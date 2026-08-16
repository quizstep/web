/**
 * Authentication Module for QuizStep
 * Handles Supabase Email/Password sign-up, sign-in, password strength evaluation,
 * common password blocking, and form interactions.
 */

// Clean text-like SVG icons for show/hide password (stroke inherits text color)
const EYE_OPEN_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const EYE_CLOSED_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

// Common / compromised / easily guessed password blocklist
const COMMON_PASSWORDS = new Set([
    'password', 'password123', 'password1', '12345678', '123456789', '1234567890',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm1', 'admin123', 'admin1234', 'administrator',
    'quizstep', 'quizstep123', 'welcome123', 'welcome1', 'iloveyou', 'iloveyou123',
    'testing123', 'passphrase', 'changeme', 'sunshine', 'princess', 'football',
    'monkey123', 'trustno1', 'dragon123', 'master123', 'superman', 'charlie123',
    'donald123', 'computer1', 'secret123', 'myspace1', 'starwars', 'letmein123',
    '11111111', '00000000', '88888888', 'abcdefgh', 'pass1234'
]);

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    checkActiveSession();
    initTopbarAuthState();
});

/**
 * If the user is already logged in and visits login or register page,
 * redirect them to index.html.
 */
async function checkActiveSession() {
    const isAuthPage = document.getElementById('login-form') || document.getElementById('register-form');
    if (!isAuthPage || !window.supabaseClient) return;

    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.warn('Session check warning:', err);
    }
}

/**
 * Check if a password is in the common/compromised blocklist or is a trivial pattern
 */
function isCommonPassword(password) {
    if (!password) return true;
    const lower = password.toLowerCase().trim();

    if (COMMON_PASSWORDS.has(lower)) return true;

    // Check for identical repeated character sequences (e.g. 'aaaaaaaa', '11111111')
    if (/^(.)\1{7,}$/.test(lower)) return true;

    return false;
}

/**
 * Evaluate password strength:
 * - Minimum 8 characters
 * - Allows any characters including spaces (passphrases welcome)
 * - Does not enforce restrictive character composition (e.g. mandatory numbers/symbols)
 * - Identifies and penalizes common/compromised passwords
 */
function evaluatePasswordStrength(password) {
    if (!password || password.length === 0) {
        return { score: 0, label: '', className: '', hint: '', isAcceptable: false };
    }

    if (isCommonPassword(password)) {
        return {
            score: 1,
            label: 'Too Common',
            className: 'strength-weak',
            hint: 'Easily guessed. Avoid common words.',
            isAcceptable: false
        };
    }

    const len = password.length;

    if (len < 8) {
        return {
            score: 1,
            label: 'Too Short',
            className: 'strength-weak',
            hint: `Need at least 8 characters (${8 - len} more)`,
            isAcceptable: false
        };
    }

    // Password variety & length scoring
    const hasSpaces = /\s/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9\s]/.test(password);

    let varietyCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;

    if (len >= 16 || (len >= 12 && (hasSpaces || varietyCount >= 2))) {
        return {
            score: 4,
            label: 'Strong',
            className: 'strength-strong',
            hint: 'Great password!',
            isAcceptable: true
        };
    }

    if (len >= 11 || (len >= 8 && (hasSpaces || varietyCount >= 2))) {
        return {
            score: 3,
            label: 'Good',
            className: 'strength-good',
            hint: 'Good password length',
            isAcceptable: true
        };
    }

    // 8-10 chars simple
    return {
        score: 2,
        label: 'Fair',
        className: 'strength-fair',
        hint: 'Add more characters to strengthen',
        isAcceptable: true
    };
}

/**
 * Initialize show/hide password toggle buttons with clean SVG icons
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.innerHTML = EYE_OPEN_SVG;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const wrapper = btn.closest('.password-input-wrapper');
            if (!wrapper) return;
            const input = wrapper.querySelector('input');
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = EYE_CLOSED_SVG;
                btn.setAttribute('aria-label', 'Hide password');
                btn.title = 'Hide password';
            } else {
                input.type = 'password';
                btn.innerHTML = EYE_OPEN_SVG;
                btn.setAttribute('aria-label', 'Show password');
                btn.title = 'Show password';
            }
        });
    });
}

/**
 * Validate phone number format (must be 10 digits if provided)
 */
