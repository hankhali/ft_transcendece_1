import './style.css'; // Ensure your CSS is imported

// Global variables for message display and voice control
let messageTimeout: number | null = null;

// Speech Recognition API setup
let SpeechRecognition: typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition | null = null;
let recognition: SpeechRecognition | null = null;
let isVoiceControlActive = false;

// Check for Web Speech API support
if ('SpeechRecognition' in window) {
  SpeechRecognition = window.SpeechRecognition;
} else if ('webkitSpeechRecognition' in window) {
  SpeechRecognition = window.webkitSpeechRecognition;
}

// Utility function to navigate between pages
function navigateTo(path: string) {
  history.pushState(null, '', path);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = ''; // Clear current page
    setupRoutes(app); // Render new page based on route
    // Announce page change for screen readers
    document.title = getPageTitle(path); // Update document title
    const liveRegion = document.getElementById('screen-reader-live-region');
    if (liveRegion) {
        liveRegion.textContent = ''; // Clear first to ensure re-announcement
        liveRegion.textContent = `Mapsd to ${document.title}.`;
    }
    window.scrollTo(0, 0); // Scroll to top on navigation
  }
}

// Helper to get page title based on path
function getPageTitle(path: string): string {
    switch (path) {
        case '/': return 'Home - Neon Pong';
        case '/tournament': return 'Tournaments - Neon Pong';
        case '/register': return 'Register - Neon Pong';
        default: return 'Page Not Found - Neon Pong';
    }
}

// Function to create a generic loading overlay
function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'assertive');

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  overlay.appendChild(spinner);

  const loadingText = document.createElement('p');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Loading...';
  loadingText.setAttribute('aria-label', 'Content is loading');

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
  messageDiv.setAttribute('role', 'status');
  messageDiv.setAttribute('aria-live', 'polite');
  messageDiv.setAttribute('aria-atomic', 'true');

  document.body.appendChild(messageDiv); // Append to the body instead of app

  messageTimeout = setTimeout(() => {
    messageDiv.classList.add('hidden');
    setTimeout(() => messageDiv.remove(), 500);
  }, 5000);
}

// --- Component Functions (for different pages/sections) ---

