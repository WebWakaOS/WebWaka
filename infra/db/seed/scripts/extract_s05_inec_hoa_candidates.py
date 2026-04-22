"""INEC HoA coordinate extractor — v5 (production)."""
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextBox
from pathlib import Path
import re

KNOWN_PARTIES = {
    "A","AA","AAC","ADC","ADP","AGAP","APM","APP",
    "APC","APGA","BP","LP","NNPP","NRM","PDP","PRP","SDP","YPP","ZLP",
}
TWO_WORD_STATES = {"AKWA IBOM", "CROSS RIVER"}
INEC_STATES = {
    "ABIA","ADAMAWA","AKWA IBOM","ANAMBRA","BAUCHI","BAYELSA","BENUE",
    "BORNO","CROSS RIVER","DELTA","EBONYI","EDO","EKITI","ENUGU",
    "GOMBE","IMO","JIGAWA","KADUNA","KANO","KATSINA","KEBBI","KOGI",
    "KWARA","LAGOS","NASARAWA","NIGER","OGUN","ONDO","OSUN","OYO",
    "PLATEAU","RIVERS","SOKOTO","TARABA","YOBE","ZAMFARA",
}
HEADER_TEXTS = {
    "S/N","STATE","CONSTITUENCY","PARTY POSITION","CANDIDATE_NAME","PWD",
    "AGE GENDER QUALIFICATIONS","AGE GENDER QUALIFICATIONS REMARKS",
    "REMARKS","PARTY","POSITION","AGE","GENDER","QUALIFICATIONS",
}

# Strip any occurrence of position language from constituency/state text
POSITION_STRIP_RE = re.compile(
    r'\s*\b(?:State\s+House\s+of\s+Assembly|State\s+House\s+of|State\s+House|of\s+Assembly)\b\s*',
    re.IGNORECASE
)
# Detect "PARTY State House" combined text
PARTY_POS_RE = re.compile(
    r'^(' + '|'.join(sorted(KNOWN_PARTIES, key=len, reverse=True)) + r')\s+(?:State\s+House)',
    re.IGNORECASE
)
AGE_GENDER_RE = re.compile(r'^(\d{1,3})\s+([MF])$')
AGE_RE        = re.compile(r'^\d{1,3}$')

def classify_col(x0, x1):
    xm = (x0 + x1) / 2
    if xm < 60:   return 'sn'
    if xm < 252:  return 'sc'   # state or constituency (or merged)
    if xm < 365:  return 'pp'   # party or position (or merged)
    if xm < 510:  return 'name'
    if xm < 555:  return 'pwd'
    if xm < 586:  return 'age'
    if xm < 640:  return 'gender'
    return 'quals'

def clean(s):
    return ' '.join(s.replace('\n', ' ').split()).strip()

def extract_party_from_text(text: str) -> tuple[str, str]:
    """Strip position language and extract trailing party code. Returns (party, clean_text)."""
    t = POSITION_STRIP_RE.sub(' ', text)
    t = ' '.join(t.split()).strip()
    words = t.split()
    if words and words[-1].upper() in KNOWN_PARTIES:
        return words[-1].upper(), ' '.join(words[:-1]).strip()
    return '', t

def split_state_constituency(raw: str) -> tuple[str, str]:
    """Split 'STATE CONSTITUENCY' merged text."""
    raw = raw.strip().upper()
    for st in TWO_WORD_STATES:
        if raw.startswith(st + ' ') or raw == st:
            return st, raw[len(st):].strip()
    words = raw.split()
    if words and words[0] in INEC_STATES:
        return words[0], ' '.join(words[1:]).strip()
    return raw, ''

