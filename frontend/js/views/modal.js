// Modal utility for showing notifications
export class Modal {
  constructor() {
    this.createModalContainer();
  }

  createModalContainer() {
    // Remove existing modal if any
    const existing = document.getElementById("app-modal");
    if (existing) {
      existing.remove();
    }

    // Create modal HTML
    const modalHTML = `
      <div id="app-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-icon" id="modal-icon">
              <i id="modal-icon-symbol"></i>
            </div>
            <h3 class="modal-title" id="modal-title"></h3>
          </div>
          <div class="modal-body" id="modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="modal-close">OK</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add event listeners
    document
      .getElementById("modal-close")
      .addEventListener("click", () => this.hide());
    document.getElementById("app-modal").addEventListener("click", (e) => {
      if (e.target.id === "app-modal") {
        this.hide();
      }
    });
  }

  show(type, title, message) {
    const modal = document.getElementById("app-modal");
    const icon = document.getElementById("modal-icon");
    const iconSymbol = document.getElementById("modal-icon-symbol");
    const titleEl = document.getElementById("modal-title");
    const bodyEl = document.getElementById("modal-body");

    // Set icon and styling based on type
    icon.className = `modal-icon ${type}`;

    switch (type) {
      case "success":
        iconSymbol.className = "fas fa-check";
        break;
      case "error":
        iconSymbol.className = "fas fa-exclamation-triangle";
        break;
      case "info":
        iconSymbol.className = "fas fa-info-circle";
        break;
      default:
        iconSymbol.className = "fas fa-info-circle";
    }

    titleEl.textContent = title;
    bodyEl.textContent = message;

    modal.classList.add("active");
  }

  hide() {
    const modal = document.getElementById("app-modal");
    modal.classList.remove("active");
  }

  success(title, message) {
    this.show("success", title, message);
  }

  error(title, message) {
    this.show("error", title, message);
  }

  info(title, message) {
    this.show("info", title, message);
  }
}

// Create global modal instance
export const modal = new Modal();