// Config (optional)
const defaultConfig = {
    hero_headline: 'Ihre Werkstatt für Diagnose, Wartung & Reparatur',
    hero_subline: 'Qualität, die überzeugt. Termine, die passen. Preise, die fair sind. Werkstattservice auf Premium-Niveau.',
    cta_primary: 'Termin anfragen',
    about_text: 'Auto Atelier ist Ihre meistergeführte Werkstatt. Unser Fokus: moderne Diagnostik, saubere Wartung und Reparaturen, die nachhaltig funktionieren – transparent und planbar.',
    contact_phone: '05151 123456',
    contact_email: 'info@auto-atelier.de',
    contact_address: 'Musterstraße 12, 31785 Hameln'
};

let recordCount = 0;

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast glass px-5 py-4 rounded-xl border flex items-center gap-3 ${type === 'success' ? 'border-green-500/30' : 'border-red-500/30'}`;
    toast.innerHTML = `
    <svg class="w-5 h-5 ${type === 'success' ? 'text-green-500' : 'text-red-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      ${type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'}
    </svg>
    <span class="text-white text-sm">${message}</span>
  `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

function onConfigChange(config) {
    const c = { ...defaultConfig, ...(config || {}) };

    const h1 = document.getElementById('hero-headline');
    const sub = document.getElementById('hero-subline');
    const cta = document.getElementById('cta-primary');
    const about = document.getElementById('about-text');

    if (h1) h1.textContent = c.hero_headline;
    if (sub) sub.textContent = c.hero_subline;
    if (cta) cta.textContent = c.cta_primary;
    if (about) about.textContent = c.about_text;

    const phone = document.getElementById('contact-phone');
    const email = document.getElementById('contact-email');
    const addr = document.getElementById('contact-address');

    if (phone) phone.textContent = c.contact_phone;
    if (email) email.textContent = c.contact_email;
    if (addr) addr.textContent = c.contact_address;
}

function mapToCapabilities() {
    return { recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined };
}

function mapToEditPanelValues(config) {
    const c = { ...defaultConfig, ...(config || {}) };
    return new Map([
        ['hero_headline', c.hero_headline],
        ['hero_subline', c.hero_subline],
        ['cta_primary', c.cta_primary],
        ['about_text', c.about_text],
        ['contact_phone', c.contact_phone],
        ['contact_email', c.contact_email],
        ['contact_address', c.contact_address],
    ]);
}

async function initApp() {
    // year
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // defaults
    onConfigChange(defaultConfig);

    // SDK init (optional)
    if (window.elementSdk) {
        await window.elementSdk.init({
            defaultConfig,
            onConfigChange,
            mapToCapabilities,
            mapToEditPanelValues
        });
    }

    // Mobile menu
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (btn && menu && overlay) {
        btn.addEventListener('click', () => {
            const isHidden = menu.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', String(!isHidden));
        });

        overlay.addEventListener('click', () => {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        });

        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                menu.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    const newRequestBtn = document.getElementById('new-request-btn');

    if (contactForm && formSuccess && submitBtn && newRequestBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (recordCount >= 999) {
                showToast('Maximale Anzahl an Anfragen erreicht.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Wird gesendet.</span>
      `;

            const payload = {
                name: document.getElementById('name')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                vehicle: document.getElementById('vehicle')?.value || '',
                concern: document.getElementById('concern')?.value || '',
                preferred_date: document.getElementById('preferred_date')?.value || 'Flexibel',
                created_at: new Date().toISOString()
            };

            try {
                if (window.dataSdk) {
                    const result = await window.dataSdk.create(payload);
                    if (!result?.isOk) throw new Error('dataSdk.create failed');
                }

                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                showToast('Ihre Anfrage wurde erfolgreich gesendet!');
                recordCount += 1;
            } catch (err) {
                console.error(err);
                showToast('Fehler beim Senden. Bitte versuchen Sie es erneut.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
          <span>Termin anfragen</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        `;
            }
        });

        newRequestBtn.addEventListener('click', () => {
            contactForm.reset();
            contactForm.classList.remove('hidden');
            formSuccess.classList.add('hidden');
        });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

document.addEventListener('DOMContentLoaded', initApp);
