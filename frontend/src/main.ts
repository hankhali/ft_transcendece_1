import './style.css'; // Ensure your CSS is imported
import { setupRoutes } from './router';

// Global variables for message display
let messageTimeout: number | null = null;

// Utility function to navigate between pages
function navigateTo(path: string) {
  history.pushState(null, '', path);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = ''; // Clear current page
    setupRoutes(app); // Render new page based on route
  }
}

// Function to create a generic loading overlay
function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay'; // Add ID for easy access

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  overlay.appendChild(spinner);

  const loadingText = document.createElement('p');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Loading...';
  overlay.appendChild(loadingText);

  return overlay;
}

// Function to show the loading overlay
function showLoading() {
  const app = document.getElementById('app');
  if (app) {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = createLoadingOverlay();
      app.appendChild(overlay);
    }
    overlay.classList.remove('hidden');
  }
}

// Function to hide the loading overlay
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Function to display messages (error/success)
function showMessage(text: string, type: 'success' | 'error') {
  const app = document.getElementById('app');
  if (!app) return;

  // Clear existing messages and timeouts
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  if (messageTimeout) {
    clearTimeout(messageTimeout);
    messageTimeout = null;
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  app.prepend(messageDiv); // Add to the top of the app

  messageTimeout = setTimeout(() => {
    messageDiv.classList.add('hidden'); // Fade out or slide up
    messageDiv.remove(); // Remove from DOM after transition
  }, 5000); // Message disappears after 5 seconds
}

// --- Component Functions (for different pages/sections) ---

// Navbar Component
function createNavbar(): HTMLElement {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';

  const logo = document.createElement('a');
  logo.className = 'navbar-logo';
  logo.textContent = 'Neon Pong';
  logo.href = '/'; // Link to home
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });

  const navLinks = document.createElement('div');
  navLinks.className = 'navbar-links';

  const homeLink = document.createElement('a');
  homeLink.className = 'navbar-link';
  homeLink.textContent = 'Home';
  homeLink.href = '/';
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });

  const tournamentLink = document.createElement('a');
  tournamentLink.className = 'navbar-link';
  tournamentLink.textContent = 'Tournaments';
  tournamentLink.href = '/tournament';
  tournamentLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/tournament');
  });

  const registerLink = document.createElement('a');
  registerLink.className = 'navbar-link';
  registerLink.textContent = 'Register';
  registerLink.href = '/register';
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/register');
  });

  navLinks.appendChild(homeLink);
  navLinks.appendChild(tournamentLink);
  navLinks.appendChild(registerLink);
  // Add other links here (e.g., login, profile)

  navbar.appendChild(logo); // Logo is hidden by CSS but kept for structure
  navbar.appendChild(navLinks);

  // Set active link based on current path
  const currentPath = window.location.pathname;
  if (currentPath === '/') homeLink.classList.add('active');
  else if (currentPath.startsWith('/tournament')) tournamentLink.classList.add('active');
  else if (currentPath.startsWith('/register')) registerLink.classList.add('active');

  return navbar;
}

// Footer Component
function createFooter(): HTMLElement {
  const footer = document.createElement('footer');
  const footerText = document.createElement('p');
  footerText.textContent = `© ${new Date().getFullYear()} Neon Pong. All rights reserved.`;
  footer.appendChild(footerText);
  return footer;
}

