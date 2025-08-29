// Simple auth helper for the SPA

const KEY_ROLE = "lp_role";
const KEY_USER = "lp_username";

export const auth = {
  isLoggedIn() {
    return !!localStorage.getItem(KEY_ROLE);
  },
  role() {
    return localStorage.getItem(KEY_ROLE); // "tutor" | "student" | null
  },
  username() {
    return localStorage.getItem(KEY_USER);
  },
  login({ role, username }) {
    if (!role) throw new Error("Role is required to login");
    localStorage.setItem(KEY_ROLE, role);
    localStorage.setItem(KEY_USER, username || (role === "tutor" ? "Tutor" : "Student"));
  },
  logout() {
    localStorage.removeItem(KEY_ROLE);
    localStorage.removeItem(KEY_USER);
  }
};