def parse_page(boxes_raw):
    sn_boxes = []
    for x0, y0, x1, y1, txt in boxes_raw:
        xm = (x0 + x1) / 2
        t = clean(txt)
        if xm < 60 and t.isdigit():
            sn_boxes.append((int(t), (y0 + y1) / 2))
    if not sn_boxes:
        return []
    sn_boxes.sort(key=lambda s: -s[1])
    sn_ys = [(sn, y) for sn, y in sn_boxes]
    max_sn_y = sn_ys[0][1]

    rows = {sn: {'sc': [], 'sc_xm': [], 'pp': [], 'name': [],
                 'pwd': [], 'age': [], 'gender': [], 'quals': []}
             for sn, _ in sn_ys}

    for x0, y0, x1, y1, txt in boxes_raw:
        t = clean(txt)
        if not t or t in HEADER_TEXTS:
            continue
        col = classify_col(x0, x1)
        if col == 'sn':
            continue
        yc = (y0 + y1) / 2
        if yc > max_sn_y + 5:
            continue
        nearest_sn = min(sn_ys, key=lambda sv: abs(sv[1] - yc))[0]
        if col in rows[nearest_sn]:
            rows[nearest_sn][col].append(t)
            if col == 'sc':
                rows[nearest_sn]['sc_xm'].append((x0 + x1) / 2)

    records = []
    for sn, yc in sn_ys:
        row = rows[sn]

        # --- State & Constituency ---
        sc_texts = row['sc']
        sc_xmids = row['sc_xm']
        # Separate by x-mid: < 140 → state column, >= 140 → constituency column
        state_texts = [t for t, x in zip(sc_texts, sc_xmids) if x < 140]
        const_texts  = [t for t, x in zip(sc_texts, sc_xmids) if x >= 140]

        state_raw = ' '.join(state_texts).strip()
        const_raw = ' '.join(const_texts).strip()

        # State may contain constituency (two-word states or wide boxes)
        embedded_party = ''
        if state_raw.upper() in INEC_STATES:
            state = state_raw.upper()
        elif state_raw:
            st, remainder = split_state_constituency(state_raw)
            if st in INEC_STATES:
                state = st
                # Remainder is constituency that spilled into state column
                const_raw = (remainder + ' ' + const_raw).strip()
            else:
                state = ''
                const_raw = (state_raw + ' ' + const_raw).strip()
        else:
            # const_raw may start with "STATE CONSTITUENCY" when the state cell
            # was wide enough to fall entirely in the constituency x-range
            st_try, rem = split_state_constituency(const_raw)
            if st_try in INEC_STATES:
                state = st_try
                const_raw = rem
            else:
                state = ''

        # Constituency: strip position language, extract trailing party
        const_stripped = POSITION_STRIP_RE.sub(' ', const_raw)
        const_stripped = ' '.join(const_stripped.split()).strip()
        embedded_party, constituency = extract_party_from_text(const_stripped)

        # --- Party ---
        party = ''
        for text in row['pp']:
            m = PARTY_POS_RE.match(text)
            if m:
                party = m.group(1).upper()
                break
            elif clean(text).upper() in KNOWN_PARTIES:
                party = clean(text).upper()
                break
        if not party:
            party = embedded_party

        # --- Candidate Name ---
        cand_text = ' '.join(row['name']).strip()
        pwd_hit = re.search(r'\s+(None|PWD|Nil|NIL)\s*$', cand_text, re.IGNORECASE)
        if pwd_hit:
            cand_text = cand_text[:pwd_hit.start()].strip()
            if not row['pwd']:
                row['pwd'] = [pwd_hit.group(1)]
        candidate_name = cand_text

        pwd_val = ' '.join(row['pwd']).strip() or None

        age_text    = ' '.join(row['age']).strip()
        gender_text = ' '.join(row['gender']).strip()
        m = AGE_GENDER_RE.match(age_text)
        if m:
            age, gender = int(m.group(1)), m.group(2)
        elif AGE_RE.match(age_text):
            age   = int(age_text)
            gender = gender_text if gender_text in ('M', 'F') else None
        else:
            age, gender = None, (gender_text if gender_text in ('M', 'F') else None)

        qualifications = ' '.join(row['quals']).strip() or None

        records.append({
            'sn': sn, 'state': state, 'constituency': constituency,
            'party': party, 'candidate_name': candidate_name,
            'pwd': pwd_val, 'age': age, 'gender': gender,
            'qualifications': qualifications,
        })
    return records


def extract_chunk(pdf_path, page_start, page_end, verbose=False):
    candidates, errors = [], []
    for pg_idx, page_layout in enumerate(
        extract_pages(str(pdf_path), page_numbers=list(range(page_start, page_end)))
    ):
        boxes_raw = []
        for el in page_layout:
            if isinstance(el, LTTextBox):
                boxes_raw.append((el.x0, el.y0, el.x1, el.y1, el.get_text()))
        for rec in parse_page(boxes_raw):
            ok = True
            issues = []
            if rec['state'] not in INEC_STATES:
                issues.append(f"unknown_state:{rec['state']!r}")
                ok = False
            if rec['party'] not in KNOWN_PARTIES:
                issues.append(f"unknown_party:{rec['party']!r}")
                ok = False
            if not rec['candidate_name']:
                issues.append("no_name")
                ok = False
            (candidates if ok else errors).append(
                rec if ok else {**rec, "issues": issues}
            )
        if verbose and (pg_idx + 1) % 100 == 0:
            print(f"  {pg_idx+1}/{page_end-page_start} pages: {len(candidates)} ok {len(errors)} err", flush=True)
    return candidates, errors

