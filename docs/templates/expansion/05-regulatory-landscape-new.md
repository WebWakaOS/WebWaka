# WebWaka OS — Regulatory Landscape for Expansion Niches

**Status:** RESEARCH — Informing Expansion Decisions
**Date:** 2026-04-26
**Parent:** `docs/templates/expansion/00-expansion-master-blueprint.md`
**Scope:** Regulatory gates, licenses, and compliance requirements for all proposed new niches

---

## Regulatory Framework Overview

Nigeria's regulatory landscape for the expansion niches spans multiple federal ministries, parastatals, and state-level bodies. Each niche's regulatory gate determines:

1. **KYC tier required** — what proof of identity/license WebWaka must collect before activating the niche
2. **Compliance document display** — what license/registration numbers must appear on the template
3. **Feature gating** — whether certain template features (e.g., collecting patient payments, displaying drug prices) require verified compliance status
4. **Risk level** — how much verification is needed before a tenant can go live

### KYC Tier Reference

| Tier | Description | Examples |
|---|---|---|
| **Tier 1** | Basic — CAC/BN registration number | General retail, food vendor, cleaning service |
| **Tier 2** | Standard — CAC + sector license (self-declared) | Restaurant (NAFDAC), pharmacy (PCN), school (State Ministry) |
| **Tier 3** | Enhanced — CAC + sector license (verified/OCR scanned) | Hospital (MDCN), MFB (CBN), law firm (NBA) |
| **Tier 4** | Institutional — Full regulatory standing verification | University (NUC), insurance company (NAICOM), pension fund (PenCom) |

---

## HEALTH SECTOR REGULATORY GATES

### `hospital` — Hospital / Secondary Healthcare Facility
| Requirement | Body | Tier |
|---|---|---|
| Hospital license | Federal/State Ministry of Health | Tier 4 |
| MDCN facility registration | Medical and Dental Council of Nigeria (MDCN) | Tier 4 |
| NHIA accreditation | National Health Insurance Authority | Tier 3 (optional but strongly recommended) |
| Fire safety certificate | State fire service | Tier 3 |
| Environmental impact | State environmental agency | Tier 3 |
| Pharmaceutical license (if dispensing) | NAFDAC + PCN | Tier 3 |

**Template compliance display requirements:**
- MDCN facility registration number
- State Ministry of Health license number
- NHIA accreditation status (if applicable)
- Physical address with ward and LGA
- Lead medical officer credentials (MDCN)

**Feature gates:**
- Patient record access → requires MDCN verification
- Online payment for medical services → requires NHIA or direct billing setup
- Drug dispensing module → requires NAFDAC + PCN verification

**Risk profile:** HIGH. The hospital niche is a sensitive vertical where patient safety is at stake. Implementation must include a pre-activation compliance check.

---

### `diagnostic-lab` — Medical / Diagnostic Laboratory
| Requirement | Body | Tier |
|---|---|---|
| MLSCN license | Medical Laboratory Science Council of Nigeria | Tier 3 |
| Premises certificate | MLSCN (premises inspection) | Tier 3 |
| NAFDAC permit | For reagents, diagnostic kits | Tier 3 |
| CAC registration | Corporate Affairs Commission | Tier 2 |
| State Ministry approval | State level lab licensing | Tier 2 |

**Template compliance display requirements:**
- MLSCN registration number
- Lead medical laboratory scientist (MLS) name and credentials
- Test accreditation list (if any ISO 15189 accreditation)
- NAFDAC reagent permit reference

**Feature gates:**
- Result delivery portal → requires MLSCN verification
- Online payment for test orders → standard Paystack/Flutterwave; no additional gate

**Risk profile:** MEDIUM-HIGH. Diagnostic results affect patient care decisions.

---

### `physiotherapy` — Physiotherapy / OT Clinic
| Requirement | Body | Tier |
|---|---|---|
| PCN-PT registration | Physiotherapy Council of Nigeria | Tier 3 |
| Premises license | State Ministry of Health | Tier 2 |
| CAC registration | Corporate Affairs Commission | Tier 2 |

**Template compliance display requirements:**
- PCN registration number for lead physiotherapist
- Specialisation certifications (sports, neuro, ortho, paediatric)

**Risk profile:** MEDIUM.

---

