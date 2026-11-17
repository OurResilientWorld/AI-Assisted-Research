---
title: "Costs, cash flow and value"
version: 1.0.0
status: accepted-for-publication
date: 2026-11-17
---
# Costs, cash flow and value

## Account 1 — programme cash

The service has five direct cost categories. The following **2026 Australian-dollar planning allowances** are not supplier quotes. Midpoints provide a deterministic illustration; lower/upper amounts are sensitivity bounds rather than statistical intervals. They preserve a needs-based service specification without imposing universal extra professional appointments.

| Category and timing | Lower | Midpoint | Upper |
|---|---:|---:|---:|
| Clinical/community support per active year | $750 | $1,000 | $1,250 |
| Individual AI per active year | $90 | $165 | $240 |
| Secure data per active year | $60 | $110 | $160 |
| Assessment/onboarding per new entrant | $750 | $1,000 | $1,250 |
| Watch per new/replacement device | $300 | $450 | $600 |
| New entrant direct first year | $1,950 | $2,725 | $3,500 |
| Continuing year, before any replacement due | $900 | $1,275 | $1,650 |

Watches are replaced at three-year intervals for continuing cohorts. Assessment/onboarding is paid only on entry. The direct support allowance covers professional review and nutrition/community support; initial assessment is in onboarding. Full quotations must allocate access, coordination, escalation and digital help without omissions or duplicate charges. Shared costs cover governance, supervision, insurance, finance, privacy, administration and routine supporter relations, not a second charge for the same participant contact.

Annual shared assumptions at 100/250/1,000 places are D1 $120 k/$180 k/$410 k; D2 $100 k/$150 k/$350 k. D1 is the New South Wales (NSW) association base; D2 is a lower-overhead sensitivity for that same association. Neither is a quotation for the three delivery arrangements; no organisational efficiency has been measured. In all cases operating budget is 1.10×(direct service costs+shared costs). Procurement must quote complete safe delivery before commitments.

Startup includes $90,000 setup, $120,000 pilot evaluation, $25,000 discovery and $20,000 campaign preparation/management. Applying 10% once gives **$280,500**, including **$66,000 seed preparation**. The seed includes $15,000 of the existing $90,000 setup allowance for pre-appeal formation, plus discovery/campaign work and their reserve. This allocation is an assumption to quote, not an added expense. After seed reimbursement, remaining setup/evaluation uses $214,500 including reserve; together they equal $280,500. The seed is spent before the appeal; the model assumes a successful appeal repays a private reimbursable seed advance without interest. An agreed interest charge would be added. Failure leaves that agreed loss with the underwriter, not participants. The continuing cash ledger charges the underlying seed expense once, when repaid from cleared campaign funds, rather than adding both seed spending and repayment as two programme costs.

### First pilot cash

The startup campaign fully finances the first service year and a buffer equal to three months of first-year service cost. There are **zero ordinary participant, sponsor or insurer receipts in that pilot year**. This is a proposed funded-pilot design, not evidence of free ongoing services. The cash buffer is retained, not a further expense. The budget assumes reserves are spent conservatively; unused amounts require an agreed community/donor allocation or refund rule.

`monthly-cash.csv` starts at cleared campaign funding: month 0 repays seed and pays the remaining setup/evaluation; month 1 pays entrant onboarding/watches; recurring support and overhead are paid monthly. D1 and D2 each end the base first year with the buffer. The seed advance and pre-appeal expense net to zero before this ledger; the failure case still exposes the underwriter to $66,000 at 2026 prices. There is no hidden funding source.

All cash is stated either in 2026 dollars or explicitly nominal financial-year dollars. The model uses 3% annual inflation and the financial-year midpoint: 2027–28 amounts multiply by 1.03^1.5, and later years by 1.03^(year-end−2026−0.5). This is a planning convention, not a forecast. Costs and recurring prices both index in decade illustrations, requiring real contract evidence later.

### Delivery cost comparison at three scales

The table uses **new entrants, midpoint 2026-dollar service costs with 10% reserve**. Recurring receipt/balance columns test the common member-plus-sponsor funding hypothesis for a new cohort after the pilot; they are not added to the fully crowdfunded first year. Negative balance is an operating shortfall. One-time preparation/setup/evaluation and cash buffer are excluded here and included in the campaign target.

