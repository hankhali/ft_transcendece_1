document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const passwordInput = document.getElementById('password');
    const strengthText = document.getElementById('strengthText');
    const strengthSegments = document.querySelectorAll('.strength-segment');

    // Toggle between login and register forms
    function showForm(formToShow) {
        if (formToShow === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    // Event Listeners for form toggling
    loginTab.addEventListener('click', () => showForm('login'));
    registerTab.addEventListener('click', () => showForm('register'));
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
    });
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('register');
    });

    // Password strength meter
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }

    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        const strengthTexts = ['Very Weak', 'Weak', 'Good', 'Strong', 'Very Strong'];
        const strengthColors = ['#ff4d4d', '#ff9c4d', '#ffd24d', '#a3d063', '#2ecc71'];
        
        // Length check
        if (password.length >= 8) strength++;
        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;
        // Contains number
        if (/[0-9]/.test(password)) strength++;
        // Contains special char
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Cap strength at 5
        strength = Math.min(strength, 5);
        
        // Update UI
        strengthText.textContent = strengthTexts[strength - 1] || 'Very Weak';
        strengthText.style.color = strengthColors[strength - 1] || '#ff4d4d';
        
        // Update strength bars
        strengthSegments.forEach((segment, index) => {
            segment.style.backgroundColor = index < strength ? strengthColors[strength - 1] : '#444';
            segment.style.opacity = index < strength ? '1' : '0.3';
        });
    }

    // Form submission
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log('Login form submitted');
    });

    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your registration logic here
        console.log('Register form submitted');
        
        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // If validation passes, you can submit the form
        // registerForm.submit();
    });

    // Add animation to form elements on load
    setTimeout(() => {
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }, 300);
});