### `mental-health` — Mental Health / Counselling
| Requirement | Body | Tier |
|---|---|---|
| MDCN registration | For psychiatrists | Tier 3 |
| Psychology body membership | Nigerian Society of Clinical Psychologists | Tier 2 |
| Counselling body membership | Counselling Association of Nigeria (CASSON) | Tier 2 |
| CAC registration | For clinic/organization entity | Tier 2 |

**Special feature considerations:**
- Confidentiality notice must appear on booking page
- Patient data handling must comply with NDPC (Nigeria Data Protection Commission) regulations
- Crisis resource links must appear on every mental health template

**Risk profile:** MEDIUM-HIGH (data sensitivity, patient safety).

---

### `maternity-clinic` — Maternity / Birthing Centre
| Requirement | Body | Tier |
|---|---|---|
| MDCN facility license | Medical and Dental Council of Nigeria | Tier 3 |
| NMCN (Nursing & Midwifery) | Nursing and Midwifery Council of Nigeria | Tier 3 |
| State Ministry of Health | Maternity home license | Tier 3 |
| NHIA accreditation | For HMO billing | Tier 3 (optional) |

**Template compliance display requirements:**
- MDCN facility number
- NMCN registration for lead midwife
- State Ministry of Health license number
- NHIA accreditation (if applicable)

**Risk profile:** HIGH. Maternal and neonatal safety.

---

## EDUCATION SECTOR REGULATORY GATES

### `university` — University / Polytechnic / College
| Requirement | Body | Tier |
|---|---|---|
| University: NUC license | National Universities Commission | Tier 4 |
| Polytechnic: NBTE approval | National Board for Technical Education | Tier 4 |
| College: NCCE approval | National Commission for Colleges of Education | Tier 4 |
| CAC incorporation | Corporate Affairs Commission | Tier 2 |
| NUC programme approval | Per programme (e.g., Law → NUC + Council of Legal Education) | Tier 4 |

**Template compliance display requirements:**
- NUC/NBTE/NCCE approval number
- NUC-approved programmes list
- State of licensing
- Accreditation status (full/interim)

**Feature gates:**
- Student application portal → requires NUC verification
- Course catalog → degree programmes need NUC approval per programme
- Certificate generation → cannot display if NUC approval is pending/lapsed

**Risk profile:** VERY HIGH. Fraudulent degree mills exist; NUC verification is critical.

---

### `exam-prep-centre` — Exam Preparation Centre
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| State Ministry of Education (optional) | Some states require approval | Tier 2 |
| JAMB accreditation | For JAMB CBT centres specifically | Tier 3 |

**Note:** General exam prep centres have low regulatory burden. Only those running JAMB CBT practice centres need JAMB accreditation.

**Risk profile:** LOW.

---

### `elearning-platform` — E-Learning Platform
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NUC approval (only if awarding degrees) | NUC | Tier 4 |
| NITDA (optional) | NITDA Digital Innovation Standards | Tier 2 |

**Note:** E-learning platforms that award non-degree certificates have NO specific regulatory requirement beyond CAC registration and NDPC compliance for data protection.

**Risk profile:** LOW (unless awarding NUC-recognised degrees).

---

### `tech-academy` — Technology / Coding Academy
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NITDA accreditation (optional) | NITDA — Digital Skills Programme | Tier 2 |
| NABTEB certification (optional) | For vocational/technical certificates | Tier 2 |

**Risk profile:** LOW.

---

## FINANCIAL SECTOR REGULATORY GATES

### `microfinance-bank` — Microfinance Bank
| Requirement | Body | Tier |
|---|---|---|
| CBN MFB license | Central Bank of Nigeria (unit/state/national) | Tier 4 |
| NDIC membership | Nigeria Deposit Insurance Corporation | Tier 4 |
| FIRS registration | Federal Inland Revenue Service | Tier 3 |
| CAC incorporation | Corporate Affairs Commission | Tier 3 |
| Anti-money laundering policy | EFCC / CBN AML guidelines | Tier 4 |

**Template compliance display requirements:**
- CBN MFB license number and tier
- NDIC registration number
- Physical address of each branch
- Directors' names (publicly disclosed per CBN requirement)
- Interest rate disclosure for loan products

**Feature gates:**
- Loan application module → requires CBN MFB verification
- Savings product display → requires NDIC verification
- KYC collection for customer accounts → must meet CBN KYC requirements

**Risk profile:** VERY HIGH. Financial sector; CBN oversight.

---

