;; (() => {
    'use strict'

    /* ==========================================================================
       Auto Atelier Demo – app.js (improved)
       - Mobile menu: scroll lock, ESC close, click-outside, focus trap
       - Smooth scroll: closes menu, respects fixed nav via scroll-margin (CSS-side)
       - Form: safer send logic, better UX states
       - Toast: a11y + limiter
       ========================================================================== */

    const defaultConfig = {
        hero_headline: 'Ihre Werkstatt für Diagnose, Wartung & Reparatur',
        hero_subline:
            'Qualität, die überzeugt. Termine, die passen. Preise, die fair sind. Werkstattservice auf Premium-Niveau.',
        cta_primary: 'Termin anfragen',
        about_text:
            'Auto Atelier ist Ihre meistergeführte Werkstatt. Unser Fokus: moderne Diagnostik, saubere Wartung und Reparaturen, die nachhaltig funktionieren – transparent und planbar.',
        contact_phone: '05151 123456',
        contact_email: 'info@auto-atelier.de',
        contact_address: 'Musterstraße 12, 31785 Hameln'
    }

    let recordCount = 0

    function qs(sel, root) {
        return (root || document).querySelector(sel)
    }
    function qsa(sel, root) {
        return Array.from((root || document).querySelectorAll(sel))
    }

    function getFocusable(root) {
        if (!root) return []
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ]
        return qsa(selectors.join(','), root).filter(el => {
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        })
    }

    function showToast(message, type) {
        const container = qs('#toast-container')
        if (!container) return

        const variant = type === 'error' ? 'error' : 'success'
        const icon =
            variant === 'success'
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'

        if (container.children.length >= 3) {
            container.removeChild(container.firstElementChild)
        }

        const toast = document.createElement('div')
        toast.className =
            'toast glass px-5 py-4 rounded-xl border flex items-center gap-3 ' +
            (variant === 'success' ? 'border-green-500/30' : 'border-red-500/30')
        toast.setAttribute('role', 'status')
        toast.setAttribute('aria-live', 'polite')

        toast.innerHTML =
            '<svg class="w-5 h-5 ' +
            (variant === 'success' ? 'text-green-500' : 'text-red-500') +
            '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
            icon +
            '</svg>' +
            '<span class="text-white text-sm">' +
            String(message || '') +
            '</span>'

        container.appendChild(toast)

        window.setTimeout(function () {
            if (toast && toast.parentNode) toast.parentNode.removeChild(toast)
        }, 3200)
    }

    function onConfigChange(config) {
        const c = Object.assign({}, defaultConfig, config || {})

        const h1 = qs('#hero-headline')
        const sub = qs('#hero-subline')
        const cta = qs('#cta-primary')
        const about = qs('#about-text')

        if (h1) h1.textContent = c.hero_headline
        if (sub) sub.textContent = c.hero_subline
        if (cta) cta.textContent = c.cta_primary
        if (about) about.textContent = c.about_text

        const phone = qs('#contact-phone')
        const email = qs('#contact-email')
        const addr = qs('#contact-address')

        if (phone) phone.textContent = c.contact_phone
        if (email) email.textContent = c.contact_email
        if (addr) addr.textContent = c.contact_address
    }

    function mapToCapabilities() {
        return {
            recolorables: [],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
        }
    }

    function mapToEditPanelValues(config) {
        const c = Object.assign({}, defaultConfig, config || {})
        return new Map([
            ['hero_headline', c.hero_headline],
            ['hero_subline', c.hero_subline],
            ['cta_primary', c.cta_primary],
            ['about_text', c.about_text],
            ['contact_phone', c.contact_phone],
            ['contact_email', c.contact_email],
            ['contact_address', c.contact_address]
        ])
    }

    function initMobileMenu() {
        const btn = qs('#mobile-menu-btn')
        const menu = qs('#mobile-menu')
        const overlay = qs('#mobile-menu-overlay')
        if (!btn || !menu || !overlay) return null

        const panel = overlay.nextElementSibling
        let lastActive = null

        function lockScroll(lock) {
            if (lock) {
                document.documentElement.classList.add('overflow-hidden')
                document.body.classList.add('overflow-hidden')
            } else {
                document.documentElement.classList.remove('overflow-hidden')
                document.body.classList.remove('overflow-hidden')
            }
        }

        function isOpen() {
            return !menu.classList.contains('hidden')
        }

        function openMenu() {
            if (isOpen()) return
            lastActive = document.activeElement
            menu.classList.remove('hidden')
            btn.setAttribute('aria-expanded', 'true')
            lockScroll(true)

            const focusables = getFocusable(panel || menu)
            if (focusables.length) focusables[0].focus()
        }

        function closeMenu() {
            if (!isOpen()) return
            menu.classList.add('hidden')
            btn.setAttribute('aria-expanded', 'false')
            lockScroll(false)

            if (lastActive && typeof lastActive.focus === 'function') {
                lastActive.focus()
            }
        }

        btn.addEventListener('click', function () {
            if (isOpen()) closeMenu()
            else openMenu()
        })

        overlay.addEventListener('click', closeMenu)

        document.addEventListener('mousedown', function (e) {
            if (!isOpen()) return
            if (!panel) return
            if (panel.contains(e.target) || btn.contains(e.target)) return
            closeMenu()
        })

        document.addEventListener('keydown', function (e) {
            if (!isOpen()) return
            if (e.key === 'Escape') {
                e.preventDefault()
                closeMenu()
            }
        })

        document.addEventListener('keydown', function (e) {
            if (!isOpen()) return
            if (e.key !== 'Tab') return
            if (!panel) return

            const focusables = getFocusable(panel)
            if (!focusables.length) return

            const first = focusables[0]
            const last = focusables[focusables.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        })

        qsa('a', menu).forEach(function (a) {
            a.addEventListener('click', function () {
                closeMenu()
            })
        })

        return { closeMenu, isOpen }
    }

    function initSmoothScroll(mobileMenuApi) {
        qsa('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                const href = a.getAttribute('href')
                if (!href || href === '#') return

                const target = qs(href)
                if (!target) return

                if (mobileMenuApi && mobileMenuApi.isOpen && mobileMenuApi.isOpen()) {
                    mobileMenuApi.closeMenu()
                }

                e.preventDefault()
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        })
    }

    function setSubmitState(btn, loading) {
        if (!btn) return

        btn.disabled = !!loading

        if (loading) {
            btn.innerHTML =
                '<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">' +
                '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
                '</svg>' +
                '<span>Wird gesendet…</span>'
        } else {
            btn.innerHTML =
                '<span>Termin anfragen</span>' +
                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>' +
                '</svg>'
        }
    }

    async function sendRequest(payload) {
        const ALLOW_DEMO_SUCCESS_WITHOUT_BACKEND = false

        if (window.dataSdk && typeof window.dataSdk.create === 'function') {
            const result = await window.dataSdk.create(payload)
            if (!result || !result.isOk) throw new Error('dataSdk.create failed')
            return true
        }

        if (ALLOW_DEMO_SUCCESS_WITHOUT_BACKEND) return true
        throw new Error('No backend configured (dataSdk missing)')
    }

    function initContactForm() {
        const contactForm = qs('#contact-form')
        const formSuccess = qs('#form-success')
        const submitBtn = qs('#submit-btn')
        const newRequestBtn = qs('#new-request-btn')

        if (!contactForm || !formSuccess || !submitBtn || !newRequestBtn) return

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault()

            if (recordCount >= 999) {
                showToast('Maximale Anzahl an Anfragen erreicht.', 'error')
                return
            }

            setSubmitState(submitBtn, true)

            const payload = {
                name: (qs('#name') && qs('#name').value) || '',
                phone: (qs('#phone') && qs('#phone').value) || '',
                vehicle: (qs('#vehicle') && qs('#vehicle').value) || '',
                concern: (qs('#concern') && qs('#concern').value) || '',
                preferred_date:
                    (qs('#preferred_date') && qs('#preferred_date').value) || 'Flexibel',
                created_at: new Date().toISOString()
            }

            try {
                await sendRequest(payload)

                contactForm.classList.add('hidden')
                formSuccess.classList.remove('hidden')
                showToast('Ihre Anfrage wurde erfolgreich gesendet!', 'success')
                recordCount += 1
            } catch (err) {
                console.error(err)

                const msg =
                    String((err && err.message) || '').indexOf('No backend configured') >=
                        0
                        ? 'Demo: Keine Versand-Integration aktiv. Bitte dataSdk / E-Mail-API anbinden.'
                        : 'Fehler beim Senden. Bitte versuchen Sie es erneut.'

                showToast(msg, 'error')
            } finally {
                setSubmitState(submitBtn, false)
            }
        })

        newRequestBtn.addEventListener('click', function () {
            contactForm.reset()
            contactForm.classList.remove('hidden')
            formSuccess.classList.add('hidden')
        })
    }

    async function initApp() {
        const y = qs('#year')
        if (y) y.textContent = String(new Date().getFullYear())

        onConfigChange(defaultConfig)

        if (window.elementSdk && typeof window.elementSdk.init === 'function') {
            try {
                await window.elementSdk.init({
                    defaultConfig: defaultConfig,
                    onConfigChange: onConfigChange,
                    mapToCapabilities: mapToCapabilities,
                    mapToEditPanelValues: mapToEditPanelValues
                })
            } catch (e) {
                console.warn('elementSdk.init failed', e)
            }
        }

        const mobileMenuApi = initMobileMenu()
        initSmoothScroll(mobileMenuApi)
        initContactForm()
    }

    document.addEventListener('DOMContentLoaded', initApp)
})()
