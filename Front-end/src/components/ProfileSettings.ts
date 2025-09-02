
interface UserProfile {
  username: string;
  displayName: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  bio: string;
  avatar: string;
}

export function createProfileSettings(profile: Partial<UserProfile> = {}): HTMLElement {
  const container = document.createElement('div');
  container.className = 'profile-settings';

  // Initialize default values
  const defaultProfile: UserProfile = {
    username: '',
    displayName: '',
    skillLevel: 'beginner',
    bio: '',
    avatar: '',
    ...profile
  };

  // Create form
  const form = document.createElement('form');
  form.className = 'profile-form';
  form.noValidate = true;

  // Avatar Section - Centered
  const avatarOuterContainer = document.createElement('div');
  avatarOuterContainer.className = 'form-section';
  
  const avatarSection = document.createElement('div');
  avatarSection.className = 'avatar-section';
  
  const avatarLabel = document.createElement('label');
  avatarLabel.className = 'form-label';
  avatarLabel.textContent = 'Customize Avatar';
  
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';
  
  const avatarPreviewContainer = document.createElement('div');
  avatarPreviewContainer.className = 'avatar-preview-container';
  
  const avatarPreview = document.createElement('div');
  avatarPreview.className = 'avatar-preview';
  avatarPreview.innerHTML = `
    <i class="fas fa-user-circle"></i>
  `;
  
  const avatarUpload = document.createElement('div');
  avatarUpload.className = 'avatar-upload';
  avatarUpload.innerHTML = '<i class="fas fa-camera"></i>';
  
  const avatarInput = document.createElement('input');
  avatarInput.type = 'file';
  avatarInput.accept = 'image/*';
  avatarInput.className = 'avatar-input';
  avatarInput.hidden = true;
  
  const changeButton = document.createElement('button');
  changeButton.type = 'button';
  changeButton.className = 'secondary-button';
  changeButton.textContent = 'Change Avatar';
  changeButton.style.marginTop = '1rem';
  changeButton.addEventListener('click', () => avatarInput.click());
  
  avatarPreviewContainer.appendChild(avatarPreview);
  avatarPreviewContainer.appendChild(avatarUpload);
  
  avatarContainer.appendChild(avatarPreviewContainer);
  avatarContainer.appendChild(changeButton);
  avatarContainer.appendChild(avatarInput);
  
  avatarSection.appendChild(avatarLabel);
  avatarSection.appendChild(avatarContainer);
  avatarOuterContainer.appendChild(avatarSection);

  // Username Field
  const usernameField = createFormField({
    label: 'Username',
    name: 'username',
    type: 'text',
    value: defaultProfile.username,
    required: true,
    placeholder: 'Enter your username'
  });

  // Display Name Field
  const displayNameField = createFormField({
    label: 'Display Name',
    name: 'displayName',
    type: 'text',
    value: defaultProfile.displayName,
    required: true,
    placeholder: 'Enter your display name'
  });

  // Skill Level Field
  const skillLevelField = document.createElement('div');
  skillLevelField.className = 'form-group';
  
  const skillLabel = document.createElement('label');
  skillLabel.className = 'form-label';
  skillLabel.textContent = 'Skill Level';
  skillLabel.htmlFor = 'skillLevel';
  
  const skillOptions = [
    { id: 'beginner', label: 'Beginner', emoji: '👶' },
    { id: 'intermediate', label: 'Intermediate', emoji: '💪' },
    { id: 'expert', label: 'Expert', emoji: '🏆' }
  ] as const;
  
  const skillContainer = document.createElement('div');
  skillContainer.className = 'skill-level-options';
  
  skillOptions.forEach(({ id, label, emoji }) => {
    const optionId = `skill-${id}`;
    const optionContainer = document.createElement('div');
    optionContainer.className = 'radio-option';
    optionContainer.dataset.level = id;
    
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.id = optionId;
    radioInput.name = 'skillLevel';
    radioInput.value = id;
    radioInput.checked = defaultProfile.skillLevel === id;
    
    const radioLabel = document.createElement('label');
    radioLabel.htmlFor = optionId;
    radioLabel.dataset.level = id;
    
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'level-emoji';
    emojiSpan.textContent = emoji;
    
    const textSpan = document.createElement('span');
    textSpan.className = 'level-text';
    textSpan.textContent = label;
    
    radioLabel.appendChild(emojiSpan);
    radioLabel.appendChild(document.createElement('br'));
    radioLabel.appendChild(textSpan);
    
    optionContainer.appendChild(radioInput);
    optionContainer.appendChild(radioLabel);
    skillContainer.appendChild(optionContainer);
  });
  
  skillLevelField.appendChild(skillLabel);
  skillLevelField.appendChild(skillContainer);

  // Bio Field
  const bioField = createFormField({
    label: 'Bio (Optional)',
    name: 'bio',
    type: 'textarea',
    value: defaultProfile.bio,
    placeholder: 'Tell us about yourself...'
  });

  // Advanced Settings Toggle - Styled Button
  const advancedToggle = document.createElement('div');
  advancedToggle.className = 'settings-button-container';
  advancedToggle.innerHTML = `
    <button type="button" class="settings-button advanced-toggle-button">
      <span class="button-icon"><i class="fas fa-sliders-h"></i></span>
      <span class="button-text">ADVANCED SETTINGS</span>
      <span class="button-arrow"><i class="fas fa-chevron-down"></i></span>
    </button>
  `;

  // Advanced Settings Content
  const advancedContent = document.createElement('div');
  advancedContent.className = 'advanced-content';
  advancedContent.style.display = 'none';
  
  // Password Update Section
  const passwordField = createFormField({
    label: 'New Password',
    name: 'newPassword',
    type: 'password',
    placeholder: 'Leave blank to keep current',
    autoComplete: 'new-password'
  });
  
  const confirmPasswordField = createFormField({
    label: 'Confirm New Password',
    name: 'confirmPassword',
    type: 'password',
    placeholder: 'Confirm your new password',
    autoComplete: 'new-password'
  });
  
  advancedContent.appendChild(passwordField);
  advancedContent.appendChild(confirmPasswordField);
  
  // Toggle advanced settings
  const toggleButton = advancedToggle.querySelector('.advanced-toggle-button');
  const chevron = advancedToggle.querySelector('.fa-chevron-down');
  
  toggleButton?.addEventListener('click', () => {
    const isExpanded = advancedContent.style.display !== 'none';
    advancedContent.style.display = isExpanded ? 'none' : 'block';
    if (chevron) {
      chevron.className = isExpanded 
        ? 'fas fa-chevron-down'
        : 'fas fa-chevron-up';
    }
  });

  // Submit Button - Styled
  const submitButton = document.createElement('div');
  submitButton.className = 'settings-button-container';
  submitButton.innerHTML = `
    <button type="submit" class="settings-button save-changes-button">
      <span class="button-icon"><i class="fas fa-save"></i></span>
      <span class="button-text">SAVE CHANGES</span>
      <span class="button-check"><i class="fas fa-check"></i></span>
    </button>
  `;

  // Assemble the form
  form.appendChild(avatarOuterContainer);
  form.appendChild(usernameField);
  form.appendChild(displayNameField);
  form.appendChild(skillLevelField);
  form.appendChild(bioField);
  form.appendChild(advancedToggle);
  form.appendChild(advancedContent);
  
  // Game History Button - Styled
  const gameHistoryButton = document.createElement('div');
  gameHistoryButton.className = 'settings-button-container';
  gameHistoryButton.innerHTML = `
    <button type="button" class="settings-button game-history-button">
      <span class="button-icon"><i class="fas fa-history"></i></span>
      <span class="button-text">GAME HISTORY</span>
      <span class="button-arrow"><i class="fas fa-external-link-alt"></i></span>
    </button>
  `;
  
  gameHistoryButton.querySelector('button')?.addEventListener('click', () => {
    console.log('Game History clicked');
    showMessage('Game History feature coming soon!', 'info');
  });
  
  form.appendChild(gameHistoryButton);
  form.appendChild(submitButton);

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const profileData: Record<string, any> = {};
    
    // Get all form data
    formData.forEach((value, key) => {
      if (value) profileData[key] = value;
    });
    
    // Get skill level
    const selectedSkill = form.querySelector('input[name="skillLevel"]:checked') as HTMLInputElement;
    if (selectedSkill) {
      profileData.skillLevel = selectedSkill.value;
    }
    
    try {
      // TODO: Add API call to update profile
      console.log('Updating profile:', profileData);
      
      // Show success message
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  });

  container.appendChild(form);
  return container;
}

