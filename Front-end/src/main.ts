// This file is a TypeScript module
import "./style.css"; // Ensure your CSS is imported
import "./language.css"; // Import language switcher styles
import { createNeonPongGame } from "./game.ts";
import { apiService } from "./api.ts";
import { createProfileSettings } from "./components/ProfileSettings";
import { initLanguage } from "./language";

// Global variables for message display
declare global {
  interface Window {
    showMessage: (text: string, type?: 'success' | 'error' | 'info') => void;
    messageTimeout: number | null;
  }
  interface Window {
    messageTimeout: number | null;
    currentGameContainer: HTMLElement | null;
  }
}

window.messageTimeout = null;
let currentUser: { id: number; username: string } | null = null;
window.currentGameContainer = null;

// Utility function to navigate between pages
export function navigateTo(path: string) {
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

interface Tournament {
  id: number;
  name: string;
  status: string;
  max_players: number;
  // Add other tournament properties as needed
}

function showJoinTournamentModal(tournament?: Tournament) {
  if (!tournament) {
    console.log('No tournament selected');
    return;
  }
  
  console.log(`Joining tournament: ${tournament.name}`);
  // TODO: Implement join tournament modal with the selected tournament
  // This will be implemented in a future update
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
  
  // Create message content container
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.setAttribute("aria-label", "Close message");
  closeButton.addEventListener("click", () => {
    messageDiv.remove();
    if (window.messageTimeout) {
      clearTimeout(window.messageTimeout);
    }
  });
  
  // Add icon based on message type
  let icon = "";
  if (type === "success") icon = "✓";
  else if (type === "error") icon = "✕";
  else icon = "ℹ";
  
  const iconSpan = document.createElement("span");
  iconSpan.className = "message-icon";
  iconSpan.textContent = icon;
  
  // Assemble the message
  messageDiv.appendChild(iconSpan);
  messageDiv.appendChild(messageContent);
  messageDiv.appendChild(closeButton);
  
  // Accessibility
  messageDiv.setAttribute("role", "status");
  messageDiv.setAttribute("aria-live", "polite");
  messageDiv.setAttribute("aria-atomic", "true");
  
  // Add to DOM
  document.body.appendChild(messageDiv);
  
  // Auto-hide after delay
  window.messageTimeout = setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => messageDiv.remove(), 300);
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
      const announcement = `Font size set to ${size}%`;
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
  
  // Create the language switcher container
  console.log('[Navbar] Creating language switcher container...');
  const languageSwitcherContainer = document.createElement("div");
  languageSwitcherContainer.id = "language-switcher-container";
  languageSwitcherContainer.className = "language-switcher-container";
  // Force remove any red borders
  languageSwitcherContainer.style.border = 'none';
  languageSwitcherContainer.style.outline = 'none';
  languageSwitcherContainer.style.boxShadow = 'none';
  
  // Add a temporary placeholder for the language switcher
  const placeholder = document.createElement('div');
  placeholder.className = 'language-switcher';
  placeholder.innerHTML = 'Loading languages...';
  languageSwitcherContainer.appendChild(placeholder);
  
  console.log('[Navbar] Language switcher container created:', languageSwitcherContainer);
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
  // Combined ACCOUNT tab that toggles between login/register
  const ACCOUNTLink = document.createElement("a");
  ACCOUNTLink.href = "/ACCOUNT";
  ACCOUNTLink.className = "navbar-link";
  ACCOUNTLink.setAttribute('data-i18n', 'SIGN IN/SIGN UP');
  ACCOUNTLink.textContent = "ACCOUNT";
  ACCOUNTLink.setAttribute("role", "menuitem");
  ACCOUNTLink.addEventListener("click", (e) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    if (currentPath === "/login" || currentPath === "/register") {
      // Toggle between login and register
      const newPath = currentPath === "/login" ? "/register" : "/login";
      navigateTo(newPath);
    } else {
      // Default to login page
      navigateTo("/login");
    }
  });
  navLinks.appendChild(homeLink);
  navLinks.appendChild(tournamentsLink);
  
  // Add Dashboard link
  const dashboardLink = document.createElement("a");
  dashboardLink.href = "/dashboard";
  dashboardLink.className = "navbar-link";
  dashboardLink.textContent = "Dashboard";
  dashboardLink.setAttribute("role", "menuitem");
  dashboardLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/dashboard");
  });
  navLinks.appendChild(dashboardLink);
  
  navLinks.appendChild(ACCOUNTLink);
  
  // Profile Dropdown
  const profileContainer = document.createElement('div');
  profileContainer.className = 'profile-container';
  
  const profileButton = document.createElement('button');
  profileButton.className = 'profile-button';
  profileButton.setAttribute('aria-label', 'Profile menu');
  profileButton.setAttribute('aria-expanded', 'false');
  profileButton.setAttribute('aria-haspopup', 'true');
  
  const profileIcon = document.createElement('i');
  profileIcon.className = 'fas fa-user-circle';
  profileButton.appendChild(profileIcon);
  
  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'profile-dropdown';
  dropdownMenu.setAttribute('role', 'menu');
  
  // Dropdown content will be added here
  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'dropdown-content';
  // Create profile settings container
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'profile-settings-container';
  
  // Create profile header
  const header = document.createElement('div');
  header.className = 'dropdown-header';
  header.innerHTML = `
    <i class="fas fa-user-circle"></i>
    <span>Guest</span>
  `;
  
  settingsContainer.appendChild(header);
  
  // Add divider
  const divider = document.createElement('div');
  divider.className = 'dropdown-divider';
  settingsContainer.appendChild(divider);
  
  // Add menu items
  const menuItems = [
    { icon: 'fa-cog', text: 'Profile Settings', action: 'settings' },
    { icon: 'fa-sign-out-alt', text: 'Sign Out', action: 'signout' }
  ];
  
  menuItems.forEach(item => {
    const menuItem = document.createElement('a');
    menuItem.href = '#';
    menuItem.className = 'dropdown-item';
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('data-action', item.action);
    menuItem.innerHTML = `
      <i class="fas ${item.icon}"></i>
      <span>${item.text}</span>
    `;
    settingsContainer.appendChild(menuItem);
  });
  
  dropdownContent.appendChild(settingsContainer);
  
  // Create profile settings form (initially hidden)
  const profileFormContainer = document.createElement('div');
  profileFormContainer.className = 'profile-form-container';
  profileFormContainer.style.display = 'none';
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'dropdown-back';
  backButton.innerHTML = `
    <i class="fas fa-arrow-left"></i>
    <span>Back to Menu</span>
  `;
  backButton.addEventListener('click', () => {
    settingsContainer.style.display = 'block';
    profileFormContainer.style.display = 'none';
  });
  
  profileFormContainer.appendChild(backButton);
  
  // Add profile settings form
  const profileForm = createProfileSettings({
    username: 'username123', // Replace with actual user data
    displayName: 'Player',   // Replace with actual user data
    skillLevel: 'intermediate', // Default skill level
    bio: 'Ping pong enthusiast!',
    avatar: ''
  });
  
  profileFormContainer.appendChild(profileForm);
  dropdownContent.appendChild(profileFormContainer);
  
  // Handle menu item clicks
  dropdownContent.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const menuItem = target.closest('.dropdown-item') as HTMLElement;
    
    if (!menuItem) return;
    
    e.preventDefault();
    const action = menuItem.getAttribute('data-action');
    
    if (action === 'settings') {
      settingsContainer.style.display = 'none';
      profileFormContainer.style.display = 'block';
    } else if (action === 'signout') {
      // Handle sign out
      console.log('User signed out');
      // TODO: Implement sign out logic
    }
  });
  
  dropdownMenu.appendChild(dropdownContent);
  profileContainer.appendChild(profileButton);
  profileContainer.appendChild(dropdownMenu);
  
  // Toggle dropdown on button click
  profileButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = profileButton.getAttribute('aria-expanded') === 'true';
    profileButton.setAttribute('aria-expanded', (!isExpanded).toString());
    dropdownMenu.classList.toggle('show', !isExpanded);
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!profileContainer.contains(e.target as Node)) {
      profileButton.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.remove('show');
    }
  });
  
  navLinks.appendChild(profileContainer);
  
  // Accessibility Controls
  const accessibilityControls = document.createElement('div');
  accessibilityControls.className = 'accessibility-controls';
  accessibilityControls.setAttribute('aria-label', 'Accessibility controls');
  
  // Add language switcher to accessibility controls
  console.log('Adding language switcher to accessibility controls');
  
  // Force display and visibility
  languageSwitcherContainer.style.display = 'flex';
  languageSwitcherContainer.style.visibility = 'visible';
  languageSwitcherContainer.style.opacity = '1';
  languageSwitcherContainer.style.position = 'relative';
  languageSwitcherContainer.style.zIndex = '1000';
  languageSwitcherContainer.style.minWidth = '150px';
  languageSwitcherContainer.style.height = '40px';
  languageSwitcherContainer.style.alignItems = 'center';
  languageSwitcherContainer.style.justifyContent = 'center';
  languageSwitcherContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  languageSwitcherContainer.style.borderRadius = '6px';
  languageSwitcherContainer.style.padding = '0.5rem';
  languageSwitcherContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  languageSwitcherContainer.style.transition = 'all 0.2s ease';
  
  // Make sure the select is visible
  const select = languageSwitcherContainer.querySelector('select');
  if (select) {
    console.log('Found select element in language switcher');
    select.style.color = 'white';
    select.style.backgroundColor = '#1a1a2e';
    select.style.border = '1px solid #00e6ff';
    select.style.borderRadius = '4px';
    select.style.padding = '5px';
    select.style.minWidth = '120px';
    select.style.fontSize = '14px';
    select.style.cursor = 'pointer';
  } else {
    console.error('No select element found in language switcher!');
  }
  
  console.log('Language switcher container before append:', languageSwitcherContainer.outerHTML);
  accessibilityControls.appendChild(languageSwitcherContainer);
  console.log('Accessibility controls after appending language switcher:');
  console.log(accessibilityControls.outerHTML);
  
  // Verify it's actually in the DOM
  setTimeout(() => {
    const checkElement = document.getElementById('language-switcher-container');
    console.log('DOM check - language switcher container:', checkElement);
    if (checkElement) {
      console.log('Language switcher container styles:', window.getComputedStyle(checkElement));
    }
  }, 1000);
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
  const registerCtaBtn = document.createElement("button");
  registerCtaBtn.className = "primary-button register-cta-button";
  registerCtaBtn.setAttribute('data-i18n', 'register_now_button');
  registerCtaBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Now';
  registerCtaBtn.addEventListener("click", () => navigateTo("/register"));
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
// Combined Login/Register Page
function renderAuthPage(isLogin = true): HTMLElement {
  const authPage = document.createElement("div");
  authPage.className = "page content-section";
  authPage.id = isLogin ? "login" : "register";
  authPage.setAttribute("role", "main");
  
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";
  
  // Toggle between login/register
  const toggleText = document.createElement("p");
  toggleText.className = "text-center mt-4";
  const toggleLink = document.createElement("a");
  toggleLink.href = "#";
  toggleLink.className = "text-blue-500 hover:underline";
  toggleLink.textContent = isLogin ? "Create an ACCOUNT" : "Sign in to existing ACCOUNT";
  toggleLink.addEventListener("click", (e: Event) => {
    e.preventDefault();
    const newPath = isLogin ? "/register" : "/login";
    navigateTo(newPath);
  });
  // Create container for the toggle text
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'toggle-text-container';
  
  // Create the text node with proper styling
  const textNode = document.createElement('span');
  textNode.className = 'toggle-text';
  textNode.textContent = isLogin ? "Don't have an account? " : "Already have an account? ";
  
  // Style the toggle link
  toggleLink.className = 'toggle-link neon-text';
  toggleLink.style.marginLeft = '4px';
  toggleLink.style.textDecoration = 'none';
  toggleLink.style.transition = 'all 0.3s ease';
  toggleLink.style.fontWeight = '600';
  
  // Add hover effect
  toggleLink.addEventListener('mouseenter', () => {
    toggleLink.style.textShadow = '0 0 10px rgba(99, 102, 241, 0.8)';
  });
  
  toggleLink.addEventListener('mouseleave', () => {
    toggleLink.style.textShadow = 'none';
  });
  
  // Append elements
  toggleContainer.appendChild(textNode);
  toggleContainer.appendChild(toggleLink);
  toggleText.appendChild(toggleContainer);

  // Form title
  const title = document.createElement("h2");
  title.className = "form-title";
  title.textContent = isLogin ? "Login to Neon Pong" : "Register for Neon Pong";
  
  // Form element
  const form = document.createElement("form");
  form.noValidate = true;

  // Email field (only for registration)
  let emailInput: HTMLInputElement | null = null;
  if (!isLogin) {
    const emailLabel = document.createElement("label");
    emailLabel.className = "form-label";
    emailLabel.textContent = "Email";
    emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.className = "form-input";
    emailInput.required = true;
    emailInput.placeholder = "Enter your email";
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
  }

  // Username field (always shown)
  const usernameLabel = document.createElement("label");
  usernameLabel.className = "form-label";
  usernameLabel.textContent = "Username";
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.className = "form-input";
  usernameInput.required = true;
  usernameInput.placeholder = "Choose a username";
  
  // Password field (always shown)
  const passwordLabel = document.createElement("label");
  passwordLabel.className = "form-label";
  passwordLabel.textContent = "Password";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.className = "form-input";
  passwordInput.required = true;
  passwordInput.placeholder = "Create a password";

  // Confirm Password (only for registration)
  let confirmPasswordInput: HTMLInputElement | null = null;
  let confirmLabel: HTMLLabelElement | null = null;
  if (!isLogin) {
    confirmLabel = document.createElement("label");
    confirmLabel.className = "form-label";
    confirmLabel.textContent = "Confirm Password";
    confirmPasswordInput = document.createElement("input");
    confirmPasswordInput.type = "password";
    confirmPasswordInput.className = "form-input";
    confirmPasswordInput.required = true;
    confirmPasswordInput.placeholder = "Confirm your password";
  }

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-button w-full";
  submitButton.textContent = isLogin ? "Login" : "Register";

  // Back button
  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "secondary-button w-full mt-2";
  backButton.textContent = "Back to Home";
  backButton.addEventListener("click", () => navigateTo("/"));

  // Add elements to form in the correct order
  if (!isLogin) {
    // Email field is already added for registration
    form.appendChild(document.createElement('br'));
  }
  
  // Add username
  form.appendChild(usernameLabel);
  form.appendChild(usernameInput);
  form.appendChild(document.createElement('br'));
  
  // Add password
  form.appendChild(passwordLabel);
  form.appendChild(passwordInput);
  
  // Add confirm password for registration
  if (!isLogin && confirmPasswordInput && confirmLabel) {
    form.appendChild(document.createElement('br'));
    form.appendChild(confirmLabel);
    form.appendChild(confirmPasswordInput);
  }
  
  if (isLogin) {
    form.appendChild(document.createElement('br'));
  }
  form.appendChild(submitButton);
  form.appendChild(backButton);
  
  formContainer.appendChild(title);
  formContainer.appendChild(form);
  formContainer.appendChild(toggleText);
  
  authPage.appendChild(formContainer);
  authPage.appendChild(createFooter());

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!isLogin && passwordInput.value !== confirmPasswordInput?.value) {
      showMessage("Passwords do not match", "error");
      return;
    }

    showLoading();
    try {
      if (isLogin) {
        const result = await apiService.users.login(
          usernameInput.value,
          passwordInput.value
        );
        if (result.data) {
          currentUser = { id: result.data.userId, username: usernameInput.value };
          showMessage("Login successful!", "success");
          navigateTo("/tournament");
        } else {
          showMessage(result.error || "Login failed", "error");
        }
      } else if (emailInput) {
        const result = await apiService.users.register(
          usernameInput.value,
          passwordInput.value,
          emailInput.value
        );
        if (result.data) {
          currentUser = { id: result.data.userId, username: usernameInput.value };
          showMessage("Registration successful!", "success");
          navigateTo("/tournament");
        } else {
          showMessage(result.error || "Registration failed", "error");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      showMessage("An error occurred. Please try again.", "error");
    } finally {
      hideLoading();
    }
  });

  return authPage;
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
    "/login": () => renderAuthPage(true),
    "/register": () => renderAuthPage(false),
    "/tournament": renderTournamentPage,
    "/profile": () => createProfileSettings(),
    "/ACCOUNT": () => renderAuthPage(true)
    // Add other routes as they are implemented
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
  
  // Initialize language system
  console.log('[App] Initializing language system...');
  try {
    await initLanguage();
    console.log('[App] Language system initialized');
    
    // Check if language switcher was properly initialized
    const langSwitcher = document.querySelector('#language-switcher-container select.language-select');
    if (!langSwitcher) {
      console.warn('[App] Main language switcher not found, creating fallback...');
      const { createFallbackLanguageSwitcher } = await import('./language');
      createFallbackLanguageSwitcher();
    }
  } catch (error) {
    console.error('[App] Error initializing language system:', error);
    try {
      // Try to load fallback if main initialization fails
      const { createFallbackLanguageSwitcher } = await import('./language');
      createFallbackLanguageSwitcher();
    } catch (fallbackError) {
      console.error('[App] Failed to create fallback language switcher:', fallbackError);
    }
  }
  
  console.log('[App] Finding app container...');
  const app = document.getElementById("app");
  if (!app) {
    console.error('[App] Failed to find #app element');
    return;
  }
  if (!app) {
    console.error('Failed to find #app element');
    return;
  }

  // Create and append the navbar first
  console.log('[App] Creating navigation bar...');
  const navbar = createNavbar();
  document.body.insertBefore(navbar, app);
  
  // Make sure language switcher is initialized after navbar is in the DOM
  console.log('[App] Initializing language switcher...');
  try {
    await initLanguage();
    console.log('[App] Language switcher initialized');
  } catch (error) {
    console.error('[App] Error initializing language switcher:', error);
  }
  
  // Add loading overlay if it doesn't exist
  if (!document.getElementById("loading-overlay")) {
    const loadingOverlay = createLoadingOverlay();
    document.body.appendChild(loadingOverlay);
  }

  // Set up routes
  console.log('[App] Setting up routes...');
  setupRoutes(app);
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    setupRoutes(app);
  });

  // Ensure home page is shown by default if no route matches
  if (window.location.pathname === '/' || window.location.pathname === '') {
    navigateTo('/');
  }

  console.log('[App] Initialization complete');
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

