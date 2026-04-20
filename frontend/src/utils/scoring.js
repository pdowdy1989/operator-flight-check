function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTrafficLightState(value, greenLimit, yellowLimit) {
  if (value <= greenLimit) return "green";
  if (value <= yellowLimit) return "yellow";
  return "red";
}

function calculateMetricDeduction(value, greenThreshold, yellowThreshold, yellowPenalty, redPenalty) {
  if (value <= greenThreshold) {
    return 0;
  }

  if (value <= yellowThreshold) {
    const ratio = (value - greenThreshold) / Math.max(1, yellowThreshold - greenThreshold);
    return Math.round(ratio * yellowPenalty);
  }

  const overflow = value - yellowThreshold;
  return Math.round(redPenalty + overflow * 2);
}

function getStatus(score, severeWeather) {
  if (severeWeather || score < 50) {
    return "RED";
  }

  if (score < 75) {
    return "YELLOW";
  }

  return "GREEN";
}

function buildSummary(status, severeWeather, topReason) {
  if (severeWeather) {
    return "Severe weather override triggered. Stand down even if some other metrics appear workable.";
  }

  if (status === "GREEN") {
    return "Conditions are comfortably inside the selected profile thresholds.";
  }

  if (status === "YELLOW") {
    return `Flyable with caution. ${topReason} is the main limiting factor today.`;
  }

  return `Not recommended to fly. ${topReason} pushes this day outside a safe operating band.`;
}

export function calculateFlyability(dayForecast, profile) {
  const windDeduction = calculateMetricDeduction(
    dayForecast.windMph,
    profile.windGreenMph,
    profile.windYellowMph,
    12,
    24
  );
  const gustDeduction = calculateMetricDeduction(
    dayForecast.gustMph,
    profile.gustGreenMph,
    profile.gustYellowMph,
    15,
    28
  );
  const precipDeduction = calculateMetricDeduction(
    dayForecast.precipPct,
    profile.precipGreenPct,
    profile.precipYellowPct,
    10,
    20
  );
  const severeWeatherDeduction = dayForecast.severeWeather ? 45 : 0;

  const rawScore =
    100 - windDeduction - gustDeduction - precipDeduction - severeWeatherDeduction;
  const flyScore = clamp(rawScore, 0, 100);
  const deductions = [
    { label: "Wind", value: windDeduction },
    { label: "Gusts", value: gustDeduction },
    { label: "Precip", value: precipDeduction },
    { label: "Severe weather", value: severeWeatherDeduction },
  ];
  const topDeduction = deductions.reduce((highest, current) =>
    current.value > highest.value ? current : highest
  );
  const status = getStatus(flyScore, dayForecast.severeWeather);

  return {
    ...dayForecast,
    flyScore,
    status,
    deductions,
    summary: buildSummary(
      status,
      dayForecast.severeWeather,
      topDeduction.label.toLowerCase()
    ),
  };
}

export function calculateForecastSummary(scoredForecast) {
  const bestWindow =
    scoredForecast
      .filter((item) => item.status === "GREEN")
      .sort((a, b) => b.flyScore - a.flyScore)[0] ?? scoredForecast[0];

  return {
    bestWindow,
    cautionDays: scoredForecast.filter((item) => item.status === "YELLOW").length,
    noFlyDays: scoredForecast.filter((item) => item.status === "RED").length,
  };
}

export function calculateDashboardFlyScore({ windMph, gustMph, precipPct, conditionCode }) {
  let score = 100;

  if (windMph > 18) score -= 35;
  else if (windMph >= 13) score -= 15;

  if (gustMph > 25) score -= 30;
  else if (gustMph >= 19) score -= 15;

  if (precipPct > 50) score -= 25;
  else if (precipPct >= 21) score -= 15;

  if (conditionCode >= 200 && conditionCode < 300) score -= 60;
  else if (conditionCode >= 500 && conditionCode < 600) score -= 40;
  else if (conditionCode >= 600 && conditionCode < 700) score -= 50;
  else if (conditionCode === 741) score -= 30;

  const finalScore = clamp(score, 0, 100);
  const status = finalScore >= 70 ? "GREEN" : finalScore >= 40 ? "YELLOW" : "RED";

  return {
    score: finalScore,
    status,
    metricStates: {
      wind: getTrafficLightState(windMph, 12, 18),
      gusts: getTrafficLightState(gustMph, 18, 25),
      precip: getTrafficLightState(precipPct, 20, 50),
    },
  };
}

export function getConditionLabel(code) {
  if (code >= 200 && code < 300) return "Thunderstorm";
  if (code >= 300 && code < 400) return "Drizzle";
  if (code >= 500 && code < 600) return "Rain";
  if (code >= 600 && code < 700) return "Snow";
  if (code === 741) return "Fog";
  if (code >= 801 && code < 900) return "Clouds";
  return "Clear";
}