// Helper function to create form fields
function createFormField({
  label,
  name,
  type,
  value = '',
  required = false,
  placeholder = '',
  autoComplete = '',
  className = ''
}: {
  label: string;
  name: string;
  type: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}): HTMLElement {
  const group = document.createElement('div');
  group.className = `form-group ${className}`.trim();
  
  const labelEl = document.createElement('label');
  labelEl.className = 'form-label';
  labelEl.htmlFor = name;
  labelEl.textContent = label;
  
  let input: HTMLInputElement | HTMLTextAreaElement;
  
  if (type === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.id = name;
    textarea.name = name;
    textarea.value = value;
    textarea.placeholder = placeholder;
    textarea.required = required;
    textarea.rows = 3;
    input = textarea;
  } else {
    const inputEl = document.createElement('input');
    inputEl.type = type;
    inputEl.id = name;
    inputEl.name = name;
    inputEl.value = value;
    inputEl.placeholder = placeholder;
    inputEl.required = required;
    if (autoComplete) inputEl.autocomplete = autoComplete as any;
    input = inputEl;
  }
  
  input.className = 'form-input';
  
  group.appendChild(labelEl);
  group.appendChild(input);
  
  return group;
}

// Use the global showMessage function from main.ts
const showMessage = window.showMessage;
