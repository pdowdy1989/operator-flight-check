import { apiClient } from "./apiClient";

export const weatherService = {
  async getSevenDayForecast(params) {
    const response = await apiClient.get("/weather/forecast", { params });
    return response.data;
  },

  async getHourlyForecast(params) {
    const response = await apiClient.get("/weather/hourly", { params });
    return response.data;
  },
};
