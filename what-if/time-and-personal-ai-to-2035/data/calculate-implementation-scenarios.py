"""Reproduce A2/B2 illustrative arithmetic using Python's standard library.

Run in place; writes four CSV files beside this script. No network or spending.
Inputs distinguish ABS age counts/list tariffs from proposed budget assumptions.
"""
import csv
import json
from decimal import Decimal as D
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "implementation-model-inputs.json").read_text())


def decimal(value):
    return D(str(value))


def write(name, rows):
    with (HERE / name).open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def package(n, ceiling, active, redeemed, fixed):
    n, ceiling, active, redeemed = map(decimal, (n, ceiling, active, redeemed))
    service = n * ceiling * active * redeemed
    admin = service * decimal(INPUT["admin_share_of_service_spend"])
    help_cost = n * active * decimal(INPUT["help_share_of_active"]) * decimal(INPUT["help_cost"])
    fixed_total = sum(map(decimal, fixed.values()))
    return dict(service=service, admin=admin, optional_help=help_cost,
                infrastructure=decimal(fixed["infrastructure_availability"]),
                devices=decimal(fixed["devices_connectivity_pool"]),
                evaluation=decimal(fixed["evaluation"]),
                projects=decimal(fixed["project_backing_commitments"]),
                total=service + admin + help_cost + fixed_total)


def national_rows():
    rows = []
    for n in INPUT["population_scenarios"]:
        for c in INPUT["ceilings"]:
            for u in INPUT["uptake"] + [1]:
                for r in (INPUT["redemption"] if u != 1 else [1]):
                    values = package(n, c, u, r, INPUT["fixed_annual"])
                    rows.append(dict(population=n, annual_ceiling=c, uptake=u, redemption=r,
                                     **values, base_maximum=n*c,
                                     one_off=INPUT["one_off_platform_transition"],
                                     description="Illustrative annual AI package; excludes time reform and retained BAU expenditure"))
    return rows


def price_rows():
    rows = []
    for model, price in INPUT["model_prices_usd_per_million"].items():
        for workload, (tokens_in, tokens_out) in INPUT["token_workloads_million"].items():
            usd = decimal(tokens_in)*decimal(price["input"]) + decimal(tokens_out)*decimal(price["output"])
            for fx in INPUT["fx_aud_per_usd_scenarios"]:
                gross = usd*decimal(fx)*decimal(INPUT["gross_tax_factor_scenario"])
                rows.append(dict(model=model, workload=workload, input_million=tokens_in,
                                 output_million=tokens_out, usd=usd, assumed_aud_per_usd=fx,
                                 tax_factor=INPUT["gross_tax_factor_scenario"], gross_aud=gross,
                                 note="Token charges only; no quality equivalence, under-18 eligibility or complete delivered-service claim"))
    return rows


def labour_rows():
    rows = []
    for reduction in map(decimal, INPUT["hours_reduction"]):
        for gain in map(decimal, INPUT["effective_output_per_hour_gain"]):
            multiplier = 1 / ((1-reduction)*(1+gain))
            # Do not count implied headcount cuts as financing for this programme.
            additional = max(D(0), multiplier-1)
            rows.append(dict(hours_reduction=reduction, effective_output_gain=gain,
                             required_fte_multiplier=multiplier,
                             funded_additional_payroll_share=additional,
                             reference_payroll=INPUT["labour_baseline_payroll"],
                             additional_payroll=additional*decimal(INPUT["labour_baseline_payroll"]),
                             note="Constant required output and remuneration; staffing indivisibility, skill mix, capital and redesign extra"))
    return rows


def pathway_rows():
    wf2 = INPUT["wf2_scenario"]
    incremental = package(wf2["selected_people"], wf2["ceiling"], wf2["uptake"], wf2["redemption"], wf2["fixed_annual"])
    personal = package(20000000, 1200, D("0.5"), D("0.75"), INPUT["fixed_annual"])
    rows = []
    for code, annual, once, time in [
        ("WF1", 0, 0, "Existing time arrangements retained in B0"),
        ("WF2", incremental["total"], wf2["one_off"], "T2: added voluntary-trial coverage; not estimated nationally"),
        ("WF3", personal["total"], INPUT["one_off_platform_transition"], "T3: added partial sector coverage; not estimated nationally"),
        ("WF4", personal["total"], INPUT["one_off_platform_transition"], "T4: added integrated sector coverage; not estimated nationally"),
    ]:
        rows.append(dict(pathway=code, illustrative_incremental_ai_annual=annual,
                         illustrative_additional_training_annual=wf2["additional_training_annual"] if code == "WF2" else 0,
                         illustrative_ai_setup=once, time_reform_term=time,
                         retained_baseline="B0: existing spending retained; zero incremental WF1 does not mean zero total spending",
                         complete_cost_formula="B0 + incremental AI + additional training + T_pathway + capital/redesign not already included",
                         note="No national combined total claimed; public and employer time-cost shares must be separated"))
    return rows


if __name__ == "__main__":
    national, prices, labour, paths = national_rows(), price_rows(), labour_rows(), pathway_rows()
    central = package(20000000,1200,D("0.5"),D("0.75"),INPUT["fixed_annual"])
    maximum = package(20000000,1200,1,1,INPUT["fixed_annual"])
    assert central["total"] == D("10600000000")
    assert maximum["total"] == D("26550000000")
    assert sum(s["awards"]*s["ceiling"] for s in INPUT["project_stages"]) == 250000000
    assert next(r for r in prices if r["model"]=="claude-sonnet-4-6" and r["workload"]=="builder" and r["assumed_aud_per_usd"]==1.5)["gross_aud"] == 99
    assert next(r for r in labour if r["hours_reduction"]==D("0.2") and r["effective_output_gain"]==0)["additional_payroll"] == 25000000
    with (HERE / "resident-population-by-age.csv").open() as stream:
        ages = list(csv.DictReader(stream))
    assert sum(int(r["resident_population"]) for r in ages) == 27611026
    assert sum(int(r["resident_population"]) for r in ages if int(r["age"])>=16) == 22467512
    for name, rows in [("national-ai-cost-scenarios.csv",national),("service-price-scenarios.csv",prices),
                       ("labour-coverage-scenarios.csv",labour),("implementation-pathway-costs.csv",paths)]:
        write(name,rows)
        print(f"{name}: {len(rows)} rows")
    print(f"Central annual AI scenario: {central['total']}; full-redemption scenario: {maximum['total']}")
