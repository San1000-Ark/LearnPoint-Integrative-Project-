import { db } from "./firebaseConfig.js";
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, 
  doc, setDoc, getDoc, updateDoc, where, getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ================== VISTA HTML ==================
export function chats() {
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
      <a class="navbar-item has-text-white" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i>&nbsp; Logout
      </a>
    </div>
  </nav>

  <div class="section">
    <div class="container">
      <h1 class="title">Chats</h1>
      <div class="columns">
        <!-- BARRA LATERAL IZQUIERDA - LISTA DE CHATS -->
        <div class="column is-4">
          <div class="box">
            <h2 class="title is-5">Your Chats</h2>
            <div id="contacts" class="contacts">
              <!-- Aquí aparecerán los chats -->
            </div>
          </div>
        </div>

        <!-- ÁREA PRINCIPAL DE CHAT -->
        <div class="column is-8">
          <div class="box">
            <div id="chatHeader" class="has-text-centered">
              <p class="subtitle">Select a chat to start</p>
            </div>
            
            <!-- MENSAJES -->
            <div class="messages" id="messages" style="height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;"></div>
            
            <!-- INPUT DE MENSAJES (OCULTO AL INICIO) -->
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
  `;
}

async function loadSpecificChat(tutorId, studentId, currentUserId, currentUserRole) {
  try {
    const chatId = [String(tutorId), String(studentId)].sort().join("_");
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      const chatData = { id: chatSnap.id, ...chatSnap.data() };
      loadMessages(chatId);
      
      const otherParticipantId = chatData.participants.find(id => id !== currentUserId);
      let username = "Unknown User";
      
      if (chatData.participantNames && chatData.participantNames[otherParticipantId]) {
        username = chatData.participantNames[otherParticipantId];
      } else {
        username = await getUsernameById(otherParticipantId);
      }
      
      document.getElementById("chatHeader").innerHTML = `<h3 class="title is-6">Chat with ${username}</h3>`;
      document.getElementById("chatInputContainer").style.display = "block";
      loadUserChats(currentUserId, currentUserRole);
    } else {
      loadUserChats(currentUserId, currentUserRole);
    }
  } catch (error) {
    console.error("Error loading specific chat:", error);
    loadUserChats(currentUserId, currentUserRole);
  }
}

// ================== INICIALIZACIÓN ==================
export function initChats(navigate) {
  const currentUserId = localStorage.getItem("lp_userId");
  const currentUserRole = localStorage.getItem("lp_role");
  
  console.log("🔑 User info:", { currentUserId, currentUserRole });

  // Manejar logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      navigate("home");
    });
  }

  if (!currentUserId) {
    document.getElementById("contacts").innerHTML = "<p>Debes iniciar sesión para ver los chats</p>";
    return;
  }

  // Verificar si hay un chat específico para cargar
  const specificTutorId = localStorage.getItem("activeChatTutorId");
  const specificStudentId = localStorage.getItem("activeChatStudentId");
  
  if (specificTutorId && specificStudentId) {
    loadSpecificChat(specificTutorId, specificStudentId, currentUserId, currentUserRole);
    localStorage.removeItem("activeChatTutorId");
    localStorage.removeItem("activeChatStudentId");
  } else {
    loadUserChats(currentUserId, currentUserRole);
  }

  // Eventos para enviar mensajes
  document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
  document.getElementById("chatInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// ================== FUNCIONES AUXILIARES ==================

async function loadUserChats(currentUserId, currentUserRole) {
  try {
    // ✅ Usar el user_id (que está en localStorage) para buscar chats
    const user = auth.getUser();
    const firebaseUserId = user.id; // ← users.id
    
    console.log("🔍 Loading chats for user_id:", firebaseUserId);
    
    // Cargar TODOS los chats de Firebase
    const querySnapshot = await getDocs(collection(db, "chats"));
    const allChats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log("📋 All chats from Firebase:", allChats);
    
    // Filtrar chats usando user_id
    const userChats = allChats.filter(chat => {
      if (!chat.participants) return false;
      const participantStrings = chat.participants.map(p => String(p));
      return participantStrings.includes(String(firebaseUserId));
    });
    
    console.log("🎯 User's chats found:", userChats);
    
    renderChats(userChats, currentUserId, currentUserRole);
    
  } catch (error) {
    console.error("Error loading chats:", error);
    document.getElementById("contacts").innerHTML = `
      <div class="notification is-danger">
        <p>Error loading chats: ${error.message}</p>
        <button class="button is-small is-info" onclick="location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }
}

