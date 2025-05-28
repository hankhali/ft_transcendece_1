import './style.css';
import { apiService, type Tournament, type User } from './api';

// DOM Elements
const appElement = document.querySelector<HTMLDivElement>('#app')!;

// Create navigation bar
function createNavbar(): HTMLElement {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  // Logo
  const logo = document.createElement('a');
  logo.href = '#';
  logo.className = 'navbar-logo';
  logo.innerHTML = '<span>ft_transcendence</span>';
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });
  
  // Navigation links
  const navLinks = document.createElement('div');
  navLinks.className = 'navbar-links';
  
  const homeLink = document.createElement('a');
  homeLink.href = '#home';
  homeLink.className = 'navbar-link';
  homeLink.textContent = 'Home';
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });
  
  const registerLink = document.createElement('a');
  registerLink.href = '#register';
  registerLink.className = 'navbar-link';
  registerLink.textContent = 'Register';
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('register');
  });
  
  const tournamentLink = document.createElement('a');
  tournamentLink.href = '#tournament';
  tournamentLink.className = 'navbar-link';
  tournamentLink.textContent = 'Tournament';
  tournamentLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('tournament');
  });
  
  navLinks.appendChild(homeLink);
  navLinks.appendChild(registerLink);
  navLinks.appendChild(tournamentLink);
  
  navbar.appendChild(logo);
  navbar.appendChild(navLinks);
  
  return navbar;
}

// Create footer
function createFooter(): HTMLElement {
  const footer = document.createElement('footer');
  const footerText = document.createElement('p');
  footerText.innerHTML = 'Team ft_transcendence';
  footer.appendChild(footerText);
  return footer;
}

// Application state
interface AppState {
  currentPage: string;
  user: {
    alias: string | null;
    id?: number;
  };
  isLoading: boolean;
  error: string | null;
}

const state: AppState = {
  currentPage: 'home',
  user: {
    alias: null
  },
  isLoading: false,
  error: null
};

// Router
const routes = {
  home: renderHomePage,
  register: renderRegisterPage,
  tournament: renderTournamentPage
};

// Navigation
function navigateTo(page: string): void {
  // Update active link in navbar
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent?.toLowerCase() === page) {
      link.classList.add('active');
    }
  });
  
  state.currentPage = page;
  window.history.pushState({ page }, '', `#${page}`);
  renderApp();
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
  if (event.state?.page) {
    state.currentPage = event.state.page;
    renderApp();
  }
});

// Home Page
function renderHomePage(): HTMLElement {
  const home = document.createElement('div');
  home.className = 'page home-page';
  
  // Hero Section
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';
  
  const heroTitle = document.createElement('h1');
  heroTitle.className = 'hero-title';
  heroTitle.textContent = 'Welcome to Pong Tournament';
  
  const heroSubtitle = document.createElement('p');
  heroSubtitle.className = 'hero-subtitle';
  heroSubtitle.textContent = 'Join the ultimate Pong experience and compete with players from around the world!';
  
  const heroCta = document.createElement('div');
  heroCta.className = 'hero-cta';
  
  // Welcome message for registered users
  if (state.user.alias) {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'welcome-message';
    welcomeMsg.textContent = `Welcome back, ${state.user.alias}!`;
    heroSection.appendChild(welcomeMsg);
  }
  
  const registerBtn = document.createElement('button');
  registerBtn.className = 'primary-button';
  registerBtn.textContent = state.user.alias ? 'Update Profile' : 'Register Now';
  registerBtn.addEventListener('click', () => navigateTo('register'));
  
  const tournamentBtn = document.createElement('button');
  tournamentBtn.className = 'secondary-button';
  tournamentBtn.textContent = 'View Tournaments';
  tournamentBtn.addEventListener('click', () => navigateTo('tournament'));
  
  heroCta.appendChild(registerBtn);
  heroCta.appendChild(tournamentBtn);
  
  heroSection.appendChild(heroTitle);
  heroSection.appendChild(heroSubtitle);
  heroSection.appendChild(heroCta);
  
  home.appendChild(heroSection);
  
  // Content Section with Features
  const contentSection = document.createElement('section');
  contentSection.className = 'content-section';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'section-title';
  sectionTitle.textContent = 'Tournament Features';
  contentSection.appendChild(sectionTitle);
  
  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';
  
  // Feature cards
  const features = [
    {
      title: 'Real-time Matches',
      content: 'Experience the thrill of real-time Pong matches with players from around the world.'
    },
    {
      title: 'Tournament Rankings',
      content: 'Climb the leaderboard and establish yourself as a top Pong player.'
    },
    {
      title: 'Custom Tournaments',
      content: 'Create and join custom tournaments with friends or the community.'
    }
  ];
  
  features.forEach(feature => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = feature.title;
    
    const cardContent = document.createElement('p');
    cardContent.className = 'card-content';
    cardContent.textContent = feature.content;
    
    card.appendChild(cardTitle);
    card.appendChild(cardContent);
    
    cardContainer.appendChild(card);
  });
  
  contentSection.appendChild(cardContainer);
  home.appendChild(contentSection);
  
  // Add footer
  home.appendChild(createFooter());
  
  return home;
}