### `insurance-company` — Insurance Underwriter
| Requirement | Body | Tier |
|---|---|---|
| NAICOM license | National Insurance Commission | Tier 4 |
| Minimum capital proof | NAICOM (varies by insurance class) | Tier 4 |
| CAC incorporation | Corporate Affairs Commission | Tier 3 |
| SEC registration (if investment products) | Securities and Exchange Commission | Tier 4 |
| FIRS registration | Federal Inland Revenue Service | Tier 3 |

**Template compliance display requirements:**
- NAICOM license number and class of insurance
- NAICOM premium (minimum guaranteed amount)
- Contact for complaints (NAICOM complaint hotline)
- Statutory deposit receipt

**Risk profile:** VERY HIGH. Insurance policyholders are especially vulnerable.

---

### `credit-union` — Credit Union / SACCO
| Requirement | Body | Tier |
|---|---|---|
| CAC cooperative registration | Corporate Affairs Commission | Tier 2 |
| State Cooperative Development | State Ministry of Commerce/Industry | Tier 2 |
| NACCOSS membership | National Association of Cooperative Societies | Tier 2 (optional) |

**Template compliance display requirements:**
- CAC cooperative registration number
- State registration number
- Board of Directors (elected)

**Risk profile:** MEDIUM. Financial cooperative handling member funds.

---

### `pension-fund` — Pension Fund Administrator
| Requirement | Body | Tier |
|---|---|---|
| PenCom license | National Pension Commission | Tier 4 |
| SEC registration (for fund management) | Securities and Exchange Commission | Tier 4 |
| CBN custodian agreement | For pension fund assets | Tier 4 |
| CAC incorporation | Corporate Affairs Commission | Tier 3 |
| FIRS registration | Federal Inland Revenue Service | Tier 3 |

**Risk profile:** VERY HIGH. Pension funds managed on behalf of millions of contributors.

---

### `stockbroker` — Stockbroker / Securities Dealer
| Requirement | Body | Tier |
|---|---|---|
| SEC registration | Securities and Exchange Commission | Tier 4 |
| NSE/NASD membership | Nigerian Stock Exchange / NASD OTC Securities Exchange | Tier 4 |
| CSCS account | Central Securities Clearing System | Tier 4 |
| CAC incorporation | Corporate Affairs Commission | Tier 3 |
| FIRS registration | Federal Inland Revenue Service | Tier 3 |

**Risk profile:** VERY HIGH. Capital markets; investor protection.

---

## PROFESSIONAL SERVICES REGULATORY GATES

### `software-agency` — Software / App Development Agency
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NITDA CPAN (optional) | Computer Professionals Registration Council of Nigeria | Tier 2 |
| NDPC compliance | Nigerian Data Protection Commission | Tier 2 |

**Risk profile:** LOW. No sector regulator; standard business registration.

---

### `architecture-firm` — Architecture / Interior Design Firm
| Requirement | Body | Tier |
|---|---|---|
| ARCON registration | Architects Registration Council of Nigeria | Tier 3 |
| CAC registration | Corporate Affairs Commission | Tier 2 |
| NIQS (if QS) | Nigerian Institute of Quantity Surveyors | Tier 3 |
| TOPREC (if town planning) | Town Planners Registration Council of Nigeria | Tier 3 |

**Template compliance display requirements:**
- ARCON registration number for principal architect
- Project portfolio (planning authority approved projects)
- Professional indemnity insurance disclosure

**Risk profile:** MEDIUM. Building design affects public safety.

---

### `recruitment-agency` — HR / Recruitment Agency
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| FME registration (for overseas placement) | Federal Ministry of Employment | Tier 3 |
| CIPM membership (optional) | Chartered Institute of Personnel Management | Tier 2 |

**Special note:** Agencies placing Nigerians in overseas employment MUST be licensed by the Federal Ministry of Employment (FME) / Nigerian Association of Licensed Labour Contractors (NALLC). This is critical to prevent human trafficking risk.

**Feature gate:**
- International job listings → requires FME license (overseas placement)
- Domestic job listings → Tier 1 only

**Risk profile:** MEDIUM-HIGH (for overseas placement — anti-trafficking compliance).

---

### `management-consulting` — Management Consulting Firm
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| ICAN (if finance-focused) | Institute of Chartered Accountants of Nigeria | Tier 2 |
| CIA / CFE (international certifications) | ACFE, IIA | Tier 2 (optional) |

**Risk profile:** LOW. No sector regulator for general management consulting.

---

