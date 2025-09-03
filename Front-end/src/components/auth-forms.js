document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authToggle = document.getElementById('authToggle');
    const passwordInput = document.getElementById('password');
    const strengthText = document.getElementById('strengthText');
    const strengthSegments = document.querySelectorAll('.strength-segment');

    // Toggle between login and register forms
    function toggleForms() {
        const isRegister = authToggle.checked;
        if (isRegister) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            document.title = 'Sign Up | Neon Pong';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            document.title = 'Sign In | Neon Pong';
        }
    }

    // Initialize forms
    toggleForms();

    // Event Listener for toggle switch
    authToggle.addEventListener('change', toggleForms);

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
