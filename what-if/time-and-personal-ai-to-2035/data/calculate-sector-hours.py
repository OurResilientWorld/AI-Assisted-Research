"""Reproduce proposed hours targets and a separate staged D2 sensitivity.

All inputs are design illustrations. Source verification is in the accompanying
sector-hours ledger. This does not amend the original action model or estimate
national costs, actual industry hours, feasibility or statistical power.
"""

import csv
import json
from decimal import Decimal, getcontext
from pathlib import Path

getcontext().prec = 28
HERE = Path(__file__).resolve().parent
D = Decimal


def payroll_factor(base, target, gain=D(0)):
    return max(D(0), base / (target * (1 + gain)) - 1)


def generate():
    rows = []
    for baseline in (D("35"), D("37.5"), D("38")):
        for offer, target in (
            ("initial-10-percent", baseline * D("0.9")),
            ("final-20-percent", baseline * D("0.8")),
            ("fixed-32-hours-comparator", D("32")),
        ):
            reduction = 1 - target / baseline
            rows.append({
                "baseline_ordinary_hours": str(baseline),
                "offer": offer,
                "target_ordinary_hours": str(target),
                "reduction_percent": str(100 * reduction),
                "four_equal_days_hours_each": str(target / 4),
                "no_gain_additional_payroll_percent": str(
                    100 * payroll_factor(baseline, target)
                ),
                "status": "illustration-not-agreed-roster",
            })
    with (HERE / "sector-hours-targets.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    baseline_payroll = D("100000000")
    other_d2_costs = D("10150000")  # 4.8m allowances + 5.35m other delivery
    contingency = D("0.2")
    stages = {
        "original-full-year-20-percent": [(12, D("0.8"))],
        "alternative-six-months-10-then-six-months-20": [
            (6, D("0.9")), (6, D("0.8"))
        ],
    }
    scenarios = []
    for name, periods in stages.items():
        assert sum(months for months, _ in periods) == 12
        extra = sum(
            baseline_payroll * D(months) / 12 * payroll_factor(D(1), fraction)
            for months, fraction in periods
        )
        average_reduction = sum(
            D(months) / 12 * (1 - fraction) for months, fraction in periods
        )
        scenarios.append({
            "scenario": name,
            "baseline_annual_payroll_aud": str(baseline_payroll),
            "other_d2_costs_aud": str(other_d2_costs),
            "extra_payroll_aud": str(extra),
            "total_with_20_percent_contingency_aud": str(
                (extra + other_d2_costs) * (1 + contingency)
            ),
            "average_ordinary_hours_reduction_percent": str(
                100 * average_reduction
            ),
            "status": "retained-original" if len(periods) == 1 else "unselected-alternative",
        })
    result = {
        "date": "2026-09-09",
        "assumptions": [
            "Same ordinary remuneration per worker; unchanged required output",
            "Zero effective output-per-hour gain in both scenarios",
            "Costs prorate with months; whole-person staffing constraints excluded",
            "Additional stage-transition and extended evaluation costs excluded",
            "National AI inputs and original D0/D1/D2 model files unchanged",
        ],
        "initial_no_gain_payroll_factor": str(payroll_factor(D(1), D("0.9"))),
        "further_factor_relative_to_intermediate_payroll": str(
            payroll_factor(D("0.9"), D("0.8"))
        ),
        "scenarios": scenarios,
    }
    (HERE / "sector-hours-staged-scenarios.json").write_text(
        json.dumps(result, indent=2) + "\n"
    )
    print(f"Generated {len(rows)} target comparisons and {len(scenarios)} D2 scenarios.")
    for scenario in scenarios:
        total = D(scenario["total_with_20_percent_contingency_aud"])
        print(f"{scenario['scenario']}: A${total / 1000000:.2f}m")


if __name__ == "__main__":
    generate()