// Navbar Component
function createNavbar(): HTMLElement {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.setAttribute('aria-label', 'Main navigation');

  const logo = document.createElement('a');
  logo.className = 'navbar-logo';
  logo.textContent = 'Neon Pong';
  logo.href = '/';
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

  navbar.appendChild(logo);
  navbar.appendChild(navLinks);

  // Add voice control button
  const voiceControlBtn = document.createElement('button');
  voiceControlBtn.className = 'voice-control-button';
  voiceControlBtn.textContent = 'Start Voice';
  voiceControlBtn.title = 'Toggle Voice Control';
  if (SpeechRecognition) {
      voiceControlBtn.addEventListener('click', toggleVoiceControl);
  } else {
      voiceControlBtn.disabled = true;
      voiceControlBtn.textContent = 'Voice Not Supported';
      voiceControlBtn.title = 'Your browser does not support Web Speech API.';
  }
  navLinks.appendChild(voiceControlBtn);


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
  home.setAttribute('role', 'main');

  // Hero Section
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';

  const heroTitle = document.createElement('h1');
  heroTitle.className = 'hero-title';
  heroTitle.innerHTML = 'NEON PONG';

  const heroSubtitle = document.createElement('p');
  heroSubtitle.className = 'hero-subtitle';
  heroSubtitle.textContent = 'THE ULTIMATE RETRO-FUTURISTIC ARCADE EXPERIENCE.';

  const heroDescription = document.createElement('p');
  heroDescription.className = 'hero-description';
  heroDescription.textContent = 'Challenge your friends in a fast-paced game of skill and reflexes.';

  const heroCreatorInfo = document.createElement('p');
  heroCreatorInfo.className = 'hero-description';
  heroCreatorInfo.textContent = 'Created by Four Innovative Minds - Your Next-Level Pong Experience';

  const heroCta = document.createElement('div');
  heroCta.className = 'hero-cta';

  const playNowBtn = document.createElement('button');
  playNowBtn.className = 'primary-button';
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
  paddleImage.alt = 'Stylized neon ping pong paddle';
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
  tournamentTypesGrid.setAttribute('role', 'group');
  tournamentTypesGrid.setAttribute('aria-label', 'List of tournament types you can play');


  const tournamentTypes = [
    { icon: '&#x1F3C6;', title: 'Single Elimination', description: 'Classic knockout style, one loss and you\'re out!' },
    { icon: '&#x2694;&#xFE0F;', title: 'Round Robin', description: 'Everyone plays everyone, test all your skills.' },
    { icon: '&#x1F3AE;', title: 'Team Battles', description: 'Compete with your squad, for ultimate glory.' },
    { icon: '&#x1F4BA;', title: 'Custom Rules', description: 'Unique formats and challenges, designed by the community.' },
    { icon: '&#x1F3D3;', title: 'Arcade Mode', description: 'Fast-paced, high-score challenges!' },
    { icon: '&#x1F389;', title: 'Seasonal Events', description: 'Special limited-time tournaments with unique rewards!' }
  ];

  tournamentTypes.forEach(type => {
    const typeCard = document.createElement('div');
    typeCard.className = 'tournament-type-card';
    typeCard.innerHTML = `
      <span class="tournament-type-icon" aria-hidden="true">${type.icon}</span>
      <h3>${type.title}</h3>
      <p>${type.description}</p>
    `;
    typeCard.addEventListener('click', () => navigateTo('tournament'));
    tournamentTypesGrid.appendChild(typeCard);
  });

  // Create Navigation Arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-navigation left';
  leftArrow.innerHTML = '&lsaquo;';
  leftArrow.setAttribute('aria-label', 'Scroll left to view previous tournament types');

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-navigation right';
  rightArrow.innerHTML = '&rsaquo;';
  rightArrow.setAttribute('aria-label', 'Scroll right to view next tournament types');

  tournamentCarouselContainer.appendChild(leftArrow);
  tournamentCarouselContainer.appendChild(tournamentTypesGrid);
  tournamentCarouselContainer.appendChild(rightArrow);

  tournamentTypesSection.appendChild(tournamentCarouselContainer);
  home.appendChild(tournamentTypesSection);

  // --- Carousel Logic (Event Listeners and Visibility) ---
  const scrollStep = 340;

  const updateArrowVisibility = () => {
    if (tournamentTypesGrid.scrollLeft <= 5) {
      leftArrow.classList.add('hidden');
    } else {
      leftArrow.classList.remove('hidden');
    }

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
    setTimeout(updateArrowVisibility, 300);
  });

  rightArrow.addEventListener('click', () => {
    tournamentTypesGrid.scrollBy({
      left: scrollStep,
      behavior: 'smooth'
    });
    setTimeout(updateArrowVisibility, 300);
  });

  tournamentTypesGrid.addEventListener('scroll', updateArrowVisibility);
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
    { name: 'Hanieh', avatar: 'pic1.png' },
    { name: 'Reem', avatar: 'pic2.png' },
    { name: 'Mira', avatar: 'pic3.png' },
    { name: 'Omniat', avatar: 'pic4.png' }
  ];

  teamMembers.forEach(member => {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member-card';

    const avatar = document.createElement('img');
    avatar.src = member.avatar;
    avatar.alt = `Avatar of ${member.name}`;
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

// Tournament Page
function renderTournamentPage(): HTMLElement {
  const tournament = document.createElement('div');
  tournament.className = 'page content-section';
  tournament.setAttribute('role', 'main');

  const title = document.createElement('h1');
  title.className = 'section-title';
  title.textContent = 'Upcoming Tournaments';
  tournament.appendChild(title);

  const tournamentList = document.createElement('div');
  tournamentList.className = 'tournament-list';
  tournamentList.setAttribute('role', 'list');

  // Example tournament items
  const tournaments = [
    { name: 'Neon Cup 2025', status: 'Open', date: 'June 15, 2025', participants: 15, max: 32 },
    { name: 'Rookie Rumble', status: 'In Progress', date: 'July 1, 2025', participants: 8, max: 16 },
    { name: 'Master\'s Challenge', status: 'Completed', date: 'May 20, 2025', participants: 32, max: 32 }
  ];

  tournaments.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tournament-item';
    item.setAttribute('role', 'listitem');

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
    statusIndicator.textContent = ` (${t.status})`;
    statusIndicator.setAttribute('aria-live', 'polite');
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
    joinButton.disabled = t.status !== 'Open';
    joinButton.setAttribute('aria-disabled', t.status !== 'Open' ? 'true' : 'false');


    if (t.status === 'Completed') {
        joinButton.classList.add('secondary-button');
        joinButton.classList.remove('primary-button');
    }

    joinButton.addEventListener('click', () => {
      if (t.status === 'Open') {
        showMessage(`You joined the ${t.name}!`, 'success');
        joinButton.textContent = 'Joined';
        joinButton.disabled = true;
        joinButton.setAttribute('aria-disabled', 'true');
        joinButton.classList.add('joined');
      } else {
        showMessage(`Viewing details for ${t.name}`, 'success');
      }
    });
    item.appendChild(joinButton);

    tournamentList.appendChild(item);
  });

  tournament.appendChild(tournamentList);
  tournament.appendChild(createFooter());
  return tournament;
}