// Renderizar lista de chats
async function renderChats(chats, currentUserId, currentUserRole) {
  const contactsDiv = document.getElementById("contacts");
  console.log("🎨 Rendering", chats.length, "chats");
  
  // SI HAY CHATS pero dice "No active chats", es un error
  if (chats.length === 0) {
    contactsDiv.innerHTML = `
      <div class="notification is-info">
        <p>No active chats yet</p>
        <p class="is-size-7">Chats will appear here when tutors accept your requests</p>
      </div>
    `;
    return;
  }

  // LIMPIAR y MOSTRAR los chats
  contactsDiv.innerHTML = ""; // Esto limpia el mensaje de "No active chats"

  for (const chat of chats) {
    // Encontrar el ID del tutor
    const tutorId = chat.participants.find(id => id !== currentUserId);
    
    // Usar el nombre del tutor
    let tutorName = "Tutor";
    if (chat.participantNames && chat.participantNames[tutorId]) {
      tutorName = chat.participantNames[tutorId];
    } else {
      // Si no hay nombre guardado, usar el ID
      tutorName = `Tutor ${tutorId}`;
    }

    // Crear elemento del chat
    const div = document.createElement("div");
    div.classList.add("box", "chat-item");
    div.style.cursor = "pointer";
    div.style.marginBottom = "10px";
    div.style.padding = "15px";
    div.style.borderLeft = "4px solid #3273dc";
    div.style.backgroundColor = "#f5f5f5";
    
    div.innerHTML = `
      <div class="is-flex is-justify-content-space-between is-align-items-center">
        <div>
          <strong class="is-size-5">${tutorName}</strong>
          <p class="has-text-grey is-size-7">${chat.lastMessage || "Start conversation"}</p>
        </div>
        <span class="tag is-success is-light">● Active</span>
      </div>
    `;

    // Al hacer clic en el chat
    div.addEventListener("click", () => {
      console.log("💬 Selected chat:", chat.id);
      
      // 1. Cargar mensajes
      loadMessages(chat.id);
      
      // 2. Guardar chat seleccionado
      localStorage.setItem("activeChatId", chat.id);
      
      // 3. Mostrar input de mensajes
      document.getElementById("chatInputContainer").style.display = "block";
      document.getElementById("chatHeader").innerHTML = `<h3 class="title is-6">Chat with ${tutorName}</h3>`;
    });

    contactsDiv.appendChild(div);
  }

  // AUTO-SELECCIONAR el primer chat si hay chats
  if (chats.length > 0) {
    const firstChat = chats[0];
    const tutorId = firstChat.participants.find(id => id !== currentUserId);
    
    let tutorName = "Tutor";
    if (firstChat.participantNames && firstChat.participantNames[tutorId]) {
      tutorName = firstChat.participantNames[tutorId];
    }
    
    // Cargar automáticamente el primer chat
    loadMessages(firstChat.id);
    localStorage.setItem("activeChatId", firstChat.id);
    document.getElementById("chatInputContainer").style.display = "block";
    document.getElementById("chatHeader").innerHTML = `<h3 class="title is-6">Chat with ${tutorName}</h3>`;
    
    console.log("✅ Auto-selected first chat:", firstChat.id);
  }
}