### `digital-marketing-agency` — Digital Marketing Agency
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| APCON membership | Advertising Practitioners Council of Nigeria | Tier 2 |
| NCC (if telecoms-adjacent services) | Nigerian Communications Commission | Tier 2 |

**Risk profile:** LOW.

---

### `cac-registration-agent` — CAC Registration Agent
| Requirement | Body | Tier |
|---|---|---|
| CAC accredited agent status | Corporate Affairs Commission | Tier 3 |
| CAC registration (as a business) | Corporate Affairs Commission | Tier 1 |

**Risk profile:** LOW-MEDIUM. CAC agents handle sensitive business documents.

---

## TECHNOLOGY SERVICES REGULATORY GATES

### `cybersecurity-firm` — Cybersecurity Company
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NITDA accreditation (optional) | National Information Technology Development Agency | Tier 2 |
| NIS ISO 27001 (optional) | Nigerian Industrial Standards / BSI | Tier 2 |
| NDPC compliance | Nigerian Data Protection Commission | Tier 2 |
| NCC (for network security services) | Nigerian Communications Commission | Tier 2 |

**Risk profile:** LOW (no mandatory sector regulator; NCC only if offering telecoms network security).

---

### `data-analytics-firm` — Data Analytics / BI Firm
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NDPC compliance | Nigerian Data Protection Commission (NDPR 2019 / Nigeria Data Protection Act 2023) | Tier 2 |

**Critical note:** The Nigeria Data Protection Act (2023) and NDPR require any organization processing personal data of Nigerians to:
1. Appoint a Data Protection Compliance Organisation (DPCO) or Data Protection Officer (DPO)
2. File data audit reports with NDPC annually
3. Implement data subject rights (access, correction, deletion)

Data analytics firms by definition process large amounts of personal data. The WebWaka data-analytics-firm template must include:
- NDPC compliance statement
- Data processing disclosure
- DPO contact information

**Risk profile:** MEDIUM (data protection obligations).

---

## HOSPITALITY REGULATORY GATES

### `bar-lounge` — Bar / Lounge / Nightclub
| Requirement | Body | Tier |
|---|---|---|
| State liquor/entertainment license | State Ministry of Commerce/Tourism | Tier 3 |
| CAC registration | Corporate Affairs Commission | Tier 1 |
| Local Government permit | LGA entertainment/music permit | Tier 2 |
| NAFDAC (for alcohol retail/import) | NAFDAC | Tier 3 |
| Fire safety certificate | State fire service | Tier 2 |
| NCC (if playing licensed music publicly) | NCC/CMD music licensing | Tier 2 |

**Template compliance display requirements:**
- State entertainment license number
- Age restriction notice (18+ mandatory)
- Operating hours

**Risk profile:** MEDIUM. Alcohol service and entertainment.

---

### `resort` — Resort / Leisure Park
| Requirement | Body | Tier |
|---|---|---|
| State Tourism Board registration | State Tourism Board | Tier 2 |
| NTDC classification | Nigerian Tourism Development Corporation | Tier 2 |
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NAFDAC (food service) | NAFDAC | Tier 2 |
| Environmental permit | State environmental agency | Tier 2 |

**Risk profile:** LOW-MEDIUM.

---

### `vacation-rental` — Vacation Rental / Short-let Portfolio
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| State tourism/short-let permit | Some states (Lagos LASG) are developing short-let frameworks | Tier 2 |
| Landlord-tenant compliance | State tenancy laws | Tier 1 |

**Note:** Lagos State is developing a short-let regulation framework (2024–2025). Template should be designed to accommodate future mandatory permit display.

**Risk profile:** LOW (currently).

---

## PROPERTY MANAGEMENT REGULATORY GATES

### `coworking-space` — Co-working Space / Business Hub
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| Fire safety certificate | State fire service | Tier 2 |
| LGA business permit | LGA | Tier 1 |

**Risk profile:** LOW.

---

### `property-management` — Property Management Company
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| ESVARBON registration (for valuers/surveyors) | Estate Surveyors and Valuers Registration Board of Nigeria | Tier 3 |
| State rent protection compliance | State Tenancy Law | Tier 1 |

**Risk profile:** LOW-MEDIUM.

---

### `student-hostel` — Student Hostel Operator
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| State Ministry of Education (some states) | Hostel approval | Tier 2 |
| Fire safety certificate | State fire service | Tier 2 |
| University proximity compliance | University accommodation office | Tier 2 (case-specific) |

