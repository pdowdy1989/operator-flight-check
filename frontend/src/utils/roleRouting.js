export function getHomePathForRole(role) {
  return "/dashboard";
}

export function getRoleLabel(role) {
  if (role === "PILOT") return "Pilot";
  if (role === "CLIENT") return "Client";
  if (role === "COMPANY") return "Company";
  if (role === "ADMIN") return "Admin";
  return "User";
}
