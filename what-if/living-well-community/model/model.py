"""Standalone community programme. Deterministic assumptions, not observations.
D1/D2 are same-association overhead scenarios; all delivery arrangements require startup crowdfunding.
"""
from pathlib import Path
import csv,json
HERE=Path(__file__).resolve().parent
SOURCE=HERE/'service-cost-assumptions.json'
SERVICE=json.loads(SOURCE.read_text());KEYS=list(SERVICE['costs']['lower'])
UNITS={b:{k:(SERVICE['costs']['lower'][k]+SERVICE['costs']['upper'][k])/2 if b=='midpoint' else SERVICE['costs'][b][k] for k in KEYS} for b in ['lower','midpoint','upper']}
INPUTS={'price_year':2026,'inflation':.03,'reserve':.1,'watch_life_years':3,
 'service_units':UNITS,'source_cost_file':'Model/service-cost-assumptions.json',
 'options':{'D1':'NSW Living Well incorporated association — base overhead','D2':'Same NSW association — lower-overhead sensitivity'},
 'fixed':{'D1':[120000,180000,410000],'D2':[100000,150000,350000]},
 'scales':[100,250,1000],'setup':90000,'pilot_evaluation':120000,'discovery':25000,'campaign_preparation':20000,'preappeal_formation_from_setup':15000,
 'crowd_fee_fraction':.05,'crowd_loss_fraction':.03,'concession_share':.2,'concession_monthly':60,
 'full_monthly_fee':200,'sponsor_per_person':1000,'annual_retention':.8,'ramp':[100,250,500,750,1000,1000,1000,1000,1000,1000],
 'startup_crowdfunding_required':True,'pilot_ordinary_receipts':0,
 'research_budget_scope':'Initial/pilot university research placeholder only; later phases separately costed and funded. No royalties, grants or unconfirmed university subsidy.',
 'scenario_scope':'D1 base and D2 lower overhead sensitivity for the same NSW association; not quoted prices for delivery arrangements.',
 'warning':'All amounts, uptake, timing and outcomes are assumptions. No funding or Living Well entity is established. Pilot funded upfront by donations; recurring payment tests begin after pilot.'}
MODELS=list(INPUTS['options'])
def units(b='midpoint'):return UNITS[b]
def recurring(b='midpoint'):
 u=units(b);return u['clinical_and_community_per_active']+u['ai_per_active']+u['data_per_active']
def first_unit(b='midpoint'):return sum(units(b).values())
def startup():return 1.1*sum(INPUTS[k] for k in ['setup','pilot_evaluation','discovery','campaign_preparation'])
def seed():return 1.1*(INPUTS['discovery']+INPUTS['campaign_preparation']+INPUTS['preappeal_formation_from_setup'])
def fixed(m,n):
 xs=INPUTS['scales'];ys=INPUTS['fixed'][m]
 if n<=100:return ys[0]
 if n>=1000:return ys[-1]*n/1000
 for i in range(2):
  if xs[i]<=n<=xs[i+1]:return ys[i]+(ys[i+1]-ys[i])*(n-xs[i])/(xs[i+1]-xs[i])
def income(n,funding='members_sponsor',donor_renewal=1):
 # These are renewal hypotheses AFTER the crowdfunded pilot, common across delivery options.
 if funding=='insurer_equity':return {'participant':0,'contract':n*.8*3600,'donor':n*.2*3600}
 full=300 if funding=='members_only' else 200
 return {'participant':n*(.8*full+.2*60)*12,'contract':n*1000 if funding=='members_sponsor' else 0,
 'donor':n*1000*.92*donor_renewal if funding=='members_supporters' else 0}
def cost(m,n,b='midpoint',extra=0):return 1.1*(fixed(m,n)+n*(first_unit(b)+extra))
def annual(m,n,b='midpoint',funding='members_sponsor'):
 c=cost(m,n,b);i=income(n,funding)
 return {'delivery':m,'basis':b,'n':n,'funding_test':funding,**i,'cost':c,'net':sum(i.values())-c,'cost_per_person':c/n,
 'full_fee_break_even':(c-i['contract']-i['donor']-n*.2*60*12)/(n*.8*12) if funding!='insurer_equity' else None}
