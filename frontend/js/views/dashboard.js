import { auth } from "../auth.js";
import { createChat } from "./chats.js";
import { modal } from "../views/modal.js";

// Navbar y layout del dashboard
export function dashboard() {
  const user = auth.getUser();
  const role = user?.role || "unknown";
  const username = user?.username || "Unknown";

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
          <a href="#" class="sidebar-nav-item active" data-route="dashboard">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a href="#" class="sidebar-nav-item" data-route="calendar">
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

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Navbar -->
        <header class="top-navbar">
          <div class="navbar-left">
            <button class="mobile-menu-btn" id="mobile-menu-btn">
              <i class="fas fa-bars"></i>
            </button>
            <h1>Welcome back, ${username}</h1>
          </div>
          <div class="navbar-right">
            <div class="user-profile">
              <div class="user-avatar">
                ${username.charAt(0).toUpperCase()}
              </div>
              <div class="user-info">
                <div class="user-name">${username}</div>
                <div class="user-role">${role}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <div id="contentDashboard"></div>
        </div>
      </main>
    </div>`;
}

export function initDashboard(navigate) {
  const user = auth.getUser();
  const role = user?.role;
  const studentId = user?.studentId;
  const tutorId = user?.tutorId;

  // Navigation
  document.querySelectorAll(".sidebar-nav-item[data-route]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      
      // Update active state
      document.querySelectorAll(".sidebar-nav-item").forEach(item => {
        item.classList.remove("active");
      });
      link.classList.add("active");
      
      navigate(link.getAttribute("data-route"));
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.clearUser();
    navigate("home");
  });

  if (role === "student") renderStudentDashboard(studentId);
  else if (role === "tutor") renderTutorDashboard(tutorId);
  else document.getElementById("contentDashboard").innerHTML = `
    <div class="empty-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Unknown Role</h3>
      <p>Unable to determine user role. Please contact support.</p>
    </div>
  `;
}

// Studen dashboard

function renderStudentDashboard(studentDbId) {
  const content = document.getElementById("contentDashboard");
  content.innerHTML = `
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="fas fa-comments"></i>
        </div>
        <div class="stat-number" id="active-chats-count">0</div>
        <div class="stat-label">Active Chats</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon secondary">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-number" id="available-tutors-count">0</div>
        <div class="stat-label">Available Tutors</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">Your Active Chats</h3>
        </div>
        <div id="activeChats"></div>
      </div>
      
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">Available Tutors</h3>
        </div>
        <div id="tutorsList"></div>
      </div>
    </div>
  `;
  
  loadStudentChats(studentDbId);
  loadTutors(studentDbId);
}

async function loadStudentChats(studentDbId) {
  try {
    const res = await fetch(`https://backend-1-x71e.onrender.com/requests?student_id=${studentDbId}`);
    const requests = await res.json();
    const accepted = requests.filter(r => r.status === "accepted");
    renderStudentChats(accepted, studentDbId);
  } catch (err) {
    console.error("Error loading chats:", err);
  }
}

function renderStudentChats(requests, studentDbId) {
  const container = document.getElementById("activeChats");

  //  limpiar antes
  container.innerHTML = "";

  // Update stats
  document.getElementById("active-chats-count").textContent = requests.length;
  
  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>No Active Chats</h3>
        <p>Chats will appear here when tutors accept your requests</p>
      </div>
    `;
    return;
  }
  requests.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("request-item");
    div.innerHTML = `
      <div class="request-header">
        <div class="request-info">
          <h4>Chat with ${req.tutor_name} ${req.tutor_last_name}</h4>
          <p>Ready to start learning</p>
        </div>
        <span class="card-badge badge-success">${req.status}</span>
      </div>
      <div class="request-actions">
        <button class="btn btn-info goToChatBtn" 
              data-tutor-user-id="${req.tutor_user_id}" 
              data-student-user-id="${req.student_user_id}">
          <i class="fas fa-comments"></i>
          Open Chat
        </button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".goToChatBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Guardar el id de rol (tutorId y studentId) para el chat
      localStorage.setItem("activeChatTutorId", btn.dataset.tutorUserId);
      localStorage.setItem("activeChatStudentId", btn.dataset.studentUserId);

      window.location.hash = "#/chats";
    });
  });
}

