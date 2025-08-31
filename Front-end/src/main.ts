// This file is a TypeScript module
import "./style.css"; // Ensure your CSS is imported
import "./language.css"; // Import language switcher styles
import { createNeonPongGame } from "./game.ts";
import { apiService } from "./api.ts";
import { initLanguage, updateUITexts } from "./language";

// Global variables for message display
declare global {
  interface Window {
    messageTimeout: number | null;
    currentGameContainer: HTMLElement | null;
  }
}

window.messageTimeout = null;
let currentUser: { id: number; username: string } | null = null;
window.currentGameContainer = null;

// Utility function to navigate between pages
function navigateTo(path: string) {
  showLoading();
  // Simulate network delay for a smoother loading experience
  setTimeout(() => {
    history.pushState(null, "", path);
    const app = document.getElementById("app");
    if (app) {
      setupRoutes(app); // Render new page based on route
      document.title = getPageTitle(path); // Update document title
      const liveRegion = document.getElementById("screen-reader-live-region");
      if (liveRegion) {
        liveRegion.textContent = ""; // Clear first to ensure re-announcement
        liveRegion.textContent = `Navigated to ${document.title}.`;
      }
      window.scrollTo(0, 0); // Scroll to top on navigation
    }
    hideLoading();
  }, 300); // Simulate 300ms loading
}
// Helper to get page title based on path
function getPageTitle(path: string): string {
  switch (path) {
    case "/":
      return "Home - Neon Pong";
    case "/tournament":
      return "Tournaments - Neon Pong";
    case "/register":
      return "Register - Neon Pong";
    case "/login":
      return "Login - Neon Pong";
    default:
      return "Page Not Found - Neon Pong";
  }
}
// Function to create a generic loading overlay
function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay hidden"; // Start hidden
  overlay.id = "loading-overlay";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "assertive");
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  overlay.appendChild(spinner);
  const loadingText = document.createElement("p");
  loadingText.className = "loading-text";
  loadingText.textContent = "Loading...";
  loadingText.setAttribute("aria-label", "Content is loading");
  overlay.appendChild(loadingText);
  return overlay;
}
// Function to show the loading overlay
function showLoading() {
  const app = document.getElementById("app");
  if (app) {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
      overlay = createLoadingOverlay();
      app.appendChild(overlay);
    }
    overlay.classList.remove("hidden");
  }
}
// Function to hide the loading overlay
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}
// Function to display messages (error/success/info)
function showMessage(
  text: string,
  type: "success" | "error" | "info" = "info"
) {
  // Clear existing messages and timeouts
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }
  if (window.messageTimeout) {
    clearTimeout(window.messageTimeout);
  }
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  messageDiv.setAttribute("role", "status");
  messageDiv.setAttribute("aria-live", "polite");
  messageDiv.setAttribute("aria-atomic", "true");
  document.body.appendChild(messageDiv); // Append to the body instead of app
  window.messageTimeout = setTimeout(() => {
    messageDiv.classList.add("hidden");
    messageDiv.addEventListener("transitionend", () => messageDiv.remove(), {
      once: true,
    });
  }, 5000);
}
// Global variables for accessibility features
let isHighContrast = false;
let fontSizeMultiplier = 1;
// Function to toggle high contrast mode
function toggleHighContrast(): void {
  isHighContrast = !isHighContrast;
  document.body.classList.toggle('high-contrast', isHighContrast);
  localStorage.setItem('highContrast', isHighContrast.toString());
}
// Function to adjust font size
function adjustFontSize(increase: boolean): void {
  const step = 0.1;
  const minSize = 0.8;
  const maxSize = 2.0;
  // Update the multiplier
  const newMultiplier = Math.max(minSize, Math.min(maxSize,
    fontSizeMultiplier + (increase ? step : -step)));
  // Only update if changed
  if (newMultiplier !== fontSizeMultiplier) {
    fontSizeMultiplier = newMultiplier;
    // Apply to root element
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString());
    // Force a reflow to ensure styles are recalculated
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
    // Update display
    const display = document.querySelector('.font-size-display') as HTMLElement;
    if (display) {
      const size = Math.round(fontSizeMultiplier * 100);
      display.textContent = `${size}%`;
      // Save preference
      localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier.toString());
      // Visual feedback
      display.classList.add('active');
      setTimeout(() => display.classList.remove('active'), 500);
      // Announce change for screen readers
  
      const liveRegion = document.getElementById('a11y-announcement');
      if (liveRegion) {
        liveRegion.textContent = announcement;
        setTimeout(() => liveRegion.textContent = '', 1000);
      } else {
        showMessage(announcement, 'info');
      }
    }
  }
}
// Initialize accessibility features from localStorage
function initAccessibility() {
  // Load high contrast preference
  const savedHighContrast = localStorage.getItem('highContrast') === 'true';
  if (savedHighContrast) {
    isHighContrast = true;
    document.body.classList.add('high-contrast');
  }
  // Load font size preference
  const savedFontSize = parseFloat(localStorage.getItem('fontSizeMultiplier') || '1');
  if (savedFontSize >= 0.8 && savedFontSize <= 1.5) {
    fontSizeMultiplier = savedFontSize;
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString());
  }
}
// Call init on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAccessibility);
}
// Navbar Component
function createNavbar(): HTMLElement {
  const navbar = document.createElement("nav");
  navbar.className = "navbar";
  navbar.setAttribute("aria-label", "Main navigation");
  
  const logo = document.createElement("a");
  logo.className = "navbar-logo";
  logo.setAttribute('data-i18n', 'neon_pong_title');
  logo.textContent = "Neon Pong";
  logo.href = "/";
  logo.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });
  const mobileMenuToggle = document.createElement("div");
  mobileMenuToggle.id = "mobile-menu";
  mobileMenuToggle.className = "menu-toggle";
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-controls", "navbarLinksContainer");
  for (let i = 0; i < 3; i++) {
    const bar = document.createElement("span");
    bar.className = "bar";
    mobileMenuToggle.appendChild(bar);
  }
  const navbarLinksContainer = document.createElement("div");
  navbarLinksContainer.id = "navbarLinksContainer";
  navbarLinksContainer.className = "navbar-links-container";
  
  const navLinks = document.createElement("div");
  navLinks.className = "navbar-links";
  
  // Language switcher container - will be populated by initLanguage()
  const languageSwitcherContainer = document.createElement("div");
  languageSwitcherContainer.id = "language-switcher-container";
  languageSwitcherContainer.className = "language-switcher-container";
  navLinks.setAttribute("role", "menubar"); // Role for menu bar
  const homeLink = document.createElement("a");
  homeLink.href = "/";
  homeLink.className = "navbar-link";
  homeLink.setAttribute('data-i18n', 'home');
  homeLink.textContent = "Home";
  homeLink.setAttribute("role", "menuitem");
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });
  const tournamentsLink = document.createElement("a");
  tournamentsLink.href = "/tournament";
  tournamentsLink.className = "navbar-link";
  tournamentsLink.setAttribute('data-i18n', 'tournaments');
  tournamentsLink.textContent = "Tournaments";
  tournamentsLink.setAttribute("role", "menuitem");
  tournamentsLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/tournament");
  });
  const registerLink = document.createElement("a");
  registerLink.href = "/register";
  registerLink.className = "navbar-link";
  registerLink.setAttribute('data-i18n', 'register');
  registerLink.textContent = "Register";
  registerLink.setAttribute("role", "menuitem");
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/register");
  });
  const loginLink = document.createElement("a");
  loginLink.href = "/login";
  loginLink.className = "navbar-link";
  loginLink.setAttribute('data-i18n', 'login');
  loginLink.textContent = "Login";
  loginLink.setAttribute("role", "menuitem");
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/login");
  });
  navLinks.appendChild(homeLink);
  navLinks.appendChild(tournamentsLink);
  navLinks.appendChild(registerLink);
  navLinks.appendChild(loginLink);
  // Accessibility Controls
  const accessibilityControls = document.createElement('div');
  accessibilityControls.className = 'accessibility-controls';
  accessibilityControls.setAttribute('aria-label', 'Accessibility controls');
  // High Contrast Toggle
  const highContrastBtn = document.createElement('button');
  highContrastBtn.className = 'accessibility-btn';
  highContrastBtn.innerHTML = '<i class="fas fa-adjust" aria-hidden="true"></i>';
  highContrastBtn.setAttribute('aria-label', 'Toggle high contrast mode');
  highContrastBtn.setAttribute('title', 'Toggle high contrast mode');
  highContrastBtn.addEventListener('click', toggleHighContrast);
  // Font Size Controls
  const fontSizeContainer = document.createElement('div');
  fontSizeContainer.className = 'font-size-controls';
  fontSizeContainer.setAttribute('aria-label', 'Font size controls');
  // Add a label for screen readers
  const fontSizeLabel = document.createElement('span');
  fontSizeLabel.className = 'sr-only';
  fontSizeLabel.textContent = 'Font size: ';
  fontSizeContainer.appendChild(fontSizeLabel);
  // Decrease button with minus icon
  const decreaseFontBtn = document.createElement('button');
  decreaseFontBtn.className = 'font-size-btn';
  decreaseFontBtn.innerHTML = '<i class="fas fa-minus" aria-hidden="true"></i> <span class="sr-only">Decrease font size</span>';
  decreaseFontBtn.setAttribute('aria-label', 'Decrease font size');
  decreaseFontBtn.setAttribute('title', 'Decrease font size (Smaller text)');
  decreaseFontBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adjustFontSize(false);
  });
  // Current font size display
  const fontSizeDisplay = document.createElement('span');
  fontSizeDisplay.className = 'font-size-display';
  fontSizeDisplay.textContent = 'A';
  fontSizeDisplay.setAttribute('aria-hidden', 'true');
  // Increase button with plus icon
  const increaseFontBtn = document.createElement('button');
  increaseFontBtn.className = 'font-size-btn';
  increaseFontBtn.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> <span class="sr-only">Increase font size</span>';
  increaseFontBtn.setAttribute('aria-label', 'Increase font size');
  increaseFontBtn.setAttribute('title', 'Increase font size (Larger text)');
  increaseFontBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adjustFontSize(true);
  });
  // Add all elements to container
  fontSizeContainer.appendChild(decreaseFontBtn);
  fontSizeContainer.appendChild(fontSizeDisplay);
  fontSizeContainer.appendChild(increaseFontBtn);
  // Skip to main content link (hidden until focused)
  const skipToContent = document.createElement('a');
  skipToContent.href = '#main-content';
  skipToContent.className = 'skip-to-content';
  skipToContent.textContent = 'Skip to main content';
  skipToContent.setAttribute('tabindex', '0');
  
  // Create a container for accessibility controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  // Add font size controls first
  controlsContainer.appendChild(fontSizeContainer);
  
  // Add language switcher next to font controls
  controlsContainer.appendChild(languageSwitcherContainer);
  
  // Add high contrast toggle last
  controlsContainer.appendChild(highContrastBtn);
  
  // Add all controls to accessibility controls
  accessibilityControls.appendChild(controlsContainer);
  
  // Add nav links and accessibility controls to container
  navbarLinksContainer.appendChild(navLinks);
  navbarLinksContainer.appendChild(accessibilityControls);
  
  // Add other navbar elements
  navbar.prepend(skipToContent);
  navbar.appendChild(logo);
  navbar.appendChild(mobileMenuToggle);
  navbar.appendChild(navbarLinksContainer);
  // Mobile menu toggle logic
  mobileMenuToggle.addEventListener("click", () => {
    navbarLinksContainer.classList.toggle("active");
    mobileMenuToggle.classList.toggle("active");
    const expanded = mobileMenuToggle.classList.contains("active");
    mobileMenuToggle.setAttribute("aria-expanded", String(expanded));
    
    // Toggle language switcher visibility in mobile menu
    if (window.innerWidth <= 768) {
      const languageSwitcher = document.getElementById('language-switcher-container');
      if (languageSwitcher) {
        languageSwitcher.style.display = expanded ? 'flex' : 'none';
      }
    }
  });
  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll(".navbar-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        navbarLinksContainer.classList.remove("active");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
  // Close mobile menu if clicked outside
  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 768 &&
      !navbarLinksContainer.contains(event.target as Node) &&
      !mobileMenuToggle.contains(event.target as Node) &&
      navbarLinksContainer.classList.contains("active")
    ) {
      navbarLinksContainer.classList.remove("active");
      mobileMenuToggle.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
    }
  });
  return navbar;
}
// Footer Component
function createFooter(): HTMLElement {
  return document.createElement("footer");
}
// Home Page
function renderHomePage(): HTMLElement {
  const home = document.createElement("div");
  home.className = "page"; // Removed home-page specific class as it's handled by 'page'
  home.setAttribute("role", "main");
  home.id = "home"; // Add ID for nav link highlighting
  // Hero Section
  const heroSection = document.createElement("section");
  heroSection.className = "hero-section content-section";
  const paddleImage = document.createElement("img");
  // paddleImage.src = './ping.png'; // Corrected path
  // paddleImage.alt = 'Stylized neon ping pong paddle';
  paddleImage.className = "ping-pong-paddle";
  const heroTitle = document.createElement("h1");
  heroTitle.className = "hero-title";
  heroTitle.setAttribute('data-i18n', 'neon_pong_title');
  heroTitle.textContent = "NEON PONG";
  
  const heroSubtitle = document.createElement("h2");
  heroSubtitle.className = "hero-subtitle";
  heroSubtitle.setAttribute('data-i18n', 'hero_subtitle');
  heroSubtitle.textContent = "THE ULTIMATE RETRO-FUTURISTIC ARCADE EXPERIENCE.";
  
  const heroDescription = document.createElement("p");
  heroDescription.className = "hero-description";
  heroDescription.setAttribute('data-i18n', 'hero_description');
  heroDescription.textContent = "Challenge your friends in a fast-paced game of skill and reflexes.";
  const heroCta = document.createElement("div");
  heroCta.className = "hero-cta";
  const playNowBtn = document.createElement("button");
  playNowBtn.className = "primary-button play-now-button";
  playNowBtn.setAttribute('data-i18n', 'play_now_button');
  playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now';
  playNowBtn.addEventListener("click", () => navigateTo("/tournament"));
  // 1v1 Button
  const oneVsOneBtn = document.createElement("button");
  oneVsOneBtn.className = "primary-button one-vs-one-button";
  oneVsOneBtn.setAttribute('data-i18n', 'one_vs_one_button');
  oneVsOneBtn.innerHTML = '<i class="fas fa-gamepad"></i> 1v1 Match';
  oneVsOneBtn.addEventListener("click", () => showNeonPongGame());
  const registerCtaBtn = document.createElement("button");
  registerCtaBtn.className = "primary-button register-cta-button";
  registerCtaBtn.setAttribute('data-i18n', 'register_now_button');
  registerCtaBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Now';
  registerCtaBtn.addEventListener("click", () => navigateTo("/register"));
  heroCta.appendChild(playNowBtn);
  // 1v1 Button
  heroCta.appendChild(oneVsOneBtn);
  heroCta.appendChild(registerCtaBtn);
  heroSection.appendChild(paddleImage);
  heroSection.appendChild(heroTitle);
  heroSection.appendChild(heroSubtitle);
  heroSection.appendChild(heroDescription);
  heroSection.appendChild(heroCta);
  home.appendChild(heroSection);
  // Meet The Team Section
  const teamSection = document.createElement("section");
  teamSection.id = "team"; // Add ID for nav link highlighting
  teamSection.className = "content-section";
  const teamTitle = document.createElement("h2");
  teamTitle.className = "section-title";
  teamTitle.setAttribute('data-i18n', 'meet_the_team');
  teamTitle.textContent = "Meet the Team";
  teamSection.appendChild(teamTitle);
  const teamGrid = document.createElement("div");
  teamGrid.className = "team-grid";
  const teamMembers = [
    { name: "Hanieh", avatar: "./pic1.png" },
    { name: "Mira", avatar: "./pic2.png" },
    { name: "Reem", avatar: "./pic3.png" },
    { name: "Omniat", avatar: "./pic4.png" },
  ];
  teamMembers.forEach((member) => {
    const memberCard = document.createElement("div");
    memberCard.className = "team-member-card";
    const avatar = document.createElement("img");
    avatar.src = member.avatar;
    avatar.alt = `Avatar of ${member.name}`;
    avatar.className = "team-member-avatar";
    const name = document.createElement("p");
    name.className = "team-member-name";
    name.textContent = member.name;
    memberCard.appendChild(avatar);
    memberCard.appendChild(name);
    teamGrid.appendChild(memberCard);
  });
  teamSection.appendChild(teamGrid);
  home.appendChild(teamSection);
  // Add footer
  home.appendChild(createFooter());
  return home;
}
// Tournament Page (Simplified for dynamic content, actual tournament data will be in renderHomePage)
// Tournament Page (Updated with API integration)
function renderTournamentPage(): HTMLElement {
  const tournamentPage = document.createElement("div");
  tournamentPage.className = "page content-section";
  tournamentPage.id = "tournaments-page";
  tournamentPage.setAttribute("role", "main");
  const title = document.createElement("h1");
  title.className = "section-title";
  title.textContent = "Tournaments";
  tournamentPage.appendChild(title);
  // Create Tournament Button
  const createButton = document.createElement("button");
  createButton.className = "primary-button";
  createButton.style.cssText =
    "margin-bottom: 2rem; display: block; margin-left: auto; margin-right: auto;";
  createButton.innerHTML = '<i class="fas fa-plus"></i> Create Tournament';
  createButton.addEventListener("click", showCreateTournamentModal);
  tournamentPage.appendChild(createButton);
  const tournamentList = document.createElement("div");
  tournamentList.className = "tournament-list";
  tournamentList.setAttribute("role", "list");
  tournamentList.id = "tournament-list-container";
  tournamentPage.appendChild(tournamentList);
  // Load tournaments from API
  loadTournaments(tournamentList);
  tournamentPage.appendChild(createFooter());
  return tournamentPage;
}
//load tournaments from db
async function loadTournaments(container: HTMLElement) {
  showLoading();
  try {
    const result = await apiService.tournaments.getAll();
    if (result.data && result.data.length > 0) {
      container.innerHTML = "";
      result.data.forEach((tournament: any) => {
        const item = document.createElement("div");
        item.className = "tournament-item";
        item.setAttribute("role", "listitem");
        let statusClass = "";
        let buttonText = "";
        let buttonDisabled = false;
        if (tournament.status === "pending") {
          statusClass = "status-open";
          buttonText = "Join Tournament";
        } else if (tournament.status === "started") {
          statusClass = "status-in-progress";
          buttonText = "View Progress";
          buttonDisabled = true;
        } else {
          statusClass = "status-completed";
          buttonText = "View Results";
        }
        item.innerHTML = `
          <h3>${tournament.name}</h3>
          <p class="tournament-status"><span class="status-indicator ${statusClass}"></span> ${
          tournament.status
        }</p>
          <p><strong>Max Players:</strong> ${tournament.max_players}</p>
          <button class="primary-button join-button ${
            tournament.status === "completed" ? "secondary-button" : ""
          }" ${buttonDisabled ? "disabled" : ""}>${buttonText}</button>
        `;
        const joinButton = item.querySelector(
          ".join-button"
        ) as HTMLButtonElement;
        if (joinButton && tournament.status === "pending") {
          joinButton.addEventListener("click", () => {
            showJoinTournamentModal(tournament);
          });
        }
        container.appendChild(item);
      });
    } else {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-color-light); padding: 2rem;">
          <p>No tournaments available. Create one to get started!</p>
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--error-color); padding: 2rem;">
        <p>Failed to load tournaments. Please try again later.</p>
      </div>
    `;
    console.error("Failed to load tournaments:", error);
  } finally {
    hideLoading();
  }
}
// Register Page
function renderRegisterPage(): HTMLElement {
  const register = document.createElement("div");
  register.className = "page content-section";
  register.id = "register"; // Add ID for nav link highlighting
  register.setAttribute("role", "main");
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";
  const title = document.createElement("h2");
  title.className = "form-title";
  title.id = "register-form-title";
  title.textContent = "Register for Neon Pong";
  formContainer.appendChild(title);
  const form = document.createElement("form");
  form.setAttribute("aria-labelledby", "register-form-title");
  form.noValidate = true; // Disable default browser validation for custom handling
  // Username
  const usernameLabel = document.createElement("label");
  usernameLabel.className = "form-label";
  usernameLabel.htmlFor = "username";
  usernameLabel.textContent = "Username";
  form.appendChild(usernameLabel);
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "username";
  usernameInput.className = "form-input";
  usernameInput.placeholder = "Choose a unique username";
  usernameInput.required = true;
  usernameInput.setAttribute("aria-describedby", "username-error");
  form.appendChild(usernameInput);
  const usernameError = document.createElement("span");
  usernameError.id = "username-error";
  usernameError.className = "form-error";
  usernameError.setAttribute("aria-live", "polite");
  usernameError.setAttribute("role", "alert");
  form.appendChild(usernameError);
  // Email
  const emailLabel = document.createElement("label");
  emailLabel.className = "form-label";
  emailLabel.htmlFor = "email";
  emailLabel.textContent = "Email";
  form.appendChild(emailLabel);
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.className = "form-input";
  emailInput.placeholder = "Enter your email";
  emailInput.required = true;
  emailInput.setAttribute("aria-describedby", "email-error");
  form.appendChild(emailInput);
  const emailError = document.createElement("span");
  emailError.id = "email-error";
  emailError.className = "form-error";
  emailError.setAttribute("aria-live", "polite");
  emailError.setAttribute("role", "alert");
  form.appendChild(emailError);
  // Password
  const passwordLabel = document.createElement("label");
  passwordLabel.className = "form-label";
  passwordLabel.htmlFor = "password";
  passwordLabel.textContent = "Password";
  form.appendChild(passwordLabel);
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.className = "form-input";
  passwordInput.placeholder = "Create a strong password";
  passwordInput.required = true;
  passwordInput.setAttribute("aria-describedby", "password-error");
  form.appendChild(passwordInput);
  const passwordError = document.createElement("span");
  passwordError.id = "password-error";
  passwordError.className = "form-error";
  passwordError.setAttribute("aria-live", "polite");
  passwordError.setAttribute("role", "alert");
  form.appendChild(passwordError);
  // Confirm Password
  const confirmPasswordLabel = document.createElement("label");
  confirmPasswordLabel.className = "form-label";
  confirmPasswordLabel.htmlFor = "confirmPassword";
  confirmPasswordLabel.textContent = "Confirm Password";
  form.appendChild(confirmPasswordLabel);
  const confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "password";
  confirmPasswordInput.id = "confirmPassword";
  confirmPasswordInput.className = "form-input";
  confirmPasswordInput.placeholder = "Re-enter your password";
  confirmPasswordInput.required = true;
  confirmPasswordInput.setAttribute(
    "aria-describedby",
    "confirm-password-error"
  );
  form.appendChild(confirmPasswordInput);
  const confirmPasswordError = document.createElement("span");
  confirmPasswordError.id = "confirm-password-error";
  confirmPasswordError.className = "form-error";
  confirmPasswordError.setAttribute("aria-live", "polite");
  confirmPasswordError.setAttribute("role", "alert");
  form.appendChild(confirmPasswordError);
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-button";
  submitButton.textContent = "Register Account";
  form.appendChild(submitButton);
  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "secondary-button back-button";
  backButton.textContent = "Back to Home";
  backButton.addEventListener("click", () => navigateTo("/"));
  form.appendChild(backButton);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Clear previous errors
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    usernameInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
    confirmPasswordInput.removeAttribute("aria-invalid");
    let isValid = true;
    let firstInvalidField: HTMLElement | null = null;
    // Validation logic (same as before)
    if (!usernameInput.value.trim()) {
      usernameError.textContent = "Username is required.";
      usernameInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = usernameInput;
    }
    if (!emailInput.value.trim() || !/\S+@\S+\.\S+/.test(emailInput.value)) {
      emailError.textContent = "A valid email is required.";
      emailInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = emailInput;
    }
    if (!passwordInput.value || passwordInput.value.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      passwordInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = passwordInput;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordError.textContent = "Passwords do not match.";
      confirmPasswordInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = confirmPasswordInput;
    }
    if (!isValid) {
      showMessage("Please correct the errors in the form.", "error");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }
    //for registration
    showLoading();
    try {
      const result = await apiService.users.register(
        usernameInput.value.trim(),
        passwordInput.value,
        emailInput.value.trim()
      );
      if (result.data) {
        currentUser = {
          id: result.data.userId,
          username: usernameInput.value.trim(),
        };
        showMessage(
          "Registration successful! Welcome to Neon Pong.",
          "success"
        );
        form.reset();
        navigateTo("/tournament");
      } else {
        showMessage(
          result.error || "Registration failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Registration failed. Please try again.", "error");
      console.error("Registration error:", error);
    } finally {
      hideLoading();
    }
  });
  formContainer.appendChild(form);
  register.appendChild(formContainer);
  register.appendChild(createFooter());
  return register;
}
function renderLoginPage(): HTMLElement {
  const login = document.createElement("div");
  login.className = "page content-section";
  login.id = "login";
  login.setAttribute("role", "main");
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";
  const title = document.createElement("h2");
  title.className = "form-title";
  title.id = "login-form-title";
  title.textContent = "Login to Neon Pong";
  formContainer.appendChild(title);
  const form = document.createElement("form");
  form.setAttribute("aria-labelledby", "login-form-title");
  form.noValidate = true;
  // Username
  const usernameLabel = document.createElement("label");
  usernameLabel.className = "form-label";
  usernameLabel.htmlFor = "login-username";
  usernameLabel.textContent = "Username";
  form.appendChild(usernameLabel);
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "login-username";
  usernameInput.className = "form-input";
  usernameInput.placeholder = "Enter your username";
  usernameInput.required = true;
  usernameInput.setAttribute("aria-describedby", "login-username-error");
  form.appendChild(usernameInput);
  const usernameError = document.createElement("span");
  usernameError.id = "login-username-error";
  usernameError.className = "form-error";
  usernameError.setAttribute("aria-live", "polite");
  usernameError.setAttribute("role", "alert");
  form.appendChild(usernameError);
  // Password
  const passwordLabel = document.createElement("label");
  passwordLabel.className = "form-label";
  passwordLabel.htmlFor = "login-password";
  passwordLabel.textContent = "Password";
  form.appendChild(passwordLabel);
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "login-password";
  passwordInput.className = "form-input";
  passwordInput.placeholder = "Enter your password";
  passwordInput.required = true;
  passwordInput.setAttribute("aria-describedby", "login-password-error");
  form.appendChild(passwordInput);
  const passwordError = document.createElement("span");
  passwordError.id = "login-password-error";
  passwordError.className = "form-error";
  passwordError.setAttribute("aria-live", "polite");
  passwordError.setAttribute("role", "alert");
  form.appendChild(passwordError);
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-button";
  submitButton.textContent = "Login";
  form.appendChild(submitButton);
  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "secondary-button back-button";
  backButton.textContent = "Back to Home";
  backButton.addEventListener("click", () => navigateTo("/"));
  form.appendChild(backButton);
  // Link to register page
  const registerLinkContainer = document.createElement("div");
  registerLinkContainer.style.textAlign = "center";
  registerLinkContainer.style.marginTop = "1rem";
  registerLinkContainer.innerHTML = `
    <p style="color: var(--text-color-light);">
      Don't have an account?
      <a href="/register" style="color: var(--primary-color); text-decoration: none;" id="register-link">Register here</a>
    </p>
  `;
  const registerLink = registerLinkContainer.querySelector("#register-link");
  registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/register");
  });
  form.appendChild(registerLinkContainer);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Clear previous errors
    usernameError.textContent = "";
    passwordError.textContent = "";
    usernameInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
    let isValid = true;
    let firstInvalidField: HTMLElement | null = null;
    // Validation
    if (!usernameInput.value.trim()) {
      usernameError.textContent = "Username is required.";
      usernameInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = usernameInput;
    }
    if (!passwordInput.value) {
      passwordError.textContent = "Password is required.";
      passwordInput.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalidField) firstInvalidField = passwordInput;
    }
    if (!isValid) {
      showMessage("Please fill in all required fields.", "error");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }
    //for login
    showLoading();
    try {
      const result = await apiService.users.login(
        usernameInput.value.trim(),
        passwordInput.value
      );
      if (result.data) {
        currentUser = {
          id: result.data.userId,
          username: result.data.username
        };
        showMessage(`Welcome back, ${result.data.username}!`, "success");
        form.reset();
        navigateTo("/tournament");
      } else {
        showMessage(result.error || "Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      showMessage("Login failed. Please try again.", "error");
      console.error("Login error:", error);
    } finally {
      hideLoading();
    }
  });
  formContainer.appendChild(form);
  login.appendChild(formContainer);
  login.appendChild(createFooter());
  return login;
}
// Create Tournament Modal
function showCreateTournamentModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = `
    background: var(--bg-color);
    border: 2px solid var(--primary-color);
    border-radius: 10px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 0 20px var(--primary-color);
  `;
  modalContent.innerHTML = `
    <h2 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">Create Tournament</h2>
    <form id="create-tournament-form">
      <label for="tournament-name" style="display: block; margin-bottom: 0.5rem; color: var(--text-color);">Tournament Name:</label>
      <input type="text" id="tournament-name" required style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--primary-color); border-radius: 5px; background: var(--bg-color); color: var(--text-color);">
      <label for="max-players" style="display: block; margin-bottom: 0.5rem; color: var(--text-color);">Max Players:</label>
      <select id="max-players" required style="width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; border: 1px solid var(--primary-color); border-radius: 5px; background: var(--bg-color); color: var(--text-color);">
        <option value="">Select Players</option>
        <option value="4">4 Players</option>
        <option value="8">8 Players</option>
      </select>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button type="button" id="cancel-tournament" class="secondary-button">Cancel</button>
        <button type="submit" class="primary-button">Create Tournament</button>
      </div>
    </form>
  `;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  const form = modal.querySelector(
    "#create-tournament-form"
  ) as HTMLFormElement;
  const cancelBtn = modal.querySelector(
    "#cancel-tournament"
  ) as HTMLButtonElement;
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showMessage("Please register first to create a tournament.", "error");
      document.body.removeChild(modal);
      navigateTo("/register");
      return;
    }
    const nameInput = modal.querySelector(
      "#tournament-name"
    ) as HTMLInputElement;
    const playersSelect = modal.querySelector(
      "#max-players"
    ) as HTMLSelectElement;
    const name = nameInput.value.trim();
    const maxPlayers = parseInt(playersSelect.value) as 4 | 8;
    if (!name || !maxPlayers) {
      showMessage("Please fill in all fields.", "error");
      return;
    }
    //will create tournament
    showLoading();
    try {
      const result = await apiService.tournaments.create(
        name,
        maxPlayers,
        currentUser.id
      );
      if (result.data) {
        showMessage(`Tournament "${name}" created successfully!`, "success");
        document.body.removeChild(modal);
        // Refresh tournament page
        if (window.location.pathname === "/tournament") {
          const app = document.getElementById("app");
          if (app) {
            setupRoutes(app);
          }
        }
      } else {
        showMessage(result.error || "Failed to create tournament.", "error");
      }
    } catch (error) {
      showMessage("Failed to create tournament. Please try again.", "error");
      console.error("Tournament creation error:", error);
    } finally {
      hideLoading();
    }
  });
}
// Join Tournament Modal
function showJoinTournamentModal(tournament: any) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = `
    background: var(--bg-color);
    border: 2px solid var(--primary-color);
    border-radius: 10px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 0 20px var(--primary-color);
    max-height: 80vh;
    overflow-y: auto;
  `;
  let inputsHTML = "";
  for (let i = 1; i <= tournament.max_players; i++) {
    inputsHTML += `
      <label for="alias-${i}" style="display: block; margin-bottom: 0.5rem; color: var(--text-color);">Player ${i} Alias:</label>
      <input type="text" id="alias-${i}" required maxlength="10" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--primary-color); border-radius: 5px; background: var(--bg-color); color: var(--text-color);" placeholder="Enter unique alias">
    `;
  }
  modalContent.innerHTML = `
    <h2 style="color: var(--primary-color); margin-bottom: 1rem; text-align: center;">Join "${tournament.name}"</h2>
    <p style="text-align: center; margin-bottom: 1.5rem; color: var(--text-color-light);">Enter ${tournament.max_players} unique player aliases:</p>
    <form id="join-tournament-form">
      ${inputsHTML}
      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button type="button" id="cancel-join" class="secondary-button">Cancel</button>
        <button type="submit" class="primary-button">Join Tournament</button>
      </div>
    </form>
  `;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  const form = modal.querySelector("#join-tournament-form") as HTMLFormElement;
  const cancelBtn = modal.querySelector("#cancel-join") as HTMLButtonElement;
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showMessage("Please register first to join a tournament.", "error");
      document.body.removeChild(modal);
      navigateTo("/register");
      return;
    }
    const aliases = [];
    for (let i = 1; i <= tournament.max_players; i++) {
      const input = modal.querySelector(`#alias-${i}`) as HTMLInputElement;
      const alias = input.value.trim();
      if (!alias) {
        showMessage(`Please enter alias for Player ${i}.`, "error");
        input.focus();
        return;
      }
      aliases.push(alias);
    }
    // Check for duplicate aliases
    const uniqueAliases = new Set(aliases);
    if (uniqueAliases.size !== aliases.length) {
      showMessage("All aliases must be unique!", "error");
      return;
    }
    //join tournament using aliases
    showLoading();
    try {
      const result = await apiService.tournaments.join(
        tournament.id,
        aliases,
        currentUser.id
      );
      if (result.data) {
        showMessage(
          `Successfully joined "${tournament.name}" with ${aliases.length} players!`,
          "success"
        );
        document.body.removeChild(modal);
        // Refresh tournament page
        if (window.location.pathname === "/tournament") {
          const app = document.getElementById("app");
          if (app) {
            setupRoutes(app);
          }
        }
      } else {
        showMessage(result.error || "Failed to join tournament.", "error");
      }
    } catch (error) {
      showMessage("Failed to join tournament. Please try again.", "error");
      console.error("Tournament join error:", error);
    } finally {
      hideLoading();
    }
  });
}
// Router setup function
function setupRoutes(app: HTMLElement): void {
  const path = window.location.pathname;
  app.innerHTML = ""; // This clears everything inside #app
  // Create a live region for screen reader announcements.
  let liveRegion = document.getElementById("screen-reader-live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "screen-reader-live-region";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "hidden-visually";
    document.body.appendChild(liveRegion); // Append to body to ensure it's always available
  }
  // Define route mapping
  const routes: { [key: string]: () => HTMLElement } = {
    "/": renderHomePage,
    "/tournament": renderTournamentPage,
    "/register": renderRegisterPage,
    "/login": renderLoginPage,
  };
  const renderFunction = routes[path];
  // The main content container within the page that will hold dynamic content
  const pageContentContainer = document.createElement("div");
  pageContentContainer.className = "page-content-wrapper"; // A new wrapper for dynamic content
  app.appendChild(pageContentContainer);
  if (renderFunction) {
    pageContentContainer.appendChild(renderFunction());
    document.title = getPageTitle(path);
  } else {
    const notFound = document.createElement("div");
    notFound.className = "page content-section";
    notFound.id = "not-found";
    notFound.setAttribute("role", "main");
    notFound.innerHTML =
      '<h1 class="section-title">404 - Page Not Found</h1><p style="text-align:center; color: var(--text-color-light);">The page you are looking for does not exist.</p>';
    const backHomeBtn = document.createElement("button");
    backHomeBtn.className = "primary-button back-button";
    backHomeBtn.textContent = "Go to Home";
    backHomeBtn.addEventListener("click", () => navigateTo("/"));
    notFound.appendChild(backHomeBtn);
    notFound.appendChild(createFooter());
    pageContentContainer.appendChild(notFound);
    document.title = "404 - Page Not Found - Neon Pong";
  }
  // The navbar is appended to the body or a specific fixed container, not necessarily #app.
  // We need to ensure it's outside the dynamic content area if it's fixed.
  // For simplicity here, I'll still attach it to app, but if it needs to be fixed at top,
  // HTML structure needs to handle it (e.g., a div above #app or directly in body)
  // Re-append the navbar to ensure it's always there, or manage its position via CSS fixed.
  // Given your index.html has a fixed navbar outside #app's dynamic content,
  // we just need to ensure the correct element is updated.
  // Let's assume the navbar lives *outside* the #app for better fixed positioning.
  // If your index.html structure is different, please re-evaluate where createNavbar() is called.
  // For this scenario, we assume the navbar is already fixed in the DOM, and we just update its active state.
  // Update active navbar link after page render
  document.querySelectorAll(".navbar-link").forEach((link) => {
    link.classList.remove("active");
    // Ensure that '/tournament' matches both '/tournament' and the tournaments page's content ID
    const linkHref = link.getAttribute("href");
    const currentPath = window.location.pathname;
    if (linkHref === currentPath) {
      link.classList.add("active");
    } else if (linkHref === "/" && currentPath === "/") {
      link.classList.add("active");
    }
    // Specific handling for tournament link if it points to /tournament but also highlights based on content ID
    if (currentPath === "/tournament" && linkHref === "/tournament") {
      link.classList.add("active");
    } else if (currentPath === "/register" && linkHref === "/register") {
      link.classList.add("active");
    }
  });
}

