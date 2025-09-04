import { db } from "./firebaseConfig.js";
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, 
  doc, setDoc, getDoc, updateDoc, where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth } from "../auth.js";
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ================== HTML VIEW ==================
export function chats() {
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
    <div class="section">
      <div class="container">
        <h1 class="title">Chats</h1>
        <div class="columns">
          <div class="column is-4">
            <div class="box">
              <h2 class="title is-5">Your Chats</h2>
              <div id="contacts" class="contacts"></div>
            </div>
          </div>

          <div class="column is-8">
            <div class="box">
              <div id="chatHeader" class="has-text-centered">
                <p class="subtitle">Select a chat to start</p>
              </div>
              <div class="messages" id="messages"></div>
              <div class="chat-input" id="chatInputContainer" style="display: none;">
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <input class="input" type="text" id="chatInput" placeholder="Type a message..." />
                  </div>
                  <div class="control">
                    <button class="button is-primary" id="sendBtn">
                      <i class="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
  `;
}

// ================== INITIALIZATION ==================
export function initChats(navigate) {
  const user = auth.getUser();
  const currentUserId = user?.id;
  const currentUserRole = user?.role;

  console.log("🔑 User info (auth):", { currentUserId, currentUserRole });

  // Clear previous listeners
  if (window.currentChatsUnsubscribe) {
    window.currentChatsUnsubscribe();
    window.currentChatsUnsubscribe = null;
  }
  if (window.currentChatUnsubscribe) {
    window.currentChatUnsubscribe();
    window.currentChatUnsubscribe = null;
  }

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (window.currentChatsUnsubscribe) window.currentChatsUnsubscribe();
    if (window.currentChatUnsubscribe) window.currentChatUnsubscribe();
    auth.clearUser();
    navigate("home");
  });

  if (!currentUserId) {
    document.getElementById("contacts").innerHTML = "<p>Debes iniciar sesión para ver los chats</p>";
    return;
  }

  const specificTutorId = localStorage.getItem("activeChatTutorId");
  const specificStudentId = localStorage.getItem("activeChatStudentId");

  if (specificTutorId && specificStudentId) {
    loadSpecificChat(specificTutorId, specificStudentId, currentUserId);
    localStorage.removeItem("activeChatTutorId");
    localStorage.removeItem("activeChatStudentId");
  } else {
    loadUserChats(currentUserId);
  }

  document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
  document.getElementById("chatInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// ================== AUXILIARY FUNCTIONS ==================
async function loadUserChats(currentUserId) {
  try {
    const contactsDiv = document.getElementById("contacts");
    contactsDiv.innerHTML = `<div class="notification is-info">
        <p><i class="fas fa-spinner fa-spin"></i> Loading chats...</p>
      </div>`;

    if (window.currentChatsUnsubscribe) window.currentChatsUnsubscribe();

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", String(currentUserId))
    );

    window.currentChatsUnsubscribe = onSnapshot(chatsQuery, async (querySnapshot) => {
      const userChats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await renderChats(userChats, currentUserId);
    });
  } catch (error) {
    console.error("Error loading chats:", error);
    document.getElementById("contacts").innerHTML = `<div class="notification is-danger">
        <p>Error loading chats: ${error.message}</p>
      </div>`;
  }
}

async function renderChats(chats, currentUserId) {
  const contactsDiv = document.getElementById("contacts");
  contactsDiv.innerHTML = "";

  const seen = new Set();
  const uniqueChats = chats.filter(chat => {
    const key = [...chat.participants].sort().join("_");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueChats.length === 0) {
    contactsDiv.innerHTML = `<div class="notification is-info">
        <p>No active chats yet</p>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  const currentActiveChatId = localStorage.getItem("activeChatId");

  for (const chat of uniqueChats) {
    const otherId = chat.participants.find(id => id !== String(currentUserId));
    const otherName = chat.participantNames?.[otherId] || await getUsernameById(otherId);

    const div = document.createElement("div");
    div.classList.add("box", "chat-item");
    div.style.cursor = "pointer";
    div.style.marginBottom = "10px";
    div.style.padding = "15px";
    div.style.borderLeft = "4px solid #3273dc";
    div.style.backgroundColor = chat.id === currentActiveChatId ? "#e8f4fd" : "#f5f5f5";

    div.innerHTML = `<div class="is-flex is-justify-content-space-between is-align-items-center">
        <div>
          <strong>${otherName}</strong>
          <p class="has-text-grey is-size-7">${chat.lastMessage || "Start conversation"}</p>
        </div>
      </div>`;

    div.addEventListener("click", () => {
      document.querySelectorAll('.chat-item').forEach(item => {
        item.style.backgroundColor = "#f5f5f5";
        item.style.borderLeftColor = "#3273dc";
      });
      div.style.backgroundColor = "#e8f4fd";
      div.style.borderLeftColor = "#209cee";
      loadMessages(chat.id);
      localStorage.setItem("activeChatId", chat.id);
      document.getElementById("chatInputContainer").style.display = "block";
      document.getElementById("chatHeader").innerHTML = `<h3 class="title is-6">Chat con ${otherName}</h3>`;
    });

    fragment.appendChild(div);
  }
  contactsDiv.appendChild(fragment);
}