**Risk profile:** LOW-MEDIUM.

---

## WELLNESS REGULATORY GATES

### `yoga-studio` — Yoga / Pilates / Meditation Studio
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| Fire safety certificate | State fire service | Tier 1 |

**Risk profile:** LOW. No sector regulator.

---

### `traditional-medicine` — Traditional Medicine Practitioner
| Requirement | Body | Tier |
|---|---|---|
| State Traditional Medicine Board | State-level traditional medicine registration | Tier 2 |
| NAFDAC herbal product registration | NAFDAC (for each herbal product sold) | Tier 3 |
| CAC registration (for organizations) | Corporate Affairs Commission | Tier 1 |

**Critical note:** NAFDAC registration is required for **every herbal/traditional medicine product sold**. The template must include a product-level NAFDAC registration field and must not display herbal products without a valid NAFDAC number.

**Risk profile:** MEDIUM-HIGH (public health; false medical claims risk).

---

### `health-food-store` — Supplement / Health Food Store
| Requirement | Body | Tier |
|---|---|---|
| NAFDAC registration per product | National Agency for Food and Drug Administration and Control | Tier 3 |
| CAC registration | Corporate Affairs Commission | Tier 1 |
| SON certification (for some products) | Standards Organisation of Nigeria | Tier 2 |

**Risk profile:** MEDIUM. NAFDAC compliance is non-negotiable.

---

## COMMERCE EXPANSION REGULATORY GATES

### `electronics-store` — Electronics / Mobile Phone Retail
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| SON approval (for electrical goods) | Standards Organisation of Nigeria | Tier 2 |
| NCC type approval (for communications devices) | Nigerian Communications Commission | Tier 2 |
| Import documentation | Nigeria Customs Service (Form M / NAFDAC/SON) | Tier 2 |

**Template compliance display requirements:**
- Warranty terms per product
- SON/NCC type approval note for imported devices

**Risk profile:** LOW-MEDIUM.

---

### `jewellery-shop` — Jewellery Shop / Goldsmith
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| CBN gold dealer (if gold trading) | Central Bank of Nigeria | Tier 3 |
| SON hallmarking (for gold products) | Standards Organisation of Nigeria | Tier 2 |

**Risk profile:** LOW-MEDIUM (gold trading has AML implications).

---

### `baby-shop` — Baby Shop / Maternity Store
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| NAFDAC (baby food, formula, bottles) | NAFDAC | Tier 3 |
| SON (safety standards for baby products) | Standards Organisation of Nigeria | Tier 2 |

**Risk profile:** MEDIUM (baby safety products; NAFDAC compliance critical).

---

### `cosmetics-shop` — Perfume & Cosmetics Shop
| Requirement | Body | Tier |
|---|---|---|
| NAFDAC registration per product | National Agency for Food and Drug Administration | Tier 3 |
| CAC registration | Corporate Affairs Commission | Tier 1 |
| Import licence (for imported cosmetics) | Nigeria Customs Service | Tier 2 |

**Template compliance display requirements:**
- NAFDAC registration number per product (mandatory)
- Country of origin for imported products
- Batch number display for accountability

**Risk profile:** MEDIUM-HIGH. Cosmetics are a major NAFDAC enforcement area; counterfeit cosmetics cause health damage.

---

### `thrift-store` — Secondhand / Thrift Store
| Requirement | Body | Tier |
|---|---|---|
| CAC registration | Corporate Affairs Commission | Tier 1 |
| State Environmental Health (textile imports) | State environmental agency | Tier 1 |
| SON (for imported used goods — "Tokunbo") | Standards Organisation of Nigeria | Tier 1 |

**Risk profile:** LOW.

---

## Regulatory Summary Table

