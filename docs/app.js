





const currentLang = (document.documentElement.lang || 'hr').slice(0, 2).toLowerCase();



const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;




const navbar = document.getElementById('navbar');



const updateNavbarScrolled = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
};
window.addEventListener('scroll', updateNavbarScrolled, { passive: true });
updateNavbarScrolled();












const LOADER_MIN_MS = 1500;

(function revealPageWhenLoaded() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    const windowLoaded = new Promise(resolve => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    });
    const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();




    const minShown = new Promise(resolve => {
        const check = () => {
            const left = LOADER_MIN_MS - performance.now();
            if (left > 0) setTimeout(check, Math.ceil(left));
            else resolve();
        };
        check();
    });

    Promise.all([windowLoaded, fontsReady, minShown]).catch(() => {}).then(() => {
        loader.classList.add('is-done');
        const remove = () => loader.remove();
        loader.addEventListener('transitionend', remove, { once: true });
        setTimeout(remove, 600);
    });
})();









document.querySelectorAll('iframe[data-src]').forEach(frame => {
    let io = null;
    const load = () => {
        if (io) { io.disconnect(); io = null; }
        if (!frame.src) frame.src = frame.dataset.src;
    };

    const loadWhenIdle = () => {
        if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1000 });
        else setTimeout(load, 0);
    };
    if (document.readyState === 'complete') loadWhenIdle();
    else window.addEventListener('load', loadWhenIdle, { once: true });

    if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) load();
        }, { rootMargin: '400px 0px' });
        io.observe(frame);
    }
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        }
    });
});


const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active', open);

        mobileMenuToggle.setAttribute('aria-expanded', String(open));
    });


    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}









let focusFromKeyboard = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') focusFromKeyboard = true;
}, true);
document.addEventListener('pointerdown', () => { focusFromKeyboard = false; }, true);







function centredScrollY(el) {
    const start = window.scrollY;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    let y = start;
    for (let i = 0; i < 8; i++) {
        const r = el.getBoundingClientRect();
        const delta = (r.top + r.height / 2) - window.innerHeight / 2;
        const next = Math.max(0, Math.min(maxY, Math.round(y + delta)));
        if (Math.abs(next - y) < 1) break;
        y = next;
        window.scrollTo({ top: y, behavior: 'instant' });
    }
    window.scrollTo({ top: start, behavior: 'instant' });
    return y;
}

document.addEventListener('focusin', (e) => {
    if (!focusFromKeyboard) return;
    focusFromKeyboard = false;
    const el = e.target;
    if (!(el instanceof Element) || el.closest('.site-header')) return;
    window.scrollTo({
        top: centredScrollY(el),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
});









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
    } catch (e) { }
}


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

    window.addEventListener('load', apply, { once: true });
})();








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
    contactForm.querySelectorAll('input[type="checkbox"]').forEach(box => {
        box.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' || e.isComposing) return;
            e.preventDefault();
            box.click();
        });
    });
}

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




document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
});













document.addEventListener('mouseup', (e) => {
    const t = e.target;
    if (t && t.closest &&
        t.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) {
        return;
    }
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && sel.isCollapsed) {
        sel.removeAllRanges();
    }
});




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




if (!prefersReducedMotion) {
    document.querySelectorAll('.practice-card, .info-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
