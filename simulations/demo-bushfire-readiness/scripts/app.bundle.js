(function () {
const appMeta = {
  title: "Our Resilient World",
  product: "Demo Bushfire Readiness Simulator",
  strapline: "Use the four sliders to see which actions this demonstration treats as most effective at reducing bushfire risk. Compare business as usual with your chosen actions, then switch the Extreme El Niño test on or off to see how harsher conditions change priorities. The numbers are transparent demo assumptions, not forecasts."
};

const defaultSliders = {
  detection: 35,
  initialAttack: 30,
  apzEmber: 25,
  mechanicalSlashing: 20
};

const sliderDefinitions = [
  {
    key: "detection",
    label: "Faster detection",
    shortLabel: "Detection",
    description: "Investment in faster fire detection and dispatch activation.",
    responsibility: "Shared responsibility",
    min: 0,
    max: 100
  },
  {
    key: "initialAttack",
    label: "Initial attack pre-positioning",
    shortLabel: "Initial attack",
    description: "Additional pre-season positioning and surge readiness of crews and assets.",
    responsibility: "State and territory led",
    min: 0,
    max: 100
  },
  {
    key: "apzEmber",
    label: "APZ + ember protection",
    shortLabel: "APZ + ember",
    description: "An Asset Protection Zone (APZ) is a managed area around a home or other asset. This action reduces nearby fuel and improves protection against burning embers entering buildings.",
    responsibility: "Shared responsibility",
    min: 0,
    max: 100
  },
  {
    key: "mechanicalSlashing",
    label: "Mechanical slashing",
    shortLabel: "Slashing",
    description: "Rapid mechanical treatment in priority corridors and access edges.",
    responsibility: "Shared responsibility",
    min: 0,
    max: 100
  }
];

const metricDefinitions = [
  {
    key: "riskScore",
    label: "Bushfire risk score",
    unit: "/100",
    description: "The remaining risk in your scenario. Lower is better. This is a demonstration score, not the probability of a fire."
  },
  {
    key: "riskReduction",
    label: "Risk reduced by your actions",
    unit: "points",
    description: "The difference between the BAU risk score and your remaining risk. More points means a larger combined effect from your selected actions."
  },
  {
    key: "strongestAction",
    label: "Strongest action now",
    unit: "",
    description: "The action making the largest contribution at your current slider settings. It can change when you move a slider or change the test conditions."
  },
  {
    key: "implementationReadiness",
    label: "Implementation Readiness",
    unit: "/100",
    description: "A simple estimate of how ready the selected package may be to deliver. It starts at 40 for existing capacity and is not a guarantee of results."
  }
];

const scenarioContext = {
  geography: "Australia",
  subGeography: "National public comparison view",
  conditionBand: "Extreme El Niño test",
  fuelContext: "Mixed",
  saturation: "Medium",
  targetDate: "1 December 2026"
};

const geographyCards = [
  {
    title: "Australia",
    copy: "National comparisons are recalculated from geography-weighted context rather than implied from a single top-level constant.",
    tag: "National literacy"
  },
  {
    title: "State and territory",
    copy: "State views add more realistic operational context while preserving a clear public explanation of assumptions and shared responsibility.",
    tag: "Operational context"
  },
  {
    title: "LGA context",
    copy: "Local views distinguish observed local backdrops from state or national assumptions so the interface does not overclaim local precision.",
    tag: "Context, not certainty"
  }
];

const sourceRegister = [
  {
    source: "CSIRO NBIC",
    detail: "National hazard and vulnerability backbone for fireline intensity and building loss context.",
    className: "Observed"
  },
  {
    source: "BoM",
    detail: "The Bureau reported on 1 July 2026 that El Niño is underway and may bring drier and warmer conditions, while warning that its local effects vary. The Extreme El Niño setting is a declared test assumption, not a Bureau fire forecast.",
    className: "Derived"
  },
  {
    source: "AFAC Seasonal Bushfire Outlook",
    detail: "National seasonal outlook context used to frame elevated-condition comparisons without implying a forecast.",
    className: "Derived"
  },
  {
    source: "State fire agencies and standards",
    detail: "State fire agency guidance and bushfire protection standards inform APZ, ember protection, and readiness framing.",
    className: "Modeled"
  },
  {
    source: "Phase 0 intervention priors",
    detail: "Provisional steel-thread effect and deployability assumptions kept visible until coefficient sign-off is complete.",
    className: "Assumed"
  }
];

const scenarioContent = {
  sourcesEvidenceClasses: ["Observed", "Derived", "Modeled", "Assumed"],
  evidenceCards: [
    {
      className: "Observed",
      title: "Observed",
      copy: "Published hazard, vulnerability, and climate records used as the backbone for the literacy tool."
    },
    {
      className: "Derived",
      title: "Derived",
      copy: "Calculated views such as BAU references and normalized pathway scores that combine multiple observed inputs."
    },
    {
      className: "Modeled",
      title: "Modeled",
      copy: "Scenario-response curves that turn the current four sliders into public comparison outputs."
    },
    {
      className: "Assumed",
      title: "Assumed",
      copy: "Declared placeholders where evidence gaps remain and where the mockup must not overstate certainty."
    }
  ],
  assumptions: [
    "The typical-condition BAU risk score is 65; the Extreme El Niño test raises that starting score to 85.",
    "Each slider removes a declared number of risk points. Under the Extreme El Niño test, APZ and ember protection receive more weight while detection, response and slashing receive less.",
    "A minimum remaining-risk score of 18 applies in typical conditions and 32 in the Extreme El Niño test, so the demo never implies that action removes all risk.",
    "These values illustrate how priorities can be compared. They are provisional assumptions, not forecasts, probabilities or evaluated intervention coefficients."
  ],
  aboutBullets: [
    "This is a structured expert-judgment and evidence-weighted scenario model.",
    "It is not an operational fire forecast.",
    "It is not a real-time spread simulator.",
    "It does not replace warnings, forecasts, or emergency instructions."
  ]
};


const routes = [
  { id: "simulator", label: "Simulator" },
  { id: "sources", label: "Sources & Assumptions" },
  { id: "geography", label: "Geography", disabled: true },
  { id: "about", label: "About the Model" }
];

function normalizeRoute(hash = "") {
  const route = hash.replace(/^#\/?/, "").trim().toLowerCase();
  return routes.some((item) => item.id === route && !item.disabled) ? route : "simulator";
}

function getRouteLabel(routeId) {
  const route = routes.find((item) => item.id === routeId);
  return route ? route.label : routes[0].label;
}


const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const conditionProfiles = {
  typical: {
    key: "typical",
    label: "Typical-condition test",
    bauRisk: 65,
    minimumRisk: 18,
    maxRiskReduction: {
      detection: 17,
      initialAttack: 19,
      apzEmber: 16,
      mechanicalSlashing: 14
    }
  },
  extremeElNino: {
    key: "extremeElNino",
    label: "Extreme El Niño test",
    bauRisk: 85,
    minimumRisk: 32,
    maxRiskReduction: {
      detection: 14,
      initialAttack: 16,
      apzEmber: 26,
      mechanicalSlashing: 11
    }
  }
};

function deployability(sliders) {
  const readiness =
    sliders.detection * 0.24 +
    sliders.initialAttack * 0.29 +
    sliders.apzEmber * 0.25 +
    sliders.mechanicalSlashing * 0.22;

  return Math.round(40 + readiness * 0.45);
}

function riskReductionByLever(sliders, profile) {
  const rawImpacts = Object.fromEntries(
    Object.entries(profile.maxRiskReduction).map(([key, maximum]) => [
      key,
      maximum * (clamp(Number(sliders[key] ?? 0), 0, 100) / 100)
    ])
  );
  const rawTotal = Object.values(rawImpacts).reduce((total, value) => total + value, 0);
  const maximumTotal = profile.bauRisk - profile.minimumRisk;
  const scale = rawTotal > maximumTotal ? maximumTotal / rawTotal : 1;

  return Object.fromEntries(
    Object.entries(rawImpacts).map(([key, value]) => [key, Math.round(value * scale * 10) / 10])
  );
}

function calculateScenario(sliders, options = {}) {
  const profile = options.extremeElNino === false ? conditionProfiles.typical : conditionProfiles.extremeElNino;
  const leverImpacts = riskReductionByLever(sliders, profile);
  const totalReduction = Object.values(leverImpacts).reduce((total, value) => total + value, 0);
  const riskScore = Math.round(clamp(profile.bauRisk - totalReduction, profile.minimumRisk, profile.bauRisk));
  const strongestEntry = Object.entries(leverImpacts).sort((a, b) => b[1] - a[1])[0];
  const strongestAction = strongestEntry?.[1] > 0 ? strongestEntry[0] : null;

  return {
    condition: profile,
    bau: { riskScore: profile.bauRisk },
    active: { riskScore },
    leverImpacts,
    activeMetrics: {
      riskScore,
      riskReduction: profile.bauRisk - riskScore,
      strongestAction,
      strongestActionImpact: strongestEntry?.[1] ?? 0,
      implementationReadiness: deployability(sliders)
    }
  };
}



function metricValue(metricKey, scenario) {
  const strongestSlider = sliderDefinitions.find((slider) => slider.key === scenario.activeMetrics.strongestAction);
  const values = {
    riskScore: scenario.activeMetrics.riskScore,
    riskReduction: scenario.activeMetrics.riskReduction,
    strongestAction: strongestSlider?.shortLabel ?? "None yet",
    implementationReadiness: scenario.activeMetrics.implementationReadiness
  };

  return values[metricKey];
}

function sliderMarkup(slider, value) {
  return `
    <label class="slider-card" for="slider-${slider.key}">
      <div class="slider-head">
        <div>
          <span class="eyebrow">Intervention lever</span>
          <h3>${slider.label}</h3>
        </div>
        <output class="slider-value" data-slider-value="${slider.key}">${value}</output>
      </div>
      <p>${slider.description}</p>
      <input
        id="slider-${slider.key}"
        name="${slider.key}"
        type="range"
        min="${slider.min}"
        max="${slider.max}"
        value="${value}"
        data-slider="${slider.key}"
      />
      <div class="slider-meta">
        <span>Who acts: ${slider.responsibility}</span>
        <span>Your chosen level</span>
      </div>
    </label>
  `;
}

function metricMarkup(metric, scenario) {
  return `
    <article class="metric-card metric-card-${metric.key}">
      <span class="eyebrow">${metric.label}</span>
      <strong>${metricValue(metric.key, scenario)}</strong>
      <span>${metric.unit}</span>
      <p>${metric.description}</p>
    </article>
  `;
}

function leverImpactMarkup(scenario) {
  const scaleMaximum = Math.max(...Object.values(scenario.condition.maxRiskReduction));

  return `
    <section class="lever-impact-panel" aria-labelledby="lever-impact-title">
      <h3 id="lever-impact-title">Which actions reduce risk most?</h3>
      <p>Longer bars mean a larger reduction at your current slider settings. The ranking changes as you move the sliders or switch the Extreme El Niño test.</p>
      <div class="lever-impact-list">
        ${sliderDefinitions.map((slider) => {
          const impact = scenario.leverImpacts[slider.key];
          const width = scaleMaximum > 0 ? (impact / scaleMaximum) * 100 : 0;
          return `
            <div class="lever-impact-row">
              <span>${slider.shortLabel}</span>
              <div class="lever-impact-track" aria-hidden="true"><i style="width:${width}%"></i></div>
              <strong>${impact.toFixed(1)} pts</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function impactBars(scenario) {
  const bauScore = scenario.bau.riskScore;
  const activeScore = scenario.activeMetrics.riskScore;

  return `
    <div class="chart-panel" aria-labelledby="risk-chart-title" aria-describedby="risk-chart-description">
      <h3 class="visually-hidden" id="risk-chart-title">Bushfire risk comparison</h3>
      <div class="chart-legend">
        <span><i class="legend-dot bau"></i>Business as usual</span>
        <span><i class="legend-dot active"></i>Your scenario</span>
      </div>
      <div class="readiness-chart">
        <div class="readiness-y-title">Bushfire risk score (0–100)</div>
        <div class="readiness-y-labels" aria-hidden="true">
          <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
        </div>
        <div class="readiness-plot">
          <div class="readiness-gridlines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <div class="readiness-bars">
            <div class="readiness-bar-group" style="--score:${bauScore}">
              <strong>${bauScore}</strong>
              <div class="readiness-bar bau" style="height:${bauScore}%"></div>
              <span>BAU risk</span>
            </div>
            <div class="readiness-bar-group" style="--score:${activeScore}">
              <strong>${activeScore}</strong>
              <div class="readiness-bar active" style="height:${activeScore}%"></div>
              <span>Your scenario</span>
            </div>
          </div>
        </div>
      </div>
      <div class="readiness-x-title">Scenario</div>
      <p class="chart-explanation" id="risk-chart-description"><strong>How to read this graph:</strong> BAU is the starting bushfire risk if no extra action is taken. Your scenario is the risk left after your selected actions. A shorter blue bar means your choices have reduced risk. This is a comparison score, not the chance of a fire occurring.</p>
      ${leverImpactMarkup(scenario)}
      <button
        type="button"
        class="geo-insight-trigger is-disabled"
        data-geo-insight-open
        aria-disabled="true"
        disabled
        title="Geo-spatial insight is not available in this demo"
      >
        View geo-spatial insight
      </button>
      <dialog
        class="geo-insight-dialog"
        id="geo-insight-dialog"
        aria-labelledby="geo-insight-title"
        aria-describedby="geo-insight-description"
      >
        <div class="geo-insight-card">
          <div class="geo-insight-heading">
            <span class="eyebrow" id="geo-insight-title">Geo-spatial insight</span>
            <button type="button" class="geo-insight-close" data-geo-insight-close aria-label="Close geo-spatial insight">Close</button>
          </div>
          <div class="geo-insight-image" aria-hidden="true"></div>
        <p id="geo-insight-description">A future geographic view could show where the selected actions may matter most. This demonstration does not yet include a working map or local risk data.</p>
        </div>
      </dialog>
    </div>
  `;
}

function improvementStatement(scenario) {
  const reduction = scenario.activeMetrics.riskReduction;
  const heading = reduction > 0
    ? `Your selected actions reduce the demo bushfire risk score from ${scenario.bau.riskScore} to ${scenario.active.riskScore}`
    : "No extra action is selected, so your risk score remains at BAU";
  const result = reduction > 0 ? `${reduction} points lower` : "No change";

  return `
    <div class="difference-banner">
      <div>
        <span class="eyebrow">Your result</span>
        <h2>${heading}</h2>
      </div>
      <strong>${result}</strong>
    </div>
  `;
}

function createSimulatorMarkup({ sliders, scenario, extremeElNino = true }) {
  const sliderState = sliders ?? {};

  return `
    <section class="screen screen-simulator">
      <div class="simulator-app-frame">
        <aside class="simulator-rail">
          <div class="rail-profile">
            <div class="rail-avatar" aria-hidden="true">◆</div>
            <div>
              <strong>Public Scenario</strong>
              <span>${scenarioContext.subGeography}</span>
            </div>
          </div>
          <nav class="rail-nav" aria-label="Simulator sections">
            <a href="#/simulator" class="is-active">Current Simulation</a>
            <a class="is-disabled" aria-disabled="true" tabindex="-1" title="Not available in this demo">Geography</a>
            <a href="#/sources">Sources & Assumptions</a>
            <a href="#/about">About the Model</a>
          </nav>
          <div class="rail-cta is-disabled" aria-disabled="true" title="Not available in this demo">New Scenario</div>
          <div class="rail-meta">
            <span class="is-disabled" aria-disabled="true" title="Not available in this demo">Help</span>
            <span class="is-disabled" aria-disabled="true" title="Not available in this demo">Feedback</span>
          </div>
        </aside>

        <div class="simulator-stage">
          <div class="simulator-heading">
            <span class="kicker">Simulations</span>
            <h1>${appMeta.product}</h1>
            <p class="simulator-purpose">${appMeta.strapline}</p>
            <div class="simulator-heading-row">
              <div class="hero-chips">
                <span class="chip chip-location is-disabled" aria-disabled="true" title="National comparison is not available in this demo">${scenarioContext.geography} / National comparison</span>
                <button type="button" class="chip chip-alert condition-toggle ${extremeElNino ? "is-on" : ""}" data-extreme-toggle aria-pressed="${extremeElNino}">EXTREME EL NIÑO TEST: ${extremeElNino ? "ON" : "OFF"}</button>
              </div>
            </div>
            <p class="condition-explanation"><strong>${extremeElNino ? "Test on:" : "Test off:"}</strong> ${extremeElNino ? "raises the BAU risk and gives more weight to passive APZ and ember protection, which can still help when detection and emergency response are under greater strain." : "uses the typical-condition demo assumptions, where detection and early response have relatively more influence."} The Bureau reports El Niño is underway in 2026, but this setting is a test assumption—not a fire-season forecast. <a href="https://www.bom.gov.au/news-and-media/el-nino-what-it-means-for-australias-climate" target="_blank" rel="noopener noreferrer">Read the Bureau explanation.</a></p>
          </div>

          <div class="simulator-grid simulator-grid-primary">
            <aside class="panel controls-panel simulator-controls-panel">
              <div class="section-heading">
                <h2>Simulation Levers</h2>
                <p>Move the sliders to test an example package. Reset to BAU sets all four actions to zero.</p>
              </div>
              <button type="button" class="reset-bau-button" data-reset-bau>Reset to BAU</button>
              <div class="slider-stack">
                ${sliderDefinitions.map((slider) => sliderMarkup(slider, sliderState[slider.key] ?? 0)).join("")}
              </div>
              <div class="slider-key">
                <p><strong>Shared responsibility</strong> means households, landholders, councils and state agencies all have a role.</p>
                <p><strong>Your chosen level</strong> is the amount of additional action you are testing with that slider.</p>
              </div>
            </aside>

            <section class="panel results-panel simulator-results-panel">
              ${improvementStatement(scenario)}
              <div class="section-heading projection-heading">
                <div>
                  <h2>How your choices reduce risk</h2>
                  <p>Lower risk is better; the action-impact bars show which levers make the largest difference.</p>
                </div>
              </div>
              ${impactBars(scenario)}
              <div class="comparison-copy simulator-notes">
                <article>
                  <span class="eyebrow">Business as usual</span>
                  <strong>${scenario.bau.riskScore}/100 risk</strong>
                  <p>The starting score if no additional action is taken under the selected test conditions.</p>
                </article>
                <article>
                  <span class="eyebrow">Active Scenario</span>
                  <strong>${scenario.active.riskScore}/100 risk</strong>
                  <p>The risk remaining after the four slider settings are applied. Lower is better.</p>
                </article>
              </div>
            </section>

            <aside class="metrics-column">
              <div class="metrics-introduction">
                <h2>What these measures mean</h2>
                <p>These simple comparison measures show the effect of your choices. They are demo assumptions—not forecasts, probabilities or guarantees.</p>
              </div>
              <div class="metrics-grid metrics-grid-sidebar">
                ${metricDefinitions.map((metric) => metricMarkup(metric, scenario)).join("")}
              </div>
            </aside>
          </div>

          <div class="simulator-footer-row">
            <span class="footer-action footer-action-primary is-disabled" aria-disabled="true" title="Not available in this demo">Share Scenario</span>
            <a href="#/sources" class="footer-action">Sources / Assumptions</a>
            <p class="footer-note">The risk scores and action weights are declared demonstration assumptions. They are not forecasts or probabilities.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}



function createSourcesMarkup() {
  return `
    <section class="screen screen-sources">
      <div class="section-heading section-heading-wide">
        <span class="kicker">Sources & assumptions</span>
        <h1>Transparency over false precision</h1>
        <p class="lede">
          This public-facing mockup shows how the simulator distinguishes observed evidence, derived layers, modeled responses, and declared assumptions.
        </p>
      </div>

      <div class="panel feature-panel">
        <div>
          <span class="eyebrow">Business as usual baseline</span>
          <h2>BAU risk compared with your actions</h2>
          <p>The selected test condition sets the BAU starting risk. Your remaining risk and each action's contribution then update when a slider moves.</p>
        </div>
        <div class="feature-stat">
          <span class="eyebrow">Evidence posture</span>
          <strong>Observed + Derived + Modeled + Assumed</strong>
        </div>
      </div>

      <div class="evidence-grid">
        ${scenarioContent.evidenceCards
          .map(
            (card) => `
              <article class="panel evidence-class">
                <span class="eyebrow">${card.className}</span>
                <h3>${card.title}</h3>
                <p>${card.copy}</p>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="two-column-grid">
        <section class="panel">
          <div class="section-heading">
            <span class="eyebrow">Assumptions carried in the mockup</span>
            <h2>Declared limitations</h2>
          </div>
          <ul class="detail-list">
            ${scenarioContent.assumptions.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
        <section class="panel">
          <div class="section-heading">
            <span class="eyebrow">Primary register</span>
            <h2>Source classes in use</h2>
          </div>
          <div class="source-list">
            ${sourceRegister
              .map(
                (entry) => `
                  <article class="source-row">
                    <div>
                      <h3>${entry.source}</h3>
                      <p>${entry.detail}</p>
                    </div>
                    <span class="source-tag">${entry.className}</span>
                  </article>
                `
              )
              .join("")}
          </div>
          <p class="source-footnote">
            Visible source anchors for this mockup include NBIC, BoM, AFAC, and state fire agency and standards references.
          </p>
        </section>
      </div>
    </section>
  `;
}



function createGeographyMarkup() {
  return `
    <section class="screen screen-geography">
      <div class="panel geography-summary">
        <div class="section-heading">
          <span class="kicker">Geography</span>
          <h1>Geography context</h1>
          <p class="lede">
            Vulnerability context, fuel context, settlement exposure, and leverage points are foregrounded here before deeper decorative context.
          </p>
        </div>
        <div class="hero-chips">
          <span class="chip">${scenarioContext.geography}</span>
          <span class="chip">Fuel context: ${scenarioContext.fuelContext}</span>
          <span class="chip">Saturation: ${scenarioContext.saturation}</span>
        </div>
      </div>

      <div class="three-column-grid geography-priority-grid">
        <article class="panel geography-card">
          <span class="eyebrow">Vulnerability context</span>
          <h3>Settlement-edge vulnerability</h3>
          <p>National and local context layers are surfaced together so exposure at the settlement edge is visible immediately.</p>
        </article>
        <article class="panel geography-card">
          <span class="eyebrow">Fuel context</span>
          <h3>Mixed fuels with changing response value</h3>
          <p>Fuel context changes how detection, initial attack, and slashing are interpreted across forest, grassland, and mixed landscapes.</p>
        </article>
        <article class="panel geography-card">
          <span class="eyebrow">Settlement exposure</span>
          <h3>Exposure concentrates near access and asset clusters</h3>
          <p>Exposure and asset-value-weighted context are shown before any finer-grain local interpretation.</p>
        </article>
      </div>

      <div class="two-column-grid geography-main-grid">
        <section class="panel">
          <div class="map-panel map-panel-compact">
            <div class="map-art" aria-hidden="true"></div>
            <div class="map-overlay">
              <span class="eyebrow">Current default view</span>
              <h2>${scenarioContext.geography}</h2>
              <p>${scenarioContext.subGeography}</p>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="section-heading">
            <span class="eyebrow">Leverage points</span>
            <h2>What the geography view needs to make visible</h2>
          </div>
          <div class="source-list">
            ${geographyCards
              .map(
                (card) => `
                  <article class="source-row">
                    <div>
                      <h3>${card.title}</h3>
                      <p>${card.copy}</p>
                    </div>
                    <span class="source-tag">${card.tag}</span>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      </div>
    </section>
  `;
}



function createAboutMarkup() {
  return `
    <section class="screen screen-about">
      <div class="section-heading section-heading-wide">
        <span class="kicker">About the model</span>
        <h1>What this model is, and what it is not</h1>
        <p class="lede">
          This demo is a structured expert-judgment and evidence-weighted scenario model designed for transparency and decision literacy.
        </p>
      </div>

      <div class="two-column-grid">
        <section class="panel">
          <div class="section-heading">
            <span class="eyebrow">Model posture</span>
            <h2>Boundaries</h2>
          </div>
          <ul class="detail-list">
            ${scenarioContent.aboutBullets.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
        <section class="panel accent-panel">
          <div class="section-heading">
          <span class="eyebrow">Demonstration scope</span>
            <h2>Provisional mockup implementation</h2>
          </div>
          <p>
            This build is a static HTML, CSS, and JS demonstration. Its risk scores and action weights are declared assumptions for comparing choices, not validated coefficients or a production forecasting model.
          </p>
        </section>
      </div>

      <section class="panel formula-panel">
        <div class="section-heading">
          <span class="eyebrow">Core screen logic</span>
          <h2>Visible comparison rules</h2>
        </div>
        <div class="formula-grid">
          <article>
            <h3>Fixed BAU</h3>
            <p>The BAU 2026 path is always visible and does not move when sliders change.</p>
          </article>
          <article>
            <h3>Your selected actions</h3>
            <p>The remaining risk and action-impact bars recalculate immediately when a slider moves.</p>
          </article>
          <article>
            <h3>Extreme El Niño test</h3>
            <p>The optional test raises BAU risk and changes the relative effect assigned to each action. It is an assumption, not a forecast.</p>
          </article>
          <article>
            <h3>Remaining risk</h3>
            <p>A minimum score remains even when every action is set to 100, so the demonstration never implies that bushfire risk can be eliminated.</p>
          </article>
        </div>
      </section>
    </section>
  `;
}









function createInitialAppState() {
  return {
    route: "simulator",
    sliders: { ...defaultSliders },
    extremeElNino: true
  };
}

function pageMarkup(state) {
  const scenario = calculateScenario(state.sliders, { extremeElNino: state.extremeElNino });
  const screenMap = {
    simulator: createSimulatorMarkup({ sliders: state.sliders, scenario, extremeElNino: state.extremeElNino }),
    sources: createSourcesMarkup(),
    geography: createGeographyMarkup(),
    about: createAboutMarkup()
  };

  return `
    <div class="shell shell-${state.route}">
      <header class="site-header">
        <div class="site-brand">
          <span class="brand-mark">${appMeta.title}</span>
          <p>${appMeta.product}</p>
        </div>
        <nav class="site-nav" aria-label="Primary">
          ${routes
            .map((route) =>
              route.disabled
                ? `<a class="is-disabled" aria-disabled="true" tabindex="-1" title="Not available in this demo">${route.label}</a>`
                : `<a href="#/${route.id}" class="${route.id === state.route ? "is-active" : ""}">${route.label}</a>`
            )
            .join("")}
        </nav>
        <div class="site-actions">
          <span class="site-action-button is-disabled" aria-disabled="true" title="Not available in this demo">Share Scenario</span>
          <span class="site-action-text is-disabled" aria-disabled="true" title="This label has no action">Directional demo</span>
        </div>
      </header>
      <main class="page-content">
        ${screenMap[state.route]}
      </main>
      <footer class="site-footer site-footer-branded">
        <a class="footer-logo-link" href="https://www.ourresilient.world/" target="_blank" rel="noopener noreferrer" aria-label="Visit Our Resilient World">
          <img class="footer-logo" src="assets/orw-logo-transparent-800px.png" alt="Our Resilient World">
        </a>
        <p class="footer-brand"><strong>AI Resilience · <a href="https://www.ourresilient.world/" target="_blank" rel="noopener noreferrer">Our Resilient World</a></strong></p>
        <p><strong>${appMeta.product}</strong> · Directional concept demonstration.</p>
        <p>Research by <a href="mailto:rick.molony@ourresilient.world">Rick Molony</a>, developed with AI assistance. See the public <a href="../../index.html" target="_blank" rel="noopener noreferrer">AI-Assisted Research collection</a>.</p>
        <p>No information is transmitted by this page.</p>
        <p>Except where otherwise noted, content is licensed <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 International (CC BY 4.0)</a>.</p>
      </footer>
    </div>
  `;
}

function bindSliderEvents(root, state, rerender) {
  const sliders = root.querySelectorAll("[data-slider]");
  sliders.forEach((input) => {
    input.addEventListener("input", (event) => {
      state.sliders[event.target.dataset.slider] = Number(event.target.value);
      rerender();
    });
  });
}

function bindResetEvent(root, state, rerender) {
  const resetButton = root.querySelector("[data-reset-bau]");
  if (!resetButton) {
    return;
  }

  resetButton.addEventListener("click", () => {
    Object.keys(state.sliders).forEach((key) => {
      state.sliders[key] = 0;
    });
    rerender();
  });
}

function bindConditionEvent(root, state, rerender) {
  const conditionButton = root.querySelector("[data-extreme-toggle]");
  if (!conditionButton) {
    return;
  }

  conditionButton.addEventListener("click", () => {
    state.extremeElNino = !state.extremeElNino;
    rerender();
  });
}

function bindGeoInsightEvents(root) {
  const trigger = root.querySelector("[data-geo-insight-open]");
  const dialog = root.querySelector("#geo-insight-dialog");
  const closeButton = root.querySelector("[data-geo-insight-close]");

  if (!trigger || !dialog || !closeButton) {
    return;
  }

  const openDialog = () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeDialog = () => {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    trigger.focus();
  };

  trigger.addEventListener("click", openDialog);
  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("close", () => trigger.focus());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });
}

function mountApp(root, initialState = createInitialAppState()) {
  const state = initialState;

  const rerender = () => {
    state.route = normalizeRoute(window.location.hash);
    root.innerHTML = pageMarkup(state);
    bindSliderEvents(root, state, rerender);
    bindResetEvent(root, state, rerender);
    bindConditionEvent(root, state, rerender);
    bindGeoInsightEvents(root);
  };

  window.addEventListener("hashchange", rerender);
  rerender();
}

if (typeof document !== "undefined") {
  const root = document.querySelector("#app");
  if (root) {
    mountApp(root);
  }
}

})();
