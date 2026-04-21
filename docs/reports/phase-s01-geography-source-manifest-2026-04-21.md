# Phase S01 Geography Source Manifest

## Source Identity

| Field | Value |
|---|---|
| Source ID | `seed_source_inec_2023_delimitation_count` |
| Source name | INEC 2023 General Election delimitation figures |
| Owner / publisher | Independent National Electoral Commission (INEC), Nigeria |
| Source type | official_government |
| Confidence | official_verified |
| URL or access path | https://x.com/inecnigeria/status/1628280758845468673 and INEC polling-unit references |
| Retrieval date | 2026-04-21 |
| Use in S01 | Canonical target count: 8,809 registration areas/wards, 774 LGAs, 37 states/FCT, 176,846 polling units |

| Field | Value |
|---|---|
| Source ID | `seed_source_hdx_inec_admin_level_geodatabase_2017` |
| Source name | Nigeria - Independent National Electoral Commission - LGA and Wards |
| Owner / publisher | HDX / OCHA Nigeria, based on INEC electoral registration points |
| Source type | public_directory |
| Confidence | public_high_confidence |
| URL or access path | https://data.humdata.org/dataset/nigeria-independent-national-electoral-commission-lga-and-wards |
| Direct artifact | `inec_admin-level-geodatabase.xls` |
| Retrieval date | 2026-04-21 |
| Use in S01 | Partial source cross-check for selected northern/FCT states; not complete national coverage |

| Field | Value |
|---|---|
| Source ID | `seed_source_temikeezy_nigeria_geojson_data_wards` |
| Source name | temikeezy/nigeria-geojson-data `data/wards.json` |
| Owner / publisher | Public GitHub repository |
| Source type | public_directory |
| Confidence | public_high_confidence |
| URL or access path | https://raw.githubusercontent.com/temikeezy/nigeria-geojson-data/main/data/wards.json |
| Retrieval date | 2026-04-21 |
| Use in S01 | Complete 8,809-row State → LGA → Ward reference used to regenerate `infra/db/seed/0003_wards.sql` after matching all rows to WebWaka LGA IDs |

| Field | Value |
|---|---|
| Source ID | `seed_source_nielvid_states_lga_wards_polling_units` |
| Source name | nielvid/states-lga-wards-polling-units `ward.sql` |
| Owner / publisher | Public GitHub repository |
| Source type | public_directory |
| Confidence | official_stale |
| URL or access path | https://github.com/nielvid/states-lga-wards-polling-units |
| Retrieval date | 2026-04-21 |
| Use in S01 | Prior local seed provenance; retained as historical context but superseded for ward reconciliation because local derivative had 8,810 wards and parent-LGA assignment issues |

## Coverage

| Dataset | Accepted S01 count | Validation source |
|---|---:|---|
| Nigeria root | 1 | Local seed validation |
| Geopolitical zones | 6 | Local seed validation |
| States/FCT | 37 | Local seed validation |
| LGAs | 774 | Local seed validation after duplicate Ogun LGA removal |
| Wards / registration areas | 8,809 | INEC official count and complete public ward reference |

## Known Source Notes

- HDX INEC workbook is useful and source-aligned, but it covers only selected states/sheets and therefore cannot by itself produce the national 8,809 ward seed.
- The prior nielvid-derived local seed produced 8,810 ward tuples and only 767 distinct ward parents, leaving eight LGA records without child wards.
- The complete public reference used for regeneration matches INEC's official 8,809 ward/registration-area count, but it carries spelling variants that were mapped to WebWaka's stable LGA IDs in `infra/db/seed/scripts/generate_wards_sql.ts`.
