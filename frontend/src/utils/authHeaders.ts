export const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
});
