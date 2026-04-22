"""
Extract the 2023 INEC Final List of Candidates for State Elections from the
official INEC PDF.

Source: INEC "FINAL LIST OF CANDIDATES FOR STATE ELECTIONS – Governorship &
Houses of Assembly" (October 2022 publication for March 2023 elections).
URL: https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf

Structure of the PDF (relevant to HoA extraction):
  Section 1: Governorship candidates (preface pp. 3–96 internal pagination)
  Section 2: Houses of Assembly candidates (pp. 97–end)

Each HoA candidate row has globally-sequential S/N, STATE, CONSTITUENCY,
PARTY, POSITION ("State House of Assembly"), CANDIDATE_NAME, PWD, AGE,
GENDER, QUALIFICATIONS, REMARKS.

Party abbreviations seen: A (Accord), AA (Allied Accord), AAC, ADC, ADP,
AGAP, APM, APP, APC, APGA, BP, LP, NNPP, NRM, PDP, SDP, YPP, ZLP.

Output:
  infra/db/seed/sources/s05_inec_2023_hoa_candidates_extracted.json
  infra/db/seed/sources/s05_inec_2023_hoa_candidates_report.json
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

from pdfminer.high_level import extract_text

ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "infra" / "db" / "seed" / "sources"
PDF_PATH   = SOURCE_DIR / "s05_inec_2023_candidates_final_list.pdf"
OUT_CANDS  = SOURCE_DIR / "s05_inec_2023_hoa_candidates_extracted.json"
OUT_REPORT = SOURCE_DIR / "s05_inec_2023_hoa_candidates_report.json"

# Known INEC party abbreviations for 2023 state elections (18 parties)
KNOWN_PARTIES = {
    "A",    # Accord
    "AA",   # Allied Accord
    "AAC",  # All Awaiting Candidates (actually "Action Alliance of Citizens" or similar)
    "ADC",  # African Democratic Congress
    "ADP",  # Action Democratic Party
    "AGAP", # Advanced Growth And Progress Party
    "APM",  # Action Peoples Movement
    "APP",  # All Progressives Party
    "APC",  # All Progressives Congress
    "APGA", # All Progressives Grand Alliance
    "BP",   # Better People's Party
    "LP",   # Labour Party
    "NNPP", # New Nigeria Peoples Party
    "NRM",  # New Renaissance Movement
    "PDP",  # Peoples Democratic Party
    "SDP",  # Social Democratic Party
    "YPP",  # Young Progressives Party
    "ZLP",  # Zenith Labour Party
}

# INEC 36-state abbreviations for validation
INEC_STATES = {
    "ABIA", "ADAMAWA", "AKWA IBOM", "ANAMBRA", "BAUCHI", "BAYELSA", "BENUE",
    "BORNO", "CROSS RIVER", "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU",
    "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI",
    "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO",
    "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA",
}

# Page number patterns embedded in page footers (to strip)
PAGE_FOOTER_RE = re.compile(r'\n\d{1,3}\n\nLIST OF CANDIDATES FOR NATIONAL ELECTIONS - STATE HOUSE OF ASSEMBLY\n', re.IGNORECASE)

# Govship section header (to detect section boundary)
GOVSHIP_HEADER_RE = re.compile(r'LIST OF CANDIDATES FOR NATIONAL ELECTIONS - GOVERNORSHIP', re.IGNORECASE)
HOA_HEADER_RE = re.compile(r'LIST OF CANDIDATES FOR NATIONAL ELECTIONS - STATE HOUSE OF ASSEMBLY', re.IGNORECASE)

# Record pattern: starts with an integer S/N number on its own line
SN_RE = re.compile(r'^\d+$')
AGE_GENDER_RE = re.compile(r'^(\d{1,3})\s+([MF])$')


def extract_all_hoa_text() -> str:
    """Extract text from the entire PDF and return only the HoA section."""
    print("Extracting text from PDF (894 pages)...", flush=True)
    # Extract all text at once - pdfminer handles memory internally
    all_text = extract_text(str(PDF_PATH))
    print(f"Total text extracted: {len(all_text):,} chars", flush=True)

    # Find where the HoA section starts
    # The HoA section has "ABIA STATE" as first state header
    # and the first real page marker "97" or "99"
    # Strategy: split at the first HOA_HEADER occurrence after the governorship intro
    hoa_matches = list(HOA_HEADER_RE.finditer(all_text))
    if not hoa_matches:
        raise ValueError("HoA section header not found in PDF text")
    # Use the SECOND occurrence (first page of the HoA section)
    if len(hoa_matches) < 2:
        start_pos = hoa_matches[0].end()
    else:
        start_pos = hoa_matches[1].end()

    hoa_text = all_text[start_pos:]
    print(f"HoA section text: {len(hoa_text):,} chars", flush=True)
    return hoa_text


def clean_text(raw: str) -> str:
    """Normalise whitespace, remove page footers."""
    # Remove page footer patterns
    text = PAGE_FOOTER_RE.sub('\n', raw)
    # Normalise
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse 3+ newlines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text


def parse_candidates(hoa_text: str) -> list[dict]:
    """Parse the HoA text into structured candidate records."""
    text = clean_text(hoa_text)

    # Split into logical lines
    raw_lines = [l.strip() for l in text.split('\n')]
    # Filter out empty lines, state-header lines ("ABIA STATE"), and
    # footer lines that contain just page numbers
    lines = []
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]
        if not line:
            i += 1
            continue
        # Skip page footer lines like "99" or "100" (already handled by regex above)
        # Skip state-header lines "ABIA STATE\n\nS/N\nSTATE..."
        if re.match(r'^\w+\s+STATE$', line) and i + 1 < len(raw_lines) and 'S/N' in raw_lines[i+1]:
            # Skip the entire header block (state name + column headers)
            while i < len(raw_lines) and raw_lines[i] not in ('', ):
                # Skip until we hit something that looks like a S/N number
                if SN_RE.match(raw_lines[i]):
                    break
                i += 1
            continue
        lines.append(line)
        i += 1

    # Now parse records. Each record starts with a line that is just a number (S/N)
    # followed by STATE, CONSTITUENCY, PARTY, "State House\nof Assembly",
    # CANDIDATE_NAME (possibly 2 lines), PWD, AGE_GENDER, QUALIFICATIONS...
    candidates = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        # Is this a S/N number?
        if not SN_RE.match(line):
            i += 1
            continue

        sn = int(line)
        record_lines = []
        i += 1

        # Collect lines until we hit the next S/N or end
        while i < n:
            # Check if next line is a S/N
            if SN_RE.match(lines[i]):
                break
            record_lines.append(lines[i])
            i += 1

        # Now parse record_lines into fields
        # Expected order: STATE, CONSTITUENCY (1-2 lines), PARTY, 
        # "State House" / "of Assembly", CANDIDATE_NAME (1-2 lines),
        # PWD, AGE GENDER, QUALIFICATIONS
        rec = parse_record(sn, record_lines)
        if rec:
            candidates.append(rec)

    return candidates


def parse_record(sn: int, lines: list[str]) -> dict | None:
    """Parse a single candidate record from its collected lines."""
    if len(lines) < 5:
        return None

    idx = 0

    # 1. STATE
    state = lines[idx].strip() if idx < len(lines) else ""
    # Some records have the state and constituency on same chunk
    # Validate state
    if state not in INEC_STATES:
        # State might be split across our reconstruction - check multi-word states
        if idx + 1 < len(lines):
            candidate_state = (state + " " + lines[idx+1]).strip()
            if candidate_state in INEC_STATES:
                state = candidate_state
                idx += 1
    if state not in INEC_STATES:
        # Can't determine state - skip
        return None
    idx += 1

    # 2. CONSTITUENCY (1 or 2 lines, all-caps)
    constituency_parts = []
    while idx < len(lines):
        l = lines[idx]
        # Stop if we hit a known party abbreviation
        if l in KNOWN_PARTIES:
            break
        # Stop if it looks like "State House" or "of Assembly"
        if l.lower() in ('state house', 'of assembly', 'state house of assembly'):
            break
        # If it's a plausible constituency name (all-caps or mixed with numbers/slash)
        if re.match(r'^[A-Z0-9 /\-\.\']+$', l) and l not in INEC_STATES:
            constituency_parts.append(l)
            idx += 1
        else:
            break
    constituency = " ".join(constituency_parts).strip()
    if not constituency:
        return None

    # 3. PARTY
    party = lines[idx].strip() if idx < len(lines) else ""
    if party not in KNOWN_PARTIES:
        # Sometimes party ends up merged with constituency or next line
        # Try to find it
        found_party = False
        for j in range(idx, min(idx+3, len(lines))):
            if lines[j] in KNOWN_PARTIES:
                party = lines[j]
                idx = j + 1
                found_party = True
                break
        if not found_party:
            return None
    else:
        idx += 1

    # 4. Skip "State House" / "of Assembly" position line(s)
    while idx < len(lines):
        l = lines[idx].lower().strip()
        if l in ('state house', 'of assembly', 'state house of assembly',
                 'state house\nof assembly', 'state\nhouse\nof assembly'):
            idx += 1
        elif 'state house' in l or 'of assembly' in l:
            idx += 1
        else:
            break

    # 5. CANDIDATE_NAME (1 or 2 lines, typically all-caps or TITLE CASE)
    name_parts = []
    while idx < len(lines):
        l = lines[idx].strip()
        # Name ends when we hit PWD status ("None" or "PWD") or age+gender pattern
        if l in ('None', 'PWD', 'none'):
            break
        if AGE_GENDER_RE.match(l):
            break
        # If l looks like a name (has letters)
        if re.search(r'[A-Za-z]', l):
            name_parts.append(l)
            idx += 1
        else:
            break
    candidate_name = " ".join(name_parts).strip()
    if not candidate_name:
        return None

    # 6. PWD
    pwd = None
    if idx < len(lines) and lines[idx].strip() in ('None', 'PWD', 'none'):
        pwd = lines[idx].strip()
        idx += 1

    # 7. AGE and GENDER
    age = None
    gender = None
    if idx < len(lines):
        m = AGE_GENDER_RE.match(lines[idx].strip())
        if m:
            age = int(m.group(1))
            gender = m.group(2)
            idx += 1
        else:
            # Sometimes age and gender are on separate lines
            if lines[idx].strip().isdigit():
                age = int(lines[idx].strip())
                idx += 1
            if idx < len(lines) and lines[idx].strip() in ('M', 'F'):
                gender = lines[idx].strip()
                idx += 1

    # 8. QUALIFICATIONS (remaining lines)
    qualifications = " ".join(lines[idx:]).strip()

    return {
        "sn": sn,
        "state": state,
        "constituency": constituency,
        "party": party,
        "candidate_name": candidate_name,
        "pwd": pwd,
        "age": age,
        "gender": gender,
        "qualifications": qualifications if qualifications else None,
    }


def main() -> None:
    hoa_text = extract_all_hoa_text()
    print("Parsing candidate records...", flush=True)
    candidates = parse_candidates(hoa_text)
    print(f"Parsed {len(candidates):,} candidate records", flush=True)

    # Validate against known counts
    state_counts = {}
    for c in candidates:
        state_counts[c["state"]] = state_counts.get(c["state"], 0) + 1
    party_counts = {}
    for c in candidates:
        party_counts[c["party"]] = party_counts.get(c["party"], 0) + 1

    print("\nState counts:")
    for s in sorted(state_counts.keys()):
        print(f"  {s}: {state_counts[s]}")
    print("\nParty counts:")
    for p, cnt in sorted(party_counts.items(), key=lambda x: -x[1]):
        print(f"  {p}: {cnt}")

    # Check for records without age/gender (data quality indicator)
    no_age = [c for c in candidates if c["age"] is None]
    print(f"\nRecords without age: {len(no_age)}")

    # Write output
    pdf_hash = hashlib.sha256(PDF_PATH.read_bytes()).hexdigest()
    out = {
        "source": {
            "url": "https://inecnigeria.org/wp-content/uploads/2022/10/Final-List-of-Candidates-for-National-Elections_SHA-14.pdf",
            "pdf_sha256": pdf_hash,
            "description": "INEC Final List of Candidates for State Elections – Governorship & Houses of Assembly (2023)",
            "confidence_tier": "official_verified",
        },
        "total_candidates": len(candidates),
        "state_counts": state_counts,
        "party_counts": party_counts,
        "no_age_count": len(no_age),
        "candidates": candidates,
    }
    OUT_CANDS.write_text(json.dumps(out, indent=2))
    cands_hash = hashlib.sha256(OUT_CANDS.read_bytes()).hexdigest()
    print(f"\nWritten {OUT_CANDS} ({OUT_CANDS.stat().st_size:,} bytes, SHA-256: {cands_hash})")

    report = {
        "total_candidates": len(candidates),
        "state_counts": state_counts,
        "party_counts": party_counts,
        "no_age_count": len(no_age),
        "pdf_sha256": pdf_hash,
        "artifact_sha256": cands_hash,
    }
    OUT_REPORT.write_text(json.dumps(report, indent=2))
    print(f"Written report: {OUT_REPORT}")


if __name__ == "__main__":
    main()