// Register Page
function renderRegisterPage(): HTMLElement {
  const register = document.createElement('div');
  register.className = 'page register-page';
  
  // Content Section
  const contentSection = document.createElement('section');
  contentSection.className = 'content-section';
  
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'section-title';
  sectionTitle.textContent = state.user.alias ? 'Update Your Profile' : 'Register for Tournament';
  contentSection.appendChild(sectionTitle);
  
  // Form Container
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';
  
  const form = document.createElement('form');
  form.className = 'register-form';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aliasInput = document.getElementById('alias') as HTMLInputElement;
    const alias = aliasInput.value.trim();
    
    // Form validation
    if (alias.length < 3) {
      showError('Alias must be at least 3 characters');
      return;
    }
    
    // Show loading state
    state.isLoading = true;
    renderApp();
    
    try {
      // Call API service
      const response = await apiService.users.register(alias);
      
      if (response.error) {
        showError(response.error);
        return;
      }
      
      if (response.data) {
        // Save to state
        state.user.alias = response.data.alias;
        state.user.id = response.data.id;
        showSuccess('Registration successful!');
        
        // Navigate to home after delay
        setTimeout(() => navigateTo('home'), 1500);
      }
    } catch (error) {
      showError('An unexpected error occurred');
    } finally {
      state.isLoading = false;
      renderApp();
    }
  });
  
  // Form Group
  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  
  const aliasLabel = document.createElement('label');
  aliasLabel.setAttribute('for', 'alias');
  aliasLabel.className = 'form-label';
  aliasLabel.textContent = 'Your Alias:';
  
  const aliasInput = document.createElement('input');
  aliasInput.type = 'text';
  aliasInput.id = 'alias';
  aliasInput.className = 'form-input';
  aliasInput.required = true;
  aliasInput.minLength = 3;
  aliasInput.value = state.user.alias || '';
  aliasInput.placeholder = 'Enter your alias (min 3 characters)';
  
  formGroup.appendChild(aliasLabel);
  formGroup.appendChild(aliasInput);
  form.appendChild(formGroup);
  
  // Button Group
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'primary-button';
  submitBtn.textContent = state.user.alias ? 'Update' : 'Register';
  submitBtn.disabled = state.isLoading;
  
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'secondary-button';
  backBtn.textContent = 'Back to Home';
  backBtn.addEventListener('click', () => navigateTo('home'));
  
  buttonGroup.appendChild(submitBtn);
  buttonGroup.appendChild(backBtn);
  form.appendChild(buttonGroup);
  
  formContainer.appendChild(form);
  contentSection.appendChild(formContainer);
  
  // Error and Success Messages
  const errorMsg = document.createElement('div');
  errorMsg.className = 'message error-message';
  errorMsg.id = 'error-message';
  errorMsg.style.display = 'none';
  contentSection.appendChild(errorMsg);
  
  const successMsg = document.createElement('div');
  successMsg.className = 'message success-message';
  successMsg.id = 'success-message';
  successMsg.style.display = 'none';
  contentSection.appendChild(successMsg);
  
  // Loading Indicator
  if (state.isLoading) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Processing...';
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingText);
    
    register.appendChild(loadingOverlay);
  }
  
  register.appendChild(contentSection);
  register.appendChild(createFooter());
  
  return register;
}

// Tournament Page
function renderTournamentPage(): HTMLElement {
  const tournament = document.createElement('div');
  tournament.className = 'page tournament-page';
  
  // Content Section
  const contentSection = document.createElement('section');
  contentSection.className = 'content-section';
  
  // Header with title and refresh button
  const header = document.createElement('div');
  header.className = 'page-header';
  
  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = 'Tournaments';
  
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'secondary-button refresh-button';
  refreshBtn.innerHTML = '<span>↻</span> Refresh';
  refreshBtn.addEventListener('click', () => {
    loadTournaments(contentSection);
  });
  
  header.appendChild(title);
  header.appendChild(refreshBtn);
  contentSection.appendChild(header);
  
  // Loading indicator
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.style.marginTop = '1rem';
  loading.innerHTML = '<div class="spinner"></div><p>Loading tournaments...</p>';
  contentSection.appendChild(loading);
  
  // Load tournaments (initial load)
  loadTournaments(contentSection);
  
  tournament.appendChild(contentSection);
  tournament.appendChild(createFooter());
  
  return tournament;
}

