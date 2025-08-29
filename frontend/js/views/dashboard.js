import { auth } from "../auth.js";
import { createChat } from "./chats.js";

// En dashboard.js - asegúrate de que ambos roles vean el link a chats
export function dashboard() {
  const role = auth.role();
  const username = auth.username();

  return `
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
      <div id="contentDashboard"></div>
    </div>
  </section>`;
}
export function initDashboard(navigate) {
  const role = auth.role();
  const studentId = localStorage.getItem("lp_studentId");
  const tutorId = localStorage.getItem("lp_tutorId");

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();
      navigate("home");
    });
  }

  document.querySelectorAll(".navbar-item[data-route]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      navigate(link.getAttribute("data-route"));
    });
  });

  if (role === "student") renderStudentDashboard(studentId);
  else if (role === "tutor") renderTutorDashboard(tutorId);
  else document.getElementById("contentDashboard").innerHTML = "<p>❌ Rol desconocido.</p>";
}

// ---------------------
// STUDENT DASHBOARD
// ---------------------
function renderStudentDashboard(studentDbId) {
  const content = document.getElementById("contentDashboard");
  content.innerHTML = `
    <h2 class="title is-4">Student Dashboard</h2>
    
    <!-- Chats activos para estudiantes -->
    <h3 class="title is-5">Your Active Chats</h3>
    <div id="activeChats"></div>
    
    <h3 class="title is-5 mt-5">Available Tutors</h3>
    <div id="tutorsList"></div>
  `;
  
  loadStudentChats(studentDbId); // ← Nueva función
  loadTutors(studentDbId);
}

async function loadStudentChats(studentDbId) {
  try {
    const res = await fetch(`http://localhost:3000/requests?student_id=${studentDbId}`);
    const requests = await res.json();
    
    const acceptedRequests = requests.filter(r => r.status === "accepted");
    renderStudentChats(acceptedRequests, studentDbId);
    
  } catch (err) {
    console.error("❌ Error loading student chats:", err);
  }
}

function renderStudentChats(requests, studentDbId) {
  const container = document.getElementById("activeChats");
  container.innerHTML = "";

  if (!requests.length) {
    container.innerHTML = `
      <div class="notification is-info">
        <p>You don't have active chats yet</p>
        <p class="is-size-7">Chats will appear here when tutors accept your requests</p>
      </div>
    `;
    return;
  }

  requests.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("box");
    div.innerHTML = `
      <p><strong>Chat with ${req.tutor_name} ${req.tutor_last_name}</strong></p>
      <p>Status: <span class="tag is-success">${req.status}</span></p>
      <button class="button is-info is-small mt-2 goToChatBtn" 
              data-tutor-id="${req.tutor_id}" 
              data-student-id="${req.student_id}">
        <i class="fas fa-comments"></i>&nbsp; Open Chat
      </button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".goToChatBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tutorId = btn.dataset.tutorId;
      const studentId = btn.dataset.studentId;
      
      localStorage.setItem("activeChatTutorId", tutorId);
      localStorage.setItem("activeChatStudentId", studentId);
      
      window.location.hash = "#/chats";
    });
  });
};

async function loadTutors(studentDbId) {
  try {
    const res = await fetch("http://localhost:3000/users/role/tutors");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const tutors = await res.json();

    const list = document.getElementById("tutorsList");
    list.innerHTML = "";

    if (!tutors || tutors.length === 0) {
      list.innerHTML = "<p>No hay tutores disponibles</p>";
      return;
    }

    tutors.forEach(tutor => {
      const div = document.createElement("div");
      div.classList.add("box");
      div.innerHTML = `
        <p><strong>${tutor.name} ${tutor.last_name}</strong></p>
        <p>${tutor.description_tutor || "No description available"}</p>
        <button 
          class="button is-success is-small btnRequestTutor" 
          data-student-id="${studentDbId}" 
          data-tutor-id="${tutor.tutor_id || tutor.id}"
        >Request tutor</button>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll(".btnRequestTutor").forEach(btn => {
      btn.addEventListener("click", async () => {
        const student_id = btn.dataset.studentId;
        const tutor_id = btn.dataset.tutorId;

        if (!student_id || !tutor_id) {
          alert("❌ Error: IDs missing");
          return;
        }

        try {
          const res = await fetch("http://localhost:3000/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id, tutor_id })
          });

          const data = await res.json();
          if (!res.ok) {
            alert("❌ Error: " + (data.message || data.error || "Unknown error"));
          } else {
            alert("✅ Request enviada al tutor");
            // Recargar la lista para actualizar
            loadTutors(studentDbId);
          }
        } catch (err) {
          console.error("Error sending request:", err);
          alert("❌ Error de conexión");
        }
      });
    });

  } catch (err) {
    console.error("❌ Error cargando tutores:", err);
    document.getElementById("tutorsList").innerHTML = `
      <p class="has-text-danger">Error cargando tutores: ${err.message}</p>
    `;
  }
}

