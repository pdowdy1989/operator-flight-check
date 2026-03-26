import api from "./api";

export const droneProfilesService = {
  getAll: () => api.get("/drone-profiles").then((r) => r.data),
  getById: (id) => api.get(`/drone-profiles/${id}`).then((r) => r.data),
  create: (profile) => api.post("/drone-profiles", profile).then((r) => r.data),
  update: (id, profile) => api.put(`/drone-profiles/${id}`, profile).then((r) => r.data),
  delete: (id) => api.delete(`/drone-profiles/${id}`).then((r) => r.data),
};
