// ===========================
// Localization System
// ===========================
let currentLang = 'hr';
let translations = {};

// Load translations
async function loadTranslations() {
    try {
        const hrResponse = await fetch('translations/hr.json');
        const enResponse = await fetch('translations/en.json');

        translations.hr = await hrResponse.json();
        translations.en = await enResponse.json();

        // Initialize with default language
        setLanguage(currentLang);
    } catch (error) {
        console.error('Error loading translations:', error);
    }
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
    submitBtn.textContent = currentLang === 'hr' ? 'Šaljem...' : 'Sending...';

    try {
        // Send email using EmailJS
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            formData,
            EMAILJS_PUBLIC_KEY
        );

        // Show success message
        formMessage.className = 'form-message success';
        formMessage.textContent = currentLang === 'hr' 
            ? 'Hvala! Vaša poruka je uspješno poslana. Javit ćemo vam se uskoro.'
            : 'Thank you! Your message has been sent successfully. We will contact you soon.';

        // Reset form
        contactForm.reset();

    } catch (error) {
        console.error('Error sending email:', error);

        // Show error message
        formMessage.className = 'form-message error';
        formMessage.textContent = currentLang === 'hr'
            ? 'Došlo je do greške. Molimo pokušajte ponovno ili nas kontaktirajte telefonom.'
            : 'An error occurred. Please try again or contact us by phone.';
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
