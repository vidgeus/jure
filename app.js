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

    // Keep mobile language dropdown in sync
    const languageSelect = document.getElementById('language-select');
    if (languageSelect && languageSelect.value !== lang) {
        languageSelect.value = lang;
    }
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

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close the menu when a link is tapped so the page can scroll to the target.
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
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

const languageSelect = document.getElementById('language-select');
if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        setLanguage(languageSelect.value);
    });
}

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
    })() || 'marble';
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
        try {
            const v = localStorage.getItem('presentation-mode');
            if (v === null) return true; // default ON for first-time visitors
            return v === 'true';
        } catch (e) { return true; }
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
// Contact Form (Web3Forms)
// ===========================
// Web3Forms delivers form submissions to the email associated with the access
// key below. Get a free key (no account needed) at https://web3forms.com —
// enter the recipient address (testjurelaw@gmail.com) and the key arrives by
// email. Paste it into WEB3FORMS_ACCESS_KEY and submissions start working.
const WEB3FORMS_ACCESS_KEY = '1d6bdc98-34d2-48f5-a303-b8bbcb08c4c4';

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

const sendingText = {
    hr: 'Šaljem...',
    en: 'Sending...',
    it: 'Invio in corso...',
    de: 'Senden...'
};
const successText = {
    hr: 'Hvala! Vaša poruka je uspješno poslana. Javit ćemo vam se uskoro.',
    en: 'Thank you! Your message has been sent successfully. We will contact you soon.',
    it: 'Grazie! Il vostro messaggio è stato inviato con successo. Vi contatteremo presto.',
    de: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.'
};
const errorText = {
    hr: 'Došlo je do greške. Molimo pokušajte ponovno ili nas kontaktirajte telefonom.',
    en: 'An error occurred. Please try again or contact us by phone.',
    it: 'Si è verificato un errore. Riprovate o contattateci telefonicamente.',
    de: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.'
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = sendingText[currentLang] || sendingText.en;
        formMessage.style.display = '';

        try {
            const formData = new FormData(contactForm);
            formData.set('access_key', WEB3FORMS_ACCESS_KEY);
            formData.set('subject', `Upit (${formData.get('name') || 'website'}): ${formData.get('subject') || ''}`);

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.success !== true) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            formMessage.className = 'form-message success';
            formMessage.textContent = successText[currentLang] || successText.en;
            contactForm.reset();
        } catch (error) {
            console.error('Contact form submission failed:', error);
            formMessage.className = 'form-message error';
            formMessage.textContent = errorText[currentLang] || errorText.en;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 6000);
        }
    });
}

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    document.getElementById('current-year').textContent = new Date().getFullYear();
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
