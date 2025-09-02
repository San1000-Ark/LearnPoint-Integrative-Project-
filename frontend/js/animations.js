// Home view animations
export function initHomeEffects() {
  // Navbar burger toggle
  document.querySelectorAll(".navbar-burger").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.target;
      const menu = document.getElementById(target);
      el.classList.toggle("is-active");
      menu.classList.toggle("is-active");
    });
  });

  // GSAP animations
  if (document.querySelector("#home .title")) {
    gsap.from("#home .title", {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: "power3.out",
    });
  }
  if (document.querySelector("#home .subtitle")) {
    gsap.from("#home .subtitle", {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.4,
      ease: "power3.out",
    });
  }
  if (document.querySelector("#home .button")) {
    gsap.from("#home .button", {
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      delay: 0.9,
      ease: "back.out(1.7)",
    });
  }

  // Lottie Globe
  const globe = document.getElementById("globe-animation");
  if (globe) {
    lottie.loadAnimation({
      container: globe,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "./assets/animations/globe.json",
    });
  }

  // ScrollTrigger effects
  if (
    typeof ScrollTrigger !== "undefined" &&
    document.getElementById("features")
  ) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from("#features .card-tech", {
      scrollTrigger: { trigger: "#features", start: "top 80%" },
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    });
  }
}

// Dashboard animations
export function initDashboardEffects() {
  if (document.querySelector("#dashboard .card")) {
    gsap.from("#dashboard .card", {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.2,
      ease: "power2.out",
    });
  }
}

// Chats animations
export function initChatsEffects() {
  if (document.querySelector("#chats .chat-list")) {
    gsap.from("#chats .chat-list li", {
      opacity: 0,
      x: -50,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  }
  if (document.querySelector("#chats .chat-input")) {
    gsap.from("#chats .chat-input", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: 0.3,
    });
  }
}