// Home Page
function renderHomePage(): HTMLElement {
  const home = document.createElement('div');
  home.className = 'page home-page';

  // Hero Section
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';

  const heroTitle = document.createElement('h1');
  heroTitle.className = 'hero-title';
  heroTitle.innerHTML = 'NEON PONG';

  const heroSubtitle = document.createElement('p');
  heroSubtitle.className = 'hero-subtitle';
  heroSubtitle.textContent = 'THE FUTURE OF';

  const heroDescription = document.createElement('p');
  heroDescription.className = 'hero-description';
  heroDescription.textContent = 'PING PONG GAMING';

  const heroCreatorInfo = document.createElement('p');
  heroCreatorInfo.className = 'hero-description';
  heroCreatorInfo.textContent = 'Created by Four Innovative Minds - Your Next-Level Pong Experience';

  const heroCta = document.createElement('div');
  heroCta.className = 'hero-cta';

  const playNowBtn = document.createElement('button');
  playNowBtn.className = 'play-now-button';
  playNowBtn.textContent = 'PLAY NOW';
  playNowBtn.addEventListener('click', () => navigateTo('tournament'));

  const registerCtaBtn = document.createElement('button');
  registerCtaBtn.className = 'secondary-button';
  registerCtaBtn.textContent = 'Register Now';
  registerCtaBtn.addEventListener('click', () => navigateTo('register'));

  heroCta.appendChild(playNowBtn);
  heroCta.appendChild(registerCtaBtn);

  const paddleImage = document.createElement('img');
  paddleImage.src = '/ping.png'; // Make sure this path is correct relative to your project root
  paddleImage.alt = 'Neon Ping Pong Paddle';
  paddleImage.className = 'ping-pong-paddle';

  heroSection.appendChild(heroTitle);
  heroSection.appendChild(heroSubtitle);
  heroSection.appendChild(heroDescription);
  heroSection.appendChild(heroCreatorInfo);
  heroSection.appendChild(heroCta);
  heroSection.appendChild(paddleImage);

  home.appendChild(heroSection);

  // --- START: Tournament Types Section (WITH CAROUSEL) ---
  const tournamentTypesSection = document.createElement('section');
  tournamentTypesSection.className = 'tournament-types-section';

  const tournamentTypesTitle = document.createElement('h2');
  tournamentTypesTitle.className = 'section-title';
  tournamentTypesTitle.textContent = 'TYPES OF TOURNAMENTS';
  tournamentTypesSection.appendChild(tournamentTypesTitle);

  // Container for the scrollable grid and arrows
  const tournamentCarouselContainer = document.createElement('div');
  tournamentCarouselContainer.className = 'tournament-carousel-container';

  const tournamentTypesGrid = document.createElement('div');
  tournamentTypesGrid.className = 'tournament-types-grid';

  const tournamentTypes = [
    { icon: '&#x1F3C6;', title: 'Single Elimination', description: 'Classic knockout style, one loss and you\'re out!' },
    { icon: '&#x2694;&#xFE0F;', title: 'Round Robin', description: 'Everyone plays everyone, test all your skills.' },
    { icon: '&#x1F3AE;', title: 'Team Battles', description: 'Compete with your squad, for ultimate glory.' },
    { icon: '&#x1F4BA;', title: 'Custom Rules', description: 'Unique formats and challenges, designed by the community.' },
    { icon: '&#x1F3D3;', title: 'Arcade Mode', description: 'Fast-paced, high-score challenges!' }, // Example additional card
    { icon: '&#x1F389;', title: 'Seasonal Events', description: 'Special limited-time tournaments with unique rewards!' } // Example additional card
  ];

  tournamentTypes.forEach(type => {
    const typeCard = document.createElement('div');
    typeCard.className = 'tournament-type-card';
    typeCard.innerHTML = `
      <span class="tournament-type-icon">${type.icon}</span>
      <h3>${type.title}</h3>
      <p>${type.description}</p>
    `;
    typeCard.addEventListener('click', () => navigateTo('tournament')); // Link to tournament page
    tournamentTypesGrid.appendChild(typeCard);
  });

  // Create Navigation Arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-navigation left';
  leftArrow.innerHTML = '&lsaquo;'; // Left arrow character
  leftArrow.title = 'Scroll Left';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-navigation right';
  rightArrow.innerHTML = '&rsaquo;'; // Right arrow character
  rightArrow.title = 'Scroll Right';

  tournamentCarouselContainer.appendChild(leftArrow);
  tournamentCarouselContainer.appendChild(tournamentTypesGrid);
  tournamentCarouselContainer.appendChild(rightArrow);

  tournamentTypesSection.appendChild(tournamentCarouselContainer);
  home.appendChild(tournamentTypesSection);

  // --- Carousel Logic (Event Listeners and Visibility) ---
  const scrollStep = 340; // Approx. Card width (300px) + gap (32px = 2rem) + some buffer for smooth snapping

  const updateArrowVisibility = () => {
    // Hide left arrow if scrolled to the beginning
    // Use a small tolerance (e.g., 5px) for scrollLeft due to sub-pixel rendering
    if (tournamentTypesGrid.scrollLeft <= 5) {
      leftArrow.classList.add('hidden');
    } else {
      leftArrow.classList.remove('hidden');
    }

    // Hide right arrow if scrolled to the end
    // Check if remaining scrollable distance is very small
    const atEnd = tournamentTypesGrid.scrollLeft + tournamentTypesGrid.clientWidth >= tournamentTypesGrid.scrollWidth - 5;
    if (atEnd) {
      rightArrow.classList.add('hidden');
    } else {
      rightArrow.classList.remove('hidden');
    }
  };

  leftArrow.addEventListener('click', () => {
    tournamentTypesGrid.scrollBy({
      left: -scrollStep,
      behavior: 'smooth'
    });
    // Give a small delay before updating visibility to allow smooth scroll to complete
    setTimeout(updateArrowVisibility, 300);
  });

  rightArrow.addEventListener('click', () => {
    tournamentTypesGrid.scrollBy({
      left: scrollStep,
      behavior: 'smooth'
    });
    // Give a small delay before updating visibility to allow smooth scroll to complete
    setTimeout(updateArrowVisibility, 300);
  });

  // Update arrows on scroll (e.g., if user drags the scrollbar or uses touchpad)
  tournamentTypesGrid.addEventListener('scroll', updateArrowVisibility);

  // Initial update after rendering to set correct arrow visibility.
  // Use setTimeout to ensure the DOM has rendered and calculated scrollWidth/clientWidth correctly.
  setTimeout(updateArrowVisibility, 0);
  // --- END: Tournament Types Section ---


  // Meet The Team Section
  const teamSection = document.createElement('section');
  teamSection.className = 'content-section';

  const teamTitle = document.createElement('h2');
  teamTitle.className = 'section-title';
  teamTitle.textContent = 'MEET THE TEAM';
  teamSection.appendChild(teamTitle);

  const teamGrid = document.createElement('div');
  teamGrid.className = 'team-grid';

  const teamMembers = [
    { name: 'Developer 1', avatar: 'https://via.placeholder.com/100/00E6FF/FFFFFF?text=D1' }, // Placeholder
    { name: 'Developer 2', avatar: 'https://via.placeholder.com/100/FF00FF/FFFFFF?text=D2' },
    { name: 'Developer 3', avatar: 'https://via.placeholder.com/100/00E6FF/FFFFFF?text=D3' },
    { name: 'Developer 4', avatar: 'https://via.placeholder.com/100/FF00FF/FFFFFF?text=D4' }
  ];

  teamMembers.forEach(member => {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member-card';

    const avatar = document.createElement('img');
    avatar.src = member.avatar;
    avatar.alt = member.name;
    avatar.className = 'team-member-avatar';

    const name = document.createElement('p');
    name.className = 'team-member-name';
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

// Tournament Page (Placeholder)
function renderTournamentPage(): HTMLElement {
  const tournament = document.createElement('div');
  tournament.className = 'page content-section';

  const title = document.createElement('h1');
  title.className = 'section-title';
  title.textContent = 'Upcoming Tournaments';
  tournament.appendChild(title);

  const tournamentList = document.createElement('div');
  tournamentList.className = 'tournament-list';

  // Example tournament items
  const tournaments = [
    { name: 'Neon Cup 2025', status: 'Open', date: 'June 15, 2025', participants: 15, max: 32 },
    { name: 'Rookie Rumble', status: 'In Progress', date: 'July 1, 2025', participants: 8, max: 16 },
    { name: 'Master\'s Challenge', status: 'Completed', date: 'May 20, 2025', participants: 32, max: 32 }
  ];

  tournaments.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tournament-item';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';

    const h3 = document.createElement('h3');
    h3.textContent = t.name;
    header.appendChild(h3);

    const statusIndicator = document.createElement('span');
    statusIndicator.className = `status-indicator status-${t.status.toLowerCase().replace(' ', '-')}`;
    statusIndicator.title = `Status: ${t.status}`;
    header.appendChild(statusIndicator);

    item.appendChild(header);

    const pDate = document.createElement('p');
    pDate.textContent = `Date: ${t.date}`;
    item.appendChild(pDate);

    const pParticipants = document.createElement('p');
    pParticipants.textContent = `Participants: ${t.participants}/${t.max}`;
    item.appendChild(pParticipants);

    const joinButton = document.createElement('button');
    joinButton.className = 'primary-button';
    joinButton.textContent = t.status === 'Open' ? 'Join Tournament' : (t.status === 'In Progress' ? 'View Details' : 'Results');
    joinButton.disabled = t.status !== 'Open'; // Disable if not open

    if (t.status === 'Completed') {
        joinButton.classList.add('secondary-button'); // Style completed as secondary
        joinButton.classList.remove('primary-button');
    }

    joinButton.addEventListener('click', () => {
      if (t.status === 'Open') {
        showMessage(`You joined the ${t.name}!`, 'success');
        // Simulate joining by changing button text and status (in a real app, this would be backend)
        joinButton.textContent = 'Joined';
        joinButton.disabled = true;
        joinButton.classList.add('joined'); // Add a class for joined state styling
      } else {
        showMessage(`Viewing details for ${t.name}`, 'success');
        // Navigate to tournament details page
      }
    });
    item.appendChild(joinButton);

    tournamentList.appendChild(item);
  });

  tournament.appendChild(tournamentList);
  tournament.appendChild(createFooter()); // Add footer to the tournament page
  return tournament;
}


// Register Page
function renderRegisterPage(): HTMLElement {
  const register = document.createElement('div');
  register.className = 'page content-section';

  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const title = document.createElement('h2');
  title.className = 'form-title';
  title.textContent = 'Register for Neon Pong';
  formContainer.appendChild(title);

  const form = document.createElement('form');

  // Username
  const usernameLabel = document.createElement('label');
  usernameLabel.className = 'form-label';
  usernameLabel.htmlFor = 'username';
  usernameLabel.textContent = 'Username';
  form.appendChild(usernameLabel);

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.className = 'form-input';
  usernameInput.placeholder = 'Choose a unique username';
  usernameInput.required = true;
  form.appendChild(usernameInput);

  // Email
  const emailLabel = document.createElement('label');
  emailLabel.className = 'form-label';
  emailLabel.htmlFor = 'email';
  emailLabel.textContent = 'Email';
  form.appendChild(emailLabel);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.className = 'form-input';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;
  form.appendChild(emailInput);

  // Password
  const passwordLabel = document.createElement('label');
  passwordLabel.className = 'form-label';
  passwordLabel.htmlFor = 'password';
  passwordLabel.textContent = 'Password';
  form.appendChild(passwordLabel);

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.className = 'form-input';
  passwordInput.placeholder = 'Create a strong password';
  passwordInput.required = true;
  form.appendChild(passwordInput);

  // Confirm Password
  const confirmPasswordLabel = document.createElement('label');
  confirmPasswordLabel.className = 'form-label';
  confirmPasswordLabel.htmlFor = 'confirmPassword';
  confirmPasswordLabel.textContent = 'Confirm Password';
  form.appendChild(confirmPasswordLabel);

  const confirmPasswordInput = document.createElement('input');
  confirmPasswordInput.type = 'password';
  confirmPasswordInput.id = 'confirmPassword';
  confirmPasswordInput.className = 'form-input';
  confirmPasswordInput.placeholder = 'Re-enter your password';
  confirmPasswordInput.required = true;
  form.appendChild(confirmPasswordInput);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'primary-button';
  submitButton.textContent = 'Register Account';
  form.appendChild(submitButton);

  const backButton = document.createElement('button');
  backButton.type = 'button'; // Important: type="button" to prevent form submission
  backButton.className = 'secondary-button back-button';
  backButton.textContent = 'Back to Home';
  backButton.addEventListener('click', () => navigateTo('/'));
  form.appendChild(backButton);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();
    // Simulate API call
    setTimeout(() => {
      hideLoading();
      if (usernameInput.value && emailInput.value && passwordInput.value === confirmPasswordInput.value) {
        showMessage('Registration successful! Welcome to Neon Pong.', 'success');
        form.reset(); // Clear form
        navigateTo('/'); // Go back to home or a dashboard
      } else {
        showMessage('Registration failed. Please check your inputs, especially passwords.', 'error');
      }
    }, 1500); // Simulate network delay
  });

  formContainer.appendChild(form);
  register.appendChild(formContainer);
  register.appendChild(createFooter());
  return register;
}