| Delivery / people | Annual service cost | Cost per person | Test recurring receipts | Test balance |
|---|---|---|---|---|
| D1 / 100 | $431,750 | $4,318 | $306,400 | −$125,350 |
| D1 / 250 | $947,375 | $3,790 | $766,000 | −$181,375 |
| D1 / 1000 | $3,448,500 | $3,449 | $3,064,000 | −$384,500 |
| D2 / 100 | $409,750 | $4,098 | $306,400 | −$103,350 |
| D2 / 250 | $914,375 | $3,658 | $766,000 | −$148,375 |
| D2 / 1000 | $3,382,500 | $3,383 | $3,064,000 | −$318,500 |

The following **250-place operating balances in 2026 dollars** vary service-cost allowances while holding shared costs and test member/sponsor receipts fixed. Negative means shortfall. They are cost sensitivities, not probabilities or validated bids.

| Delivery | Lower | Midpoint | Upper |
|---|---|---|---|
| D1 | $31,750 | −$181,375 | −$394,500 |
| D2 | $64,750 | −$148,375 | −$361,500 |

### Continuing years and cash discipline

The illustrative path is 100→250→500→750→1,000, then 1,000 annually. 80% continue each year, with recruited replacements; 60% is also tested. Continuation combines all exit causes, including handover at 80, and is not a survival forecast. Retained people do not incur onboarding again and receive watches only when replacement is due. Cohort counts can be fractional because this is expectation arithmetic, not an enrolment list.

The table covers ten years, 2027–28 to 2036–37, in **2026 dollars**. Service/startup spending includes all costs described above. Ordinary receipts are zero during the donation-funded pilot and use the member/sponsor hypothesis afterwards. The balance before startup donation shows receipts less costs without hiding financing; startup donation appears separately. The final cash balance includes that net donation once. It includes the retained buffer and is not distributable profit or evidence of affordability.

| Delivery | Ten-year spending | Ordinary receipts after pilot | Balance before startup donation | Net startup donation | End cash, 2026 dollars |
|---|---|---|---|---|---|
| D1 | $18,886,841 | $22,980,000 | $4,093,159 | $820,188 | $4,913,347 |
| D2 | $18,336,841 | $22,980,000 | $4,643,159 | $792,688 | $5,435,847 |

The table’s “End cash, 2026 dollars” is the constant-price balance before startup donation plus that net donation. The CSV field `closing_cash_nominal` instead accumulates each year’s inflation-adjusted cash flows. For example, D1 is $4,913,347 at constant 2026 prices versus about $6,192,453 nominal; these are different price bases for the same scenario.

Hypothetical later surpluses cannot finance an earlier shortage. The decade assumes places are filled, prices renewed/indexed and the planning service safely deliverable. Renewal fees do not automatically fall with continuing costs; members should consider fairness, access subsidies and actual costs before adopting prices. The CSV also tests lower/upper costs, 60% continuation and every recurring funding route, with supporter donations halved or stopped after the pilot. Later comparative trials, debt interest and unpriced new obligations require additional budgets, not assumed coverage from a surplus.

For illustration, the following **ten-year D1 balances before startup donation in 2026 dollars** vary recurring supporter donations after the pilot. They are scenarios, not observed renewal rates.

| Share of test gifts received | Balance before startup donation |
|---|---|
| 100% | $3,493,159 |
| 50% | $43,159 |
| 0% | −$3,406,841 |

## Account 2 — value to a private buyer

For participants, measure affordable willingness to renew, function, chosen participation and time burden against alternatives. A signed renewal is stronger evidence than a positive interview. For insurers, compare attributable paid claims and contracted member-service value with the complete purchase price, internal administration and their next-best prevention option. A $3,600 payment requires at least that much defensible purchaser value before overhead/return; no claims saving of that size is estimated here. A sponsor may buy visible aggregate community service, but brand value is unmeasured and does not justify access to personal records. A donor can rationally fund public benefit without receiving a financial return; that does not establish permanent funding.

