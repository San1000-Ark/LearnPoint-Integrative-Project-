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
      ${[
        { name: "Anna Lopez", role: "JavaScript Tutor", img: 5 },
        { name: "John Torres", role: "SQL Tutor", img: 6 },
        { name: "Maria Perez", role: "Python Tutor", img: 7 },
      ].map(c => `
        <article class="media" data-contact="${c.name}">
          <figure class="media-left">
            <p class="image is-48x48">
              <img src="https://i.pravatar.cc/48?img=${c.img}" alt="${c.name}">
            </p>
          </figure>
          <div class="media-content">
            <p><strong>${c.name}</strong><br><small>${c.role}</small></p>
          </div>
        </article>
      `).join("")}
    </aside>

    <!-- CHAT BOX -->
    <section class="chat-box">
      <div class="messages" id="messages">
        <div class="message is-received">
          <p><strong>Anna:</strong> Hi! Are we ready for the class tomorrow?</p>
        </div>
        <div class="message is-sent">
          <p>Yes, I’ll be online at 5 PM.</p>
        </div>
      </div>
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
  // Logout
  const lg = document.getElementById("logoutFromChats");
  if (lg) {
    lg.addEventListener("click", () => {
      localStorage.removeItem("lp_role");
      localStorage.removeItem("lp_username");
      navigate("home");
    });
  }

  // Open chat for selected contact
  const contacts = document.getElementById("contacts");
  const messages = document.getElementById("messages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  contacts.addEventListener("click", (e) => {
    const article = e.target.closest("[data-contact]");
    if (!article) return;
    const name = article.getAttribute("data-contact");
    messages.innerHTML = `
      <div class="message is-received">
        <p><strong>${name}:</strong> Hello! This is the beginning of our chat.</p>
      </div>
    `;
  });

  function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    messages.innerHTML += `
      <div class="message is-sent"><p>${msg}</p></div>
    `;
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
