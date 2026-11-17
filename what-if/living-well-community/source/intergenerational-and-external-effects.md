---
title: "Twenty-year sensitivity, future families and external dependencies"
version: 1.0.0
status: accepted-for-publication
date: 2026-11-17
---
# Twenty-year sensitivity, future families and external dependencies

Artificial intelligence (AI) coaching is part of the full Living Well service assessed here.

## A long horizon must include later needs

For someone joining at 65–79 in 2027, a twenty-year view reaches ages 85–99. Better function may delay disability without eliminating it. Longer life may add valued years and later care costs. Neither mortality reduction nor cost reduction is established for this package. Quality of life remains the purpose; extra care in a longer valued life is not itself a failure. The cash model cannot estimate survival, disability transition or lifetime cost from a one-year pilot.

The sensitivity follows one hypothetical 250-person cohort over 2027–2046. Assume two family hours/month are freely released while benefit persists; compare no benefit, benefits through year five or twenty, and a three-year delay before benefits start. For sensitivity only, assume 12 participant and four family hours of extra annual programme burden for the first five years. These arbitrary time inputs are unmeasured; they are not a service entitlement or a claim that all support consumes only these hours. Test unchanged exposure and exposure falling 5% annually. This decline is **not a survival forecast** and should not be presented as observed attrition.

Separately test zero extra longevity against 0.02 additional person-years per original participant in each of years 11–20. Across 250 people that is 50 additional person-years over the decade. At an assumed 100 later-care hours per added person-year and $80/hour, the extra care is 5,000 hours/$400,000. These are arbitrary stress inputs to reveal a possible trade-off, not an estimated effect. No payer or public/private split is assumed for this care. Post-79 ordinary care needs would exist in both arms; the calculation is **incremental** hypothetical additional care, not all later-life costs.

The table uses constant exposure for 250 people. Hours are cumulative over twenty years; costs are undiscounted 2026 Australian dollars. The broad time balance subtracts participant and family programme time from family time released. It is not a quality-of-life measure and does not net off professional later-care hours, which remain a separate account. Negative means assumed time burden exceeds assumed released family time.

| Benefit starts / lasts through year | Gross family hours | Participant + family burden hours | Broad net time balance | Additional later care hours | Later care cost |
|---|---:|---:|---:|---:|---:|
| After 0 / 0 | 0 | 20,000 | -20,000 | 5,000 | $400,000 |
| After 0 / 5 | 30,000 | 20,000 | 10,000 | 5,000 | $400,000 |
| After 3 / 5 | 12,000 | 20,000 | -8,000 | 5,000 | $400,000 |
| After 0 / 20 | 120,000 | 20,000 | 100,000 | 5,000 | $400,000 |
| After 3 / 20 | 102,000 | 20,000 | 82,000 | 5,000 | $400,000 |

The delayed five-year case gives only two years of benefit (years four and five), illustrating how a promising mechanism can fail to repay early household burden. The original-cohort later-care calculation deliberately does **not** decline with the exposure factor used for family benefits. This is a conservative asymmetric stress, not a coherent survival model: later care remains based on all 250 original participants while family benefit exposure falls. A second `exposure_scaled` variant applies the same annual exposure factor to later care. At 5% annual decline it gives about 2,403 additional later-care hours and $192,201, compared with 5,000 hours/$400,000 on the fixed-original-cohort basis. With unchanged exposure both methods coincide. Both bases, zero-longevity variants and benefit-delay cases are in `Model/twenty-year-sensitivity.csv`; neither estimates actual longevity. Discounting later care at 0%, 3% and 5% real rates is shown separately; it changes today's valuation, not the number of hours or cash due in future. Do not add discounted amounts to undiscounted cost totals. No programme expenditure for twenty years is inferred from five years of assumed support.

A complete lifetime model would need age/sex/baseline-function transitions, survival, disability, care intensity, family composition, quality of life and service cost data with an explicit comparator. They are absent. The sensitivity therefore cannot establish net lifetime social value, prove LW-R05 or support a national benefit estimate. Observe families after support ends and participants pass 79; do not select only survivors with complete records.

## Who may gain or lose across generations

Older people may gain independent choice and social participation; adult children may gain time for work, education, rest or their own families. Grandchildren may receive additional care or simply more enjoyable contact. These are different outcomes and not automatic productive labour. Women already providing substantial unpaid care could receive more duties instead of relief. Younger families might pay fees, provide transport, troubleshoot devices or inherit later care work. Measure household bills and time by person, including those not enrolled.

Private donor and insurer funds have alternatives: disability support, younger-family prevention, accessible existing exercise or direct home assistance. A $1 million programme cannot also buy the alternative service. Make the comparator budget and workforce explicit; do not assume private spending has no social opportunity cost. Foregone tax receipts from any deductible gifts or premium arrangements belong in the public ledger, not an invisible subsidy. No lifetime net benefit is booked now.

## Other countries, technology and supply chains

At pilot scale, direct international benefit is likely limited and is not valued. Reproducible methods and honest negative findings could eventually inform other countries, subject to separate sharing/publication approval; Australian cost or clinical results would require local revalidation. Migrant families may have cross-border caring obligations, so diaries should capture them voluntarily without assuming national benefit from all hours.

Imported watches/batteries, software updates, cloud regions, AI inference, support staff, undersea connectivity and vendor solvency create foreign dependencies. Supplier nationality does not establish processing location or legal access. Require auditable contracts, complete data-flow testing, exportable plans, local encrypted backup, a replacement-device reserve, support exit clauses and staffed offline continuity. Local manufacture or Australian ownership is not assumed. Device energy use and electronic waste are plausible external costs; request lifecycle/recycling evidence rather than inventing emissions savings.

The international dependencies above require local evidence; this case asserts no national self-sufficiency or international resilience improvement.
