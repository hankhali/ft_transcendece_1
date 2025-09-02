// src/visuals.ts
// ========================================================
// VISUAL ENHANCEMENTS (TypeScript)
// ========================================================

const ball = document.querySelector(".ball");
const backgroundContainer = document.querySelector(".background-animation-container");
const appContainer = document.getElementById("app");
const glowEffect = document.querySelector(".glow-effect");
const starfield = document.getElementById("starfield");

// --- Trail Effect ---
function createTrail(): void {
  if (!(ball instanceof HTMLElement) || !(backgroundContainer instanceof HTMLElement)) return;

  const trail = document.createElement("div");
  trail.className = "trail";

  const ballRect = ball.getBoundingClientRect();
  const containerRect = backgroundContainer.getBoundingClientRect();

  trail.style.left = `${ballRect.left - containerRect.left + ballRect.width / 2}px`;
  trail.style.bottom = `${window.innerHeight - ballRect.bottom - containerRect.top + ballRect.height / 2}px`;

  backgroundContainer.appendChild(trail);

  setTimeout(() => {
    if (trail.parentNode) trail.parentNode.removeChild(trail);
  }, 800);
}

if (ball && backgroundContainer) {
  setInterval(createTrail, 100);
}

// --- Camera Shake ---
let shakeOffset = 0;
function cameraShake(): void {
  if (appContainer instanceof HTMLElement) {
    shakeOffset += 0.05;
    const shake = Math.sin(shakeOffset) * 0.5;
    appContainer.style.transform = `translateY(${shake}px)`;
  }
  requestAnimationFrame(cameraShake);
}
if (appContainer) cameraShake();

// --- Glow Effect ---
function updateGlow(): void {
  if (glowEffect instanceof HTMLElement) {
    const time = Date.now() * 0.001;
    const intensity = 0.5 + Math.sin(time * 2) * 0.3;
    glowEffect.style.opacity = intensity.toFixed(2);
  }
  requestAnimationFrame(updateGlow);
}
if (glowEffect) updateGlow();

// --- Starfield ---
function createStars(): void {
  if (!(starfield instanceof HTMLElement)) return;

  starfield.innerHTML = "";
  const numStars = 350;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const size = `${Math.random() * 2 + 1}px`;
    star.style.width = size;
    star.style.height = size;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    star.style.animationDuration = `${Math.random() * 8 + 4}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;

    star.style.setProperty("--star-translate-x-end", `${(Math.random() - 0.5) * 30}vw`);

    starfield.appendChild(star);
  }
}
if (starfield) createStars();
