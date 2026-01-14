/* ==========================================================================
   Auto Atelier Demo — app.js (stable for GitHub Pages)
   - Mobile menu: open/close with overlay, click-outside, ESC, link click
   - Smooth scroll: closes menu first, then scrollIntoView
   - Sets year + binds config texts
   - Contact form: demo mode (no backend) -> toast error
   ========================================================================== */

const defaultConfig = {
    hero_headline: "Ihre Werkstatt für Diagnose, Wartung & Reparatur",
    hero_subline:
        "Qualität, die überzeugt. Termine, die passen. Preise, die fair sind. Werkstattservice auf Premium-Niveau.",
    cta_primary: "Termin anfragen",
    about_text:
        "Auto Atelier ist Ihre meistergeführte Werkstatt. Unser Fokus: moderne Diagnostik, saubere Wartung und Reparaturen, die nachhaltig funktionieren – transparent und planbar.",
    contact_phone: "05151 123456",
    contact_email: "info@auto-atelier.de",
    contact_address: "Musterstraße 12, 31785 Hameln",
};

function qs(sel, root) {
    return (root || document).querySelector(sel);
}
function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
}

function showToast(message, type = "success") {
    const container = qs("#toast-container");
    if (!container) return;

    // limit to 3 toasts
    while (container.children.length >= 3) container.removeChild(container.firstElementChild);

    const variant = type === "error" ? "error" : "success";
    const icon =
        variant === "success"
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';

    const toast = document.createElement("div");
    toast.className =
        "toast glass px-5 py-4 rounded-xl border flex items-center gap-3 " +
        (variant === "success" ? "border-green-500/30" : "border-red-500/30");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    toast.innerHTML =
        '<svg class="w-5 h-5 ' +
        (variant === "success" ? "text-green-500" : "text-red-500") +
        '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
        icon +
        "</svg>" +
        '<span class="text-white text-sm">' +
        String(message || "") +
        "</span>";

    container.appendChild(toast);
    window.setTimeout(() => {
        try { toast.remove(); } catch (_) { }
    }, 3200);
}

/** Bind config -> DOM */
function onConfigChange(config) {
    const c = { ...defaultConfig, ...(config || {}) };

    const h1 = qs("#hero-headline");
    const sub = qs("#hero-subline");
    const cta = qs("#cta-primary");
    const about = qs("#about-text");

    if (h1) h1.textContent = c.hero_headline;
    if (sub) sub.textContent = c.hero_subline;
    if (cta) cta.textContent = c.cta_primary;
    if (about) about.textContent = c.about_text;

    const phone = qs("#contact-phone");
    const email = qs("#contact-email");
    const addr = qs("#contact-address");

    if (phone) phone.textContent = c.contact_phone;
    if (email) email.textContent = c.contact_email;
    if (addr) addr.textContent = c.contact_address;
}

/** Mobile menu */
function initMobileMenu() {
    const btn = qs("#mobile-menu-btn");
    const menu = qs("#mobile-menu");
    const overlay = qs("#mobile-menu-overlay");

    // Panel: der Bereich, der NICHT Overlay ist (dein "absolute top-16 ...")
    const panel = menu ? qs(".glass", menu) : null;

    if (!btn || !menu || !overlay) return null;

    function lockScroll(lock) {
        const on = !!lock;
        document.documentElement.classList.toggle("overflow-hidden", on);
        document.body.classList.toggle("overflow-hidden", on);
    }

    function isOpen() {
        return !menu.classList.contains("hidden");
    }

    function openMenu() {
        if (isOpen()) return;
        menu.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
        lockScroll(true);
    }

    function closeMenu() {
        if (!isOpen()) return;
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
        lockScroll(false);
    }

    btn.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    overlay.addEventListener("click", closeMenu);

    // Click outside panel (desktop + mobile)
    function onOutside(e) {
        if (!isOpen()) return;

        const t = e && e.target ? e.target : null;
        if (!t) return;

        if (panel && panel.contains(t)) return; // click inside panel
        if (btn.contains(t)) return;            // click on toggle button

        closeMenu();
    }

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside, { passive: true });

    // ESC
    document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") closeMenu();
    });

    // close on link click inside menu
    qsa('a[href^="#"]', menu).forEach((a) => a.addEventListener("click", closeMenu));

    return { isOpen, closeMenu, openMenu };
}

/** Smooth scroll: close menu first */
function initSmoothScroll(mobileMenuApi) {
    qsa('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;

            // Nur echte IDs behandeln
            const target = qs(href);
            if (!target) return;

            // Wichtig: Nur dann preventDefault, wenn wir wirklich scrollen
            e.preventDefault();

            if (mobileMenuApi && mobileMenuApi.isOpen()) mobileMenuApi.closeMenu();

            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

/** Contact form (demo) */
function initContactForm() {
    const contactForm = qs("#contact-form");
    const formSuccess = qs("#form-success");
    const submitBtn = qs("#submit-btn");
    const newRequestBtn = qs("#new-request-btn");

    // In deinem aktuellen HTML ist formSuccess zwar vorhanden,
    // aber du wolltest "no fake success" -> wir zeigen NICHT success an.
    // Trotzdem lassen wir die Elemente drin (falls du später umstellst).
    if (!contactForm || !submitBtn) return;

    function setSubmitState(loading) {
        submitBtn.disabled = !!loading;

        if (loading) {
            submitBtn.innerHTML =
                '<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">' +
                '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
                "</svg><span>Wird gesendet…</span>";
        } else {
            submitBtn.innerHTML =
                "<span>Termin anfragen</span>" +
                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>' +
                "</svg>";
        }
    }

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        setSubmitState(true);

        try {
            // Demo: no backend
            await new Promise((r) => setTimeout(r, 350));
            throw new Error("No backend configured");
        } catch (err) {
            showToast("Demo: Keine Versand-Integration aktiv. Bitte E-Mail/Backend anbinden.", "error");
        } finally {
            setSubmitState(false);
        }
    });

    // Optional: wenn du später doch success block nutzt
    if (newRequestBtn && formSuccess) {
        newRequestBtn.addEventListener("click", () => {
            contactForm.reset();
            contactForm.classList.remove("hidden");
            formSuccess.classList.add("hidden");
        });
    }
}

/** Init */
document.addEventListener("DOMContentLoaded", () => {
    // year
    const y = qs("#year");
    if (y) y.textContent = String(new Date().getFullYear());

    // texts
    onConfigChange(defaultConfig);

    // menus / scroll / form
    const mobileMenuApi = initMobileMenu();
    initSmoothScroll(mobileMenuApi);
    initContactForm();
});
