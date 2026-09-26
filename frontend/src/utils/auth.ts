export const getRole = () => {
  return localStorage.getItem("role") || "public";
};

export const isAdmin = () => {
  return getRole() === "admin";
};