// Load tournaments with API integration
async function loadTournaments(container: HTMLElement): Promise<void> {
  // Clear previous tournament list if exists
  const existingList = container.querySelector('.tournament-list');
  if (existingList) {
    container.removeChild(existingList);
  }
  
  // Show loading
  const loading = container.querySelector('.loading') as HTMLElement;
  if (loading) {
    loading.style.display = 'flex';
  }
  
  try {
    // Call API service
    const response = await apiService.tournaments.getAll();
    
    if (loading) {
      loading.style.display = 'none';
    }
    
    if (response.error) {
      const errorDisplay = document.createElement('div');
      errorDisplay.className = 'message error-message';
      errorDisplay.textContent = `Error loading tournaments: ${response.error}`;
      container.appendChild(errorDisplay);
      return;
    }
    
    if (!response.data || response.data.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No tournaments available at this time.';
      container.appendChild(emptyState);
      return;
    }
    
    // Create tournament list
    renderTournamentList(container, response.data);
    
  } catch (error) {
    if (loading) {
      loading.style.display = 'none';
    }
    
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'message error-message';
    errorDisplay.textContent = 'Failed to load tournaments. Please try again.';
    container.appendChild(errorDisplay);
  }
}

// Render tournament list
function renderTournamentList(container: HTMLElement, tournaments: Tournament[]): void {
  const tournamentList = document.createElement('div');
  tournamentList.className = 'tournament-list';
  
  tournaments.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tournament-item';
    
    const header = document.createElement('div');
    header.className = 'tournament-header';
    
    const name = document.createElement('h3');
    name.textContent = t.name;
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = `status-indicator status-${t.status.toLowerCase().replace(' ', '-')}`;
    
    header.appendChild(name);
    header.appendChild(statusIndicator);
    
    const details = document.createElement('p');
    details.textContent = `Players: ${t.players} | Status: ${t.status}`;
    
    const joinBtn = document.createElement('button');
    joinBtn.className = t.status === 'Open' ? 'primary-button join-button' : 'secondary-button join-button';
    joinBtn.textContent = 'Join Tournament';
    joinBtn.disabled = t.status !== 'Open';
    
    if (t.status === 'Open') {
      joinBtn.addEventListener('click', async () => {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining...';
        
        try {
          const response = await apiService.tournaments.join(t.id);
          
          if (response.error) {
            showError(response.error);
            joinBtn.textContent = 'Try Again';
            joinBtn.disabled = false;
            return;
          }
          
          if (response.data && response.data.success) {
            joinBtn.textContent = 'Joined';
            joinBtn.className = 'primary-button join-button joined';
            showSuccess('Successfully joined tournament!');
          }
        } catch (error) {
          joinBtn.textContent = 'Try Again';
          joinBtn.disabled = false;
          showError('Failed to join tournament');
        }
      });
    }
    
    item.appendChild(header);
    item.appendChild(details);
    item.appendChild(joinBtn);
    
    tournamentList.appendChild(item);
  });
  
  container.appendChild(tournamentList);
  
  // Add back button if not exists
  const existingBackBtn = container.querySelector('.back-button');
  if (!existingBackBtn) {
    const backBtn = document.createElement('button');
    backBtn.className = 'secondary-button';
    backBtn.textContent = 'Back to Home';
    backBtn.addEventListener('click', () => navigateTo('home'));
    container.appendChild(backBtn);
  }
}

// Helper functions
function showError(message: string): void {
  state.error = message;
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      errorElement.style.display = 'none';
      state.error = null;
    });
    
    errorElement.appendChild(closeBtn);
    
    setTimeout(() => {
      errorElement.style.display = 'none';
      state.error = null;
    }, 5000);
  }
}

function showSuccess(message: string): void {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      successElement.style.display = 'none';
    });
    
    successElement.appendChild(closeBtn);
    
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
  }
}

// Main render function
function renderApp(): void {
  // Clear the app container
  while (appElement.firstChild) {
    appElement.removeChild(appElement.firstChild);
  }
  
  // Add navbar
  appElement.appendChild(createNavbar());
  
  // Update active link in navbar
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent?.toLowerCase() === state.currentPage) {
      link.classList.add('active');
    }
  });
  
  // Get the current route renderer
  const renderer = routes[state.currentPage as keyof typeof routes];
  
  if (renderer) {
    const pageElement = renderer();
    appElement.appendChild(pageElement);
  } else {
    // Fallback to home if route not found
    state.currentPage = 'home';
    appElement.appendChild(renderHomePage());
  }
}

// Initialize the app
function initApp(): void {
  // Check for hash in URL
  const hash = window.location.hash.substring(1);
  if (hash && Object.keys(routes).includes(hash)) {
    state.currentPage = hash;
  }
  
  // Add app version class for styling
  document.body.classList.add('app-v1');
  
  renderApp();
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
