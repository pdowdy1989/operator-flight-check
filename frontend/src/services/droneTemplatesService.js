import api from "./api";

export const droneTemplatesService = {
  getAll: () => api.get("/drone-templates").then((r) => r.data),
  getById: (id) => api.get(`/drone-templates/${id}`).then((r) => r.data),
};
