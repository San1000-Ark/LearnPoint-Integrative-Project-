import home from "./views/home.js";
import { login, initLogin } from "./views/login.js";
import { register, initRegister } from "./views/register.js";
import { dashboard, initDashboard } from "./views/dashboard.js";
import { calendar, loadCalendarView } from "./views/calendar.js";
import { chats, initChats } from "./views/chats.js";
import { auth } from "./auth.js";
import {
  initHomeEffects,
  initDashboardEffects,
  initChatsEffects,
} from "./animations.js";

const outlet = document.getElementById("main");

function render(html) {
  outlet.innerHTML = html;
}

function afterMount(route) {
  switch (route) {
    case "home":
      initHomeEffects();
      break;
    case "login":
      initLogin(navigate);
      break;
    case "register":
      initRegister(navigate);
      break;
    case "dashboard":
      initDashboard(navigate);
      initDashboardEffects();
      break;
    case "calendar":
      loadCalendarView(); // render + init + logout
      break;
    case "chats":
      initChats(navigate);
      initChatsEffects();
      break;
  }
  wireNavLinks();
  wireLogout();
}

function wireNavLinks() {
  document.querySelectorAll("[data-route]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("data-route"));
    });
  });
}

function wireLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      auth.clearUser();
      window.location.hash = "#/login";
    });
  }
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
  "#/chats": "chats",
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

  // Redirect home if already logged in
  if (route === "home" && auth.isAuthenticated()) {
    navigate("dashboard");
    return;
  }

  // Protected routes
  const protectedRoutes = ["dashboard", "calendar", "chats"];
  if (protectedRoutes.includes(route) && !auth.isAuthenticated()) {
    render(login());
    requestAnimationFrame(() => afterMount("login"));
    return;
  }

  switch (route) {
    case "home":
      render(home());
      requestAnimationFrame(() => afterMount("home"));
      break;
    case "login":
      render(login());
      requestAnimationFrame(() => afterMount("login"));
      break;
    case "register":
      render(register());
      requestAnimationFrame(() => afterMount("register"));
      break;
    case "dashboard":
      render(dashboard(auth.getUser()?.role));
      requestAnimationFrame(() => afterMount("dashboard"));
      break;
    case "calendar":
      // loadCalendarView already renders + init
      loadCalendarView();
      break;
    case "chats":
      render(chats());
      requestAnimationFrame(() => afterMount("chats"));
      break;
    default:
      render(home());
      requestAnimationFrame(() => afterMount("home"));
  }
}

window.addEventListener("hashchange", routeHandler);
document.addEventListener("DOMContentLoaded", routeHandler);

// Optional: expose navigate globally
window._navigate = navigate;