async function getUsernameById(userId) {
  try {
    const res = await fetch(`https://backend-1-x71e.onrender.com/users/${userId}`);
    const data = await res.json();
    return `${data.name} ${data.last_name}` || "Usuario desconocido";
  } catch {
    return "Usuario desconocido";
  }
}

function loadMessages(chatId) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "<p class='has-text-grey'>Cargando mensajes...</p>";

  if (window.currentChatUnsubscribe) window.currentChatUnsubscribe();

  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );

  window.currentChatUnsubscribe = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();

      // Convert the date (Firestore Timestamp -> Date)
      let time = "";
      if (msg.createdAt) {
        const date = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
        time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      const msgDiv = document.createElement("div");
      msgDiv.classList.add(
        "message",
        msg.sender === String(auth.getUser()?.id) ? "is-primary" : "is-light"
      );
      msgDiv.style.marginBottom = "10px";
      msgDiv.style.padding = "8px";
      msgDiv.style.borderRadius = "8px";
      msgDiv.style.maxWidth = "70%";
      msgDiv.style.marginLeft =
        msg.sender === String(auth.getUser()?.id) ? "auto" : "0";

      // Show text + time
      msgDiv.innerHTML = `
        <p>${msg.text}</p>
        <span class="has-text-grey is-size-7" style="display:block; text-align:right; margin-top:4px;">
          ${time}
        </span>
      `;

      messagesDiv.appendChild(msgDiv);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  const chatId = localStorage.getItem("activeChatId");
  const currentUserId = auth.getUser()?.id;
  if (!text || !chatId) return;

  await addDoc(collection(db, `chats/${chatId}/messages`), {
    sender: String(currentUserId), text, createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text, lastUpdated: serverTimestamp()
  });
  input.value = "";
}

// Create chat
export async function createChat(tutorUserId, studentUserId, tutorName, studentName) {
  const chatId = [String(tutorUserId), String(studentUserId)].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, { participants: [String(tutorUserId), String(studentUserId)], createdAt: new Date() });
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      sender: "system",
      text: `¡Chat iniciado! ${tutorName} y ${studentName} pueden ahora comunicarse.`,
      createdAt: serverTimestamp()
    });
  }
  return chatId;
}

async function loadSpecificChat(tutorUserId, studentUserId, currentUserId) {
  const chatId = [String(tutorUserId), String(studentUserId)].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (chatSnap.exists()) {
    loadMessages(chatId);
    localStorage.setItem("activeChatId", chatId);
    const otherParticipantId = chatSnap.data().participants.find(id => id !== String(currentUserId));
    const username = await getUsernameById(otherParticipantId);
    document.getElementById("chatHeader").innerHTML = `<h3 class="title is-6">Chat con ${username}</h3>`;
    document.getElementById("chatInputContainer").style.display = "block";
  }
  // We do NOT call loadUserChats() again here to avoid duplicates.
  loadUserChats(currentUserId);
}