function validatePhoneNumber(phoneInput) {
    if (!phoneInput) return { isValid: true, cleanDigits: '', formatted: '' };
    
    const raw = String(phoneInput).trim();
    if (!raw) return { isValid: true, cleanDigits: '', formatted: '' };

    // Extract digits only
    const digitsOnly = raw.replace(/\D/g, '');

    // Normalize: allow exactly 10 digits, or 11 with leading 0, or 12 with leading 91
    let tenDigits = '';
    if (digitsOnly.length === 10) {
        tenDigits = digitsOnly;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
        tenDigits = digitsOnly.slice(1);
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        tenDigits = digitsOnly.slice(2);
    } else {
        return { 
            isValid: false, 
            message: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).' 
        };
    }

    if (!/^[5-9]\d{9}$/.test(tenDigits) && !/^\d{10}$/.test(tenDigits)) {
        return { 
            isValid: false, 
            message: 'Please enter a valid 10-digit mobile number.' 
        };
    }

    return { 
        isValid: true, 
        cleanDigits: tenDigits, 
        formatted: '+91' + tenDigits 
    };
}

/**
 * Initialize Login Form (Supports login with Email OR 10-digit Mobile Number)
 */
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const alertBox = document.getElementById('auth-alert');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const identifier = (document.getElementById('login-identifier')?.value || document.getElementById('email')?.value || '').trim();
        const password = document.getElementById('password')?.value || '';

        // Validation
        if (!identifier) {
            showAlert(alertBox, 'Please enter your email address or mobile number.', 'error');
            return;
        }

        if (!password) {
            showAlert(alertBox, 'Please enter your password.', 'error');
            return;
        }

        if (!window.supabaseClient) {
            showAlert(alertBox, 'Supabase client is not configured. Please check js/supabase-config.js.', 'error');
            return;
        }

        const isEmail = identifier.includes('@');
        let emailToLogin = '';
        let phoneToLogin = '';

        if (isEmail) {
            if (!isValidEmail(identifier)) {
                showAlert(alertBox, 'Please enter a valid email address.', 'error');
                return;
            }
            emailToLogin = identifier;
        } else {
            const phoneCheck = validatePhoneNumber(identifier);
            if (!phoneCheck.isValid || !phoneCheck.cleanDigits) {
                showAlert(alertBox, 'Please enter a valid email address or 10-digit mobile number.', 'error');
                return;
            }
            phoneToLogin = phoneCheck.cleanDigits;
        }

        // Set Loading State
        setLoadingState(true, submitBtn, btnText, btnSpinner, 'Logging in...');

        try {
            let loginSuccess = false;
            let lastErrorMessage = '';

            if (emailToLogin) {
                // 1. Email Login
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: emailToLogin,
                    password: password
                });

                if (!error && data?.session) {
                    loginSuccess = true;
                } else if (error) {
                    lastErrorMessage = error.message;
                }
            } else if (phoneToLogin) {
                // 2. Phone Number Login
                // Attempt A: Direct Supabase Phone Auth (+91 format)
                const phoneAttempt1 = await window.supabaseClient.auth.signInWithPassword({
                    phone: '+91' + phoneToLogin,
                    password: password
                });

                if (!phoneAttempt1.error && phoneAttempt1.data?.session) {
                    loginSuccess = true;
                } else {
                    // Attempt B: Direct Supabase Phone Auth (10-digit format)
                    const phoneAttempt2 = await window.supabaseClient.auth.signInWithPassword({
                        phone: phoneToLogin,
                        password: password
                    });

                    if (!phoneAttempt2.error && phoneAttempt2.data?.session) {
                        loginSuccess = true;
                    } else {
                        // Attempt C: Look up registered email by phone metadata/profiles
                        try {
                            const { data: lookedUpEmail } = await window.supabaseClient.rpc('get_email_by_phone', { 
                                phone_input: phoneToLogin 
                            });

                            if (lookedUpEmail) {
                                const emailAttempt = await window.supabaseClient.auth.signInWithPassword({
                                    email: lookedUpEmail,
                                    password: password
                                });

                                if (!emailAttempt.error && emailAttempt.data?.session) {
                                    loginSuccess = true;
                                } else if (emailAttempt.error) {
                                    lastErrorMessage = emailAttempt.error.message;
                                }
                            } else {
                                lastErrorMessage = 'No account found with this mobile number. Please check or sign in with your email.';
                            }
                        } catch (rpcErr) {
                            console.warn('RPC lookup note:', rpcErr);
                            lastErrorMessage = phoneAttempt1.error?.message || phoneAttempt2.error?.message || 'Invalid credentials.';
                        }
                    }
                }
            }

            if (loginSuccess) {
                showAlert(alertBox, 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 600);
            } else {
                let displayMsg = lastErrorMessage || 'Invalid login credentials. Please check your details.';
                if (displayMsg.toLowerCase().includes('invalid login credentials') || displayMsg.toLowerCase().includes('invalid grant')) {
                    displayMsg = 'Invalid email/mobile number or password. Please check your credentials.';
                } else if (displayMsg.toLowerCase().includes('email not confirmed')) {
                    displayMsg = 'Please confirm your email address before logging in.';
                }
                showAlert(alertBox, displayMsg, 'error');
                setLoadingState(false, submitBtn, btnText, btnSpinner, 'Log In');
            }

        } catch (err) {
            console.error('Login error:', err);
            showAlert(alertBox, 'An unexpected error occurred during login. Please try again.', 'error');
            setLoadingState(false, submitBtn, btnText, btnSpinner, 'Log In');
        }
    });

    // Forgot Password link (UI only)
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAlert(alertBox, 'Password reset is not yet configured for this platform. Please contact support.', 'info');
        });
    }
}

