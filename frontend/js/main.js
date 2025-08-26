// Simple hash-based SPA router
import home from "./views/home.js";
import { login, initLogin } from "./views/login.js";
import { register, initRegister } from "./views/register.js";
import { dashboard, initDashboard } from "./views/dashboard.js";
import { calendar, initCalendar } from "./views/calendar.js";
import { chats, initChats } from "./views/chats.js";
import { auth } from "./auth.js";
import { initHomeEffects, initDashboardEffects, initCalendarEffects, initChatsEffects } from "./animations.js";

const outlet = document.getElementById("main");

function render(html) {
  outlet.innerHTML = html;
}

function afterMount(route) {
  switch (route) {
    case "home":      initHomeEffects(); break;
    case "login":     initLogin(navigate); break;
    case "register":  initRegister(navigate); break;
    case "dashboard": initDashboard(navigate); initDashboardEffects(); break;
    case "calendar":  initCalendar(navigate); initCalendarEffects(); break;
    case "chats":     initChats(navigate); initChatsEffects(); break;
  }
  wireNavLinks();
}


function wireNavLinks() {
  document.querySelectorAll("[data-route]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("data-route"));
    });
  });
}

const routes = {
  "": "home",
  "#": "home",
  "#/": "home",
  "#/home": "home",
  "#/login": "login",
  "#/register": "register",
  "#/dashboard": "dashboard",
  "#/calendar": "calendar",
  "#/chats": "chats"
};

function navigate(routeName) {
  const normalized = routeName.startsWith("#/") ? routeName : `#/` + routeName;
  if (location.hash !== normalized) {
    location.hash = normalized;
    return;
  }
  routeHandler();
}

function routeHandler() {
  const key = location.hash || "#/home";
  const route = routes[key] || "home";

  if (route === "home" && auth.isLoggedIn()) {
    navigate("dashboard");
    return;
  }

  const protectedRoutes = ["dashboard", "calendar", "chats"];
  if (protectedRoutes.includes(route) && !auth.isLoggedIn()) {
    render(login());
    afterMount("login");
    return;
  }

  switch (route) {
    case "home":      render(home()); afterMount("home"); break;
    case "login":     render(login()); afterMount("login"); break;
    case "register":  render(register()); afterMount("register"); break;
    case "dashboard": render(dashboard(auth.role())); afterMount("dashboard"); break;
    case "calendar":  render(calendar()); afterMount("calendar"); break;
    case "chats":     render(chats()); afterMount("chats"); break;
    default:          render(home()); afterMount("home");
  }
}

window.addEventListener("hashchange", routeHandler);
document.addEventListener("DOMContentLoaded", routeHandler);

// Optional: expose
window._navigate = navigate;
