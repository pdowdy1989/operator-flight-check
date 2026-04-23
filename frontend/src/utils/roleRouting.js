export function getHomePathForRole(role) {
  if (role === "CLIENT" || role === "COMPANY") return "/my-requests";
  return "/jobs";
}

export function getRoleLabel(role) {
  if (role === "PILOT") return "Pilot";
  if (role === "CLIENT") return "Client";
  if (role === "COMPANY") return "Company";
  if (role === "ADMIN") return "Admin";
  return "User";
}
