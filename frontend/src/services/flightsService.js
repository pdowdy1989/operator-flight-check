import api from "./api";

export const flightsService = {
  getAll: () => api.get("/flights").then((r) => r.data),
  create: (payload) => api.post("/flights", payload).then((r) => r.data),
  assignDrone: (flightId, payload) =>
    api.post(`/flights/${flightId}/assign-drone`, payload).then((r) => r.data),
  removeDrone: (flightId, droneId) =>
    api.delete(`/flights/${flightId}/remove-drone`, { params: { droneId } }).then((r) => r.data),
  delete: (flightId) => api.delete(`/flights/${flightId}`).then((r) => r.data),
};