Participant payments transfer money to the operator: they are cash receipts, not an additional social benefit on top of service outcomes. An investor contribution changes financing, not operating earnings. Social benefits are not assigned to a private buyer unless separately evidenced and valued without overlap.

## Account 3 — wider social value

Measure function, quality of life, chosen childcare/adult care/volunteering, participant time and carer time against current services and a funded alternative. Use diaries with mutually exclusive primary-activity categories; record simultaneous activity separately. Distinguish new useful time, substitution for existing volunteers, transferred work from another relative and compulsory extra burden. Never treat all healthy time as work or require unpaid contribution as a condition of receiving care.

For illustration only, 250 people adding one chosen hour a week for 40 weeks would contribute 10,000 gross hours. If half displaces others' activity and participation/support consumes 4,000 additional hours, the broad time balance is only 1,000 hours. At zero additional activity it is −4,000. Such subtraction is an opportunity-cost sensitivity, not a measured utility comparison: an hour of valued social participation and an hour of unwanted burden need not have equal welfare value. Report participant/carer outcomes alongside hours. Multiplying net hours by a transparent replacement-cost rate is a sensitivity, never operator cash or an invoice. National unpaid-care valuations do not prove this programme's incremental output. [Australian Bureau of Statistics experimental unpaid-care measurement](https://www.abs.gov.au/statistics/detailed-methodology-information/information-papers/update-measuring-unpaid-care-labour-account).

Do not count the same released carer hour as unpaid output, paid earnings and leisure simultaneously. Do not add overlapping wellbeing and monetised time measures without a clear valuation boundary. Measure independent living and participant-reported goals even if monetisation is inappropriate. Full cost-effectiveness or lifetime value cannot be inferred from this concept arithmetic.



## Account 4 — public effects and usable capacity

Private cash receipts do not prove zero public fiscal effects. Record additional consultations, tests, care needs and any lawful tax concessions separately. Do not finance required programme delivery through hidden public payments. Public savings are not estimated or available as operator cash in this case.

Record clinical and coordination time by profession, location and timing, including programme governance and care induced by detecting needs. Aggregate service budgets do not establish a staffing roster. Usable clinical capacity equals attributable avoided compatible care hours multiplied by the share actually redeployable, less programme hours and induced demand. If programme hours are H and induced hours J for n people, avoided hours per person needed for a positive balance exceed (H+J)/(n×redeployable share), when that share is positive. No numeric gain is claimed before those quantities are measured.

The full evaluation considers functional outcomes, quality of life, additional chosen contribution, household burden, opportunity costs and adverse effects. A positive operator balance, a donation or a community vote is not itself a health or resilience benefit. Wider value cannot be counted again as programme revenue.

## NSW governance and research baseline reconciliation

D1 uses the base overhead allowance; D2 tests lower overhead for the same NSW association. These are planning sensitivities, not quotations or evidence that the legal form is cheaper.

| Cost or funding item | Retained 2026-dollar baseline | What must now be verified |
|---|---|---|
| Setup/formation | $90,000 before reserve, including $15,000 pre-appeal allocation | Custom participatory constitution, formation, contracts, training and governance support |
| Initial/pilot research | $120,000 before reserve | University staff, overhead, methods, ethics, analysis, publication and data duties; no confirmed quote |
| Discovery / campaign | $25,000 / $20,000 before reserve | Allocate university feasibility and community work once; no duplicate charges |
| Total startup / seed within it | $280,500 / $66,000 including reserve | Same totals; underwriting not committed |
| D1 100-person pilot gross target | $891,508, approximately $932,000 at assumed 2027–28 prices | Recalculate against actual complete quotations before appeal |
| Comparative/long-term research | Not priced or included in current operating cashflows | Separate funded work packages before obligations; no claimed ten-year all-in cost |
| Commercialisation revenue | $0 | No dependable amount, rights or transaction exists |

The long-term model therefore remains a service-operating sensitivity, not the complete cost of the proposed service-plus-longitudinal-research program. University cost proposals may increase fundraising requirements. Fund required research milestones before promising them, and do not cover a shortfall by reducing necessary clinical support or silently drawing on public services.
