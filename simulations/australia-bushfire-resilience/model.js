(function (global) {
  "use strict";

  function round(value, digits) {
    return Number(value.toFixed(digits));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function buildYearRange(startYear, endYear) {
    const years = [];
    for (let year = startYear; year <= endYear; year += 1) {
      years.push(year);
    }
    return years;
  }

  function normalizeControls(controls) {
    return {
      detection: clamp(Number(controls.detection || 0), 0, 100) / 100,
      response: clamp(Number(controls.response || 0), 0, 100) / 100,
      building: clamp(Number(controls.building || 0), 0, 100) / 100,
      fuel: clamp(Number(controls.fuel || 0), 0, 100) / 100
    };
  }

  function calculateCombinedEffect(controls) {
    const normalized = normalizeControls(controls);
    const raw =
      normalized.detection * 0.15 +
      normalized.response * 0.2 +
      normalized.building * 0.25 +
      normalized.fuel * 0.15;

    return {
      normalized: normalized,
      raw: round(raw, 4),
      capped: round(Math.min(raw, 0.65), 4)
    };
  }

  function calculateLeverRamp(year, startYear, endYear) {
    if (year < startYear) {
      return 0;
    }

    if (endYear <= startYear) {
      return 1;
    }

    if (year >= endYear) {
      return 1;
    }

    return round((year - startYear + 1) / (endYear - startYear + 1), 4);
  }

  function calculateCostRamp(year, startYear, endYear, startupFloor) {
    if (year < startYear) {
      return 0;
    }

    const baseRamp = calculateLeverRamp(year, startYear, endYear);
    return round(startupFloor + (1 - startupFloor) * baseRamp, 4);
  }

  function getLeverDefinitions(controls) {
    return [
      {
        key: "detection",
        start: Number(controls.detectionStart || 2026),
        end: Number(controls.detectionEnd || 2032),
        annualCostFull: Number(controls.detectionAnnualCostFull || 0),
        effectLagYears: 2,
        setupPremium: 1.1,
        startupFloor: 0.35
      },
      {
        key: "response",
        start: Number(controls.responseStart || 2026),
        end: Number(controls.responseEnd || 2034),
        annualCostFull: Number(controls.responseAnnualCostFull || 0),
        effectLagYears: 3,
        setupPremium: 1.15,
        startupFloor: 0.4
      },
      {
        key: "building",
        start: Number(controls.buildingStart || 2026),
        end: Number(controls.buildingEnd || 2038),
        annualCostFull: Number(controls.buildingAnnualCostFull || 0),
        effectLagYears: 4,
        setupPremium: 1.2,
        startupFloor: 0.45
      },
      {
        key: "fuel",
        start: Number(controls.fuelStart || 2026),
        end: Number(controls.fuelEnd || 2036),
        annualCostFull: Number(controls.fuelAnnualCostFull || 0),
        effectLagYears: 2,
        setupPremium: 1.05,
        startupFloor: 0.35
      }
    ];
  }

  function calculateBauSeries(assumptions, startYear, endYear) {
    const years = buildYearRange(startYear, endYear);
    const baseline = Number(assumptions.baseline2025);
    const growthRate = Number(assumptions.hazardGrowthRate);

    return years.map(function (year) {
      const offset = year - startYear;
      const cost = baseline * Math.pow(1 + growthRate, offset);
      return {
        year: year,
        cost: round(cost, 2)
      };
    });
  }

  function calculateScenarioSeries(bauSeries, controls) {
    const normalized = normalizeControls(controls);
    const leverDefinitions = getLeverDefinitions(controls);

    return bauSeries.map(function (entry) {
      let combinedEffectRaw = 0;
      let annualInterventionCost = 0;
      const leverStates = {};

      leverDefinitions.forEach(function (lever) {
        const costRamp = calculateCostRamp(entry.year, lever.start, lever.end, lever.startupFloor);
        const effectRamp = calculateLeverRamp(
          entry.year,
          lever.end + lever.effectLagYears,
          lever.end + lever.effectLagYears * 2
        );
        const activeIntensity = normalized[lever.key] * effectRamp;
        leverStates[lever.key] = {
          costRamp: costRamp,
          effectRamp: effectRamp,
          activeIntensity: round(activeIntensity, 4)
        };

        if (lever.key === "detection") {
          combinedEffectRaw += activeIntensity * 0.15;
        }
        if (lever.key === "response") {
          combinedEffectRaw += activeIntensity * 0.2;
        }
        if (lever.key === "building") {
          combinedEffectRaw += activeIntensity * 0.25;
        }
        if (lever.key === "fuel") {
          combinedEffectRaw += activeIntensity * 0.15;
        }

        annualInterventionCost +=
          normalized[lever.key] *
          costRamp *
          lever.annualCostFull *
          (1 + lever.setupPremium * (1 - effectRamp));
      });

      const combinedEffect = Math.min(combinedEffectRaw, 0.65);
      const residualLoss = entry.cost * (1 - combinedEffect);
      const totalScenarioCost = residualLoss + annualInterventionCost;

      return {
        year: entry.year,
        bauCost: entry.cost,
        residualLoss: round(residualLoss, 2),
        annualInterventionCost: round(annualInterventionCost, 2),
        totalScenarioCost: round(totalScenarioCost, 2),
        avoidedCost: round(entry.cost - totalScenarioCost, 2),
        combinedEffect: round(combinedEffect, 4),
        leverStates: leverStates
      };
    });
  }

  function calculatePublicSpend(seriesEntry, assumptions, controls) {
    const normalized = normalizeControls(controls);
    const scenarioCost = Number(seriesEntry.totalScenarioCost);
    const federalTotal = scenarioCost * Number(assumptions.federalShare);
    const stateLocalTotal = scenarioCost * Number(assumptions.stateLocalShare);

    const federalPreventionRaw =
      Number(assumptions.federalPreventionBase) *
      (1 + normalized.building * 0.5 + normalized.detection * 0.3 + normalized.fuel * 0.4);
    const federalPrevention = Math.min(federalPreventionRaw, federalTotal);

    const stateLocalPreventionRaw =
      stateLocalTotal *
      Number(assumptions.stateLocalPreventionShare) *
      (1 + normalized.building * 0.4 + normalized.fuel * 0.3);
    const stateLocalPrevention = Math.min(stateLocalPreventionRaw, stateLocalTotal);

    return {
      federalTotal: round(federalTotal, 2),
      federalPrevention: round(federalPrevention, 2),
      federalResponse: round(federalTotal - federalPrevention, 2),
      stateLocalTotal: round(stateLocalTotal, 2),
      stateLocalPrevention: round(stateLocalPrevention, 2),
      stateLocalResponse: round(stateLocalTotal - stateLocalPrevention, 2)
    };
  }

  function calculateCumulativeMetrics(scenarioSeries) {
    return scenarioSeries.reduce(
      function (totals, entry) {
        totals.cumulativeBauCost += entry.bauCost;
        totals.cumulativeScenarioCost += entry.totalScenarioCost;
        totals.cumulativeAvoidedCost += entry.avoidedCost;
        totals.cumulativeInterventionCost += entry.annualInterventionCost;
        return totals;
      },
      {
        cumulativeBauCost: 0,
        cumulativeScenarioCost: 0,
        cumulativeAvoidedCost: 0,
        cumulativeInterventionCost: 0
      }
    );
  }

  const api = {
    round: round,
    clamp: clamp,
    buildYearRange: buildYearRange,
    normalizeControls: normalizeControls,
    calculateCombinedEffect: calculateCombinedEffect,
    calculateLeverRamp: calculateLeverRamp,
    calculateCostRamp: calculateCostRamp,
    getLeverDefinitions: getLeverDefinitions,
    calculateBauSeries: calculateBauSeries,
    calculateScenarioSeries: calculateScenarioSeries,
    calculatePublicSpend: calculatePublicSpend,
    calculateCumulativeMetrics: calculateCumulativeMetrics
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.DisasterModel = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
