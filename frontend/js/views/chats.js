import { db } from "./firebaseConfig.js";
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, 
  doc, setDoc, getDoc, updateDoc, where 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
      <a class="navbar-item has-text-white" id="logoutFromChats">
        <i class="fas fa-sign-out-alt"></i>&nbsp; Log out
      </a>
    </div>
  </nav>

  <div class="chat-container">
    <!-- CONTACTS -->
    <aside class="contacts" id="contacts">
      <!-- Firebase inyectará los contactos aquí -->
    </aside>

    <!-- CHAT BOX -->
    <section class="chat-box">
      <div class="messages" id="messages"></div>
      <div class="chat-input">
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
    </section>
  </div>
  `;
}

export function initChats(navigate) {

  const lg = document.getElementById("logoutFromChats");
  if (lg) {
    lg.addEventListener("click", () => {
      localStorage.removeItem("lp_role");
      localStorage.removeItem("lp_username");
      localStorage.removeItem("lp_userId");
      navigate("home");
    });
  }


  const contacts = document.getElementById("contacts");
  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  let currentChatId = null;
  let unsubscribe = null; // para dejar de escuchar cuando cambias de chat

  const currentUserId = localStorage.getItem("lp_userId");
  const currentUsername = localStorage.getItem("lp_username") || "demoUser";


  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", currentUserId)
  );

  onSnapshot(q, (snapshot) => {
    contacts.innerHTML = "";
    snapshot.forEach(docSnap => {
      const chat = docSnap.data();
      const otherUser = chat.participants.find(p => p !== currentUserId);
      const div = document.createElement("article");
      div.className = "media";
      div.setAttribute("data-id", otherUser);
      div.setAttribute("data-name", otherUser);
      div.innerHTML = `
        <div class="media-content">
          <p><strong>${otherUser}</strong><br><small>${chat.lastMessage || ""}</small></p>
        </div>
      `;
      contacts.appendChild(div);
    });
  });


  contacts.addEventListener("click", async (e) => {
    const article = e.target.closest("[data-id]");
    if (!article) return;

    const contactId = article.getAttribute("data-id");
    const contactName = article.getAttribute("data-name");

    // Generar chatId único
    currentChatId = [currentUserId, contactId].sort().join("_");

    // Crear el documento del chat si no existe
    const chatRef = doc(db, "chats", currentChatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUserId, contactId],
        createdAt: serverTimestamp()
      });
    }

    // Limpiar mensajes
    messagesDiv.innerHTML = `<p><em>Chat con ${contactName}</em></p>`;

    // Dejar de escuchar el chat anterior si existía
    if (unsubscribe) unsubscribe();

    // Suscribirse a los mensajes de este chat
    const q = query(collection(db, `chats/${currentChatId}/messages`), orderBy("createdAt", "asc"));
    unsubscribe = onSnapshot(q, (snapshot) => {
      messagesDiv.innerHTML = "";
      snapshot.forEach((doc) => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.className = msg.sender === currentUserId ? "message is-sent" : "message is-received";
        div.innerHTML = `<p><strong>${msg.sender}:</strong> ${msg.text}</p>`;
        messagesDiv.appendChild(div);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  });


  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg || !currentChatId) return;

    await addDoc(collection(db, `chats/${currentChatId}/messages`), {
      sender: currentUserId,
      text: msg,
      createdAt: serverTimestamp()
    });

    // actualizar preview en lista
    const chatRef = doc(db, "chats", currentChatId);
    await updateDoc(chatRef, {
      lastMessage: msg,
      updatedAt: serverTimestamp()
    });

    input.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

