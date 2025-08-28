import { auth } from "../auth.js";

// ======================
// Vista del calendario
// ======================
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

  <div id="calendar" class="calendar-full"></div>

  <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>
  `;
}

// ======================
// Inicializar calendario con selección de rango y Jitsi
// ======================
export async function initCalendar(userId, role) {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    locale: "es",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    selectable: role === "tutor",
    editable: role === "tutor",

    // ======================
    // Selección de rango de horas
    // ======================
    select: async (selectionInfo) => {
      if (role !== "tutor") return;

      const students = await fetchStudents();
      const subjects = await fetchSubjects();

      if (!students || !subjects) {
        alert("Error al cargar estudiantes o materias.");
        return;
      }

      const studentId = prompt(
        "Selecciona un estudiante (ID):\n" +
        students.map(s => `ID: ${s.id}, Nombre: ${s.name}`).join("\n")
      );
      if (!studentId) return;

      const subjectId = prompt(
        "Selecciona una materia (ID):\n" +
        subjects.map(s => `ID: ${s.id}, Nombre: ${s.subject_name}`).join("\n")
      );
      if (!subjectId) return;

      await createTutoria(selectionInfo.start, selectionInfo.end, studentId, subjectId);
      calendar.refetchEvents();
    },

    // ======================
    // Cargar eventos desde backend
    // ======================
    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        const res = await fetch("http://localhost:3000/calendar/events");
        if (!res.ok) throw new Error("Error cargando eventos");
        const data = await res.json();
        successCallback(data);
      } catch (err) {
        console.error(err);
        failureCallback(err);
      }
    },

    // ======================
    // Mostrar link de Jitsi en cada evento
    // ======================
    eventContent: function(arg) {
      const link = arg.event.extendedProps.jitsi_link;
      return {
        html: `<div>
                 ${arg.event.title || "Tutoría"} <br>
                 ${link ? `<a href="${link}" target="_blank">🖥️ Entrar a Jitsi</a>` : ""}
               </div>`
      };
    },

    // ======================
    // Click en evento: eliminar
    // ======================
    eventClick: async (info) => {
      if (role !== "tutor") return;
      if (confirm("¿Eliminar tutoría?")) {
        try {
          await fetch(`http://localhost:3000/calendar/events/${info.event.id}`, {
            method: "DELETE",
          });
          info.event.remove();
        } catch (err) {
          console.error("Error eliminando evento:", err);
        }
      }
    },
  });

  calendar.render();

  // ======================
  // Crear tutoría con Jitsi
  // ======================
  async function createTutoria(start, end, studentId, subjectId) {
    const jitsiLink = `https://meet.jit.si/tutoria-${Date.now()}`;

    const body = {
      start_datetime: start.toISOString().slice(0, 19).replace("T", " "),
      end_datetime: end.toISOString().slice(0, 19).replace("T", " "),
      tutors_id: userId,
      students_id: Number(studentId),
      subjects_id: Number(subjectId),
      jitsi_link: jitsiLink
    };

    console.log("📤 Enviando body:", body);

    try {
      const res = await fetch("http://localhost:3000/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creando tutoría:", errorData);
        alert("Error creando tutoría ❌");
      } else {
        alert(`Tutoría creada ✅\nEnlace Jitsi: ${jitsiLink}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error creando tutoría ❌");
    }
  }

  // ======================
  // Helpers fetch
  // ======================
  async function fetchStudents() {
    try {
      const res = await fetch("http://localhost:3000/users/role/students");
      if (!res.ok) throw new Error("Error al obtener estudiantes");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function fetchSubjects() {
    try {
      const res = await fetch("http://localhost:3000/subjects");
      if (!res.ok) throw new Error("Error al obtener materias");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

// ======================
// Cargar vista del calendario
// ======================
export function loadCalendarView() {
  document.getElementById("main").innerHTML = calendar();

  const user = auth.getUser();
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.hash = "#/login";
    return;
  }

  initCalendar(user.id, user.role);

  document.getElementById("logoutFromCalendar")?.addEventListener("click", () => {
    auth.clearUser();
    window.location.hash = "#/login";
  });
}
