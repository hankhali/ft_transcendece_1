import './style.css';
import { apiService, type Tournament, type User } from './api';

// DOM Elements
const appElement = document.querySelector<HTMLDivElement>('#app')!;

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
  
  const title = document.createElement('h1');
  title.textContent = 'Welcome to Pong Tournament';
  
  const description = document.createElement('p');
  description.textContent = 'Join the ultimate Pong experience!';
  
  // Welcome message for registered users
  if (state.user.alias) {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'welcome-message';
    welcomeMsg.textContent = `Welcome back, ${state.user.alias}!`;
    home.appendChild(welcomeMsg);
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  
  const registerBtn = document.createElement('button');
  registerBtn.className = 'primary-button';
  registerBtn.textContent = state.user.alias ? 'Update Profile' : 'Register Now';
  registerBtn.addEventListener('click', () => navigateTo('register'));
  
  const tournamentBtn = document.createElement('button');
  tournamentBtn.className = 'secondary-button';
  tournamentBtn.textContent = 'View Tournaments';
  tournamentBtn.addEventListener('click', () => navigateTo('tournament'));
  
  buttonContainer.appendChild(registerBtn);
  buttonContainer.appendChild(tournamentBtn);
  
  home.appendChild(title);
  home.appendChild(description);
  home.appendChild(buttonContainer);
  
  // Footer with version info
  const footer = document.createElement('footer');
  footer.innerHTML = '<p>ft_transcendence v1.0 | TypeScript SPA</p>';
  home.appendChild(footer);
  
  return home;
}

// Register Page
function renderRegisterPage(): HTMLElement {
  const register = document.createElement('div');
  register.className = 'page register-page';
  
  const title = document.createElement('h1');
  title.textContent = state.user.alias ? 'Update Your Profile' : 'Register for Tournament';
  
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
  
  const aliasLabel = document.createElement('label');
  aliasLabel.setAttribute('for', 'alias');
  aliasLabel.textContent = 'Your Alias:';
  
  const aliasInput = document.createElement('input');
  aliasInput.type = 'text';
  aliasInput.id = 'alias';
  aliasInput.className = 'form-input';
  aliasInput.required = true;
  aliasInput.minLength = 3;
  aliasInput.value = state.user.alias || '';
  aliasInput.placeholder = 'Enter your alias (min 3 characters)';
  
  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  formGroup.appendChild(aliasLabel);
  formGroup.appendChild(aliasInput);
  
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
  
  form.appendChild(formGroup);
  form.appendChild(buttonGroup);
  
  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.id = 'error-message';
  errorMsg.style.display = 'none';
  
  const successMsg = document.createElement('div');
  successMsg.className = 'success-message';
  successMsg.id = 'success-message';
  successMsg.style.display = 'none';
  
  // Loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = '<div class="spinner"></div><p>Processing...</p>';
  loadingIndicator.style.display = state.isLoading ? 'flex' : 'none';
  
  register.appendChild(title);
  register.appendChild(form);
  register.appendChild(errorMsg);
  register.appendChild(successMsg);
  register.appendChild(loadingIndicator);
  
  return register;
}

// Tournament Page
function renderTournamentPage(): HTMLElement {
  const tournament = document.createElement('div');
  tournament.className = 'page tournament-page';
  
  const header = document.createElement('header');
  header.className = 'page-header';
  
  const title = document.createElement('h1');
  title.textContent = 'Tournaments';
  
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'refresh-button';
  refreshBtn.innerHTML = '<span>↻</span> Refresh';
  refreshBtn.addEventListener('click', () => {
    loadTournaments(tournament);
  });
  
  header.appendChild(title);
  header.appendChild(refreshBtn);
  tournament.appendChild(header);
  
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<div class="spinner"></div><p>Loading tournaments...</p>';
  tournament.appendChild(loading);
  
  // Load tournaments (initial load)
  loadTournaments(tournament);
  
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
      errorDisplay.className = 'error-display';
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
    errorDisplay.className = 'error-display';
    errorDisplay.textContent = 'Failed to load tournaments. Please try again.';
    container.appendChild(errorDisplay);
  }
  
  // Add back button
  const existingBackBtn = container.querySelector('.back-button');
  if (!existingBackBtn) {
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button secondary-button';
    backBtn.textContent = 'Back to Home';
    backBtn.addEventListener('click', () => navigateTo('home'));
    container.appendChild(backBtn);
  }
}

// Render tournament list
function renderTournamentList(container: HTMLElement, tournaments: Tournament[]): void {
  const tournamentList = document.createElement('div');
  tournamentList.className = 'tournament-list';
  
  tournaments.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tournament-item';
    
    const name = document.createElement('h3');
    name.textContent = t.name;
    
    const details = document.createElement('p');
    details.textContent = `Players: ${t.players} | Status: ${t.status}`;
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = `status-indicator status-${t.status.toLowerCase().replace(' ', '-')}`;
    
    const joinBtn = document.createElement('button');
    joinBtn.className = 'join-button';
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
            joinBtn.className = 'join-button joined';
            showSuccess('Successfully joined tournament!');
          }
        } catch (error) {
          joinBtn.textContent = 'Try Again';
          joinBtn.disabled = false;
          showError('Failed to join tournament');
        }
      });
    }
    
    const header = document.createElement('div');
    header.className = 'tournament-header';
    header.appendChild(name);
    header.appendChild(statusIndicator);
    
    item.appendChild(header);
    item.appendChild(details);
    item.appendChild(joinBtn);
    
    tournamentList.appendChild(item);
  });
  
  container.appendChild(tournamentList);
}

// Helper functions
function showError(message: string): void {
  state.error = message;
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
      state.error = null;
    }, 3000);
  }
}

function showSuccess(message: string): void {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }
}

// Main render function
function renderApp(): void {
  // Clear the app container
  while (appElement.firstChild) {
    appElement.removeChild(appElement.firstChild);
  }
  
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
