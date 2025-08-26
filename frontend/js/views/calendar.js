import { auth } from "../auth.js";

// Vista del calendario
export function calendar() {
  return `
  <nav class="navbar has-background">
    <div class="navbar-brand">
    <img src="./assets/images/logo.png" alt="LearnPoint logo" class="logo-nav">
      <a class="navbar-item has-text-white" data-route="dashboard" href="#/dashboard">
        <i class="fas fa-home"></i>&nbsp; Dashboard
      </a>
    </div>
    <div class="navbar-end">
      <a class="navbar-item has-text-white" data-route="calendar" href="#/calendar">
        <i class="fas fa-calendar-alt"></i>&nbsp; Calendar
      </a>
      <a class="navbar-item has-text-white" data-route="chats" href="#/chats">
        <i class="fas fa-comments"></i>&nbsp; Chats
      </a>
      <a class="navbar-item has-text-white" id="logoutFromCalendar">
        <i class="fas fa-sign-out-alt"></i>&nbsp; Log out
      </a>
    </div>
  </nav>

  <section class="section">
    <div class="container">
      <h1 class="title has-text-centered">Tutoring Calendar</h1>
      <p class="subtitle has-text-centered">Manage and join your tutoring sessions</p>
    </div>
  </section>

  <div id="calendar"></div>
  `;
}

// Inicialización del calendario
export async function initCalendar(navigate) {
  // Logout
  const lg = document.getElementById("logoutFromCalendar");
  if (lg) {
    lg.addEventListener("click", () => {
      auth.logout();
      navigate("home");
    });
  }

  const el = document.getElementById("calendar");
  if (!el || typeof FullCalendar === "undefined") return;

  const role = localStorage.getItem("lp_role"); // "student" o "tutor"
  const username = localStorage.getItem("lp_username");

  // Cargar reservas desde el backend
  const res = await fetch("http://localhost:3000/reservations");
  let sessions = await res.json();

  // Filtrar por rol
  if (role === "student") {
    sessions = sessions.filter(s => s.extendedProps.student === username);
  } else if (role === "tutor") {
    sessions = sessions.filter(s => s.extendedProps.tutor === username);
  }

  const calendar = new FullCalendar.Calendar(el, {
    initialView: "dayGridMonth",
    selectable: role === "tutor",
    editable: false,
    events: sessions,

    dateClick(info) {
      if (role !== "tutor") return;

      const student_id = prompt("Enter student ID:"); // usa IDs reales
      const subject_id = prompt("Enter subject ID:");
      if (student_id && subject_id) {
        const jitsiRoom = "tutoring-" + Math.random().toString(36).substring(2, 10);
        const jitsiLink = `https://meet.jit.si/${jitsiRoom}`;

        // Guardar en la BD
        fetch("http://localhost:3000/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservation_date: info.dateStr,
            start_time: "10:00:00", // puedes pedirlo en el prompt
            tutor_id: username, // depende de cómo guardes los IDs
            student_id,
            subject_id
          })
        }).then(() => {
          calendar.addEvent({
            title: `Student ${student_id} - Subject ${subject_id}`,
            start: `${info.dateStr}T10:00:00`,
            extendedProps: { jitsi: jitsiLink }
          });
          alert(`Class scheduled!\nJitsi link: ${jitsiLink}`);
        });
      }
    },

    eventClick(info) {
      const jitsi = info.event.extendedProps?.jitsi;
      if (jitsi) {
        if (role === "tutor") {
          if (confirm("Do you want to delete this session?")) {
            fetch(`http://localhost:3000/reservations/${info.event.id}`, {
              method: "DELETE"
            }).then(() => {
              info.event.remove();
              alert("Session deleted!");
            });
          } else {
            window.open(jitsi, "_blank", "noopener");
          }
        } else {
          window.open(jitsi, "_blank", "noopener");
        }
      }
    }
  });

  calendar.render();
}
