import { auth } from "../auth.js";

export function calendar() {
  return `
<div class="dashboard-layout">
  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" data-route="dashboard">
        <i class="fas fa-graduation-cap"></i>
        <span>LearnPoint</span>
      </a>
    </div>

    <nav class="sidebar-nav">
      <a href="#" class="sidebar-nav-item" data-route="dashboard">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </a>
      <a href="#" class="sidebar-nav-item active" data-route="calendar">
        <i class="fas fa-calendar-alt"></i>
        <span>Calendar</span>
      </a>
      <a href="#" class="sidebar-nav-item" data-route="chats">
        <i class="fas fa-comments"></i>
        <span>Chats</span>
      </a>
      <button class="sidebar-nav-item" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </nav>
  </aside>

  <!-- Main content -->
  <main class="main-content">
    <section class="section">
      <div class="container">
        <h1 class="title has-text-centered">Tutoring Calendar</h1>
        <p class="subtitle has-text-centered">Manage and join your tutoring sessions</p>
      </div>
    </section>

    <div id="calendar" class="calendar-full box"></div>
  </main>
</div>
    <!-- Tutoring Modal -->
    <div id="tutoringModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title" id="modalTitle"></p>
          <button
            class="delete"
            aria-label="close"
            onclick="document.getElementById('tutoringModal').classList.remove('is-active')"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Student</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select id="modalStudent"></select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Subject</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select id="modalSubject"></select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Start</label>
            <div class="control">
              <input class="input" type="datetime-local" id="modalStart" />
            </div>
          </div>
          <div class="field">
            <label class="label">End</label>
            <div class="control">
              <input class="input" type="datetime-local" id="modalEnd" />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button id="modalSaveBtn" class="button is-success">Save</button>
          <button id="modalDeleteBtn" class="button is-danger is-hidden">Delete</button>
          <button
            class="button"
            onclick="document.getElementById('tutoringModal').classList.remove('is-active')"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>

    <div id="errorModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-content has-text-centered">
        <div class="box p-6" style="max-width: 400px; margin: auto;">
          <button class="delete is-large modal-close" aria-label="close"
            style="position: absolute; top: 15px; right: 15px; transform: scale(1.5);">
          </button>
          <p id="errorModalMessage" class="has-text-danger has-text-weight-semibold is-size-5"></p>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div id="confirmModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm Action</p>
          <button class="delete modal-close" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <p id="confirmModalMessage">Are you sure?</p>
        </section>
        <footer class="modal-card-foot">
          <button id="confirmYesBtn" class="button is-danger">Yes</button>
          <button class="button modal-close">Cancel</button>
        </footer>
      </div>
    </div>

    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>
  `;
}

