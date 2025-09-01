document.addEventListener('DOMContentLoaded', function() {
    // Skill level selection
    document.querySelectorAll('.skill-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.skill-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatar = document.getElementById('avatar');
                    avatar.style.backgroundImage = `url(${e.target.result})`;
                    avatar.style.backgroundSize = 'cover';
                    avatar.style.backgroundPosition = 'center';
                    avatar.textContent = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                username: document.getElementById('username')?.value,
                displayName: document.getElementById('displayName')?.value,
                skillLevel: document.querySelector('.skill-option.selected')?.dataset.skill,
                preferences: {
                    tournaments: document.getElementById('tournaments')?.checked,
                    ranked: document.getElementById('ranked')?.checked,
                    casual: document.getElementById('casual')?.checked,
                    spectate: document.getElementById('spectate')?.checked
                },
                bio: document.getElementById('bio')?.value,
                newUsername: document.getElementById('newUsername')?.value,
                currentPassword: document.getElementById('currentPassword')?.value,
                newPassword: document.getElementById('newPassword')?.value,
                confirmPassword: document.getElementById('confirmPassword')?.value
            };

            // Validate password change if attempted
            if (formData.newPassword || formData.confirmPassword) {
                if (!formData.currentPassword) {
                    alert('Please enter your current password to change it.');
                    return;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    alert('New passwords do not match!');
                    return;
                }
                if (formData.newPassword.length < 6) {
                    alert('New password must be at least 6 characters long.');
                    return;
                }
            }
            
            console.log('Profile data:', formData);
            alert('Profile setup complete! 🎮');
        });
    }

    // Progress animation
    setTimeout(() => {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    }, 500);

    // Settings toggle functionality
    const settingsHeader = document.querySelector('.settings-header');
    if (settingsHeader) {
        settingsHeader.addEventListener('click', toggleSettings);
    }

    // Password validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = this.value;
            
            if (newPassword && confirmPassword) {
                if (newPassword !== confirmPassword) {
                    this.style.borderColor = '#ff4444';
                } else {
                    this.style.borderColor = '#44ff44';
                }
            }
        });
    }
});

function toggleSettings() {
    const content = document.getElementById('settingsContent');
    const arrow = document.getElementById('settingsArrow');
    
    if (content && arrow) {
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            arrow.classList.remove('rotated');
        } else {
            content.classList.add('expanded');
            arrow.classList.add('rotated');
        }
    }
}

function toggleHistory() {
    const content = document.getElementById('historyContent');
    const arrow = document.getElementById('historyArrow');
    
    if (content && arrow) {
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            arrow.classList.remove('rotated');
        } else {
            content.classList.add('expanded');
            arrow.classList.add('rotated');
        }
    }
}
