import { useReducer, useCallback } from "react";
import { calculateFlyability } from "../utils/scoring";
import { mockForecast } from "../utils/mockForecast";
import { mockHourlyForecast } from "../utils/mockHourlyForecast";

// useReducer for forecast state (demonstrates rubric requirement)
const initialState = {
  loading: false,
  forecast: [],
  hourly: {},
  error: null,
  selectedDay: null,
  lastUpdated: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        forecast: action.forecast,
        hourly: action.hourly,
        selectedDay: action.forecast[0] ?? null,
        lastUpdated: action.lastUpdated,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SELECT_DAY":
      return { ...state, selectedDay: action.day };
    default:
      return state;
  }
}

// Custom hook wrapping weather state with useReducer
export function useWeather(location, profile) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchForecast = useCallback(() => {
    dispatch({ type: "FETCH_START" });
    // Simulate async fetch with mock data
    setTimeout(() => {
      try {
        const scored = mockForecast.map((day) =>
          calculateFlyability(day, profile)
        );
        dispatch({
          type: "FETCH_SUCCESS",
          forecast: scored,
          hourly: mockHourlyForecast,
          lastUpdated: new Date().toISOString(),
        });
      } catch (err) {
        dispatch({ type: "FETCH_ERROR", error: err.message });
      }
    }, 400);
  }, [profile]);

  const selectDay = useCallback((day) => {
    dispatch({ type: "SELECT_DAY", day });
  }, []);

  return { ...state, fetchForecast, selectDay };
}
