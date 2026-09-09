"""Reproduce foundation arithmetic; illustrative 2026 AUD, not national forecasts.

Run with Python 3. Writes cost-and-time-scenarios.csv beside this script.
No network, package dependencies, population estimate or vendor-price inputs.
"""

import csv
from decimal import Decimal as D
from pathlib import Path


def scenarios():
    rows = []
    for ceiling in (600, 1200, 2400):
        for active in ("0.25", "0.50", "0.75", "1.00"):
            for redeemed in ("0.50", "1.00"):
                cost = D(1000000) * D(active) * D(redeemed) * D(ceiling)
                rows.append({
                    "id": f"B-C{ceiling}-U{active}-R{redeemed}",
                    "kind": "base-service cash cost",
                    "eligible_people": 1000000,
                    "active_share": active,
                    "redeemed_fraction_among_active": redeemed,
                    "annual_ceiling_aud_2026": ceiling,
                    "formula": "N * u * r * C",
                    "result": str(cost),
                    "unit": "AUD_2026_per_year",
                    "limit": "Normalised denominator; excludes support/admin/infrastructure/evaluation/venture; not Australia population",
                })
        rows.append({
            "id": f"B-MAX-{ceiling}", "kind": "maximum base entitlement exposure",
            "eligible_people": 1000000, "annual_ceiling_aud_2026": ceiling,
            "formula": "N * C", "result": str(1000000 * ceiling),
            "unit": "AUD_2026_per_year", "limit": "Full redemption by every eligible person; same exclusions",
        })
    time_cases = [
        ("A-HOURS", "38-hour baseline at 80 percent", "38 * 0.8", D(38) * D("0.8"), "hours_per_week"),
        ("A-32H", "32-hour reduction from 38", "(38 - 32) / 38 * 100", (D(38)-D(32))/D(38)*100, "percent"),
        ("A-OUTPUT", "output per hour increase required", "(1 / (1 - 0.2) - 1) * 100", (1/(1-D("0.2"))-1)*100, "percent"),
        ("A-STAFF", "staff increase for fixed coverage", "(1 / (1 - 0.2) - 1) * 100", (1/(1-D("0.2"))-1)*100, "percent"),
        ("A-COST", "total cost increase when labour share is 60 percent", "0.6 * 0.25 * 100", D("0.6")*D("0.25")*100, "percent"),
    ]
    for identifier, kind, formula, value, unit in time_cases:
        rows.append({"id": identifier, "kind": kind, "formula": formula,
                     "result": str(value), "unit": unit,
                     "limit": "Illustrative constant-output/coverage arithmetic; not measured sector productivity or costs"})
    return rows


if __name__ == "__main__":
    rows = scenarios()
    by_id = {row["id"]: row for row in rows}
    assert D(by_id["B-C1200-U0.50-R1.00"]["result"]) == 600000000
    assert D(by_id["B-C1200-U0.50-R0.50"]["result"]) == 300000000
    assert D(by_id["A-HOURS"]["result"]) == D("30.4")
    assert D(by_id["A-COST"]["result"]) == 15
    fields = ["id", "kind", "eligible_people", "active_share", "redeemed_fraction_among_active",
              "annual_ceiling_aud_2026", "formula", "result", "unit", "limit"]
    target = Path(__file__).with_name("cost-and-time-scenarios.csv")
    with target.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Validated and wrote {len(rows)} illustrative scenarios: {target}")