// Register Page
function renderRegisterPage(): HTMLElement {
  const register = document.createElement('div');
  register.className = 'page content-section';
  register.setAttribute('role', 'main');

  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const title = document.createElement('h2');
  title.className = 'form-title';
  title.id = 'register-form-title';
  title.textContent = 'Register for Neon Pong';
  formContainer.appendChild(title);

  const form = document.createElement('form');
  form.setAttribute('aria-labelledby', 'register-form-title');

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
  usernameInput.setAttribute('aria-describedby', 'username-error');
  form.appendChild(usernameInput);
  const usernameError = document.createElement('span');
  usernameError.id = 'username-error';
  usernameError.className = 'form-error';
  usernameError.setAttribute('aria-live', 'polite');
  usernameError.setAttribute('role', 'alert');
  form.appendChild(usernameError);

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
  emailInput.setAttribute('aria-describedby', 'email-error');
  form.appendChild(emailInput);
  const emailError = document.createElement('span');
  emailError.id = 'email-error';
  emailError.className = 'form-error';
  emailError.setAttribute('aria-live', 'polite');
  emailError.setAttribute('role', 'alert');
  form.appendChild(emailError);

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
  passwordInput.setAttribute('aria-describedby', 'password-error');
  form.appendChild(passwordInput);
  const passwordError = document.createElement('span');
  passwordError.id = 'password-error';
  passwordError.className = 'form-error';
  passwordError.setAttribute('aria-live', 'polite');
  passwordError.setAttribute('role', 'alert');
  form.appendChild(passwordError);

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
  confirmPasswordInput.setAttribute('aria-describedby', 'confirm-password-error');
  form.appendChild(confirmPasswordInput);
  const confirmPasswordError = document.createElement('span');
  confirmPasswordError.id = 'confirm-password-error';
  confirmPasswordError.className = 'form-error';
  confirmPasswordError.setAttribute('aria-live', 'polite');
  confirmPasswordError.setAttribute('role', 'alert');
  form.appendChild(confirmPasswordError);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'primary-button';
  submitButton.textContent = 'Register Account';
  form.appendChild(submitButton);

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'secondary-button back-button';
  backButton.textContent = 'Back to Home';
  backButton.addEventListener('click', () => navigateTo('/'));
  form.appendChild(backButton);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    usernameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';

    let isValid = true;

    if (!usernameInput.value) {
        usernameError.textContent = 'Username is required.';
        usernameInput.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        usernameInput.removeAttribute('aria-invalid');
    }
    if (!emailInput.value || !/\S+@\S+\.\S+/.test(emailInput.value)) {
        emailError.textContent = 'A valid email is required.';
        emailInput.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        emailInput.removeAttribute('aria-invalid');
    }
    if (!passwordInput.value || passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        passwordInput.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        passwordInput.removeAttribute('aria-invalid');
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match.';
        confirmPasswordInput.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        confirmPasswordInput.removeAttribute('aria-invalid');
    }

    if (!isValid) {
        showMessage('Please correct the errors in the form.', 'error');
        const firstInvalid = form.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }

    showLoading();
    setTimeout(() => {
      hideLoading();
      showMessage('Registration successful! Welcome to Neon Pong.', 'success');
      form.reset();
      navigateTo('/');
    }, 1500);
  });

  formContainer.appendChild(form);
  register.appendChild(formContainer);
  register.appendChild(createFooter());
  return register;
}