// Initial page load
document.addEventListener("DOMContentLoaded", async () => {
  console.log('[App] DOM fully loaded, initializing application...');
  
  const app = document.getElementById("app");
  if (!app) {
    console.error('[App] Could not find app element');
    return;
  }

  try {
    // Create and append the navbar first
    console.log('[App] Creating navigation bar...');
    const navbar = createNavbar();
    document.body.prepend(navbar);
    
    // Add loading overlay if it doesn't exist
    if (!document.getElementById("loading-overlay")) {
      document.body.appendChild(createLoadingOverlay());
    }
    
    // Set up routes to render the initial page
    console.log('[App] Setting up routes...');
    setupRoutes(app);
    
    // Initialize language system after navbar is created
    console.log('[App] Initializing language system...');
    initLanguage();
    
    // Force update all UI texts after a small delay to ensure all elements are rendered
    console.log('[App] Scheduling initial UI update...');
    setTimeout(() => {
      console.log('[App] Updating UI texts...');
      // Update UI texts
      const event = new CustomEvent('languageChanged', { 
        detail: { initialLoad: true } 
      });
      document.dispatchEvent(event);
      
      // Ensure language switcher is properly initialized
      const container = document.getElementById('language-switcher-container');
      if (container) {
        const select = container.querySelector('select.language-select');
        if (select) {
          console.log('[App] Language switcher found and initialized');
        } else {
          console.warn('[App] Language select element not found in container');
        }
      } else {
        console.warn('[App] Language switcher container not found');
      }
    }, 500); // Increased delay to ensure all elements are rendered
    
    console.log('[App] Initialization complete');
  } catch (error) {
    console.error('[App] Error during initialization:', error);
  }
});
// Handle browser history changes (back/forward buttons)
window.addEventListener("popstate", () => {
  if (window.currentGameContainer) {
    window.currentGameContainer.remove();
    window.currentGameContainer = null;
    document.body.style.overflow = "";
    return;
  }
  const app = document.getElementById("app");
  if (app) {
    setupRoutes(app);
  }
});

// Function to display the game
function showNeonPongGame() {
  if (window.currentGameContainer) {
    window.currentGameContainer.remove();
    window.currentGameContainer = null;
  }
  history.pushState({ neonGame: true }, "", window.location.pathname);
  window.currentGameContainer = createNeonPongGame();
  document.body.appendChild(window.currentGameContainer);
  // Prevent scrolling while game is open
  document.body.style.overflow = "hidden";
}

