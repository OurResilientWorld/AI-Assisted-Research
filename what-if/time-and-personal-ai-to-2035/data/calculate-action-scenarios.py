"""Illustrative envelopes and precision, not a power analysis or procurement estimate.
Run with Python 3; writes two CSVs beside this script. No network or spending.
"""
import csv
import json
from decimal import Decimal as D
from pathlib import Path
P = Path(__file__).resolve().parent
I = json.loads((P/'action-model-inputs.json').read_text())

def write(name, rows):
    with (P/name).open('w', newline='') as f:
        w=csv.DictWriter(f,fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)

def budgets():
    rows=[]
    for stage,s in I['stages'].items():
        gains=s.get('effective_gain_scenarios',['0'])
        for gain in gains:
            entitlement=D(s.get('people',0))*D(s.get('annual_ceiling',0))*D(s.get('months',0))/12
            expected=entitlement*D(s.get('redemption_expected','1'))
            coverage=D(0)
            if stage=='D2':
                coverage=D(s['baseline_annual_payroll'])*max(D(0),1/((1-D(s['hours_reduction']))*(1+D(gain)))-1)
            fixed=sum(map(D,s['items'].values()))
            subtotal=entitlement+fixed+coverage
            reserve=subtotal*D(I['contingency_share'])
            rows.append(dict(stage=stage,effective_hourly_gain=gain,period=s['period'],people=s.get('people',0),base_entitlement=entitlement,expected_service_spend=expected,unredeemed_entitlement_reserve=entitlement-expected,other_costs=fixed,additional_payroll=coverage,subtotal=subtotal,contingency=reserve,total_envelope=subtotal+reserve))
    return rows

def precision():
    s=I['precision']; rows=[]
    for n in s['survey_completes']:
        for deff in s['design_effects']:
            effective=D(n)/D(deff)
            half=D(s['z'])*(D(s['p'])*(1-D(s['p']))/effective).sqrt()*100
            rows.append(dict(kind='probability_survey_illustration',nominal_n=n,responding_n=n,design_effect=deff,effective_n=effective,half_width_percentage_points=half,icc='',note='95% normal approximation at p=.5; excludes coverage nonresponse measurement bias; not opt-in poll MOE'))
    for icc in s['icc']:
        n=D(s['cluster_people'])*D(s['followup_response_share'])
        # Conservative illustration retains original cluster size despite attrition.
        deff=1+(D(s['cluster_size'])-1)*D(icc)
        effective=n/deff
        half=D(s['z'])*(D('.25')/effective).sqrt()*100
        rows.append(dict(kind='clustered_descriptive_illustration',nominal_n=s['cluster_people'],responding_n=n,design_effect=deff,effective_n=effective,half_width_percentage_points=half,icc=icc,note='One descriptive proportion only; no causal power or national inference; equal clusters and conservative original m'))
    return rows

if __name__=='__main__':
    b=budgets(); r=precision()
    by={(x['stage'],x['effective_hourly_gain']):x for x in b}
    assert by['D0','0']['total_envelope']==D('420000')
    assert by['D1','0']['total_envelope']==D('1860000')
    assert by['D2','0']['total_envelope']==D('42180000')
    assert by['D2','0.25']['additional_payroll']==0
    assert by['C','0']['total_envelope']==D('1200000')
    assert by['D1','0']['base_entitlement']==D('600000')
    assert by['D2','0']['base_entitlement']==D('4800000')
    assert all(x['expected_service_spend']+x['unredeemed_entitlement_reserve']==x['base_entitlement'] for x in b)
    assert by['D2','0']['total_envelope']>by['D2','0.10']['total_envelope']>by['D2','0.25']['total_envelope']
    assert len(b)==6 and len(r)==12
    write('action-budget-scenarios.csv',b);write('action-precision-scenarios.csv',r)
    print('PASS: budget/exposure invariants; 6 budget rows; 12 precision illustrations')
