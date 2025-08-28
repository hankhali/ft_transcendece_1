import "./style.css"; // Ensure your CSS is imported
import { createNeonPongGame } from "./game.ts";
import { apiService } from "./api.ts";

// Global variables for message display and voice control
let messageTimeout: ReturnType<typeof setTimeout> | undefined;
let currentUser: { id: number; username: string } | null = null;

// Speech Recognition API setup
interface CustomSpeechRecognition extends SpeechRecognition {
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

let recognition: SpeechRecognition | null = null;
let isVoiceControlActive = false;
let voiceButton: HTMLButtonElement | null = null; // Declare globally for easier access

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
        liveRegion.textContent = `Mapsd to ${document.title}.`;
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
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  messageDiv.setAttribute("role", "status");
  messageDiv.setAttribute("aria-live", "polite");
  messageDiv.setAttribute("aria-atomic", "true");

  document.body.appendChild(messageDiv); // Append to the body instead of app

  messageTimeout = setTimeout(() => {
    messageDiv.classList.add("hidden");
    messageDiv.addEventListener("transitionend", () => messageDiv.remove(), {
      once: true,
    });
  }, 5000);
}

// --- Component Functions (for different pages/sections) ---

// Navbar Component
function createNavbar(): HTMLElement {
  const navbar = document.createElement("nav");
  navbar.className = "navbar";
  navbar.setAttribute("aria-label", "Main navigation");

  const logo = document.createElement("a");
  logo.className = "navbar-logo";
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
  navLinks.setAttribute("role", "menubar"); // Role for menu bar

  const homeLink = document.createElement("a");
  homeLink.className = "navbar-link";
  homeLink.textContent = "Home";
  homeLink.href = "/";
  homeLink.setAttribute("role", "menuitem");
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });

  const tournamentLink = document.createElement("a");
  tournamentLink.className = "navbar-link";
  tournamentLink.textContent = "Tournaments";
  tournamentLink.href = "/tournament";
  tournamentLink.setAttribute("role", "menuitem");
  tournamentLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/tournament");
  });

  const registerLink = document.createElement("a");
  registerLink.className = "navbar-link";
  registerLink.textContent = "Register";
  registerLink.href = "/register";
  registerLink.setAttribute("role", "menuitem");
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/register");
  });

  const loginLink = document.createElement("a");
    loginLink.className = "navbar-link";
    loginLink.textContent = "Login";
    loginLink.href = "/login";
    loginLink.setAttribute("role", "menuitem");
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/login");
    });

  navLinks.appendChild(homeLink);
  navLinks.appendChild(tournamentLink);
  navLinks.appendChild(registerLink);
  navLinks.appendChild(loginLink);

  navbarLinksContainer.appendChild(navLinks);

  // Add voice control button to the container
  voiceButton = document.createElement("button"); // Assign to global voiceButton
  voiceButton.className = "voice-control-button";
  voiceButton.textContent = "Voice Control";
  voiceButton.title = "Toggle Voice Control";
  if (
    window.SpeechRecognition ||
    (window as CustomSpeechRecognition).webkitSpeechRecognition
  ) {
    voiceButton.addEventListener("click", toggleVoiceControl);
  } else {
    voiceButton.disabled = true;
    voiceButton.textContent = "Voice Not Supported";
    voiceButton.title = "Your browser does not support Web Speech API.";
  }
  navbarLinksContainer.appendChild(voiceButton);

  navbar.appendChild(logo);
  navbar.appendChild(mobileMenuToggle); // Add toggle next to logo
  navbar.appendChild(navbarLinksContainer); // Add links container

  // Mobile menu toggle logic
  mobileMenuToggle.addEventListener("click", () => {
    navbarLinksContainer.classList.toggle("active");
    mobileMenuToggle.classList.toggle("active");
    const expanded = mobileMenuToggle.classList.contains("active");
    mobileMenuToggle.setAttribute("aria-expanded", String(expanded));
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
  const footer = document.createElement("footer");
  const footerText = document.createElement("p");
  footerText.innerHTML = `&copy; ${new Date().getFullYear()} Neon Pong. All rights reserved. Made with <i class="fas fa-heart" style="color: var(--secondary-color);"></i> by Four Innovative Minds.`;
  footer.appendChild(footerText);
  return footer;
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
  heroTitle.innerHTML = "NEON PONG";

  const heroSubtitle = document.createElement("h2"); // Changed to h2
  heroSubtitle.className = "hero-subtitle";
  heroSubtitle.textContent = "THE ULTIMATE RETRO-FUTURISTIC ARCADE EXPERIENCE.";

  const heroDescription = document.createElement("p");
  heroDescription.className = "hero-description";
  heroDescription.textContent =
    "Challenge your friends in a fast-paced game of skill and reflexes.";

  const heroCta = document.createElement("div");
  heroCta.className = "hero-cta";

  const playNowBtn = document.createElement("button");
  playNowBtn.className = "primary-button play-now-button";
  playNowBtn.innerHTML = '<i class="fas fa-play"></i> Play Now';
  playNowBtn.addEventListener("click", () => navigateTo("/tournament"));

  // 1v1 Button
  const oneVsOneBtn = document.createElement("button");
  oneVsOneBtn.className = "primary-button one-vs-one-button";
  oneVsOneBtn.innerHTML = '<i class="fas fa-gamepad"></i> 1v1 Match';
  oneVsOneBtn.addEventListener("click", () => showNeonPongGame());

  const registerCtaBtn = document.createElement("button");
  registerCtaBtn.className = "primary-button register-cta-button"; // Changed to primary-button for consistency
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

  // Features Section
  const featuresSection = document.createElement("section");
  featuresSection.id = "features";
  featuresSection.className = "content-section";
  featuresSection.innerHTML = `
      <h2 class="section-title">Key Features</h2>
      <div class="features-grid">
          <button class="feature-button"><i class="fas fa-cogs"></i> Customizable Paddles</button>
          <button class="feature-button"><i class="fas fa-users-line"></i> Multiplayer Arenas</button>
          <button class="feature-button"><i class="fas fa-rocket"></i> Power-Ups & Boosts</button>
          <button class="feature-button"><i class="fas fa-medal"></i> Leaderboards & Ranks</button>
          <button class="feature-button"><i class="fas fa-headset"></i> Voice Commands</button>
          <button class="feature-button"><i class="fas fa-paint-brush"></i> Dynamic Neon Themes</button>
      </div>
  `;
  home.appendChild(featuresSection);

  // Tournament Types Section
  const tournamentTypesSection = document.createElement("section");
  tournamentTypesSection.id = "tournaments"; // Add ID for nav link highlighting
  tournamentTypesSection.className = "tournament-types-section content-section";

  const tournamentTypesTitle = document.createElement("h2");
  tournamentTypesTitle.className = "section-title";
  tournamentTypesTitle.textContent = "Tournament Types";
  tournamentTypesSection.appendChild(tournamentTypesTitle);

  const tournamentCarouselContainer = document.createElement("div");
  tournamentCarouselContainer.className = "tournament-carousel-container";

  const leftArrow = document.createElement("button");
  leftArrow.className = "carousel-navigation left";
  leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
  leftArrow.setAttribute("aria-label", "Scroll left");

  const tournamentTypesGrid = document.createElement("div");
  tournamentTypesGrid.className = "tournament-types-grid";
  tournamentTypesGrid.setAttribute("role", "list");

  const tournamentTypeData = [
    {
      icon: '<i class="fas fa-trophy tournament-type-icon"></i>',
      title: "Daily Blitz",
      description:
        "Fast-paced, short tournaments. Great for quick challenges and daily rewards.",
    },
    {
      icon: '<i class="fas fa-users tournament-type-icon"></i>',
      title: "Team Showdown",
      description:
        "Join forces with friends and compete as a team. Strategy and coordination are key!",
    },
    {
      icon: '<i class="fas fa-skull-crossbones tournament-type-icon"></i>',
      title: "Elimination Rounds",
      description:
        "Survive round by round. One loss and you're out. The last player standing wins!",
    },
    {
      icon: '<i class="fas fa-globe tournament-type-icon"></i>',
      title: "Global Championship",
      description:
        "Compete against players worldwide for ultimate glory and exclusive rewards.",
    },
    {
      icon: '<i class="fas fa-star tournament-type-icon"></i>',
      title: "Special Events",
      description:
        "Unique, limited-time tournaments with special rules and massive prize pools.",
    },
  ];

  tournamentTypeData.forEach((type) => {
    const card = document.createElement("div");
    card.className = "tournament-type-card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `${type.icon}<h3>${type.title}</h3><p>${type.description}</p>`;
    tournamentTypesGrid.appendChild(card);
  });

  const rightArrow = document.createElement("button");
  rightArrow.className = "carousel-navigation right";
  rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
  rightArrow.setAttribute("aria-label", "Scroll right");

  tournamentCarouselContainer.appendChild(leftArrow);
  tournamentCarouselContainer.appendChild(tournamentTypesGrid);
  tournamentCarouselContainer.appendChild(rightArrow);

  tournamentTypesSection.appendChild(tournamentCarouselContainer);

  const upcomingTournamentsTitle = document.createElement("h2");
  upcomingTournamentsTitle.className = "section-title";
  upcomingTournamentsTitle.style.marginTop = "4rem";
  // upcomingTournamentsTitle.textContent = 'Upcoming Tournaments';
  tournamentTypesSection.appendChild(upcomingTournamentsTitle);

  const tournamentList = document.createElement("div");
  tournamentList.className = "tournament-list";
  tournamentList.setAttribute("role", "list");

  // commented out 
  const currentTournaments = [
    //{ name: 'Neon Cup #1', status: 'Open', starts: 'June 10, 2025', prize: '$1000' },
    //{ name: 'Cybernetic Showdown', status: 'In Progress', ends: 'June 15, 2025', prize: '$500' },
    //{ name: 'Retro Rumble', status: 'Completed', date: 'May 28, 2025', winner: 'PlayerX' }
  ];

  currentTournaments.forEach((t) => {
    const item = document.createElement("div");
    item.className = "tournament-item";
    item.setAttribute("role", "listitem");

    let statusClass = "";
    let buttonText = "";
    let buttonDisabled = false;
    let detailsText = "";

    if (t.status === "Open") {
      statusClass = "status-open";
      buttonText = "Join Tournament";
      detailsText = `<strong>Starts:</strong> ${t.starts}<br><strong>Prize Pool:</strong> ${t.prize}`;
    } else if (t.status === "In Progress") {
      statusClass = "status-in-progress";
      buttonText = "View Progress";
      buttonDisabled = true;
      detailsText = `<strong>Ends:</strong> ${t.ends}<br><strong>Prize Pool:</strong> ${t.prize}`;
    } else {
      // Completed
      statusClass = "status-completed";
      buttonText = "View Results";
      detailsText = `<strong>Date:</strong> ${t.date}<br><strong>Winner:</strong> ${t.winner}`;
    }

    item.innerHTML = `
      <h3>${t.name}</h3>
      <p class="tournament-status"><span class="status-indicator ${statusClass}"></span> ${
      t.status
    }</p>
      <p>${detailsText}</p>
      <button class="primary-button join-button ${
        t.status === "Completed" ? "secondary-button" : ""
      }" ${buttonDisabled ? "disabled" : ""}>${buttonText}</button>
    `;

    const joinButton = item.querySelector(".join-button") as HTMLButtonElement;
    if (joinButton) {
      joinButton.setAttribute("aria-disabled", String(buttonDisabled));
      joinButton.addEventListener("click", () => {
        if (t.status === "Open") {
          showMessage(`You joined the ${t.name}!`, "success");
          joinButton.textContent = "Joined";
          joinButton.disabled = true;
          joinButton.setAttribute("aria-disabled", "true");
          joinButton.classList.add("joined");
          joinButton.classList.remove("primary-button");
          joinButton.classList.add("secondary-button"); // Visually indicate it's joined
        } else {
          showMessage(`Viewing details for ${t.name}`, "info");
        }
      });
    }
    tournamentList.appendChild(item);
  });
  tournamentTypesSection.appendChild(tournamentList);
  home.appendChild(tournamentTypesSection);

  // Meet The Team Section
  const teamSection = document.createElement("section");
  teamSection.id = "team"; // Add ID for nav link highlighting
  teamSection.className = "content-section";

  const teamTitle = document.createElement("h2");
  teamTitle.className = "section-title";
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

  // Carousel Logic (Event Listeners and Visibility)
  const scrollAmount = 350; // Adjust based on your card width + gap

  const updateArrowVisibility = () => {
    if (tournamentTypesGrid.scrollLeft <= 5) {
      // Small tolerance for scroll start
      leftArrow.classList.add("hidden");
    } else {
      leftArrow.classList.remove("hidden");
    }

    // A small tolerance (e.g., 5px) is often needed due to sub-pixel rendering
    if (
      tournamentTypesGrid.scrollLeft + tournamentTypesGrid.clientWidth >=
      tournamentTypesGrid.scrollWidth - 5
    ) {
      rightArrow.classList.add("hidden");
    } else {
      rightArrow.classList.remove("hidden");
    }
  };

  leftArrow.addEventListener("click", () => {
    tournamentTypesGrid.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
    // Give time for scroll to complete before updating visibility
    setTimeout(updateArrowVisibility, 300);
  });

  rightArrow.addEventListener("click", () => {
    tournamentTypesGrid.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
    // Give time for scroll to complete before updating visibility
    setTimeout(updateArrowVisibility, 300);
  });

  tournamentTypesGrid.addEventListener("scroll", updateArrowVisibility);
  window.addEventListener("resize", updateArrowVisibility); // Recheck on resize

  // Initial call to set arrow visibility
  setTimeout(updateArrowVisibility, 0);

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

  const aliasInputs = [];
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

// Voice Control Functions
function setupVoiceControl() {
  const SpeechRecognition =
    (window as CustomSpeechRecognition).SpeechRecognition ||
    (window as CustomSpeechRecognition).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (voiceButton) {
      voiceButton.disabled = true;
      voiceButton.textContent = "Voice Not Supported";
      voiceButton.title = "Your browser does not support Web Speech API.";
    }
    console.warn("Web Speech API not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true; // Keep listening continuously
  recognition.interimResults = false; // Only return final results
  recognition.lang = "en-US"; // Set language

  recognition.onstart = () => {
    isVoiceControlActive = true;
    if (voiceButton) {
      voiceButton.textContent = "Voice ON";
      voiceButton.classList.add("active-voice");
      voiceButton.setAttribute("aria-pressed", "true");
    }
    showMessage("Voice control started. Listening for commands...", "info");
    console.log("Voice control started. Listening...");
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results.length - 1;
    const command = event.results[last][0].transcript.toLowerCase().trim();
    console.log("Voice command received:", command);
    processVoiceCommand(command);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    if (voiceButton) {
      voiceButton.textContent = "Voice Control";
      voiceButton.classList.remove("active-voice");
      voiceButton.setAttribute("aria-pressed", "false");
    }
    isVoiceControlActive = false; // Reset active state
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      showMessage(
        "Microphone access denied. Please enable it in your browser settings.",
        "error"
      );
    } else if (event.error === "no-speech") {
      // This is normal if there's silence, no need for an error message unless it persists
      // showMessage('No speech detected. Try speaking closer to the microphone.', 'info');
    } else {
      showMessage(
        `Voice control error: ${event.error}. Please try again.`,
        "error"
      );
    }
  };

  recognition.onend = () => {
    // If we are still "active" (user hasn't clicked to stop),
    // and the recognition ended for some reason (e.g., browser timeout for continuous),
    // we can restart it. This creates a more "always-on" feel for `continuous: true`.
    if (isVoiceControlActive) {
      console.log("Speech recognition session ended, restarting...");
      // Re-start after a brief delay to avoid rapid restarts
      setTimeout(() => {
        try {
          recognition?.start();
        } catch (e: any) {
          console.error("Error restarting recognition:", e);
          if (e.message.includes("already started")) {
            // Ignore if it's already running, could be a race condition
          } else {
            showMessage(
              `Failed to restart voice control: ${e.message}.`,
              "error"
            );
            isVoiceControlActive = false;
            if (voiceButton) {
              voiceButton.textContent = "Voice Control";
              voiceButton.classList.remove("active-voice");
              voiceButton.setAttribute("aria-pressed", "false");
            }
          }
        }
      }, 100);
    } else {
      console.log("Speech recognition intentionally stopped.");
      if (voiceButton) {
        voiceButton.textContent = "Voice Control";
        voiceButton.classList.remove("active-voice");
        voiceButton.setAttribute("aria-pressed", "false");
      }
      showMessage("Voice control stopped.", "info");
    }
  };
}

function processVoiceCommand(command: string) {
  let executed = false;
  if (command.includes("go home") || command.includes("home")) {
    navigateTo("/");
    showMessage("Navigating to Home page.", "success");
    executed = true;
  } else if (
    command.includes("go to tournaments") ||
    command.includes("tournaments") ||
    command.includes("browse tournaments")
  ) {
    navigateTo("/tournament");
    showMessage("Navigating to Tournaments page.", "success");
    executed = true;
  } else if (
    command.includes("register") ||
    command.includes("go to register") ||
    command.includes("sign up")
  ) {
    navigateTo("/register");
    showMessage("Navigating to Register page.", "success");
    executed = true;
  } else if (
    command.includes("play now") ||
    command.includes("start game") ||
    command.includes("play")
  ) {
    // You might want to simulate a click on the play button on the home page or directly navigate
    // For now, let's navigate to tournaments as a game usually starts from there.
    navigateTo("/tournament");
    showMessage("Starting game/Navigating to Tournaments!", "success");
    executed = true;
  }

  if (!executed) {
    showMessage(
      `Unrecognized command: "${command}". Try "Go Home", "Tournaments", or "Register".`,
      "error"
    );
  }
}

function toggleVoiceControl() {
  if (!recognition) {
    showMessage("Voice control not initialized or supported.", "error");
    return;
  }

  if (isVoiceControlActive) {
    // Stop recognition only if it's actively listening due to user action
    recognition.stop();
    isVoiceControlActive = false; // Explicitly set to false
  } else {
    try {
      // Start recognition
      recognition.start();
    } catch (e: any) {
      if (e.message.includes("already started")) {
        showMessage("Voice control is already active.", "info");
        isVoiceControlActive = true; // Ensure state is correct
      } else {
        showMessage(
          `Could not start voice control: ${e.message}. Please check microphone permissions.`,
          "error"
        );
        console.error("Error starting recognition:", e);
        isVoiceControlActive = false;
      }
      if (voiceButton) {
        voiceButton.textContent = "Voice Control";
        voiceButton.classList.remove("active-voice");
        voiceButton.setAttribute("aria-pressed", "false");
      }
    }
  }
}

// Router setup function
function setupRoutes(app: HTMLElement) {
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

// Initial page load and setup voice control
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    // Only create and append the navbar ONCE, as it's a persistent UI element
    const navbar = createNavbar();
    document.body.prepend(navbar); // Prepend to body so it's the first element if fixed

    // Also, ensure the loading overlay is part of the main app or body for global usage
    if (!document.getElementById("loading-overlay")) {
      document.body.appendChild(createLoadingOverlay());
    }

    setupRoutes(app); // Render initial page content
    setupVoiceControl(); // Initialize voice control when DOM is ready
  }
});

// Handle browser history changes (back/forward buttons)
window.addEventListener("popstate", () => {
  if (currentGameContainer) {
    hideNeonPongGame();
    return;
  }
  const app = document.getElementById("app");
  if (app) {
    setupRoutes(app);
  }
});

// Working of 1v1
let currentGameContainer: HTMLElement | null = null;

// Function to display the game
function showNeonPongGame() {
  if (currentGameContainer) {
    hideNeonPongGame(); // Removes existing screen first if there is some
  }

  history.pushState({ neonGame: true }, "", window.location.pathname);

  currentGameContainer = createNeonPongGame();
  document.body.appendChild(currentGameContainer);
  // Prevent scrolling while game is open
  document.body.style.overflow = "hidden";
}

// Function to hide the game
function hideNeonPongGame() {
  if (currentGameContainer) {
    currentGameContainer.remove();
    currentGameContainer = null;
    // Restore scrolling
    document.body.style.overflow = "";
  }
}
// Make this function global for the game's back button
(window as any).hideNeonPongGame = hideNeonPongGame;
