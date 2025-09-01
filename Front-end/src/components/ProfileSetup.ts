import { navigateTo } from "../main";

export function createProfileSetupForm(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'profile-setup-container';
  container.innerHTML = `
    <div class="profile-setup">
      <div class="profile-header">
        <div class="avatar-upload">
          <div class="avatar-preview">
            <i class="fas fa-user"></i>
          </div>
          <button class="upload-btn">Upload Photo</button>
        </div>
        <div class="profile-info">
          <h2>Profile Setup</h2>
          <p>Complete your profile to get started</p>
        </div>
      </div>
      
      <form id="profileForm" class="profile-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="displayName">Display Name</label>
            <input type="text" id="displayName" name="displayName" required>
          </div>
          <div class="form-group">
            <label for="skillLevel">Skill Level</label>
            <select id="skillLevel" name="skillLevel" required>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bio">Bio (Optional)</label>
            <textarea id="bio" name="bio" rows="3"></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Security</h3>
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" name="currentPassword">
          </div>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input type="password" id="newPassword" name="newPassword">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword">
          </div>
        </div>
        
        <div class="form-section">
          <h3>Game Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Games Played</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Wins</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0%</span>
              <span class="stat-label">Win Rate</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Rank</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Complete Setup</button>
        </div>
      </form>
    </div>
  `;

  // Add event listeners
  const form = container.querySelector('#profileForm') as HTMLFormElement;
  const cancelBtn = container.querySelector('#cancelBtn') as HTMLButtonElement;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form submission
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Profile data:', data);
    // Here you would typically send this to your backend
    // For now, just navigate to home
    navigateTo('/');
  });
  
  cancelBtn.addEventListener('click', () => {
    navigateTo('/');
  });
  
  return container;
}
