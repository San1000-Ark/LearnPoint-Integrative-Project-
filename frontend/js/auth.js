export const auth = {
  user: null,

  setUser(user) {
    if (!user || !user.id || !user.role) {
      console.error("Auth: usuario inválido al setear", user);
      return;
    }

    this.user = {
      id: Number(user.id),
      username: user.username || user.name || "",
      role: user.role,
      tutorId: user.tutorId ? Number(user.tutorId) : null,
      studentId: user.studentId ? Number(user.studentId) : null,
    };

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(this.user));
    localStorage.setItem("lp_userId", this.user.id);
    localStorage.setItem("lp_username", this.user.username);
    localStorage.setItem("lp_role", this.user.role);

    if (this.user.role === "tutor") {
      localStorage.setItem("lp_tutorId", this.user.tutorId);
    } else if (this.user.role === "student") {
      localStorage.setItem("lp_studentId", this.user.studentId);
    }
  },

  /**
   * Recover the user from memory or localStorage
   */
  getUser() {
    if (this.user) return this.user;

    const stored = localStorage.getItem("user");
    if (stored) {
      this.user = JSON.parse(stored);
    } else {
      // Recover individually
      const id = localStorage.getItem("lp_userId");
      const username = localStorage.getItem("lp_username");
      const role = localStorage.getItem("lp_role");

      if (id && role) {
        this.user = {
          id: Number(id),
          username: username || "",
          role,
          tutorId:
            role === "tutor"
              ? Number(localStorage.getItem("lp_tutorId")) || null
              : null,
          studentId:
            role === "student"
              ? Number(localStorage.getItem("lp_studentId")) || null
              : null,
        };
      }
    }

    return this.user;
  },

  /**
   * Clean user memory and localStorage
   */
  clearUser() {
    this.user = null;
    localStorage.removeItem("user");
    localStorage.removeItem("lp_userId");
    localStorage.removeItem("lp_username");
    localStorage.removeItem("lp_role");
    localStorage.removeItem("lp_tutorId");
    localStorage.removeItem("lp_studentId");
  },

  /**
   * Returns true if there is a valid authenticated user
   */
  isAuthenticated() {
    const u = this.getUser();
    return !!u && !!u.id && !!u.role;
  },

  /**
   * Login: recibe objeto usuario y lo setea
   */
  login(user) {
    this.setUser(user);
  },
};