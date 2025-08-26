import { auth } from "../auth.js";

export function dashboard(role, username) {
  return `
  <!-- Navbar -->
  <nav class="navbar has-background">
    <div class="navbar-brand">
    <img src="./assets/images/logo.png" alt="LearnPoint logo" class="logo-nav">
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
        <div id="tutorAnalytics" class="columns"></div>

        <h2 class="title is-4">Upcoming sessions</h2>
        <div id="tutorUpcoming"></div>
      </div>

      <!-- Student Dashboard -->
      <div id="dashboardStudent" class="${role === 'student' ? '' : 'hidden'}">
        <h2 class="title is-4">Student Dashboard</h2>
        <h2 class="title is-4">My scheduled classes</h2>
        <div id="studentUpcoming"></div>
      </div>
    </div>
  </section>`;
}

export async function initDashboard(navigate) {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();
      navigate("home");
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

  const role = localStorage.getItem("lp_role");
  const userId = localStorage.getItem("lp_userId");

  // Traer reservas de la BD
  const res = await fetch("http://localhost:3000/reservations");
  let reservations = await res.json();

  // Filtrar según rol
  if (role === "student") {
    reservations = reservations.filter(r => r.students_id == userId);
  } else if (role === "tutor") {
    reservations = reservations.filter(r => r.tutors_id == userId);
  }

  // Ordenar por fecha
  reservations.sort((a, b) => new Date(a.reservation_date + "T" + a.start_time) - new Date(b.reservation_date + "T" + b.start_time));

  // Próximas 3
  const nextSessions = reservations.slice(0, 3);

  const renderSession = (r) => {
    const start = new Date(`${r.reservation_date}T${r.start_time}`);
    return `
      <div class="box">
        <p><strong>Student:</strong> ${r.student_name}</p>
        <p><strong>Subject:</strong> ${r.subject_name}</p>
        <p><strong>Time:</strong> ${start.toLocaleString()}</p>
      </div>
    `;
  };

  if (role === "tutor") {
    // Analíticas
    const totalClasses = reservations.length;
    const totalHours = totalClasses * 2; // 2h cada clase
    document.getElementById("tutorAnalytics").innerHTML = `
      <div class="column">
        <div class="box has-text-centered">
          <h2 class="subtitle">Classes taught</h2>
          <p class="title">${totalClasses}</p>
        </div>
      </div>
      <div class="column">
        <div class="box has-text-centered">
          <h2 class="subtitle">Total hours</h2>
          <p class="title">${totalHours} h</p>
        </div>
      </div>
    `;

    document.getElementById("tutorUpcoming").innerHTML =
      nextSessions.map(renderSession).join("");
  } else if (role === "student") {
    document.getElementById("studentUpcoming").innerHTML =
      nextSessions.map(renderSession).join("");
  }
}