// Obtener username desde tu backend
async function getUsernameById(userId) {
  try {
    const res = await fetch(`http://localhost:3000/users/${userId}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");
    const data = await res.json();
    return data.name || data.username || "Usuario desconocido";
  } catch (err) {
    console.error("❌ Error obteniendo username:", err);
    return "Usuario";
  }
}

// Escuchar mensajes de un chat
function loadMessages(chatId) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "<p class='has-text-grey'>Cargando mensajes...</p>";

  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    
    if (snapshot.empty) {
      messagesDiv.innerHTML = "<p class='has-text-grey'>No hay mensajes aún</p>";
      return;
    }

    snapshot.forEach(doc => {
      const msg = doc.data();
      const currentUserId = localStorage.getItem("lp_userId");

      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message", msg.sender === currentUserId ? "is-primary" : "is-light");
      msgDiv.style.marginBottom = "10px";
      msgDiv.style.padding = "8px";
      msgDiv.style.borderRadius = "8px";
      msgDiv.style.maxWidth = "70%";
      msgDiv.style.marginLeft = msg.sender === currentUserId ? "auto" : "0";

      const time = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : "Ahora";
      msgDiv.innerHTML = `
        <p>${msg.text}</p>
        <small class="has-text-grey">${time}</small>
      `;

      messagesDiv.appendChild(msgDiv);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Guardar la función unsubscribe para limpiar luego
  window.currentChatUnsubscribe = unsubscribe;
}

// Enviar mensaje
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  const chatId = localStorage.getItem("activeChatId");
  const currentUserId = localStorage.getItem("lp_userId");

  if (!text || !chatId) {
    alert("Selecciona un chat primero");
    return;
  }

  try {
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      sender: currentUserId,
      text,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastUpdated: serverTimestamp()
    });

    input.value = "";
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
    alert("Error enviando mensaje");
  }
}

// Agrega estas funciones en chats.js
async function getUserIdFromStudentId(studentId) {
  try {
    const res = await fetch(`http://localhost:3000/users/student/${studentId}`);
    if (!res.ok) throw new Error("No se pudo obtener user_id del estudiante");
    const data = await res.json();
    return data.user_id;
  } catch (err) {
    console.error("❌ Error getting user_id from student_id:", err);
    throw err;
  }
}

async function getUserIdFromTutorId(tutorId) {
  try {
    const res = await fetch(`http://localhost:3000/users/tutor/${tutorId}`);
    if (!res.ok) throw new Error("No se pudo obtener user_id del tutor");
    const data = await res.json();
    return data.user_id;
  } catch (err) {
    console.error("❌ Error getting user_id from tutor_id:", err);
    throw err;
  }
}

// Función para crear chat (usada desde el dashboard)
// En tu chats.js - modifica la función createChat
// En chats.js - Asegúrate que createChat use strings consistentes
export async function createChat(tutorId, studentId, tutorName, studentName) {
  try {
    console.log("🎯 createChat called with:", { tutorId, studentId, tutorName, studentName });
    
    // ✅ Usar directamente los IDs de students/tutors (NO convertir a user_id)
    const chatId = [String(tutorId), String(studentId)].sort().join("_");
    console.log("🆔 Generated chatId with student/tutor IDs:", chatId);

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.log("✨ Creating new chat with student/tutor IDs...");
      await setDoc(chatRef, {
        participants: [String(tutorId), String(studentId)], // ← tutors.id y students.id
        participantNames: {
          [String(tutorId)]: tutorName,
          [String(studentId)]: studentName
        },
        lastMessage: "Chat iniciado",
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        requestAccepted: true
      });
      
      console.log("✅ Chat document created with student/tutor IDs");
      
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender: "system",
        text: `¡Chat iniciado! ${tutorName} y ${studentName} pueden ahora comunicarse.`,
        createdAt: serverTimestamp()
      });
      
      console.log("✅ Welcome message added");
      return chatId;
    } else {
      console.log("⚠️ Chat already exists");
      return chatId;
    }
  } catch (err) {
    console.error("❌ Error in createChat:", err);
    throw err;
  }
}