// ---------------------
// TUTOR DASHBOARD
// ---------------------
function renderTutorDashboard(tutorDbId) {
  const content = document.getElementById("contentDashboard");
  content.innerHTML = `
    <h2 class="title is-4">Tutor Dashboard</h2>
    <h3 class="title is-5">Pending Requests</h3>
    <div id="pendingRequests"></div>
    
    <h3 class="title is-5 mt-5">Accepted Requests</h3>
    <div id="acceptedRequests"></div>
  `;
  loadRequests(tutorDbId);
}

async function loadRequests(tutorDbId) {
  try {
    const res = await fetch(`http://localhost:3000/requests?tutor_id=${tutorDbId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const requests = await res.json();

    renderPendingRequests(requests, tutorDbId);
    renderAcceptedRequests(requests);

  } catch (err) {
    console.error("❌ Error cargando requests:", err);
    document.getElementById("pendingRequests").innerHTML = `
      <p class="has-text-danger">Error cargando solicitudes: ${err.message}</p>
    `;
  }
}

function renderPendingRequests(requests, tutorDbId) {
  const container = document.getElementById("pendingRequests");
  container.innerHTML = "";

  const pendingRequests = requests.filter(r => r.status === "pending");

  if (!pendingRequests.length) {
    container.innerHTML = "<p>No pending requests.</p>";
    return;
  }

  pendingRequests.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("box");
    div.innerHTML = `
      <p><strong>Request #${req.id}</strong></p>
      <p>Student: ${req.student_name} ${req.student_last_name}</p>
      <p>Status: <span class="tag is-warning">${req.status}</span></p>
      ${req.message ? `<p>Message: ${req.message}</p>` : ''}
      <div class="buttons mt-3">
        <button class="button is-success btnAccept" data-id="${req.id}">Accept</button>
        <button class="button is-danger btnReject" data-id="${req.id}">Reject</button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".btnAccept").forEach(btn =>
    btn.addEventListener("click", () => updateRequest(btn.dataset.id, tutorDbId, "accepted"))
  );
  container.querySelectorAll(".btnReject").forEach(btn =>
    btn.addEventListener("click", () => updateRequest(btn.dataset.id, tutorDbId, "rejected"))
  );
}

function renderAcceptedRequests(requests) {
  const container = document.getElementById("acceptedRequests");
  container.innerHTML = "";

  const acceptedRequests = requests.filter(r => r.status === "accepted");

  if (!acceptedRequests.length) {
    container.innerHTML = "<p>No accepted requests.</p>";
    return;
  }

  acceptedRequests.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("box");
    div.innerHTML = `
      <p><strong>Request #${req.id}</strong></p>
      <p>Student: ${req.student_name} ${req.student_last_name}</p>
      <p>Status: <span class="tag is-success">${req.status}</span></p>
      <button class="button is-info is-small mt-2" onclick="location.href='#/chats'">
        <i class="fas fa-comments"></i>&nbsp; Go to Chat
      </button>
    `;
    container.appendChild(div);
  });
}

// En dashboard.js - Modifica updateRequest
async function updateRequest(requestId, tutorDbId, status) {
  console.log("🔄 updateRequest called with:", { requestId, tutorDbId, status });
  
  try {
    const res = await fetch(`http://localhost:3000/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorDbId, status })
    });

    const data = await res.json();
    console.log("📋 Server response:", data);
    
    if (!res.ok) {
      alert("❌ Error: " + (data.error || data.message || "Unknown error"));
      return;
    }

    if (status === "accepted") {
      try {
        // ¡IMPORTANTE! Usar los IDs de la tabla students/tutors, NO de users
        const studentDbId = data.student_db_id;  // ← id de tabla students
        const tutorDbId = data.tutor_db_id;      // ← id de tabla tutors
        
        console.log("🎯 IDs for chat creation:", { 
          studentDbId, 
          tutorDbId,
          student_user_id: data.student_user_id, // ← Solo para debug
          tutor_user_id: data.tutor_user_id      // ← Solo para debug
        });

        if (!studentDbId || !tutorDbId) {
          throw new Error("Missing database IDs for chat creation");
        }

        const studentName = `${data.student_name} ${data.student_last_name}`;
        const tutorName = `${data.tutor_name} ${data.tutor_last_name}`;
        
        // Crear chat con los IDs CORRECTOS
        const chatId = await createChat(tutorDbId, studentDbId, tutorName, studentName);
        console.log("✅ Chat created successfully:", chatId);
        
        alert("✅ Solicitud aceptada y chat creado exitosamente");
        
      } catch (chatError) {
        console.error("❌ Error in chat creation:", chatError);
        alert("✅ Solicitud aceptada, pero error creando chat: " + chatError.message);
      }
    } else {
      alert("✅ Solicitud rechazada");
    }

    loadRequests(tutorDbId);

  } catch (err) {
    console.error("❌ Error in updateRequest:", err);
    alert("❌ Error processing request: " + err.message);
  }
}