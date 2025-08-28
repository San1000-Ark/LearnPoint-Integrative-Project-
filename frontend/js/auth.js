export const auth = {
  user: null,

  setUser(user) {
    this.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    if (!this.user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      } else {
        // Intentar recuperar del localStorage individual (lo que guardó login.js)
        const id = localStorage.getItem("lp_userId");
        const username = localStorage.getItem("lp_username");
        const role = localStorage.getItem("lp_role");
        if (id && role) {
          this.user = { id, username, role };
        }
      }
    }
    return this.user;
  },

  clearUser() {
    this.user = null;
    localStorage.removeItem("user");
    localStorage.removeItem("lp_userId");
    localStorage.removeItem("lp_username");
    localStorage.removeItem("lp_role");
  },

  isAuthenticated() {
    return !!this.getUser();
  },

  login(user) {
    this.setUser(user);
  }
};