def campaign(m,n,b='midpoint',deductions=.08):
 c=cost(m,n,b);buffer=c/4;net=c+startup()+buffer
 return {'delivery':m,'basis':b,'n':n,'deductions':deductions,'pilot_cost':c,'startup':startup(),'buffer':buffer,
 'net_required_2026':net,'gross_target_2026':net/(1-deductions),'gross_target_nominal':net/(1-deductions)*1.03**1.5,'seed_at_risk_2026':seed(),'actual_committed':0}
def monthly(m,n,scenario='base',b='midpoint'):
 # Month0 is funding clearance: repay seed (including formation allocation), then remaining setup/evaluation.
 # No pilot membership fees/sponsor/insurer income also counted against full upfront donations.
 f=1.03**1.5;c=campaign(m,n,b);balance=c['net_required_2026']*f;u=units(b)
 rows=[dict(delivery=m,scenario=scenario,month=0,donation_cash=balance,ordinary_receipts=0,outflow=startup()*f,balance=balance-startup()*f)]
 balance-=startup()*f
 for month in range(1,13):
  charge=1.1*(fixed(m,n)/12+n*recurring(b)/12)*f
  if month==1:charge+=n*(u['onboarding_per_new']+u['watch_unit'])*1.1*f
  if scenario=='workforce' and month==1:charge+=n*(u['clinical_and_community_per_active']+u['onboarding_per_new'])*.3*1.1*f
  if scenario=='outage' and month==7:charge+=(n*300+10000)*1.1*f
  balance-=charge
  rows.append(dict(delivery=m,scenario=scenario,month=month,donation_cash=0,ordinary_receipts=0,outflow=charge,balance=balance))
 return rows
def ramp(m,retention=.8,b='midpoint',funding='members_sponsor',donor_renewal=1):
 cohorts=[];rows=[];cash=0
 for y,n in enumerate(INPUTS['ramp']):
  cohorts=[(age+1,count*retention) for age,count in cohorts];cont=sum(c for a,c in cohorts);new=n-cont
  replacement=sum(c for a,c in cohorts if a%3==0);cohorts.append((0,new));u=units(b)
  out=1.1*(fixed(m,n)+n*recurring(b)+new*u['onboarding_per_new']+(new+replacement)*u['watch_unit'])+(startup() if y==0 else 0)
  receipts=0 if y==0 else sum(income(n,funding,donor_renewal).values())
  donation=campaign(m,n,b)['net_required_2026'] if y==0 else 0
  factor=1.03**(y+1.5);cash+=(receipts+donation-out)*factor
  rows.append(dict(delivery=m,basis=b,funding_test=funding,year_end=2028+y,n=n,new=new,continuing=cont,replacement_watches=replacement,
  cost_2026=out,ordinary_receipts_2026=receipts,startup_donation_finance_2026=donation,net_before_startup_finance_2026=receipts-out,
  cost_nominal=out*factor,ordinary_receipts_nominal=receipts*factor,startup_donation_finance_nominal=donation*factor,closing_cash_nominal=cash))
 return rows
def stress(m,n=250):
 revenue=sum(income(n).values());u=first_unit()
 specs={'base':(0,0,revenue),'lower_allowances':(first_unit('lower')-u,0,revenue),'upper_allowances':(first_unit('upper')-u,0,revenue),
 'workforce_30pct_support_onboarding':(600,0,revenue),'rural_access':(600,0,revenue),'heat_fire':(150,15000,revenue),
 'higher_support_needs':(300,0,revenue),'technology_outage':(300,10000,revenue),'adverse_ai':(300,50000,revenue),
 'recession_25pct_receipts_lost':(0,0,revenue*.75),'sponsor_exit':(0,0,income(n)['participant']),
 'no_health_gain':(0,0,revenue),'no_payer':(0,0,0)}
 return [dict(delivery=m,scenario=s,cost=cost(m,n,extra=extra)+fixed_extra*1.1,receipts=rev,net=rev-cost(m,n,extra=extra)-fixed_extra*1.1) for s,(extra,fixed_extra,rev) in specs.items()]
