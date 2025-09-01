// Profile setup page implementation in vanilla TypeScript

interface GameHistory {
  id: number;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  date: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const profileForm = document.getElementById('profileForm') as HTMLFormElement;
  const avatarInput = document.getElementById('avatarInput') as HTMLInputElement;
  const avatarPreview = document.getElementById('avatarPreview') as HTMLDivElement;
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const displayNameInput = document.getElementById('displayName') as HTMLInputElement;
  const skillLevels = document.querySelectorAll('.skill-option');
  const preferenceCheckboxes = document.querySelectorAll('.preference-checkbox');
  const bioInput = document.getElementById('bio') as HTMLTextAreaElement;
  const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
  const advancedSettings = document.getElementById('advancedSettings');
  const toggleHistoryBtn = document.getElementById('toggleHistory');
  const historySection = document.getElementById('historySection');
  const passwordForm = document.getElementById('passwordForm') as HTMLFormElement;
  const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement;
  const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
  const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
  const gameHistoryTable = document.getElementById('gameHistoryTable') as HTMLTableElement;
  const achievementsContainer = document.getElementById('achievementsContainer');

  // State
  let selectedSkill = 'intermediate';
  const preferences = {
    tournaments: true,
    ranked: false,
    casual: true,
    spectate: false,
  };

  // Sample data
  const gameHistory: GameHistory[] = [
    { id: 1, opponent: 'Player1', result: 'win', score: '10-5', date: '2023-05-15' },
    { id: 2, opponent: 'Player2', result: 'loss', score: '7-10', date: '2023-05-14' },
    { id: 3, opponent: 'Player3', result: 'win', score: '10-8', date: '2023-05-13' },
  ];

  const achievements: Achievement[] = [
    { id: 1, title: 'First Win', description: 'Win your first game', unlocked: true, icon: '🏆' },
    { id: 2, title: 'Pong Master', description: 'Win 10 games', unlocked: false, icon: '🎯' },
    { id: 3, title: 'Undefeated', description: 'Win 5 games in a row', unlocked: false, icon: '🔥' },
    { id: 4, title: 'Social Butterfly', description: 'Play with 5 different opponents', unlocked: true, icon: '🦋' },
  ];

  // Initialize the page
  function init() {
    setupEventListeners();
    renderGameHistory();
    renderAchievements();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Avatar upload
    if (avatarInput) {
      avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // Skill level selection
    skillLevels.forEach(level => {
      level.addEventListener('click', handleSkillSelect);
    });

    // Preference checkboxes
    preferenceCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', handlePreferenceChange);
    });

    // Toggle advanced settings
    if (toggleAdvancedBtn && advancedSettings) {
      toggleAdvancedBtn.addEventListener('click', () => {
        const isHidden = advancedSettings.classList.toggle('hidden');
        toggleAdvancedBtn.innerHTML = isHidden ? '▶ Advanced Settings' : '▼ Advanced Settings';
      });
    }

    // Toggle history section
    if (toggleHistoryBtn && historySection) {
      toggleHistoryBtn.addEventListener('click', () => {
        const isHidden = historySection.classList.toggle('hidden');
        toggleHistoryBtn.innerHTML = isHidden 
          ? '▶ Game History & Achievements' 
          : '▼ Game History & Achievements';
      });
    }

    // Profile form submission
    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Password form submission
    if (passwordForm) {
      passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
  }

  // Handle avatar upload
  function handleAvatarUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && avatarPreview) {
          avatarPreview.style.backgroundImage = `url(${e.target.result})`;
          avatarPreview.textContent = '';
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle skill level selection
  function handleSkillSelect(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const level = target.getAttribute('data-level');
    
    if (level) {
      selectedSkill = level;
      skillLevels.forEach(el => el.classList.remove('selected'));
      target.classList.add('selected');
    }
  }

  // Handle preference change
  function handlePreferenceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const pref = target.id as keyof typeof preferences;
    
    if (pref in preferences) {
      preferences[pref] = target.checked;
    }
  }

  // Handle profile form submission
  function handleProfileSubmit(event: Event) {
    event.preventDefault();
    
    const formData = {
      username: usernameInput.value,
      displayName: displayNameInput.value,
      skillLevel: selectedSkill,
      preferences: { ...preferences },
      bio: bioInput.value
    };
    
    console.log('Profile data:', formData);
    alert('Profile saved successfully!');
    // In a real app, you would send this to your backend
  }

  // Handle password form submission
  function handlePasswordSubmit(event: Event) {
    event.preventDefault();
    
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      alert("New passwords don't match!");
      return;
    }
    
    // In a real app, you would send this to your backend
    console.log('Password changed');
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    alert('Password changed successfully!');
  }

  // Render game history table
  function renderGameHistory() {
    if (!gameHistoryTable) return;
    
    const tbody = gameHistoryTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = gameHistory.map(game => `
      <tr class="${game.result}">
        <td>${game.opponent}</td>
        <td>${game.result}</td>
        <td>${game.score}</td>
        <td>${new Date(game.date).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  // Render achievements
  function renderAchievements() {
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = achievements.map(achievement => `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-details">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          <span class="status">
            ${achievement.unlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
      </div>
    `).join('');
  }

  // Initialize the page
  init();
});

export default ProfileSetup;
