// ===========================
// Localization
// ===========================
// Each language is its own pre-rendered page (/, /en/, /it/, /de/) produced by
// build.js, so translation no longer happens at runtime. We only read the
// active language (from <html lang>) for the localized contact-form messages.
const currentLang = (document.documentElement.lang || 'hr').slice(0, 2).toLowerCase();

// ===========================
// Navigation
// ===========================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
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
// Each language is its own URL, so switching is a full navigation. To keep the
// reader in place instead of jumping to the top, we remember the section in
// view (and how far we've scrolled into it) before leaving, then restore it on
// the next page. Using a section anchor + offset keeps the position accurate
// even though translated content has slightly different heights.
const LANG_SCROLL_KEY = 'lang-switch-scroll';

function rememberScrollBeforeLanguageSwitch() {
    try {
        const y = window.scrollY;
        let anchor = null;
        document.querySelectorAll('section[id]').forEach(sec => {
            if (sec.offsetTop <= y + 2) anchor = sec;
        });
        const data = anchor ? { id: anchor.id, delta: y - anchor.offsetTop } : { y };
        sessionStorage.setItem(LANG_SCROLL_KEY, JSON.stringify(data));
    } catch (e) { /* sessionStorage unavailable; ignore */ }
}

// Desktop renders the languages as <a> links; the mobile dropdown navigates on change.
document.querySelectorAll('.lang-btn').forEach(link => {
    link.addEventListener('click', rememberScrollBeforeLanguageSwitch);
});

const languageSelect = document.getElementById('language-select');
if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        rememberScrollBeforeLanguageSwitch();
        window.location.href = languageSelect.value;
    });
}

// Restore the remembered position once, after a language switch.
(function restoreScrollAfterLanguageSwitch() {
    let data;
    try {
        const raw = sessionStorage.getItem(LANG_SCROLL_KEY);
        if (!raw) return;
        sessionStorage.removeItem(LANG_SCROLL_KEY);
        data = JSON.parse(raw);
    } catch (e) { return; }
    if (!data) return;

    const apply = () => {
        if (data.id) {
            const sec = document.getElementById(data.id);
            if (sec) { window.scrollTo(0, sec.offsetTop + (data.delta || 0)); return; }
        }
        if (typeof data.y === 'number') window.scrollTo(0, data.y);
    };
    apply();
    // Re-apply after load in case fonts/images settle the layout height.
    window.addEventListener('load', apply, { once: true });
})();

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
            formData.set('subject', `Upit (${formData.get('subject') || ''})`);

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
document.querySelectorAll('.practice-card, .info-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
