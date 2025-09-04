export function register() {
  return `
  <div class="register-page section">
    <div class="container">
      <div class="level mb-5">
        <div class="level-left">
          <a data-route="home" href="#/home" class="button is-light">
            <span class="icon"><i class="fa-solid fa-arrow-left"></i></span>
          </a>
        </div>
      </div>

      <div class="buttons is-centered mb-5">
        <button class="button is-link" id="btnStudentReg">Student</button>
        <button class="button is-danger" id="btnTutorReg">Tutor</button>
      </div>

      <div class="columns is-vcentered">
        <div class="column is-half">
          <h2 class="title has-text-centered mb-4" id="registerTitle">Create your Student Account</h2>

          <form id="registerForm">
            <div class="field">
              <label class="label">First Name</label>
              <div class="control"><input class="input" type="text" id="name" placeholder="Enter your first name" required /></div>
            </div>

            <div class="field">
              <label class="label">Last Name</label>
              <div class="control"><input class="input" type="text" id="last_name" placeholder="Enter your last name" required /></div>
            </div>

            <div class="field">
              <label class="label">Age</label>
              <div class="control"><input class="input" type="number" id="age" placeholder="Enter your age" min="10" required /></div>
            </div>

            <div class="field">
              <label class="label">Email</label>
              <div class="control"><input class="input" type="email" id="email" placeholder="Enter your email" required /></div>
            </div>

            <div class="field">
              <label class="label">Password</label>
              <div class="control"><input class="input" type="password" id="password" placeholder="Create a password" required /></div>
            </div>

            <!-- Tutor-only fields -->
            <div id="tutorFields" class="is-hidden">
              <div class="field">
                <label class="label">Hourly Price ($)</label>
                <div class="control"><input class="input" type="number" id="hourPrice" placeholder="Enter your price per hour" min="1" /></div>
              </div>

              <div class="field">
                <label class="label">Description</label>
                <div class="control"><textarea class="textarea" id="description" placeholder="Tell us about your experience"></textarea></div>
              </div>

              <div class="field">
                <label class="label">Subjects</label>
                <div class="control"><input class="input" type="text" id="subjects" placeholder="E.g. JavaScript, Python, Data Science" /></div>
              </div>

              <div class="field">
                <label class="label">Working days</label>
                <div class="control">
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Mon"> Mon</label>
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Tue"> Tue</label>
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Wed"> Wed</label>
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Thu"> Thu</label>
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Fri"> Fri</label>
                  <label class="checkbox mr-3"><input type="checkbox" name="days" value="Sat"> Sat</label>
                  <label class="checkbox"><input type="checkbox" name="days" value="Sun"> Sun</label>
                </div>
                <p class="help">Select the days you are available to work.</p>
              </div>

              <div class="field is-grouped">
                <div class="control">
                  <label class="label">From</label>
                  <input class="input" type="time" id="timeFrom" value="09:00" />
                </div>
                <div class="control">
                  <label class="label">To</label>
                  <input class="input" type="time" id="timeTo" value="18:00" />
                </div>
              </div>
              <p class="help">This time range applies to all selected working days.</p>

              <div id="availabilityError" class="notification is-danger is-hidden mt-3"></div>
            </div>

            <div id="registerError" class="notification is-danger is-hidden"></div>

            <div class="field mt-5">
              <button type="submit" class="button is-primary is-fullwidth" id="registerBtn">Register</button>
            </div>

            <p class="has-text-centered mt-3">
              Already have an account?
              <a data-route="login" href="#/login">Sign in</a>
            </p>
          </form>
        </div>

        <div class="column is-half has-text-centered">
          <div id="registerLottie" style="max-width: 420px; margin: 0 auto;"></div>
        </div>
      </div>
    </div>
  </div>`;
}

export function initRegister(navigate) {
  // Lottie
  const regLottie = document.getElementById("registerLottie");
  if (regLottie) {
    lottie.loadAnimation({
      container: regLottie,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "./assets/animations/world.json",
    });
  }

  const btnStudent = document.getElementById("btnStudentReg");
  const btnTutor = document.getElementById("btnTutorReg");
  const tutorFields = document.getElementById("tutorFields");
  const registerTitle = document.getElementById("registerTitle");
  const registerBtn = document.getElementById("registerBtn");
  const registerForm = document.getElementById("registerForm");
  const availabilityError = document.getElementById("availabilityError");

  let mode = "student";

  btnStudent.addEventListener("click", (e) => {
    e.preventDefault();
    mode = "student";
    tutorFields.classList.add("is-hidden");
    registerTitle.textContent = "Create your Student Account";
    registerTitle.className = "title has-text-link has-text-centered mb-4";
    registerBtn.className = "button is-link is-fullwidth";
  });

  btnTutor.addEventListener("click", (e) => {
    e.preventDefault();
    mode = "tutor";
    tutorFields.classList.remove("is-hidden");
    registerTitle.textContent = "Create your Tutor Account";
    registerTitle.className = "title has-text-danger has-text-centered mb-4";
    registerBtn.className = "button is-danger is-fullwidth";
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Basic required fields always present
      const name = document.getElementById("name").value.trim();
      const last_name = document.getElementById("last_name").value.trim();
      const age = document.getElementById("age").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!name || !last_name || !age || !email || !password) {
        showError("registerError", "Please complete all required fields.");
        return;
      }

      let profile = {
        mode,
        name,
        last_name,
        age,
        email,
        password,
      };

      if (mode === "tutor") {
        const hourPrice = document.getElementById("hourPrice").value.trim();
        const description = document.getElementById("description").value.trim();
        const subjects = document.getElementById("subjects").value.trim();
        const timeFrom = document.getElementById("timeFrom").value;
        const timeTo = document.getElementById("timeTo").value;
        const days = Array.from(
          document.querySelectorAll('input[name="days"]:checked')
        ).map((d) => d.value);

        // Validate availability
        availabilityError.classList.add("is-hidden");
        if (days.length === 0) {
          availabilityError.textContent =
            "Please select at least one working day.";
          availabilityError.classList.remove("is-hidden");
          return;
        }
        if (!timeFrom || !timeTo || timeFrom >= timeTo) {
          availabilityError.textContent =
            "Please provide a valid time range (From must be earlier than To).";
          availabilityError.classList.remove("is-hidden");
          return;
        }

        profile = {
          ...profile,
          hourPrice: hourPrice ? Number(hourPrice) : null,
          description,
          subjects: subjects
            ? subjects
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          availability: {
            days,
            timeFrom,
            timeTo,
          },
        };
      }

      const url =
        mode === "tutor"
          ? "https://backend-1-x71e.onrender.com/registerB/registerTutor"
          : "https://backend-1-x71e.onrender.com/registerB/registerStudent";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Successfully registered user");
        navigate("login");
      } else {
        showError(
          "registerError",
          data.message || "Error registering user."
        );
      }
    } catch (err) {
      showError("registerError", "Server connection error.".err);
    }
  });

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("is-hidden");
    setTimeout(() => el.classList.add("is-hidden"), 4000);
  }
}