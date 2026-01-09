/* ==========================================================================
   Auto Atelier — Demo (vs-demo-auto-atelier)
   app.js
   - Works with or without elementSdk / dataSdk
   ========================================================================== */

const defaultConfig = {
    hero_headline: "Ihre Werkstatt für Diagnose, Wartung & Reparatur",
    hero_subline:
        "Qualität, die überzeugt. Termine, die passen. Preise, die fair sind. Erleben Sie Werkstattservice auf Premium-Niveau.",
    cta_primary: "Termin anfragen",
    about_text:
        "Auto Atelier ist Ihre meistergeführte Werkstatt in Hameln. Unser Fokus liegt auf moderner Fahrzeugdiagnostik und zuverlässiger Wartung — für alle Marken und Modelle. Mit über 15 Jahren Erfahrung und kontinuierlicher Weiterbildung sind wir Ihr kompetenter Partner rund ums Auto.",
    contact_phone: "05151 123456",
    contact_email: "info@auto-atelier.de",
    contact_address: "Musterstraße 12, 31785 Hameln",
    background_color: "#0a0a0a",
    surface_color: "#141414",
    text_color: "#e5e5e5",
    primary_color: "#0ea5e9",
    secondary_color: "#404040",
};

let recordCount = 0;

function qs(id) {
    return document.getElementById(id);
}

function safeText(id, value) {
    const el = qs(id);
    if (!el) return;
    el.textContent = value;
}

function showToast(message, type = "success") {
    const container = qs("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast glass-card px-6 py-4 rounded-xl border flex items-center gap-3 ${type === "success" ? "border-green-500/30" : "border-red-500/30"
        }`;

    toast.innerHTML = `
    <svg class="w-5 h-5 ${type === "success" ? "text-green-500" : "text-red-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === "success"
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
        }
    </svg>
    <span class="text-white text-sm">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function applyConfig(config) {
    const c = { ...defaultConfig, ...(config || {}) };

    safeText("hero-headline", c.hero_headline);
    safeText("hero-subline", c.hero_subline);
    safeText("cta-primary", c.cta_primary);
    safeText("about-text", c.about_text);

    safeText("contact-phone", c.contact_phone);
    safeText("contact-email", c.contact_email);
    safeText("contact-address", c.contact_address);

    document.documentElement.style.setProperty("--color-bg", c.background_color);
    document.documentElement.style.setProperty("--color-surface", c.surface_color);
    document.documentElement.style.setProperty("--color-text", c.text_color);
    document.documentElement.style.setProperty("--color-primary", c.primary_color);
    document.documentElement.style.setProperty("--color-secondary", c.secondary_color);
}

/* Canva Element SDK helpers (only used if elementSdk exists) */
function mapToCapabilities(config) {
    return {
        recolorables: [
            { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
            { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
            { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
            { get: () => config.primary_color || defaultConfig.primary_color, set: (v) => { config.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); } },
            { get: () => config.secondary_color || defaultConfig.secondary_color, set: (v) => { config.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); } },
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined,
    };
}

function mapToEditPanelValues(config) {
    const c = { ...defaultConfig, ...(config || {}) };
    return new Map([
        ["hero_headline", c.hero_headline],
        ["hero_subline", c.hero_subline],
        ["cta_primary", c.cta_primary],
        ["about_text", c.about_text],
        ["contact_phone", c.contact_phone],
        ["contact_email", c.contact_email],
        ["contact_address", c.contact_address],
    ]);
}

function initMobileMenu() {
    const btn = qs("mobile-menu-btn");
    const menu = qs("mobile-menu");
    const overlay = qs("mobile-menu-overlay");
    if (!btn || !menu || !overlay) return;

    btn.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });

    overlay.addEventListener("click", () => {
        menu.classList.add("hidden");
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => menu.classList.add("hidden"));
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function initContactForm() {
    const contactForm = qs("contact-form");
    const formSuccess = qs("form-success");
    const submitBtn = qs("submit-btn");
    const newRequestBtn = qs("new-request-btn");

    if (!contactForm || !formSuccess || !submitBtn || !newRequestBtn) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (recordCount >= 999) {
            showToast("Maximale Anzahl an Anfragen erreicht.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Wird gesendet.</span>
    `;

        const formData = {
            name: qs("name")?.value || "",
            phone: qs("phone")?.value || "",
            vehicle: qs("vehicle")?.value || "",
            concern: qs("concern")?.value || "",
            preferred_date: qs("preferred_date")?.value || "Flexibel",
            created_at: new Date().toISOString(),
        };

        try {
            if (window.dataSdk) {
                const result = await window.dataSdk.create(formData);
                if (!result?.isOk) throw new Error("dataSdk.create failed");
            }
            // fallback works same: just show success
            contactForm.classList.add("hidden");
            formSuccess.classList.remove("hidden");
            showToast("Ihre Anfrage wurde erfolgreich gesendet!");
            recordCount += 1;
        } catch (err) {
            console.error(err);
            showToast("Fehler beim Senden. Bitte versuchen Sie es erneut.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
        <span>Termin anfragen</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
        `;
        }
    });

    newRequestBtn.addEventListener("click", () => {
        contactForm.reset();
        contactForm.classList.remove("hidden");
        formSuccess.classList.add("hidden");
    });
}

async function initSdkIfPresent() {
    // Apply defaults immediately
    applyConfig(defaultConfig);

    // Element SDK (optional)
    if (window.elementSdk) {
        await window.elementSdk.init({
            defaultConfig,
            onConfigChange: applyConfig,
            mapToCapabilities,
            mapToEditPanelValues,
        });
    }

    // Data SDK (optional)
    if (window.dataSdk) {
        const initResult = await window.dataSdk.init(async () => ({ records: [] }));
        if (!initResult?.isOk) console.error("Failed to initialize data SDK");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initSdkIfPresent();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
});