export async function initCalendar() {
  const user = auth.getUser();
  if (!user) {
    showErrorModal("You must log in first.");
    window.location.hash = "#/login";
    return;
  }

  const calendarEl = document.getElementById("calendar");

  // Helper: show error modal
  function showErrorModal(message) {
    const modal = document.getElementById("errorModal");
    const modalMessage = document.getElementById("errorModalMessage");
    modalMessage.textContent = message;
    modal.classList.add("is-active");
    modal.querySelectorAll(".modal-close, .modal-background").forEach((el) => {
      el.onclick = () => modal.classList.remove("is-active");
    });
  }

  // Helper: show confirm modal
  function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmModalMessage").textContent = message;
    modal.classList.add("is-active");

    const yesBtn = document.getElementById("confirmYesBtn");
    const closeModal = () => modal.classList.remove("is-active");

    yesBtn.onclick = () => {
      onConfirm();
      closeModal();
    };

    modal
      .querySelectorAll(".modal-close, .modal-background, .button.modal-close")
      .forEach((el) => {
        el.onclick = closeModal;
      });
  }

  // Helper: format to MySQL datetime
  function formatToMySQLDateTime(dateStr) {
    const date = new Date(dateStr);
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0")
    );
  }

  // Helper: populate modal selects
  function populateModalSelects(students, subjects) {
    const studentSelect = document.getElementById("modalStudent");
    const subjectSelect = document.getElementById("modalSubject");

    // Clear existing options
    studentSelect.innerHTML = '<option value="">Select a student</option>';
    subjectSelect.innerHTML = '<option value="">Select a subject</option>';

    // Populate students
    students.forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      studentSelect.appendChild(option);
    });

    // Populate subjects
    subjects.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.id;
      option.textContent = subject.subject_name;
      subjectSelect.appendChild(option);
    });
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    locale: "en",
    timeZone: "local",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    selectable: user.role === "tutor",
    editable: user.role === "tutor",
    eventMinHeight: 50,

    // Validations
    selectAllow: function (selectionInfo) {
      const now = new Date();
      if (selectionInfo.start < now) {
        showErrorModal("You cannot schedule in the past.");
        return false;
      }
      const events = calendar.getEvents();
      for (let ev of events) {
        if (ev.extendedProps.tutors_id === user.tutorId) {
          const overlap =
            selectionInfo.start < ev.end && selectionInfo.end > ev.start;
          if (overlap) {
            showErrorModal("You already have a tutoring session at this time.");
            return false;
          }
        }
      }
      return true;
    },

    select: async (selectionInfo) => {
      if (user.role !== "tutor") return;

      // Fetch students and subjects
      const students = await fetchStudents();
      const subjects = await fetchSubjects();

      if (!students || !subjects) {
        showErrorModal("Error loading students or subjects. Please try again.");
        return;
      }

      document.getElementById("modalTitle").textContent =
        "Create Tutoring Session";
      document.getElementById("modalSaveBtn").textContent = "Save";
      document.getElementById("modalDeleteBtn").classList.add("is-hidden");

      // Populate the selects with data
      populateModalSelects(students, subjects);

      // Clear form values
      document.getElementById("modalStudent").value = "";
      document.getElementById("modalSubject").value = "";
      document.getElementById("modalStart").value = selectionInfo.start
        .toISOString()
        .slice(0, 16);
      document.getElementById("modalEnd").value = selectionInfo.end
        .toISOString()
        .slice(0, 16);

      // Set up save handler
      document.getElementById("modalSaveBtn").onclick = () =>
        saveTutoria(selectionInfo);

      document.getElementById("tutoringModal").classList.add("is-active");
    },

    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        const res = await fetch(
          `https://backend-1-x71e.onrender.com/calendar/events?userId=${
            user.role === "tutor" ? user.tutorId : user.studentId
          }&role=${user.role}`
        );
        if (!res.ok) throw new Error("Error loading events");
        const data = await res.json();
        const events = data.map((event) => ({
          id: event.id,
          title: `${event.subject_name} with ${event.student_name || "TBD"}`,
          start: new Date(event.start),
          end: new Date(event.end),
          extendedProps: event,
        }));
        successCallback(events);
      } catch (err) {
        console.error(err);
        failureCallback(err);
      }
    },

    eventContent: function (arg) {
      const link = arg.event.extendedProps.jitsi_link;
      const jitsiButton = link
        ? `<a href="${link}" target="_blank" class="button is-small is-link mt-1">Join Jitsi 🖥️</a>`
        : "";
      return {
        html: `
          <div style="font-size: 0.8em; line-height: 1.2; text-align: center;">
        <div style="font-weight: bold; margin-bottom: 2px;">
          ${arg.event.title}
        </div>
        ${jitsiButton}
      </div>
        `,
      };
    },

    eventClick: async (info) => {
      const event = info.event;
      const link = event.extendedProps.jitsi_link;

      if (user.role === "tutor") {
        const students = await fetchStudents();
        const subjects = await fetchSubjects();

        if (!students || !subjects) {
          showErrorModal(
            "Error loading students or subjects. Please try again."
          );
          return;
        }

        document.getElementById("modalTitle").textContent =
          "Edit Tutoring Session";
        document.getElementById("modalSaveBtn").textContent = "Update";
        document.getElementById("modalDeleteBtn").classList.remove("is-hidden");

        populateModalSelects(students, subjects);
        document.getElementById("modalStudent").value =
          event.extendedProps.students_id;
        document.getElementById("modalSubject").value =
          event.extendedProps.subjects_id;
        document.getElementById("modalStart").value = event.start
          .toISOString()
          .slice(0, 16);
        document.getElementById("modalEnd").value = event.end
          .toISOString()
          .slice(0, 16);

        document.getElementById("modalSaveBtn").onclick = () =>
          updateTutoria(event);
        document.getElementById("modalDeleteBtn").onclick = () =>
          showConfirmModal(
            "Are you sure you want to delete this tutoring session?",
            () => deleteTutoria(event.id)
          );

        document.getElementById("tutoringModal").classList.add("is-active");
      } else {
        if (link) window.open(link, "_blank");
      }
    },
  });

  calendar.render();

  async function saveTutoria(selectionInfo) {
    const start = document.getElementById("modalStart").value;
    const end = document.getElementById("modalEnd").value;
    const studentId = document.getElementById("modalStudent").value;
    const subjectId = document.getElementById("modalSubject").value;

    if (!studentId || !subjectId) {
      showErrorModal("Please select both a student and a subject.");
      return;
    }
    const body = {
      start_datetime: formatToMySQLDateTime(start),
      end_datetime: formatToMySQLDateTime(end),
      tutors_id: user.tutorId,
      students_id: Number(studentId),
      subjects_id: Number(subjectId),
      jitsi_link: `https://meet.jit.si/tutoria-${Date.now()}`,
    };

    try {
      const res = await fetch("https://backend-1-x71e.onrender.com/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error creating tutoring session");

      document.getElementById("tutoringModal").classList.remove("is-active");
      calendar.refetchEvents();
    } catch (err) {
      console.error("Error:", err);
      showErrorModal("Error creating tutoring session.");
    }
  }

  async function createTutoria(start, end, studentId, subjectId) {
    // Aquí va tu POST al backend
    return {
      id: String(Date.now()),
      title: "Tutoring Session",
      start,
      end,
      extendedProps: {
        students_id: studentId,
        subjects_id: subjectId,
        tutors_id: user.tutorId,
        jitsi_link: "", // ← agregado aquí
      },
    };
  }

  async function updateTutoria(event) {
    const start = document.getElementById("modalStart").value;
    const end = document.getElementById("modalEnd").value;
    const studentId = document.getElementById("modalStudent").value;
    const subjectId = document.getElementById("modalSubject").value;

    if (!studentId || !subjectId) {
      showErrorModal("Please select both a student and a subject.");
      return;
    }

    const newStart = new Date(start);
    const newEnd = new Date(end);
    const now = new Date();

    if (newStart < now) {
      showErrorModal("You cannot reschedule to past dates.");
      return;
    }

    const events = calendar.getEvents();
    for (let ev of events) {
      if (
        ev.id !== event.id &&
        ev.extendedProps.tutors_id === user.tutorId &&
        newStart < ev.end &&
        newEnd > ev.start
      ) {
        showErrorModal("That time slot is already occupied.");
        return;
      }
    }

    const body = {
      start_datetime: formatToMySQLDateTime(start),
      end_datetime: formatToMySQLDateTime(end),
      students_id: Number(studentId),
      subjects_id: Number(subjectId),
    };

    try {
      const res = await fetch(
        `https://backend-1-x71e.onrender.com/calendar/events/${event.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error updating tutoring session");

      document.getElementById("tutoringModal").classList.remove("is-active");
      calendar.refetchEvents();
    } catch (err) {
      console.error("Error:", err);
      showErrorModal("Error updating tutoring session.");
    }
  }

  async function deleteTutoria(eventId) {
    try {
      const res = await fetch(
        `https://backend-1-x71e.onrender.com/calendar/events/${eventId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error deleting tutoring session");
      document.getElementById("tutoringModal").classList.remove("is-active");
      calendar.refetchEvents();
    } catch (err) {
      console.error("Error:", err);
      showErrorModal("Error deleting tutoring session.");
    }
  }

  async function fetchStudents() {
    try {
      const res = await fetch("https://backend-1-x71e.onrender.com/users/role/students");
      if (!res.ok) throw new Error("Error getting students");
      const students = await res.json();
      console.log("📚 Students loaded:", students);
      return students;
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      showErrorModal("Error loading students. Please try again.");
      return null;
    }
  }

  async function fetchSubjects() {
    try {
      const res = await fetch("https://backend-1-x71e.onrender.com/subjects");
      if (!res.ok) throw new Error("Error getting subjects");
      const subjects = await res.json();
      console.log("📖 Subjects loaded:", subjects);
      return subjects;
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
      showErrorModal("Error loading subjects. Please try again.");
      return null;
    }
  }
}

// Load Calendar View
export function loadCalendarView() {
  document.getElementById("main").innerHTML = calendar();
  const user = auth.getUser();
  if (!user) {
    showErrorModal("You must log in first.");
    window.location.hash = "#/login";
    return;
  }
  initCalendar();
  document
    .getElementById("logoutFromCalendar")
    ?.addEventListener("click", () => {
      auth.clearUser();
      window.location.hash = "#/login";
    });
}