/**
 * Initialize Registration Form (with Duplicate Email Detection & 10-Digit Mobile Validation)
 */
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const alertBox = document.getElementById('auth-alert');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

    const passwordInput = document.getElementById('password');
    const strengthContainer = document.getElementById('password-strength');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const strengthHint = document.getElementById('strength-hint');

    // Real-time password strength listener
    if (passwordInput && strengthContainer) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            if (!val) {
                strengthContainer.classList.remove('active');
                return;
            }

            strengthContainer.classList.add('active');
            const evaluation = evaluatePasswordStrength(val);

            if (strengthFill) {
                strengthFill.className = `strength-meter-fill ${evaluation.className}`;
            }
            if (strengthText) {
                strengthText.className = `strength-label ${evaluation.className}`;
                strengthText.textContent = evaluation.label;
            }
            if (strengthHint) {
                strengthHint.textContent = evaluation.hint;
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(alertBox);

        const fullName = (document.getElementById('full-name')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const phone = (document.getElementById('phone')?.value || '').trim();
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirm-password')?.value || '';

        // 1. Full Name Validation
        if (!fullName || fullName.length < 2) {
            showAlert(alertBox, 'Please enter your full name (at least 2 characters).', 'error');
            return;
        }

        // 2. Email Validation
        if (!email || !isValidEmail(email)) {
            showAlert(alertBox, 'Please enter a valid email address.', 'error');
            return;
        }

        // 3. Mobile Number Validation (if entered)
        let validatedPhone = null;
        if (phone) {
            validatedPhone = validatePhoneNumber(phone);
            if (!validatedPhone.isValid) {
                showAlert(alertBox, validatedPhone.message, 'error');
                return;
            }
        }

        // 4. Password Policy Validation
        if (password.length < 8) {
            showAlert(alertBox, 'Password must be at least 8 characters long.', 'error');
            return;
        }

        if (isCommonPassword(password)) {
            showAlert(alertBox, 'This password is too common and easily guessed. Please choose a stronger password or passphrase.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert(alertBox, 'Passwords do not match.', 'error');
            return;
        }

        if (!window.supabaseClient) {
            showAlert(alertBox, 'Supabase client is not configured. Please add your credentials in js/supabase-config.js.', 'error');
            return;
        }

        // Set Loading State
        setLoadingState(true, submitBtn, btnText, btnSpinner, 'Creating Account...');

        try {
            // User metadata to store in auth.users
            const metadata = { full_name: fullName };
            if (validatedPhone && validatedPhone.cleanDigits) {
                metadata.phone = validatedPhone.cleanDigits;
                metadata.formatted_phone = validatedPhone.formatted;
            }

            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: metadata
                }
            });

            // 5. Duplicate Email Detection (Both error message check & Supabase v2 empty identities check)
            const isAlreadyRegistered = 
                (error && (
                    error.message.toLowerCase().includes('already registered') || 
                    error.message.toLowerCase().includes('already in use') || 
                    error.message.toLowerCase().includes('already exists') ||
                    error.message.toLowerCase().includes('user with this email') ||
                    error.status === 422 || 
                    error.status === 400
                )) ||
                (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

            if (isAlreadyRegistered) {
                showAlert(alertBox, 'An account with this email address already exists. Please log in instead.', 'error');
                setLoadingState(false, submitBtn, btnText, btnSpinner, 'Create Account');
                return;
            }

            if (error) {
                showAlert(alertBox, error.message, 'error');
                setLoadingState(false, submitBtn, btnText, btnSpinner, 'Create Account');
                return;
            }

            // Check if email confirmation is required or session created
            if (data?.user && !data?.session) {
                showAlert(
                    alertBox,
                    'Registration successful! Please check your email to confirm your account before logging in.',
                    'success'
                );
                form.reset();
                if (strengthContainer) strengthContainer.classList.remove('active');
                setLoadingState(false, submitBtn, btnText, btnSpinner, 'Create Account');
            } else {
                showAlert(alertBox, 'Account created successfully! Redirecting to home...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }

        } catch (err) {
            console.error('Registration error:', err);
            showAlert(alertBox, 'An unexpected error occurred during registration. Please try again.', 'error');
            setLoadingState(false, submitBtn, btnText, btnSpinner, 'Create Account');
        }
    });
}