async function loadTutors(studentDbId) {
  try {
    const res = await fetch("https://backend-1-x71e.onrender.com/users/role/tutors");
    const tutors = await res.json();
    
    // Update stats
    document.getElementById("available-tutors-count").textContent = tutors.length;
    const list = document.getElementById("tutorsList");
    //  limpiar antes
    list.innerHTML = "";

    if (tutors.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-graduate"></i>
          <h3>No Tutors Available</h3>
          <p>Check back later for available tutors</p>
        </div>
      `;
      return;
    }

    tutors.forEach(tutor => {
      const div = document.createElement("div");
      div.classList.add("tutor-card");
      div.innerHTML = `
        <div class="tutor-header">
          <div class="tutor-avatar">
            ${tutor.name.charAt(0).toUpperCase()}
          </div>
          <div class="tutor-info">
            <h4>${tutor.name} ${tutor.last_name}</h4>
            <p>Professional Tutor</p>
          </div>
        </div>
        <p style="color: #4a5568; margin-bottom: 1rem;">${tutor.description_tutor || "Experienced tutor ready to help you learn"}</p>
        <button class="btn btn-success btnRequestTutor" 
                data-student-id="${studentDbId}" 
                data-tutor-id="${tutor.tutor_id || tutor.id}">
          <i class="fas fa-paper-plane"></i>
          Request Tutor
        </button>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll(".btnRequestTutor").forEach(btn => {
      btn.addEventListener("click", async () => {
        const student_id = btn.dataset.studentId;
        const tutor_id = btn.dataset.tutorId;

        try {
          const res = await fetch("https://backend-1-x71e.onrender.com/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id, tutor_id })
          });

          const data = await res.json();
          if (!res.ok) {
            modal.error("Request Failed", data.message || "Unknown error occurred");
          } else {
            modal.success("Request Sent", "Your tutor request has been sent successfully!");
            loadTutors(studentDbId); // reload list
          }
        } catch (err) {
          modal.error("Connection Error", "Unable to send request. Please try again.");
        }
      });
    });

  } catch (err) {
    document.getElementById("tutorsList").innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Tutors</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// TUtor dashboard.

function renderTutorDashboard(tutorDbId) {
  const content = document.getElementById("contentDashboard");
  content.innerHTML = `
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon secondary">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-number" id="pending-requests-count">0</div>
        <div class="stat-label">Pending Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-number" id="accepted-requests-count">0</div>
        <div class="stat-label">Active Students</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">Pending Requests</h3>
          <span class="card-badge badge-warning" id="pending-badge">0 pending</span>
        </div>
        <div id="pendingRequests"></div>
      </div>
      
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">Active Students</h3>
          <span class="card-badge badge-success" id="accepted-badge">0 active</span>
        </div>
        <div id="acceptedRequests"></div>
      </div>
    </div>
  `;
  loadRequests(tutorDbId);
}

async function loadRequests(tutorDbId) {
  try {
    const res = await fetch(`https://backend-1-x71e.onrender.com/requests?tutor_id=${tutorDbId}`);
    const requests = await res.json();
    renderPendingRequests(requests, tutorDbId);
    renderAcceptedRequests(requests);
  } catch (err) {
    modal.error("Error", `Error loading requests: ${err.message}`);
  }
}

function renderPendingRequests(requests, tutorDbId) {
  const container = document.getElementById("pendingRequests");
  const pending = requests.filter(r => r.status === "pending");

  // Update stats and badges
  document.getElementById("pending-requests-count").textContent = pending.length;
  document.getElementById("pending-badge").textContent = `${pending.length} pending`;
    container.innerHTML = "";
  
  if (pending.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No Pending Requests</h3>
        <p>New student requests will appear here</p>
      </div>
    `;
    return;
  }

  pending.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("request-item");
    div.innerHTML = `
      <div class="request-header">
        <div class="request-info">
          <h4>Request from ${req.student_name} ${req.student_last_name}</h4>
          <p>Request #${req.id} • Waiting for response</p>
        </div>
        <span class="card-badge badge-warning">${req.status}</span>
      </div>
      <div class="request-actions">
        <button class="btn btn-success btnAccept" data-id="${req.id}">
          <i class="fas fa-check"></i>
          Accept
        </button>
        <button class="btn btn-danger btnReject" data-id="${req.id}">
          <i class="fas fa-times"></i>
          Reject
        </button>
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
  const accepted = requests.filter(r => r.status === "accepted");
  
  // Filtrar requests únicos por estudiante para evitar duplicados
  const uniqueAccepted = [];
  const seenStudents = new Set();
  
  accepted.forEach(req => {
    if (!seenStudents.has(req.student_user_id)) {
      seenStudents.add(req.student_user_id);
      uniqueAccepted.push(req);
    }
  });
  
  container.innerHTML = "";

  // Update stats and badges
  document.getElementById("accepted-requests-count").textContent = uniqueAccepted.length;
  document.getElementById("accepted-badge").textContent = `${uniqueAccepted.length} active`;
  
  if (uniqueAccepted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-graduate"></i>
        <h3>No Active Students</h3>
        <p>Accepted requests will appear here</p>
      </div>
    `;
    return;
  }

  uniqueAccepted.forEach(req => {
    const div = document.createElement("div");
    div.classList.add("request-item");
    div.innerHTML = `
      <div class="request-header">
        <div class="request-info">
          <h4>${req.student_name} ${req.student_last_name}</h4>
          <p>Request #${req.id} • Active student</p>
        </div>
        <span class="card-badge badge-success">${req.status}</span>
      </div>
      <div class="request-actions">
        <button class="btn btn-info" onclick="location.href='#/chats'">
          <i class="fas fa-comments"></i>
          Open Chat
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function updateRequest(requestId, tutorDbId, status) {
  try {
    const res = await fetch(`https://backend-1-x71e.onrender.com/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorDbId, status })
    });

    const data = await res.json();
    console.log("📦 Backend response en updateRequest:", data);


    if (!res.ok) {
      modal.error("Request Failed", data.error || "Unknown error occurred");
      return;
    }

    if (status === "accepted") {
      // Usar los IDs de rol (tutor_db_id y student_db_id) para crear el chat
      const { student_user_id, tutor_user_id, student_name, student_last_name, tutor_name, tutor_last_name } = data;;
      if (!student_user_id || !tutor_user_id) {
        throw new Error("Missing role IDs from database. Check backend response.");
      }
      
      console.log("🟢 Llamando a createChat con:", {
        tutor_user_id,
        student_user_id,
        tutor_name,
        student_name
      });

      await createChat(
        tutor_user_id,
        student_user_id,
        `${tutor_name} ${tutor_last_name}`,
        `${student_name} ${student_last_name}`
      );
      modal.success("Request Accepted", "Chat has been created successfully!");
    } else {
      modal.info("Request Rejected", "The request has been rejected");
    }

    loadRequests(tutorDbId);
  } catch (err) {
    modal.error("Error", err.message);
  }
}