| Niche | Primary Regulator | KYC Tier | Risk Profile |
|---|---|---|---|
| `hospital` | MDCN + State MOH | Tier 4 | VERY HIGH |
| `diagnostic-lab` | MLSCN + NAFDAC | Tier 3 | MEDIUM-HIGH |
| `physiotherapy` | PCN-PT | Tier 3 | MEDIUM |
| `mental-health` | MDCN / Psychology bodies | Tier 2–3 | MEDIUM-HIGH |
| `maternity-clinic` | MDCN + NMCN | Tier 3 | HIGH |
| `university` | NUC / NBTE / NCCE | Tier 4 | VERY HIGH |
| `exam-prep-centre` | None (CAC only) | Tier 1 | LOW |
| `elearning-platform` | None (CAC + NDPC) | Tier 1 | LOW |
| `tutorial-centre` | None (CAC only) | Tier 1 | LOW |
| `tech-academy` | None (CAC only) | Tier 1 | LOW |
| `microfinance-bank` | CBN + NDIC | Tier 4 | VERY HIGH |
| `insurance-company` | NAICOM | Tier 4 | VERY HIGH |
| `credit-union` | CAC + State Cooperative | Tier 2 | MEDIUM |
| `pension-fund` | PenCom + SEC | Tier 4 | VERY HIGH |
| `stockbroker` | SEC + NSE | Tier 4 | VERY HIGH |
| `software-agency` | None (CAC only) | Tier 1 | LOW |
| `architecture-firm` | ARCON | Tier 3 | MEDIUM |
| `recruitment-agency` | CAC (domestic) / FME (overseas) | Tier 1–3 | LOW–HIGH |
| `management-consulting` | None (CAC only) | Tier 1 | LOW |
| `digital-marketing-agency` | APCON | Tier 1–2 | LOW |
| `cac-registration-agent` | CAC (accredited agent) | Tier 2 | LOW-MEDIUM |
| `cybersecurity-firm` | None (CAC + NCC) | Tier 1 | LOW |
| `data-analytics-firm` | NDPC | Tier 2 | MEDIUM |
| `bar-lounge` | State Liquor Board | Tier 3 | MEDIUM |
| `resort` | State Tourism Board + NTDC | Tier 2 | LOW-MEDIUM |
| `vacation-rental` | CAC only (currently) | Tier 1 | LOW |
| `food-court` | NAFDAC + CAC | Tier 2 | LOW-MEDIUM |
| `coworking-space` | None (CAC only) | Tier 1 | LOW |
| `property-management` | ESVARBON (for surveyors) | Tier 1–3 | LOW-MEDIUM |
| `student-hostel` | State MOE | Tier 2 | LOW-MEDIUM |
| `yoga-studio` | None (CAC only) | Tier 1 | LOW |
| `traditional-medicine` | NAFDAC + State TMB | Tier 2–3 | MEDIUM-HIGH |
| `health-food-store` | NAFDAC | Tier 3 | MEDIUM |
| `electronics-store` | SON + NCC | Tier 2 | LOW-MEDIUM |
| `jewellery-shop` | CAC / CBN (gold) | Tier 1–3 | LOW-MEDIUM |
| `baby-shop` | NAFDAC + SON | Tier 2–3 | MEDIUM |
| `cosmetics-shop` | NAFDAC | Tier 3 | MEDIUM-HIGH |
| `thrift-store` | CAC only | Tier 1 | LOW |

---

## Implementation Priority by Regulatory Complexity

### Group A: Immediate (Low Regulatory Burden — Tier 1–2)
Can be built and launched without complex verification infrastructure:
`exam-prep-centre`, `tutorial-centre`, `elearning-platform`, `tech-academy`, `software-agency`, `digital-marketing-agency`, `management-consulting`, `cybersecurity-firm`, `coworking-space`, `yoga-studio`, `thrift-store`, `vacation-rental`, `bar-lounge` (Tier 3 but manageable), `credit-union`

### Group B: Standard (Tier 2–3 — sector license verification)
Require sector license field and basic verification process:
`diagnostic-lab`, `physiotherapy`, `architecture-firm`, `property-management`, `traditional-medicine`, `electronics-store`, `cosmetics-shop`, `baby-shop`, `resort`, `data-analytics-firm`, `recruitment-agency` (domestic), `cac-registration-agent`, `maternity-clinic`, `mental-health`

### Group C: Complex (Tier 3–4 — institutional verification)
Require significant compliance infrastructure before activation:
`hospital`, `university`, `microfinance-bank`, `insurance-company`, `pension-fund`, `stockbroker`, `recruitment-agency` (overseas placement)

### Recommendation
Build Group A niches first (no additional compliance infrastructure needed). Group B niches can be built alongside a sector-license verification module. Group C niches require dedicated compliance engineering before template activation.

---

*Produced: 2026-04-26 — Deep Research & Expansion Design Phase*
*All regulatory information based on publicly available Nigerian legislation, agency websites, and NBS/CBN/MDCN publications as of early 2026. Verify current requirements before implementation.*