/**
 * Reusable Global Logout function
 */
window.logout = async function() {
    if (window.supabaseClient) {
        try {
            await window.supabaseClient.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    }
    const isSubpage = window.location.pathname.includes('/pages/');
    window.location.href = isSubpage ? '../index.html' : 'index.html';
};

/**
 * Initialize Topbar Auth State & Listen for Changes
 */
async function initTopbarAuthState() {
    if (!window.supabaseClient) return;

    // Render current session state
    await renderTopbarAuthState();

    // Listen for auth state changes across tabs/actions
    try {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            renderTopbarAuthState(session);
        });
    } catch (err) {
        console.warn('onAuthStateChange listener error:', err);
    }
}

/**
 * Render the correct topbar auth UI (User Profile + Logout vs Login button)
 */
async function renderTopbarAuthState(existingSession = null) {
    const authNavSlot = document.getElementById('auth-nav-slot');
    if (!authNavSlot) return;

    let session = existingSession;
    if (session === null && window.supabaseClient) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            session = data?.session || null;
        } catch (err) {
            console.warn('Error fetching session for topbar:', err);
        }
    }

    const isSubpage = window.location.pathname.includes('/pages/');
    const loginUrl = isSubpage ? '../login.html' : 'login.html';

    if (session?.user) {
        const user = session.user;
        const fullName = (user.user_metadata?.full_name || '').trim();
        const email = (user.email || '').trim();
        const displayName = fullName || (email ? email.split('@')[0] : 'Student');
        const initial = (fullName ? fullName.charAt(0) : (email ? email.charAt(0) : 'U')).toUpperCase();

        authNavSlot.innerHTML = `
            <div class="user-profile-menu">
                <div class="user-badge" title="${escapeHtml(email)}">
                    <div class="user-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
                    <span class="user-name">${escapeHtml(displayName)}</span>
                </div>
                <button type="button" class="btn-logout" id="logout-btn" title="Log out" onclick="logout()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Log Out</span>
                </button>
            </div>
        `;
    } else {
        authNavSlot.innerHTML = `
            <a href="${loginUrl}" class="btn-primary nav-login-btn" id="login-btn">Log In</a>
        `;
    }
}

/**
 * Escape HTML utility to prevent XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * UI Helper: Set button loading state to prevent double submission
 */
function setLoadingState(isLoading, button, textSpan, spinnerSpan, activeText) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        if (textSpan) textSpan.textContent = activeText;
        if (spinnerSpan) {
            spinnerSpan.removeAttribute('hidden');
            spinnerSpan.style.display = 'inline-block';
        }
    } else {
        button.disabled = false;
        if (textSpan) textSpan.textContent = activeText;
        if (spinnerSpan) {
            spinnerSpan.setAttribute('hidden', '');
            spinnerSpan.style.display = 'none';
        }
    }
}

/**
 * UI Helper: Show alert banner
 */
function showAlert(element, message, type = 'error') {
    if (!element) return;
    element.className = `auth-alert alert-${type} visible`;
    element.textContent = message;
}

/**
 * UI Helper: Hide alert banner
 */
function hideAlert(element) {
    if (!element) return;
    element.className = 'auth-alert';
    element.textContent = '';
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