def intergenerational():
    """Illustrative cohort; compare fixed-original and exposure-scaled later care."""
    rows=[]
    for decay in [1.0,.95]:
        for delay,persistence in [(0,0),(0,5),(3,5),(0,20),(3,20)]:
            for extra_life_year in [0,.02]:
                for care_basis in ['original_cohort','exposure_scaled']:
                    family=burden=extra_care=0
                    discounted={d:0 for d in [0,.03,.05]}
                    for year in range(1,21):
                        exposure=250*decay**(year-1)
                        family+=(24 if delay < year <= persistence else 0)*exposure
                        if year<=5:burden+=16*exposure
                        care_exposure=250 if care_basis=='original_cohort' else exposure
                        care=care_exposure*extra_life_year*100 if year>10 else 0
                        extra_care+=care
                        for d in discounted:discounted[d]+=care*80/(1+d)**year
                    rows.append(dict(exposure_factor=decay,benefit_delay_years=delay,persistence_years=persistence,
                        later_care_basis=care_basis,
                        extra_person_years_per_person_per_late_year=extra_life_year,
                        gross_family_hours=family,participant_and_family_burden_hours=burden,
                        net_time_balance_hours=family-burden,
                        additional_later_care_hours=extra_care,
                        additional_later_care_cost_2026=extra_care*80,
                        later_care_present_value_3pct=discounted[.03],
                        later_care_present_value_5pct=discounted[.05]))
    return rows



def ramp_sensitivities():
 result=[]
 for m in MODELS:
  for ret in [.8,.6]:
   for b in ['lower','midpoint','upper']:
    for fund in ['members_sponsor','members_only','insurer_equity','members_supporters']:
     for q in ([1,.5,0] if fund=='members_supporters' else [1]):
      rows=ramp(m,ret,b,fund,q)
      result.append(dict(delivery=m,retention=ret,basis=b,funding_test=fund,donor_renewal=q,
       ten_year_cost_2026=sum(r['cost_2026'] for r in rows),ten_year_ordinary_receipts_2026=sum(r['ordinary_receipts_2026'] for r in rows),
       ten_year_balance_before_startup_finance_2026=sum(r['net_before_startup_finance_2026'] for r in rows),
       startup_donation_finance_2026=rows[0]['startup_donation_finance_2026'],closing_cash_nominal=rows[-1]['closing_cash_nominal']))
 return result
def crowdfunding():
 return [dict(**campaign(m,n,b,d),collection_fraction=q,published_gross_target_2026=campaign(m,n,b)['gross_target_2026'],net_collected_2026=campaign(m,n,b)['gross_target_2026']*q*(1-d),
 shortfall_2026=max(0,campaign(m,n,b)['net_required_2026']-campaign(m,n,b)['gross_target_2026']*q*(1-d)),
 cleared_gate_pass=campaign(m,n,b)['gross_target_2026']*q*(1-d)+.00001>=campaign(m,n,b)['net_required_2026'])
 for m in MODELS for n in INPUTS['scales'] for b in ['lower','midpoint','upper'] for q,d in [(1,.08),(.5,.08),(0,.08),(1,.15)]]
def write_csv(name,rows):
 with (HERE/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
def generate():
 (HERE/'inputs.json').write_text(json.dumps(INPUTS,indent=2)+'\n')
 data={'annual-options.csv':[annual(m,n,b,f) for m in MODELS for n in INPUTS['scales'] for b in UNITS for f in ['members_sponsor','members_only','insurer_equity','members_supporters']],
 'monthly-cash.csv':[r for m in MODELS for s in ['base','workforce','outage'] for r in monthly(m,100,s)],
 'opening-finance.csv':[campaign(m,n,b) for m in MODELS for n in INPUTS['scales'] for b in UNITS],
 'stress-tests.csv':[r for m in MODELS for r in stress(m)],'ten-year-cash.csv':[r for m in MODELS for r in ramp(m)],
 'ten-year-sensitivities.csv':ramp_sensitivities(),'twenty-year-sensitivity.csv':intergenerational(),'crowdfunding.csv':crowdfunding()}
 for name,rows in data.items():write_csv(name,rows)
 print(json.dumps({'startup':startup(),'seed':seed(),'pilot100':[campaign(m,100) for m in MODELS]},indent=2))
if __name__=='__main__':generate()