// Router setup function
function setupRoutes(app: HTMLElement) {
  const path = window.location.pathname;

  // Clear existing content and active classes
  app.innerHTML = '';
  const existingNavbar = document.querySelector('.navbar');
  if (existingNavbar) existingNavbar.remove();

  app.appendChild(createNavbar()); // Add navbar to every page

  switch (path) {
    case '/':
      app.appendChild(renderHomePage());
      break;
    case '/tournament':
      app.appendChild(renderTournamentPage());
      break;
    case '/register':
      app.appendChild(renderRegisterPage());
      break;
    default:
      // Basic 404 page
      const notFound = document.createElement('div');
      notFound.className = 'page content-section';
      notFound.innerHTML = '<h1 class="section-title">404 - Page Not Found</h1><p style="text-align:center; color: var(--text-color-light);">The page you are looking for does not exist.</p>';
      const backHomeBtn = document.createElement('button');
      backHomeBtn.className = 'primary-button back-button';
      backHomeBtn.textContent = 'Go to Home';
      backHomeBtn.addEventListener('click', () => navigateTo('/'));
      notFound.appendChild(backHomeBtn);
      notFound.appendChild(createFooter());
      app.appendChild(notFound);
      break;
  }

  // Update active navbar link after page render
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    setupRoutes(app);
  }
});

// Handle browser history changes (back/forward buttons)
window.addEventListener('popstate', () => {
  const app = document.getElementById('app');
  if (app) {
    setupRoutes(app);
  }
});