// ===========================
// Localization System
// ===========================
let currentLang = 'hr';
let translations = {};

// Load translations from translations.js (loaded via <script> so this works
// when the site is opened directly via file:// — fetch() of local files is
// blocked by browsers in that case).
function loadTranslations() {
    if (!window.__translations) {
        console.error('Translations missing: ensure translations.js is loaded before app.js');
        return;
    }
    translations = window.__translations;
    setLanguage(currentLang);
}

// Set language and update content
function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);

        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Helper function to get nested translation
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ===========================
// Navigation
// ===========================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// ===========================
// Language Switcher
// ===========================
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        setLanguage(lang);
    });
});

// ===========================
// Theme Switcher
// ===========================
function setTheme(theme) {
    if (theme && theme !== 'default') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    try {
        localStorage.setItem('site-theme', theme || 'default');
    } catch (e) {
        // localStorage not available; ignore
    }
}

const themeSelect = document.getElementById('theme-select');
if (themeSelect) {
    const savedTheme = (() => {
        try { return localStorage.getItem('site-theme'); } catch (e) { return null; }
    })() || 'default';
    themeSelect.value = savedTheme;
    setTheme(savedTheme);

    themeSelect.addEventListener('change', () => {
        setTheme(themeSelect.value);
    });
}

// ===========================
// Hero Blur Control
// ===========================
function setHeroBlur(value) {
    const n = Math.max(0, Math.min(100, Number(value) || 0));
    document.documentElement.style.setProperty('--hero-blur', `${n}px`);
    try {
        localStorage.setItem('hero-blur', String(n));
    } catch (e) {
        // localStorage not available; ignore
    }
    return n;
}

// ===========================
// Presentation Mode (hides theme/blur controls, splits navbar in thirds)
// ===========================
function setPresentationMode(enabled) {
    if (enabled) {
        document.documentElement.setAttribute('data-presentation', 'true');
    } else {
        document.documentElement.removeAttribute('data-presentation');
    }
    try {
        localStorage.setItem('presentation-mode', enabled ? 'true' : 'false');
    } catch (e) {
        // localStorage not available; ignore
    }
}

const presentationToggle = document.getElementById('presentation-toggle');
if (presentationToggle) {
    const savedPresentation = (() => {
        try { return localStorage.getItem('presentation-mode') === 'true'; }
        catch (e) { return false; }
    })();
    presentationToggle.checked = savedPresentation;
    setPresentationMode(savedPresentation);

    presentationToggle.addEventListener('change', () => {
        setPresentationMode(presentationToggle.checked);
    });
}

const blurInput = document.getElementById('blur-input');
if (blurInput) {
    const savedBlur = (() => {
        try { return localStorage.getItem('hero-blur'); } catch (e) { return null; }
    })();
    const initialBlur = savedBlur !== null ? Number(savedBlur) : Number(blurInput.value);
    const applied = setHeroBlur(initialBlur);
    blurInput.value = String(applied);

    blurInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const applied = setHeroBlur(blurInput.value);
            blurInput.value = String(applied);
            blurInput.blur();
        }
    });
}

// ===========================
// Contact Form with EmailJS
// ===========================
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

// EmailJS Configuration
// IMPORTANT: Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your Public Key

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Disable submit button
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    const sendingText = {
        hr: 'Šaljem...',
        en: 'Sending...',
        it: 'Invio in corso...',
        de: 'Senden...'
    };
    submitBtn.textContent = sendingText[currentLang] || sendingText.en;

    try {
        // Send email using EmailJS
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            formData,
            EMAILJS_PUBLIC_KEY
        );

        // Show success message
        const successText = {
            hr: 'Hvala! Vaša poruka je uspješno poslana. Javit ćemo vam se uskoro.',
            en: 'Thank you! Your message has been sent successfully. We will contact you soon.',
            it: 'Grazie! Il vostro messaggio è stato inviato con successo. Vi contatteremo presto.',
            de: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.'
        };
        formMessage.className = 'form-message success';
        formMessage.textContent = successText[currentLang] || successText.en;

        // Reset form
        contactForm.reset();

    } catch (error) {
        console.error('Error sending email:', error);

        // Show error message
        const errorText = {
            hr: 'Došlo je do greške. Molimo pokušajte ponovno ili nas kontaktirajte telefonom.',
            en: 'An error occurred. Please try again or contact us by phone.',
            it: 'Si è verificato un errore. Riprovate o contattateci telefonicamente.',
            de: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.'
        };
        formMessage.className = 'form-message error';
        formMessage.textContent = errorText[currentLang] || errorText.en;
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
});

// Alternative: FormSubmit.co (no JavaScript library needed)
// Uncomment this section if you prefer to use FormSubmit.co instead of EmailJS
/*
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'hr' ? 'Šaljem...' : 'Sending...';

    try {
        const formData = new FormData(contactForm);

        // Replace YOUR_EMAIL with your actual email
        const response = await fetch('https://formsubmit.co/YOUR_EMAIL@example.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            formMessage.className = 'form-message success';
            formMessage.textContent = currentLang === 'hr' 
                ? 'Hvala! Vaša poruka je uspješno poslana.'
                : 'Thank you! Your message has been sent successfully.';
            contactForm.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        formMessage.className = 'form-message error';
        formMessage.textContent = currentLang === 'hr'
            ? 'Došlo je do greške. Molimo pokušajte ponovno.'
            : 'An error occurred. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
*/

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Load translations
    loadTranslations();

    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Initialize EmailJS (if using EmailJS)
    // Make sure to include EmailJS library in your HTML
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
});

// ===========================
// Scroll Animations (Optional)
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.practice-card, .stat-item, .info-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