// Voice Control Functions
function setupVoiceControl() {
    if (!SpeechRecognition) {
        console.warn("Web Speech API not supported in this browser.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'en-US'; // Set language

    recognition.onstart = () => {
        isVoiceControlActive = true;
        const voiceButton = document.querySelector('.voice-control-button');
        if (voiceButton) {
            voiceButton.textContent = 'Voice ON';
            voiceButton.classList.add('active-voice');
        }
        showMessage('Voice control started. Listening for commands...', 'success');
        console.log('Voice control started. Listening...');
    };

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        console.log('Voice command received:', command);
        processVoiceCommand(command);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showMessage(`Voice control error: ${event.error}. Please ensure microphone access.`, 'error');
        const voiceButton = document.querySelector('.voice-control-button');
        if (voiceButton) {
            voiceButton.textContent = 'Start Voice';
            voiceButton.classList.remove('active-voice');
        }
        isVoiceControlActive = false;
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        const voiceButton = document.querySelector('.voice-control-button');
        if (voiceButton && isVoiceControlActive) { // If it ended but we still want it active, restart
            recognition?.start();
        } else if (voiceButton) { // If intentionally stopped
             voiceButton.textContent = 'Start Voice';
             voiceButton.classList.remove('active-voice');
             showMessage('Voice control stopped.', 'success');
        }
    };
}

function processVoiceCommand(command: string) {
    if (command.includes('go home') || command.includes('home')) {
        navigateTo('/');
        showMessage('Navigating to Home page.', 'success');
    } else if (command.includes('go to tournaments') || command.includes('tournaments') || command.includes('play now') || command.includes('start game')) {
        navigateTo('/tournament');
        showMessage('Navigating to Tournaments page.', 'success');
    } else if (command.includes('register') || command.includes('go to register')) {
        navigateTo('/register');
        showMessage('Navigating to Register page.', 'success');
    } else {
        showMessage(`Unrecognized command: "${command}". Try "Go Home" or "Tournaments".`, 'error');
    }
}

function toggleVoiceControl() {
    if (!recognition) {
        showMessage('Voice control not initialized or supported.', 'error');
        return;
    }

    if (isVoiceControlActive) {
        recognition.stop();
        isVoiceControlActive = false;
    } else {
        try {
            recognition.start();
        } catch (e: any) {
            // Catch errors if recognition is already active or other issues
            if (e.message.includes('already started')) {
                showMessage('Voice control is already active.', 'error');
            } else {
                showMessage(`Could not start voice control: ${e.message}.`, 'error');
                console.error("Error starting recognition:", e);
            }
        }
    }
}


// Router setup function
function setupRoutes(app: HTMLElement) {
  const path = window.location.pathname;

  app.innerHTML = ''; // This clears everything inside #app, including previous navbar

  // Prepend navbar to app, so it's always at the top and handled by app's structure
  const navbar = createNavbar();
  app.appendChild(navbar);

  // Create a live region for screen reader announcements.
  let liveRegion = document.getElementById('screen-reader-live-region');
  if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'hidden-visually';
      document.body.appendChild(liveRegion); // Append to body to ensure it's always available
  }


  // Define route mapping
  const routes: { [key: string]: () => HTMLElement } = {
    '/': renderHomePage,
    '/tournament': renderTournamentPage,
    '/register': renderRegisterPage,
  };

  const renderFunction = routes[path];

  if (renderFunction) {
      app.appendChild(renderFunction());
      document.title = getPageTitle(path);
  } else {
      const notFound = document.createElement('div');
      notFound.className = 'page content-section';
      notFound.setAttribute('role', 'main');
      notFound.innerHTML = '<h1 class="section-title">404 - Page Not Found</h1><p style="text-align:center; color: var(--text-color-light);">The page you are looking for does not exist.</p>';
      const backHomeBtn = document.createElement('button');
      backHomeBtn.className = 'primary-button back-button';
      backHomeBtn.textContent = 'Go to Home';
      backHomeBtn.addEventListener('click', () => navigateTo('/'));
      notFound.appendChild(backHomeBtn);
      notFound.appendChild(createFooter());
      app.appendChild(notFound);
      document.title = '404 - Page Not Found - Neon Pong';
  }

  // Update active navbar link after page render
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === window.location.pathname) {
      link.classList.add('active');
    }
  });
}

// Initial page load and setup voice control
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    setupRoutes(app);
    setupVoiceControl(); // Initialize voice control when DOM is ready
  }
});

// Handle browser history changes (back/forward buttons)
window.addEventListener('popstate', () => {
  const app = document.getElementById('app');
  if (app) {
    setupRoutes(app);
  }
});