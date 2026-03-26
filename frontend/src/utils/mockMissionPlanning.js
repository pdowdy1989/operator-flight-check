// Spots — normalized for SpotCard component
export const mockSpots = [
  {
    id: "spot-1",
    label: "Laguna Cliffs",
    address: "Laguna Cliffs, Dana Point, CA",
    notes: "Good coastal launch with clear western exposure.",
    isFavorite: true,
    lastStatus: "GREEN",
    lat: 33.4614,
    lon: -117.6983,
  },
  {
    id: "spot-2",
    label: "Newport Back Bay",
    address: "Upper Newport Bay, Newport Beach, CA",
    notes: "Best in calmer morning wind windows.",
    isFavorite: false,
    lastStatus: "YELLOW",
    lat: 33.6439,
    lon: -117.8851,
  },
  {
    id: "spot-3",
    label: "Torrey Pines",
    address: "Torrey Pines Gliderport, La Jolla, CA",
    notes: "Watch gust buildup after midday.",
    isFavorite: true,
    lastStatus: "RED",
    lat: 32.9175,
    lon: -117.2555,
  },
];

// Spot checks — normalized for SpotCheckCard component
export const mockSpotChecks = [
  {
    id: "check-1",
    spotId: "spot-1",
    locationLabel: "Laguna Cliffs",
    date: "Mar 24, 2026",
    flyScore: 88,
    status: "GREEN",
    profile: "DJI Air 3",
    summary: "Strong launch window from 9 AM to noon. Conditions comfortably inside thresholds.",
    notes: "",
    timestamp: "2026-03-24T09:10:00.000Z",
    lastUpdated: "2026-03-24T09:05:00.000Z",
    confidence: "High",
    bestTimeWindow: "9 AM - 12 PM",
    metrics: { windMph: 8, gustMph: 11, precipPct: 4 },
    breakdown: [
      { label: "Wind", actual: 8, threshold: "≤ 12 mph green / ≤ 18 mph caution", impact: -0, evaluation: "within limit" },
      { label: "Gust", actual: 11, threshold: "≤ 16 mph green / ≤ 24 mph caution", impact: -0, evaluation: "within limit" },
      { label: "Rain", actual: 4, threshold: "≤ 12% green / ≤ 30% caution", impact: -0, evaluation: "within limit" },
    ],
  },
  {
    id: "check-2",
    spotId: "spot-2",
    locationLabel: "Newport Back Bay",
    date: "Mar 26, 2026",
    flyScore: 61,
    status: "YELLOW",
    profile: "Mini 4 Pro",
    summary: "Flyable with caution. Gusts are the main limiting factor today.",
    notes: "Usable if gusts stay near the lower end of forecast.",
    timestamp: "2026-03-26T07:30:00.000Z",
    lastUpdated: "2026-03-26T07:20:00.000Z",
    confidence: "Moderate",
    bestTimeWindow: "8 AM - 10 AM",
    metrics: { windMph: 14, gustMph: 20, precipPct: 18 },
    breakdown: [
      { label: "Wind", actual: 14, threshold: "≤ 10 mph green / ≤ 15 mph caution", impact: -10, evaluation: "inside caution band" },
      { label: "Gust", actual: 20, threshold: "≤ 14 mph green / ≤ 20 mph caution", impact: -15, evaluation: "at caution limit" },
      { label: "Rain", actual: 18, threshold: "≤ 10% green / ≤ 25% caution", impact: -5, evaluation: "inside caution band" },
    ],
  },
  {
    id: "check-3",
    spotId: "spot-3",
    locationLabel: "Torrey Pines",
    date: "Mar 27, 2026",
    flyScore: 12,
    status: "RED",
    profile: "Matrice 350",
    summary: "Severe weather override triggered. Stand down even if some other metrics appear workable.",
    notes: "High wind and severe weather. No-go.",
    timestamp: "2026-03-27T10:05:00.000Z",
    lastUpdated: "2026-03-27T09:58:00.000Z",
    confidence: "Low",
    bestTimeWindow: null,
    metrics: { windMph: 22, gustMph: 29, precipPct: 42 },
    breakdown: [
      { label: "Wind", actual: 22, threshold: "≤ 16 mph green / ≤ 24 mph caution", impact: -14, evaluation: "inside caution band" },
      { label: "Gust", actual: 29, threshold: "≤ 22 mph green / ≤ 30 mph caution", impact: -18, evaluation: "inside caution band" },
      { label: "Rain", actual: 42, threshold: "≤ 15% green / ≤ 35% caution", impact: -20, evaluation: "over limit" },
    ],
  },
];

// Legacy exports for backward compatibility
export const savedSpots = mockSpots.map((s) => ({
  id: s.id,
  name: s.label,
  address: s.address,
  notes: s.notes,
  favorite: s.isFavorite,
}));

export const plannedChecks = mockSpotChecks.map((c) => ({
  id: c.id,
  spotId: c.spotId,
  date: c.date,
  status: c.status,
  profile: c.profile,
  summary: c.summary,
}));
