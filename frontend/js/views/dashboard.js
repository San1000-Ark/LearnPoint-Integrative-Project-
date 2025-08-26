import { auth } from "../auth.js";

export function dashboard(role, username) {
  return `
  <!-- Navbar -->
  <nav class="navbar has-background-dark">
    <div class="navbar-brand">
      <a class="navbar-item has-text-white" href="#" data-route="dashboard">
        <i class="fas fa-home"></i>&nbsp; Dashboard
      </a>
    </div>
    <div class="navbar-end">
      <a class="navbar-item has-text-white" href="#" data-route="calendar">
        <i class="fas fa-calendar-alt"></i>&nbsp; Calendar
      </a>
      <a class="navbar-item has-text-white" href="#" data-route="chats">
        <i class="fas fa-comments"></i>&nbsp; Chats
      </a>
      <a class="navbar-item has-text-white" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i>&nbsp; Logout
      </a>
    </div>
  </nav>

  <section class="section">
    <div class="container">
      <h1 class="title">Welcome, ${username}</h1>
      <p class="subtitle">Role: ${role}</p>

      <!-- Tutor Dashboard -->
      <div id="dashboardTutor" class="${role === 'tutor' ? '' : 'hidden'}">
        <h2 class="title is-4">Tutor Dashboard</h2>
        <!-- Analytics -->
        <div class="columns">
          <div class="column">
            <div class="box has-text-centered">
              <h2 class="subtitle">Classes taught</h2>
              <p class="title">35</p>
              <progress class="progress is-info" value="35" max="50"></progress>
            </div>
          </div>
          <div class="column">
            <div class="box has-text-centered">
              <h2 class="subtitle">Total hours</h2>
              <p class="title">120 h</p>
              <progress class="progress is-success" value="120" max="200"></progress>
            </div>
          </div>
          <div class="column">
            <div class="box has-text-centered">
              <h2 class="subtitle">Average rating</h2>
              <p class="title">4.7/5</p>
              <progress class="progress is-warning" value="4.7" max="5"></progress>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <h2 class="title is-4">Upcoming sessions</h2>
        <div class="box">
          <p><strong>Student:</strong> Anna Lopez</p>
          <p><strong>Subject:</strong> JavaScript</p>
          <p><strong>Time:</strong> Aug 25, 2025 - 3:00 pm</p>
        </div>
        <div class="box">
          <p><strong>Student:</strong> John Torres</p>
          <p><strong>Subject:</strong> SQL</p>
          <p><strong>Time:</strong> Aug 26, 2025 - 5:00 pm</p>
        </div>
      </div>

      <!-- Student Dashboard -->
      <div id="dashboardStudent" class="${role === 'student' ? '' : 'hidden'}">
        <h2 class="title is-4">Student Dashboard</h2>

        <!-- Filters -->
        <div class="field is-grouped">
          <div class="control">
            <div class="select">
              <select>
                <option>Subject</option>
                <option>JavaScript</option>
                <option>Java</option>
                <option>SQL</option>
              </select>
            </div>
          </div>
          <div class="control">
            <input class="input" type="text" placeholder="Max price per hour">
          </div>
          <div class="control">
            <button class="button is-link">Search</button>
          </div>
        </div>

        <!-- Tutor list -->
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="card">
              <div class="card-image has-text-centered">
                <figure class="image is-128x128 is-inline-block">
                  <img class="is-rounded" src="https://via.placeholder.com/128" alt="Tutor">
                </figure>
              </div>
              <div class="card-content has-text-centered">
                <p class="title is-5">Carlos Gomez</p>
                <p>Specialty: JavaScript</p>
                <p><strong>$15/h</strong></p>
                <button class="button is-primary is-small">View details</button>
              </div>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="card">
              <div class="card-image has-text-centered">
                <figure class="image is-128x128 is-inline-block">
                  <img class="is-rounded" src="https://via.placeholder.com/128" alt="Tutor">
                </figure>
              </div>
              <div class="card-content has-text-centered">
                <p class="title is-5">Anna Lopez</p>
                <p>Specialty: Java</p>
                <p><strong>$18/h</strong></p>
                <button class="button is-primary is-small">View details</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scheduled classes -->
        <h2 class="title is-4">My scheduled classes</h2>
        <div class="box">
          <p><strong>Tutor:</strong> Carlos Gomez</p>
          <p><strong>Subject:</strong> JavaScript</p>
          <p><strong>Time:</strong> Aug 26, 2025 - 3:00 pm</p>
        </div>
        <div class="box">
          <p><strong>Tutor:</strong> Anna Lopez</p>
          <p><strong>Subject:</strong> Java</p>
          <p><strong>Time:</strong> Aug 27, 2025 - 4:30 pm</p>
        </div>
      </div>
    </div>
  </section>`;
}

// Inicialización de eventos del Dashboard
export function initDashboard(navigate) {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();        // Borra sesión
      navigate("home");     // Redirige a Home
    });
  }

  // Navbar SPA links
  const navLinks = document.querySelectorAll(".navbar-item[data-route]");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const route = link.getAttribute("data-route");
      navigate(route);
    });
  });
}
