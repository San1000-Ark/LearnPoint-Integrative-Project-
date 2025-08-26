export function calendar() {
  return `
  <nav class="navbar has-background-dark">
    <div class="navbar-brand">
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

export function initCalendar(navigate) {
  // Allow logout here too
  const lg = document.getElementById("logoutFromCalendar");
  if (lg) {
    lg.addEventListener("click", () => {
      localStorage.removeItem("lp_role");
      localStorage.removeItem("lp_username");
      navigate("home");
    });
  }

  const el = document.getElementById("calendar");
  if (!el || typeof FullCalendar === "undefined") return;

  const calendar = new FullCalendar.Calendar(el, {
    initialView: "dayGridMonth",
    selectable: true,
    editable: false,

    dateClick(info) {
      const student = prompt("Enter student name:");
      const subject = prompt("Enter subject:");
      if (student && subject) {
        const jitsiRoom = "tutoring-" + Math.random().toString(36).substring(2, 10);
        const jitsiLink = `https://meet.jit.si/${jitsiRoom}`;

        calendar.addEvent({
          title: `${student} - ${subject}`,
          start: info.dateStr,
          extendedProps: { jitsi: jitsiLink }
        });

        alert(`Class scheduled!\nJitsi link: ${jitsiLink}`);
      }
    },

    eventClick(info) {
      const jitsi = info.event.extendedProps?.jitsi;
      if (jitsi) window.open(jitsi, "_blank", "noopener");
    },

    events: [
      {
        title: "Anna Lopez - JavaScript",
        start: "2025-08-25T15:00:00",
        extendedProps: { jitsi: "https://meet.jit.si/demo-room-anna" }
      },
      {
        title: "John Torres - SQL",
        start: "2025-08-26T17:00:00",
        extendedProps: { jitsi: "https://meet.jit.si/demo-room-john" }
      }
    ]
  });

  calendar.render();
}
