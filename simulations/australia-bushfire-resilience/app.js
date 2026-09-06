(function (global) {
  "use strict";

  const model =
    global.DisasterModel || (typeof require !== "undefined" ? require("./model.js") : null);

  const state = {
    baselineData: null,
    chartSeries: null,
    activeTab: "historical",
    projectionEndYear: 2050
  };

  function getFallbackBaselineData() {
    return {
      assumptions: {
        baseline2025: 38.0,
        hazardGrowthRate: 0.03,
        federalShare: 0.08,
        stateLocalShare: 0.12,
        federalPreventionBase: 0.2,
        stateLocalPreventionShare: 0.2,
        selectedYear: 2050,
        detectionAnnualCostFull: 0.45,
        responseAnnualCostFull: 0.85,
        buildingAnnualCostFull: 1.25,
        fuelAnnualCostFull: 0.95
      },
      presets: {
        bau: { detection: 0, response: 0, building: 0, fuel: 0, detectionStart: 2026, responseStart: 2026, buildingStart: 2026, fuelStart: 2026, detectionEnd: 2032, responseEnd: 2034, buildingEnd: 2038, fuelEnd: 2036 },
        balanced: { detection: 40, response: 40, building: 40, fuel: 40, detectionStart: 2026, responseStart: 2026, buildingStart: 2027, fuelStart: 2027, detectionEnd: 2032, responseEnd: 2034, buildingEnd: 2038, fuelEnd: 2036 },
        "detection-led": { detection: 70, response: 25, building: 25, fuel: 20, detectionStart: 2026, responseStart: 2028, buildingStart: 2029, fuelStart: 2029, detectionEnd: 2031, responseEnd: 2035, buildingEnd: 2038, fuelEnd: 2037 },
        "response-led": { detection: 20, response: 70, building: 20, fuel: 15, detectionStart: 2027, responseStart: 2026, buildingStart: 2029, fuelStart: 2029, detectionEnd: 2033, responseEnd: 2033, buildingEnd: 2038, fuelEnd: 2036 },
        "building-led": { detection: 20, response: 20, building: 70, fuel: 20, detectionStart: 2027, responseStart: 2028, buildingStart: 2026, fuelStart: 2028, detectionEnd: 2034, responseEnd: 2035, buildingEnd: 2040, fuelEnd: 2038 },
        "fuel-led": { detection: 15, response: 20, building: 20, fuel: 70, detectionStart: 2028, responseStart: 2028, buildingStart: 2029, fuelStart: 2026, detectionEnd: 2034, responseEnd: 2035, buildingEnd: 2038, fuelEnd: 2037 }
      },
      historical: [
        { year: 2016, broadCost: 18.0, insuredLoss: 1.22, federalPublicSpend: 1.44, stateLocalPublicSpend: 2.16, confidence: "Medium", evidenceType: "Derived", method: "Working baseline anchor using broad-cost calibration and share-based public split." },
        { year: 2017, broadCost: 20.2, insuredLoss: 2.54, federalPublicSpend: 1.62, stateLocalPublicSpend: 2.42, confidence: "Medium", evidenceType: "Derived", method: "Interpolated national bushfire-related burden using workbook calibration spine." },
        { year: 2018, broadCost: 22.4, insuredLoss: 1.68, federalPublicSpend: 1.79, stateLocalPublicSpend: 2.69, confidence: "Medium", evidenceType: "Derived", method: "Interpolated working estimate with modeled public burden shares." },
        { year: 2019, broadCost: 27.0, insuredLoss: 4.14, federalPublicSpend: 2.16, stateLocalPublicSpend: 3.24, confidence: "Medium", evidenceType: "Derived", method: "Spike year reflecting elevated bushfire burden and modeled public split." },
        { year: 2020, broadCost: 31.5, insuredLoss: 4.21, federalPublicSpend: 2.52, stateLocalPublicSpend: 3.78, confidence: "Medium", evidenceType: "Derived", method: "High-burden year informed by Black Summer era calibration anchor." },
        { year: 2021, broadCost: 32.8, insuredLoss: 2.43, federalPublicSpend: 2.62, stateLocalPublicSpend: 3.94, confidence: "Low", evidenceType: "Modeled", method: "Modeled continuation of national burden trend; year-level total remains provisional." },
        { year: 2022, broadCost: 34.1, insuredLoss: 8.16, federalPublicSpend: 2.73, stateLocalPublicSpend: 4.09, confidence: "Low", evidenceType: "Modeled", method: "Modeled total public burden with observed Commonwealth response lower-bound evidence available separately." },
        { year: 2023, broadCost: 35.4, insuredLoss: 2.04, federalPublicSpend: 2.83, stateLocalPublicSpend: 4.25, confidence: "Low", evidenceType: "Modeled", method: "Modeled total public burden with DRF-era prevention baseline and observed federal lower-bound evidence." },
        { year: 2024, broadCost: 36.7, insuredLoss: 0.58, federalPublicSpend: 2.94, stateLocalPublicSpend: 4.4, confidence: "Low", evidenceType: "Modeled", method: "Modeled total public burden; workbook evidence records observed Commonwealth prevention and grant lines." },
        { year: 2025, broadCost: 38.0, insuredLoss: 3.5, federalPublicSpend: 3.04, stateLocalPublicSpend: 4.56, confidence: "Low", evidenceType: "Modeled", method: "2025 baseline anchor for BAU projection; public totals remain share-based for consistency." }
      ]
    };
  }

  async function loadBaselineData(path) {
    const targetPath = path || "data/baseline.json";

    if (typeof window === "undefined") {
      const fs = require("fs");
      return JSON.parse(fs.readFileSync(targetPath, "utf8"));
    }

    try {
      const response = await fetch(targetPath);
      if (!response.ok) {
        throw new Error("Unable to load baseline data.");
      }
      return response.json();
    } catch (error) {
      return getFallbackBaselineData();
    }
  }

  function getCurrentControls(scope) {
    if (!scope || typeof scope.querySelector !== "function") {
      return {
        detection: Number(scope && scope.detection) || 0,
        response: Number(scope && scope.response) || 0,
        building: Number(scope && scope.building) || 0,
        fuel: Number(scope && scope.fuel) || 0,
        detectionStart: Number(scope && scope.detectionStart) || 2026,
        responseStart: Number(scope && scope.responseStart) || 2026,
        buildingStart: Number(scope && scope.buildingStart) || 2027,
        fuelStart: Number(scope && scope.fuelStart) || 2027,
        detectionEnd: Number(scope && scope.detectionEnd) || 2032,
        responseEnd: Number(scope && scope.responseEnd) || 2034,
        buildingEnd: Number(scope && scope.buildingEnd) || 2038,
        fuelEnd: Number(scope && scope.fuelEnd) || 2036,
        baseline2025: Number(scope && scope.baseline2025) || 38,
        hazardGrowthRate: Number(scope && scope.hazardGrowthRate) || 0.03,
        federalShare: Number(scope && scope.federalShare) || 0.08,
        stateLocalShare: Number(scope && scope.stateLocalShare) || 0.12,
        federalPreventionBase: Number(scope && scope.federalPreventionBase) || 0.2,
        stateLocalPreventionShare: Number(scope && scope.stateLocalPreventionShare) || 0.2,
        detectionAnnualCostFull: Number(scope && scope.detectionAnnualCostFull) || 0.45,
        responseAnnualCostFull: Number(scope && scope.responseAnnualCostFull) || 0.85,
        buildingAnnualCostFull: Number(scope && scope.buildingAnnualCostFull) || 1.25,
        fuelAnnualCostFull: Number(scope && scope.fuelAnnualCostFull) || 0.95,
        selectedYear: Number(scope && scope.selectedYear) || 2050
      };
    }

    const getValue = function (name) {
      const element = scope.querySelector("[name='" + name + "']");
      return element ? Number(element.value) : 0;
    };

    return {
      detection: getValue("detection"),
      response: getValue("response"),
      building: getValue("building"),
      fuel: getValue("fuel"),
      detectionStart: getValue("detectionStart"),
      responseStart: getValue("responseStart"),
      buildingStart: getValue("buildingStart"),
      fuelStart: getValue("fuelStart"),
      detectionEnd: getValue("detectionEnd"),
      responseEnd: getValue("responseEnd"),
      buildingEnd: getValue("buildingEnd"),
      fuelEnd: getValue("fuelEnd"),
      baseline2025: getValue("baseline2025"),
      hazardGrowthRate: getValue("hazardGrowthRate"),
      federalShare: getValue("federalShare"),
      stateLocalShare: getValue("stateLocalShare"),
      federalPreventionBase: getValue("federalPreventionBase"),
      stateLocalPreventionShare: getValue("stateLocalPreventionShare"),
      detectionAnnualCostFull: getValue("detectionAnnualCostFull"),
      responseAnnualCostFull: getValue("responseAnnualCostFull"),
      buildingAnnualCostFull: getValue("buildingAnnualCostFull"),
      fuelAnnualCostFull: getValue("fuelAnnualCostFull"),
      selectedYear: getValue("selectedYear")
    };
  }

  function formatCurrencyBillions(value) {
    return "$" + Number(value).toFixed(2) + "B";
  }

  function formatPercent(value) {
    return (Number(value) * 100).toFixed(0) + "%";
  }

  function setSliderValueLabel(name, value) {
    const label = document.querySelector("[data-slider-value='" + name + "']");
    if (label) {
      label.textContent = value;
    }
  }

  function updateControlReadouts(controls) {
    setSliderValueLabel("detection", controls.detection);
    setSliderValueLabel("response", controls.response);
    setSliderValueLabel("building", controls.building);
    setSliderValueLabel("fuel", controls.fuel);
  }

  function normalizeProjectionEndYear(value) {
    return Number(value) === 2035 ? 2035 : 2050;
  }

  function buildChartPoints(series, valueKey, width, height, padding, maxValue) {
    const safeMax = maxValue || 1;
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const indexDivisor = Math.max(1, series.length - 1);

    return series
      .map(function (entry, index) {
        const x = padding.left + (index / indexDivisor) * plotWidth;
        const y = height - padding.bottom - (entry[valueKey] / safeMax) * plotHeight;
        return model.round(x, 1) + "," + model.round(y, 1);
      })
      .join(" ");
  }

  function buildAxisScale(maxValue) {
    const safeMax = Math.max(1, Number(maxValue) || 1);
    const roughStep = safeMax / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    const step = multiplier * magnitude;
    const axisMax = Math.ceil(safeMax / step) * step;
    const ticks = [];

    for (let value = 0; value <= axisMax + step / 2; value += step) {
      ticks.push(model.round(value, 2));
    }

    return { axisMax: axisMax, step: step, ticks: ticks };
  }

  function buildXAxisYears(startYear, endYear) {
    const years = [];
    for (let year = startYear; year <= endYear; year += 5) {
      years.push(year);
    }
    if (years[years.length - 1] !== endYear) {
      years.push(endYear);
    }
    return years;
  }

  function renderChart(series, root) {
    const width = 760;
    const height = 400;
    const padding = { top: 42, right: 24, bottom: 54, left: 72 };
    const startYear = series[0].year;
    const endYear = series[series.length - 1].year;
    const maxValue = Math.max.apply(
      null,
      series.map(function (entry) {
        return Math.max(entry.bauCost, entry.totalScenarioCost);
      })
    );
    const scale = buildAxisScale(maxValue);
    const residualPoints = buildChartPoints(series, "residualLoss", width, height, padding, scale.axisMax);
    const bauPoints = buildChartPoints(series, "bauCost", width, height, padding, scale.axisMax);
    const totalPoints = buildChartPoints(series, "totalScenarioCost", width, height, padding, scale.axisMax);
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const areaPoints =
      residualPoints +
      " " +
      totalPoints
        .split(" ")
        .reverse()
        .join(" ");

    const yAxisMarkup = scale.ticks
      .map(function (value) {
        const y = height - padding.bottom - (value / scale.axisMax) * plotHeight;
        return (
          '<line x1="' + padding.left + '" y1="' + y + '" x2="' + (width - padding.right) + '" y2="' + y + '" class="grid-line"></line>' +
          '<line x1="' + (padding.left - 5) + '" y1="' + y + '" x2="' + padding.left + '" y2="' + y + '" class="axis-tick"></line>' +
          '<text x="' + (padding.left - 10) + '" y="' + (y + 4) + '" text-anchor="end" class="axis-label">$' + value + 'B</text>'
        );
      })
      .join("");

    const xAxisMarkup = buildXAxisYears(startYear, endYear)
      .map(function (year) {
        const x = padding.left + ((year - startYear) / (endYear - startYear)) * plotWidth;
        return (
          '<line x1="' + x + '" y1="' + (height - padding.bottom) + '" x2="' + x + '" y2="' + (height - padding.bottom + 5) + '" class="axis-tick"></line>' +
          '<text x="' + x + '" y="' + (height - padding.bottom + 22) + '" text-anchor="middle" class="axis-label">' + year + "</text>"
        );
      })
      .join("");

    const finalEntry = series[series.length - 1];

    const chartMarkup =
      '<svg viewBox="0 0 ' +
      width +
      " " +
      height +
      '" class="chart-svg" role="img" aria-labelledby="chart-svg-title chart-svg-description">' +
      '<title id="chart-svg-title">Annual bushfire cost from 2025 to ' + endYear + "</title>" +
      '<desc id="chart-svg-description">By ' + endYear + ", business as usual is " + formatCurrencyBillions(finalEntry.bauCost) + ", residual loss is " + formatCurrencyBillions(finalEntry.residualLoss) + ", intervention spend is " + formatCurrencyBillions(finalEntry.annualInterventionCost || 0) + ", and total scenario cost is " + formatCurrencyBillions(finalEntry.totalScenarioCost) + ".</desc>" +
      '<text x="' + padding.left + '" y="18" class="axis-title">Annual cost (A$ billions)</text>' +
      yAxisMarkup +
      xAxisMarkup +
      '<line x1="' +
      padding.left +
      '" y1="' +
      (height - padding.bottom) +
      '" x2="' +
      (width - padding.right) +
      '" y2="' +
      (height - padding.bottom) +
      '" class="axis-line"></line>' +
      '<line x1="' +
      padding.left +
      '" y1="' +
      padding.top +
      '" x2="' +
      padding.left +
      '" y2="' +
      (height - padding.bottom) +
      '" class="axis-line"></line>' +
      '<polygon points="' +
      areaPoints +
      '" class="area-investment"></polygon>' +
      '<polyline points="' +
      bauPoints +
      '" class="line-bau"></polyline>' +
      '<polyline points="' +
      residualPoints +
      '" class="line-residual"></polyline>' +
      '<polyline points="' +
      totalPoints +
      '" class="line-scenario-total"></polyline>' +
      '<text x="' + (padding.left + plotWidth / 2) + '" y="' + (height - 5) + '" text-anchor="middle" class="axis-title">Year</text>' +
      "</svg>";

    if (root && root.innerHTML !== undefined) {
      root.innerHTML = chartMarkup;
    }

    return {
      bauPoints: bauPoints,
      residualPoints: residualPoints,
      totalPoints: totalPoints,
      axisMax: scale.axisMax,
      yTicks: scale.ticks,
      endYear: endYear,
      markup: chartMarkup
    };
  }

  function renderMetricCards(metrics, root) {
    const endYear = metrics.endYear || metrics.targetSeries.year || 2050;
    const cards = [
      {
        label: endYear + " BAU Cost",
        value: formatCurrencyBillions(metrics.targetSeries.bauCost),
        description: "Projected annual bushfire cost if no new resilience action is taken."
      },
      {
        label: endYear + " Residual Loss",
        value: formatCurrencyBillions(metrics.targetSeries.residualLoss),
        description: "Projected annual bushfire loss after resilience effects reduce BAU damage."
      },
      {
        label: endYear + " Total Scenario Cost",
        value: formatCurrencyBillions(metrics.targetSeries.totalScenarioCost),
        description: "Residual loss plus annual intervention spending in the selected year."
      },
      {
        label: "Cumulative Avoided Cost",
        value: formatCurrencyBillions(metrics.cumulative.cumulativeAvoidedCost),
        description: "Total avoided loss from 2025 to " + endYear + " versus BAU."
      },
      {
        label: "Annual Intervention Spend",
        value: formatCurrencyBillions(metrics.targetSeries.annualInterventionCost),
        description: "The direct yearly cost of the selected resilience portfolio."
      },
      {
        label: "Federal Public Spend",
        value: formatCurrencyBillions(metrics.publicSpend.federalTotal),
        description: "Scenario-year Commonwealth disaster-related spending."
      },
      {
        label: "State / Local Spend",
        value: formatCurrencyBillions(metrics.publicSpend.stateLocalTotal),
        description: "Scenario-year state and local disaster-related spending."
      },
      {
        label: "Prevention Share",
        value: formatPercent(metrics.preventionShare),
        description: "Combined prevention share of total public spending in the selected year."
      },
      {
        label: "Response / Recovery Share",
        value: formatPercent(metrics.responseShare),
        description: "Combined response and recovery share of total public spending."
      },
      {
        label: "Confidence Note",
        value: metrics.confidence,
        description: "Historical totals mix observed, derived, and modeled values."
      }
    ];

    const markup = cards
      .map(function (card) {
        return (
          '<article class="metric-card">' +
          '<p class="metric-label">' +
          card.label +
          "</p>" +
          '<p class="metric-value">' +
          card.value +
          "</p>" +
          '<p class="metric-description">' +
          card.description +
          "</p>" +
          "</article>"
        );
      })
      .join("");

    if (root && root.innerHTML !== undefined) {
      root.innerHTML = markup;
    }

    return cards;
  }

  function renderHistoricalTable(rows, root) {
    const markup =
      '<table><caption class="visually-hidden">Historical bushfire cost baseline from 2016 to 2025</caption><thead><tr><th scope="col">Year</th><th scope="col">Broad Cost</th><th scope="col">Insured Loss</th><th scope="col">Federal Public Spend</th><th scope="col">State / Local Spend</th><th scope="col">Confidence</th><th scope="col">Method Note</th></tr></thead><tbody>' +
      rows
        .map(function (row) {
          return (
            "<tr>" +
            '<th scope="row">' +
            row.year +
            "</th>" +
            "<td>" +
            formatCurrencyBillions(row.broadCost) +
            "</td>" +
            "<td>" +
            formatCurrencyBillions(row.insuredLoss) +
            "</td>" +
            "<td>" +
            formatCurrencyBillions(row.federalPublicSpend) +
            "</td>" +
            "<td>" +
            formatCurrencyBillions(row.stateLocalPublicSpend) +
            "</td>" +
            '<td><span class="confidence-pill confidence-' +
            row.confidence.toLowerCase() +
            '">' +
            row.confidence +
            '</span><span class="evidence-type">' +
            row.evidenceType +
            "</span></td>" +
            "<td>" +
            row.method +
            "</td>" +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    if (root && root.innerHTML !== undefined) {
      root.innerHTML = markup;
    }

    return markup;
  }

  function renderScenarioTable(rows, root) {
    const endYear = rows[rows.length - 1].year;
    const markup =
      '<table><caption class="visually-hidden">Annual graph values from 2025 to ' +
      endYear +
      '</caption><thead><tr><th scope="col">Year</th><th scope="col">BAU—no new action</th><th scope="col">Residual loss after action</th><th scope="col">Added intervention spend</th><th scope="col">Total scenario cost</th></tr></thead><tbody>' +
      rows
        .map(function (row) {
          return (
            "<tr>" +
            '<th scope="row">' +
            row.year +
            "</th><td>" +
            formatCurrencyBillions(row.bauCost) +
            "</td><td>" +
            formatCurrencyBillions(row.residualLoss) +
            "</td><td>" +
            formatCurrencyBillions(row.annualInterventionCost) +
            "</td><td>" +
            formatCurrencyBillions(row.totalScenarioCost) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    if (root && root.innerHTML !== undefined) {
      root.innerHTML = markup;
    }

    return markup;
  }

  function applyPreset(name, scope, presets) {
    const preset = presets[name];
    if (!preset || !scope) {
      return null;
    }

    [
      "detection",
      "response",
      "building",
      "fuel",
      "detectionStart",
      "responseStart",
      "buildingStart",
      "fuelStart",
      "detectionEnd",
      "responseEnd",
      "buildingEnd",
      "fuelEnd"
    ].forEach(function (key) {
      const element = scope.querySelector("[name='" + key + "']");
      if (element) {
        element.value = preset[key];
      }
    });

    return preset;
  }

  function resetControls(scope) {
    if (!scope || !state.baselineData) {
      return null;
    }

    const assumptions = state.baselineData.assumptions;
    const defaults = {
      detection: 20,
      response: 20,
      building: 20,
      fuel: 20,
      detectionStart: 2026,
      responseStart: 2026,
      buildingStart: 2027,
      fuelStart: 2027,
      detectionEnd: 2032,
      responseEnd: 2034,
      buildingEnd: 2038,
      fuelEnd: 2036,
      baseline2025: assumptions.baseline2025,
      hazardGrowthRate: assumptions.hazardGrowthRate,
      federalShare: assumptions.federalShare,
      stateLocalShare: assumptions.stateLocalShare,
      federalPreventionBase: assumptions.federalPreventionBase,
      stateLocalPreventionShare: assumptions.stateLocalPreventionShare,
      detectionAnnualCostFull: assumptions.detectionAnnualCostFull,
      responseAnnualCostFull: assumptions.responseAnnualCostFull,
      buildingAnnualCostFull: assumptions.buildingAnnualCostFull,
      fuelAnnualCostFull: assumptions.fuelAnnualCostFull
    };

    Object.keys(defaults).forEach(function (key) {
      const element = scope.querySelector("[name='" + key + "']");
      if (element) {
        element.value = defaults[key];
      }
    });

    return defaults;
  }

  function buildScenarioMetrics(controls, projectionEndYear) {
    const endYear = normalizeProjectionEndYear(projectionEndYear);
    const bauSeries = model.calculateBauSeries(controls, 2025, endYear);
    const scenarioSeries = model.calculateScenarioSeries(bauSeries, controls);
    const targetSeries = scenarioSeries[scenarioSeries.length - 1];

    const publicSpend = model.calculatePublicSpend(targetSeries, controls, controls);
    const cumulative = model.calculateCumulativeMetrics(scenarioSeries);
    const totalPublic = publicSpend.federalTotal + publicSpend.stateLocalTotal;
    const totalPrevention = publicSpend.federalPrevention + publicSpend.stateLocalPrevention;
    const preventionShare = totalPublic ? totalPrevention / totalPublic : 0;

    state.chartSeries = scenarioSeries;

    return {
      targetSeries: targetSeries,
      publicSpend: publicSpend,
      cumulative: {
        cumulativeBauCost: model.round(cumulative.cumulativeBauCost, 2),
        cumulativeScenarioCost: model.round(cumulative.cumulativeScenarioCost, 2),
        cumulativeAvoidedCost: model.round(cumulative.cumulativeAvoidedCost, 2)
      },
      preventionShare: preventionShare,
      responseShare: 1 - preventionShare,
      confidence: "Mixed confidence: strong on direction, lighter on intervention-cost and historical-ledger completeness.",
      endYear: endYear,
      scenarioSeries: scenarioSeries
    };
  }

  function renderExplanationTab(tabName) {
    const panel = document.querySelector("[data-tab-panel]");
    if (!panel) {
      return;
    }

    const content = {
      historical:
        "<h3>Historical baseline</h3><p>This MVP starts from a national bushfire-related cost baseline for 2016 to 2025. The table keeps observed insured-loss anchors where available and labels broader totals as derived or modeled when the national ledger is incomplete.</p>",
      sources:
        "<h3>Sources and confidence</h3><p>The current defaults are informed by the working v06 spreadsheet, including broad cost anchors, federal prevention settings, and observed Commonwealth lower-bound grant evidence. Confidence is shown openly rather than smoothed away.</p>",
      model:
        "<h3>How the model works</h3><p>BAU cost grows from the 2025 baseline using an annual hazard-growth assumption. Each action has a start year and an implementation-complete year. Investment spending ramps up during implementation. Loss reduction begins only after a further action-specific lag and then ramps to full strength, which lets the model show an invest-now, benefit-later pattern.</p><p>The chart shows BAU, residual loss after intervention effects, and total scenario cost including the added intervention spend.</p>",
      limitations:
        "<h3>Limitations</h3><p>This is a simplified directional model, not a prediction engine. Historical totals mix observed, derived, and modeled values. Intervention costs are stylised annual portfolio costs, not yet program-by-program budget lines. Hazard-specific sub-models, interaction effects, and diminishing returns are future steps.</p>"
    };

    panel.innerHTML = content[tabName] || content.historical;
  }

  function syncActiveTabButton(tabName) {
    document.querySelectorAll("[data-tab]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.tab === tabName));
    });
  }

  function syncPresetButtons(presetName) {
    document.querySelectorAll("[data-preset]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.preset === presetName));
    });
  }

  function updateUi() {
    const controlsPanel = document.querySelector("[data-controls]");
    const controls = getCurrentControls(controlsPanel);
    const horizonControl = document.querySelector("[name='projectionEndYear']");
    const projectionEndYear = normalizeProjectionEndYear(horizonControl && horizonControl.value);
    state.projectionEndYear = projectionEndYear;
    updateControlReadouts(controls);

    const metrics = buildScenarioMetrics(controls, projectionEndYear);
    renderChart(metrics.scenarioSeries, document.querySelector("[data-chart]"));
    renderMetricCards(metrics, document.querySelector("[data-metrics]"));
    renderScenarioTable(metrics.scenarioSeries, document.querySelector("[data-chart-table]"));

    const chartTitle = document.querySelector("[data-chart-title]");
    if (chartTitle) {
      chartTitle.textContent = "Annual Bushfire Cost to " + projectionEndYear;
    }

    const outputPeriod = document.querySelector("[data-output-period]");
    if (outputPeriod) {
      outputPeriod.textContent =
        projectionEndYear + " snapshot and cumulative 2025–" + projectionEndYear + " decision signals.";
    }

    const selectedYearSummary = document.querySelector("[data-selected-year-summary]");
    if (selectedYearSummary) {
      const difference = metrics.targetSeries.bauCost - metrics.targetSeries.totalScenarioCost;
      const comparison =
        difference >= 0
          ? formatCurrencyBillions(difference) + " below BAU"
          : formatCurrencyBillions(Math.abs(difference)) + " above BAU";
      selectedYearSummary.innerHTML =
        "<strong>" +
        projectionEndYear +
        " snapshot:</strong> BAU " +
        formatCurrencyBillions(metrics.targetSeries.bauCost) +
        ", residual loss " +
        formatCurrencyBillions(metrics.targetSeries.residualLoss) +
        ", intervention spend " +
        formatCurrencyBillions(metrics.targetSeries.annualInterventionCost) +
        ", total scenario " +
        formatCurrencyBillions(metrics.targetSeries.totalScenarioCost) +
        "—" +
        comparison +
        ".";
    }
  }

  function bindEvents() {
    const controlsPanel = document.querySelector("[data-controls]");
    controlsPanel.addEventListener("input", function () {
      syncPresetButtons(null);
      updateUi();
    });

    document.querySelector("[name='projectionEndYear']").addEventListener("change", updateUi);

    document.querySelectorAll("[data-preset]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyPreset(button.dataset.preset, controlsPanel, state.baselineData.presets);
        syncPresetButtons(button.dataset.preset);
        updateUi();
      });
    });

    document.querySelector("[data-reset]").addEventListener("click", function () {
      resetControls(controlsPanel);
      document.querySelector("[name='projectionEndYear']").value = "2050";
      syncPresetButtons(null);
      updateUi();
    });

    document.querySelectorAll("[data-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.activeTab = button.dataset.tab;
        syncActiveTabButton(state.activeTab);
        renderExplanationTab(state.activeTab);
      });
    });
  }

  function populateControls(data) {
    const controlsPanel = document.querySelector("[data-controls]");
    const assumptions = data.assumptions;
    const initialValues = {
      detection: 20,
      response: 20,
      building: 20,
      fuel: 20,
      detectionStart: 2026,
      responseStart: 2026,
      buildingStart: 2027,
      fuelStart: 2027,
      detectionEnd: 2032,
      responseEnd: 2034,
      buildingEnd: 2038,
      fuelEnd: 2036,
      baseline2025: assumptions.baseline2025,
      hazardGrowthRate: assumptions.hazardGrowthRate,
      federalShare: assumptions.federalShare,
      stateLocalShare: assumptions.stateLocalShare,
      federalPreventionBase: assumptions.federalPreventionBase,
      stateLocalPreventionShare: assumptions.stateLocalPreventionShare,
      detectionAnnualCostFull: assumptions.detectionAnnualCostFull,
      responseAnnualCostFull: assumptions.responseAnnualCostFull,
      buildingAnnualCostFull: assumptions.buildingAnnualCostFull,
      fuelAnnualCostFull: assumptions.fuelAnnualCostFull
    };

    Object.keys(initialValues).forEach(function (key) {
      const element = controlsPanel.querySelector("[name='" + key + "']");
      if (element) {
        element.value = initialValues[key];
      }
    });
  }

  async function init() {
    state.baselineData = await loadBaselineData("data/baseline.json");
    populateControls(state.baselineData);
    renderHistoricalTable(state.baselineData.historical, document.querySelector("[data-historical-table]"));
    bindEvents();
    syncActiveTabButton(state.activeTab);
    syncPresetButtons(null);
    renderExplanationTab(state.activeTab);
    updateUi();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      init().catch(function (error) {
        const appRoot = document.querySelector("[data-app]");
        if (appRoot) {
          appRoot.innerHTML = "<p class='error-banner'>" + error.message + "</p>";
        }
      });
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      loadBaselineData: loadBaselineData,
      getCurrentControls: getCurrentControls,
      renderChart: renderChart,
      renderMetricCards: renderMetricCards,
      renderHistoricalTable: renderHistoricalTable,
      renderScenarioTable: renderScenarioTable,
      applyPreset: applyPreset,
      resetControls: resetControls,
      buildScenarioMetrics: buildScenarioMetrics,
      normalizeProjectionEndYear: normalizeProjectionEndYear
    };
  }

  global.DisasterApp = {
    loadBaselineData: loadBaselineData,
    getCurrentControls: getCurrentControls,
    renderChart: renderChart,
    renderMetricCards: renderMetricCards,
    renderHistoricalTable: renderHistoricalTable,
    renderScenarioTable: renderScenarioTable,
    applyPreset: applyPreset,
    resetControls: resetControls,
    updateUi: updateUi
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
