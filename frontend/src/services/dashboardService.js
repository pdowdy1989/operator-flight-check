import { apiClient } from "./apiClient";

export const dashboardService = {
  get() {
    return apiClient.get("/dashboard").then((response) => response.data);
  },
};
