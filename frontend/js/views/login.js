import { auth } from "../auth.js";

export function login() {
  return `
  <div class="login-page section">
    <div class="container">
      <div class="level mb-5">
        <div class="level-left">
          <a data-route="home" href="#/home" class="button is-light">
            <span class="icon"><i class="fa-solid fa-arrow-left"></i></span>
          </a>
        </div>
      </div>

      <div class="columns is-centered">
        <div class="column is-5">
          <div class="box has-text-centered">
          <img src="./assets/images/logo.png" alt="LearnPoint logo" class="logo">
            <h1 id="loginTitle" class="title has-text-centered mb-5">Welcome back</h1>
            <h4 id="loginSubtitle" class="subtitle has-text-centered mb-5">Select your role</h4>

            <div class="buttons is-centered mb-4">
              <button type="button" class="button is-danger is-light" id="btnTutor">
                <span class="icon"><i class="fas fa-chalkboard-teacher"></i></span>
                <span>Tutor</span>
              </button>
              <button type="button" class="button is-link is-light" id="btnStudent">
                <span class="icon"><i class="fas fa-user-graduate"></i></span>
                <span>Student</span>
              </button>
            </div>

            <div class="box" id="loginBox">
              <form id="loginForm">
                <div class="field">
                  <div class="control has-icons-left">
                    <input type="text" class="input" id="loginEmail" placeholder="Email" required />
                    <span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
                  </div>
                </div>

                <div class="field">
                  <div class="control has-icons-left">
                    <input type="password" class="input" id="loginPassword" placeholder="Password" required />
                    <span class="icon is-small is-left"><i class="fas fa-lock"></i></span>
                  </div>
                </div>

                <div id="loginError" class="notification is-danger is-hidden">Please select a role first</div>

                <div class="field">
                  <button type="submit" class="button is-fullwidth" id="loginBtn">
                    <span class="btn-text">Sign In</span>
                  </button>
                </div>

                <p class="has-text-centered mt-3">
                  Don’t have an account?
                  <a data-route="register" class="register-login" href="#/register">Register</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>`;
}

export function initLogin(navigate) {
  let userType = null;

  const btnTutor = document.getElementById("btnTutor");
  const btnStudent = document.getElementById("btnStudent");
  const loginForm = document.getElementById("loginForm");
  const loginBox = document.getElementById("loginBox");
  const loginBtn = document.getElementById("loginBtn");
  const loginTitle = document.getElementById("loginTitle");
  const loginError = document.getElementById("loginError");

  // Preselect from register preference if any
  const pref = localStorage.getItem("lp_pref_role");
  if (pref === "tutor") btnTutor.click();
  if (pref === "student") btnStudent.click();

  btnTutor.addEventListener("click", () => {
    userType = "tutor";
    loginBox.className = "box tutor-mode";
    loginBtn.className = "button is-fullwidth login-btn-tutor";
    loginTitle.className = "title has-text-centered mb-5 title-tutor";
    loginError.classList.add("is-hidden");
  });

  btnStudent.addEventListener("click", () => {
    userType = "student";
    loginBox.className = "box student-mode";
    loginBtn.className = "button is-fullwidth login-btn-student";
    loginTitle.className = "title has-text-centered mb-5 title-student";
    loginError.classList.add("is-hidden");
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userType) {
      loginError.textContent = "Please select a role first";
      loginError.classList.remove("is-hidden");
      return;
    }

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("https://backend-1-x71e.onrender.com/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      // Here we validate that the role matches the selected button
      if (data.role !== userType) {
        throw new Error(
          `This user is registered as ${data.role}, not ${userType}`
        );
      }

      localStorage.setItem("lp_userId", data.user.id); // ID real
      localStorage.setItem("lp_username", data.user.name); // opcional
      localStorage.setItem("lp_role", data.role); // tutor/student

      // Save info and redirect
      auth.login({
        ...data.user, // Includes id, name, last_name, email, studentId, tutorId
        role: data.role, // We explicitly added the role
      });
      navigate("dashboard");
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.remove("is-hidden");
    }
  });
}