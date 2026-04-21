from __future__ import annotations

import hashlib
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://cvr.inecnigeria.org"
OUTPUT_PATH = Path("infra/db/seed/sources/s05_inec_polling_units_cvr_20260421.json")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; WebWakaOSSeedBot/1.0; source-backed public official data extraction)",
    "Accept": "application/json,text/html;q=0.9,*/*;q=0.8",
    "Referer": "https://cvr.inecnigeria.org/pu",
}
STATE_CODES = [str(i) for i in range(1, 38)]
STATE_NAMES = {
    "1": "ABIA",
    "2": "ADAMAWA",
    "3": "AKWA IBOM",
    "4": "ANAMBRA",
    "5": "BAUCHI",
    "6": "BAYELSA",
    "7": "BENUE",
    "8": "BORNO",
    "9": "CROSS RIVER",
    "10": "DELTA",
    "11": "EBONYI",
    "12": "EDO",
    "13": "EKITI",
    "14": "ENUGU",
    "15": "GOMBE",
    "16": "IMO",
    "17": "JIGAWA",
    "18": "KADUNA",
    "19": "KANO",
    "20": "KATSINA",
    "21": "KEBBI",
    "22": "KOGI",
    "23": "KWARA",
    "24": "LAGOS",
    "25": "NASARAWA",
    "26": "NIGER",
    "27": "OGUN",
    "28": "ONDO",
    "29": "OSUN",
    "30": "OYO",
    "31": "PLATEAU",
    "32": "RIVERS",
    "33": "SOKOTO",
    "34": "TARABA",
    "35": "YOBE",
    "36": "ZAMFARA",
    "37": "FCT",
}


def fetch_json(path: str, params: dict[str, str], retries: int = 3) -> tuple[list[dict[str, str]], str]:
    query = urlencode(params)
    url = f"{BASE_URL}{path}?{query}"
    last_error = None
    for attempt in range(retries):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=20) as resp:
                body = resp.read()
            return json.loads(body.decode("utf-8")), hashlib.sha256(body).hexdigest()
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = str(exc)
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"failed to fetch {url}: {last_error}")


def option_items(payload: list[dict[str, str]]) -> list[dict[str, str]]:
    if not payload:
        return []
    record = payload[0]
    out = []
    for key, value in record.items():
        if key in {"0", "selected"}:
            continue
        if not value or value.strip() in {"-", "--SELECT--"}:
            continue
        out.append({"id": str(key), "label": value.strip()})
    return out


def split_code_label(label: str) -> tuple[str | None, str]:
    bits = label.split(" - ", 1)
    if len(bits) == 2 and bits[0].strip().isdigit():
        return bits[0].strip(), bits[1].strip()
    return None, label.strip()


def load_existing() -> dict:
    if OUTPUT_PATH.exists():
        return json.loads(OUTPUT_PATH.read_text())
    return {
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "source": {
            "name": "INEC CVR Polling Unit Locator Public API",
            "owner": "Independent National Electoral Commission",
            "base_url": BASE_URL,
            "locator_url": "https://cvr.inecnigeria.org/pu",
            "api_paths": ["/PublicApi/lgas/1/Search", "/PublicApi/wards/1/Search", "/PublicApi/pus/1/Search"],
        },
        "states": [],
        "fetch_hashes": [],
        "errors": [],
    }


def completed_lgas(data: dict) -> set[tuple[str, str]]:
    out = set()
    for state in data["states"]:
        for lga in state.get("lgas", []):
            out.add((state["state_api_id"], lga["lga_api_id"]))
    return out


def save(data: dict) -> None:
    rows = 0
    wards = 0
    lgas = 0
    for state in data["states"]:
        lgas += len(state.get("lgas", []))
        for lga in state.get("lgas", []):
            wards += len(lga.get("wards", []))
            for ward in lga.get("wards", []):
                rows += len(ward.get("polling_units", []))
    data["summary"] = {
        "states": len(data["states"]),
        "lgas": lgas,
        "wards": wards,
        "polling_units": rows,
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))


def main() -> None:
    data = load_existing()
    only_states = {arg for arg in sys.argv[1:] if arg.isdigit()}
    done_lgas = completed_lgas(data)
    states_by_id = {state["state_api_id"]: state for state in data["states"]}
    for state_id in STATE_CODES:
        if only_states and state_id not in only_states:
            continue
        state = states_by_id.get(state_id)
        if state is None:
            state = {"state_api_id": state_id, "state_name": STATE_NAMES[state_id], "lgas": []}
            data["states"].append(state)
        try:
            lga_payload, lga_hash = fetch_json("/PublicApi/lgas/1/Search", {"data[Search][state_id]": state_id})
            data["fetch_hashes"].append({"scope": "lgas", "state_api_id": state_id, "sha256": lga_hash})
            for lga_item in option_items(lga_payload):
                if (state_id, lga_item["id"]) in done_lgas:
                    continue
                lga_code, lga_name = split_code_label(lga_item["label"])
                lga = {"lga_api_id": lga_item["id"], "lga_code": lga_code, "lga_name": lga_name, "raw_label": lga_item["label"], "wards": []}
                ward_payload, ward_hash = fetch_json("/PublicApi/wards/1/Search", {"data[Search][local_government_id]": lga_item["id"]})
                data["fetch_hashes"].append({"scope": "wards", "state_api_id": state_id, "lga_api_id": lga_item["id"], "sha256": ward_hash})
                for ward_item in option_items(ward_payload):
                    ward_code, ward_name = split_code_label(ward_item["label"])
                    ward = {"ward_api_id": ward_item["id"], "ward_code": ward_code, "ward_name": ward_name, "raw_label": ward_item["label"], "polling_units": []}
                    pu_payload, pu_hash = fetch_json("/PublicApi/pus/1/Search", {"data[Search][registration_area_id]": ward_item["id"]})
                    data["fetch_hashes"].append({"scope": "polling_units", "state_api_id": state_id, "lga_api_id": lga_item["id"], "ward_api_id": ward_item["id"], "sha256": pu_hash})
                    for pu_item in option_items(pu_payload):
                        pu_code, pu_name = split_code_label(pu_item["label"])
                        ward["polling_units"].append({"polling_unit_api_id": pu_item["id"], "polling_unit_code": pu_code, "polling_unit_name": pu_name, "raw_label": pu_item["label"]})
                    lga["wards"].append(ward)
                state["lgas"].append(lga)
                done_lgas.add((state_id, lga_item["id"]))
                save(data)
                print(f"saved {STATE_NAMES[state_id]} / {lga_name} states={len(data['states'])} lgas={data['summary']['lgas']} wards={data['summary']['wards']} pus={data['summary']['polling_units']}", flush=True)
        except Exception as exc:
            data["errors"].append({"state_api_id": state_id, "state_name": STATE_NAMES[state_id], "error": str(exc), "recorded_at": datetime.now(timezone.utc).isoformat()})
            save(data)
            raise
    save(data)
    print(json.dumps(data["summary"], indent=2))


if __name__ == "__main__":
    main()
