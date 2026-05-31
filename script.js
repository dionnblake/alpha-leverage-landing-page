const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COOKIE_CONSENT_KEY = 'alpha_cookie_consent_v1';
window.openGhlChatFromCTA = () => {
    const ghlApi = window.leadConnector && window.leadConnector.chatWidget;
    if(ghlApi && typeof ghlApi.openWidget === 'function') {
        ghlApi.openWidget();
        return true;
    }

    const launcher = document.querySelector('#chat-widget-container button, button[class*="chat"], button[aria-label*="chat" i]');
    if(launcher && typeof launcher.click === 'function') {
        launcher.click();
        return true;
    }

    const contact = document.getElementById('contact');
    if(contact) {
        contact.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    return false;
};

        // 1. Mesh Background
        (function(){
            if(prefersReducedMotion) return;
            const canvas = document.getElementById('meshBg');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            let blobs = [
                {x: 0.2, y: 0.3, vx: 0.0005, vy: 0.0008, r: 0.5, color: 'rgba(56, 189, 248, 0.15)'},
                {x: 0.8, y: 0.7, vx: -0.0007, vy: -0.0005, r: 0.6, color: 'rgba(56, 189, 248, 0.1)'},
                {x: 0.5, y: 0.5, vx: 0.0008, vy: -0.0006, r: 0.7, color: 'rgba(56, 189, 248, 0.05)'}
            ];

            function resize() {
                const isMobile = window.innerWidth < 768;
                canvas.width = window.innerWidth * (isMobile ? 1 : window.devicePixelRatio);
                canvas.height = window.innerHeight * (isMobile ? 1 : window.devicePixelRatio);
            }
            window.addEventListener('resize', resize);
            resize();

            let running = true;
            document.addEventListener('visibilitychange', () => {
                running = !document.hidden;
                if(running) requestAnimationFrame(draw);
            });

            function draw() {
                if(!running) return;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                blobs.forEach(b => {
                    b.x += b.vx;
                    b.y += b.vy;
                    if(b.x < 0 || b.x > 1) b.vx *= -1;
                    if(b.y < 0 || b.y > 1) b.vy *= -1;

                    const x = b.x * canvas.width;
                    const y = b.y * canvas.height;
                    const rad = b.r * Math.max(canvas.width, canvas.height);

                    const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
                    grd.addColorStop(0, b.color);
                    grd.addColorStop(1, 'transparent');

                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = grd;
                    ctx.fillRect(0,0,canvas.width, canvas.height);
                });
                requestAnimationFrame(draw);
            }
            draw();
        })();

        // 2. Text Scramble
        (function() {
            const chars = '!@#$%^&*()_+{}:"<>?|[]\;,./';
            function scramble(el, duration = 2000) {
                const final = el.dataset.scramble;
                const len = final.length;
                let start = null;

                function frame(ts) {
                    if(!start) start = ts;
                    const prog = Math.min((ts - start) / duration, 1);
                    let res = '';
                    for(let i=0; i<len; i++) {
                        if(final[i] === ' ') { res += ' '; continue; }
                        const threshold = (i / len) * 0.8;
                        if(prog >= threshold) {
                            res += `<span style="color:var(--text)">${final[i]}</span>`;
                        } else {
                            res += `<span style="color:var(--text-muted)">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                        }
                    }
                    el.innerHTML = res;
                    if(prog < 1) requestAnimationFrame(frame);
                }
                requestAnimationFrame(frame);
            }
            
            const titleEl = document.getElementById('hero-title');
            if(prefersReducedMotion) {
                titleEl.textContent = titleEl.dataset.scramble;
            } else {
                setTimeout(() => scramble(titleEl), 500);
            }

            // Intro animations
            const introDuration = prefersReducedMotion ? 0.01 : 1;
            gsap.to('.hero-label', { opacity: 1, y: 0, duration: introDuration, delay: 0.2 });
            gsap.to('#hero-sub', { opacity: 1, y: 0, duration: introDuration, delay: prefersReducedMotion ? 0.2 : 1.2 });
            gsap.to('.hero-actions', { opacity: 1, y: 0, duration: introDuration, delay: prefersReducedMotion ? 0.2 : 1.5 });
        })();

        const updateSpotlight = (e, target) => {
            const rect = target.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
            target.style.setProperty('--mx', x + 'px');
            target.style.setProperty('--my', y + 'px');
        };

        const grid = document.getElementById('processGrid');
        if(grid) {
            grid.addEventListener('mousemove', (e) => {
                const cards = document.querySelectorAll('.spot-card');
                cards.forEach(c => updateSpotlight(e, c));
            });

            // Touch support for cards
            grid.addEventListener('touchstart', (e) => {
                const card = e.target.closest('.spot-card');
                if(card) updateSpotlight(e, card);
            }, {passive: true});
        }

        // 4. Wire page CTAs to GoHighLevel widget + cookie banner
        window.addEventListener('load', () => {
            const cookieBanner = document.getElementById('cookie-banner');
            const cookieAccept = document.getElementById('cookie-accept');
            const cookieReject = document.getElementById('cookie-reject');
            const cookieManage = document.getElementById('cookie-manage');
            const ctaButtons = document.querySelectorAll('#agent-start, .voice-open, .chat-open');

            const saveConsent = (choice) => {
                try {
                    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
                } catch {}
            };

            const getConsent = () => {
                try {
                    return localStorage.getItem(COOKIE_CONSENT_KEY);
                } catch {
                    return null;
                }
            };

            const hideBanner = () => {
                if(cookieBanner) cookieBanner.hidden = true;
            };

            const showBanner = () => {
                if(cookieBanner) cookieBanner.hidden = false;
            };

            const consent = getConsent();
            if(consent === 'accepted' || consent === 'rejected') {
                hideBanner();
            } else {
                showBanner();
            }

            if(cookieAccept) {
                cookieAccept.addEventListener('click', () => {
                    saveConsent('accepted');
                    hideBanner();
                });
            }

            if(cookieReject) {
                cookieReject.addEventListener('click', () => {
                    saveConsent('rejected');
                    hideBanner();
                });
            }

            if(cookieManage) {
                cookieManage.addEventListener('click', () => {
                    const current = getConsent();
                    if(current === 'accepted' || current === 'rejected') {
                        try {
                            localStorage.removeItem(COOKIE_CONSENT_KEY);
                        } catch {}
                    }
                    showBanner();
                });
            }

            ctaButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    window.openGhlChatFromCTA();
                });
            });
        });

        // 5. ROI Calculator
        const callsIn = document.getElementById('input-calls');
        const convIn = document.getElementById('input-conv');
        const jobIn = document.getElementById('input-job');
        const QUALIFIED_RATE = 0.60;
        const RECOVERY_RATE = 0.40;

        function updateROI() {
            const calls = parseInt(callsIn.value);
            const closeRate = parseInt(convIn.value) / 100;
            const job = parseInt(jobIn.value);

            document.getElementById('val-calls').textContent = calls;
            document.getElementById('val-conv').textContent = convIn.value + '%';
            document.getElementById('val-job').textContent = '$' + job.toLocaleString();

            callsIn.setAttribute('aria-valuenow', callsIn.value);
            convIn.setAttribute('aria-valuenow', convIn.value);
            jobIn.setAttribute('aria-valuenow', jobIn.value);

            const yearlyMissedCalls = calls * 365;
            const qualifiedMissedCalls = yearlyMissedCalls * QUALIFIED_RATE;
            const estimatedRisk = qualifiedMissedCalls * closeRate * job * (1 - RECOVERY_RATE);

            document.getElementById('result-risk').textContent = '$' + Math.round(estimatedRisk).toLocaleString();
        }

        [callsIn, convIn, jobIn].forEach(i => i.addEventListener('input', updateROI));
        updateROI();

        // 6. FAQ
        document.querySelectorAll('.faq-trigger').forEach(btn => {
            const panelId = btn.getAttribute('aria-controls');
            const panel = panelId ? document.getElementById(panelId) : null;
            const icon = btn.querySelector('span');

            const setExpanded = (isExpanded) => {
                btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                if(panel) {
                    panel.hidden = !isExpanded;
                }
                const item = btn.parentElement;
                if(item) {
                    item.classList.toggle('active', isExpanded);
                }
                if(icon) {
                    icon.textContent = isExpanded ? '-' : '+';
                }
            };

            setExpanded(false);
            btn.addEventListener('click', () => {
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                setExpanded(!isExpanded);
            });
        });

        // 7. Stats counter
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
            trigger: '#stat-count',
            start: 'top 80%',
            onEnter: () => {
                if(prefersReducedMotion) {
                    document.getElementById('stat-count').textContent = '82%';
                    return;
                }
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: 82,
                    duration: 2,
                    onUpdate: () => {
                        document.getElementById('stat-count').textContent = Math.floor(obj.val) + '%';
                    }
                });
            }
        });

        // 8. Contact form AJAX submission
        (function() {
            const form = document.getElementById('contact-form');
            const feedback = document.getElementById('form-feedback');
            const submitBtn = document.getElementById('form-submit');
            if(!form || !feedback || !submitBtn) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                feedback.className = 'form-feedback';
                feedback.textContent = '';

                if(!form.checkValidity()) {
                    feedback.className = 'form-feedback error';
                    feedback.textContent = 'Please fill in every field before sending.';
                    return;
                }

                const originalLabel = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: new FormData(form),
                        headers: { 'Accept': 'application/json' }
                    });

                    if(response.ok) {
                        feedback.className = 'form-feedback success';
                        feedback.textContent = "Got it. We'll be in touch within one business day to set up your demo.";
                        form.reset();
                    } else {
                        const data = await response.json().catch(() => null);
                        const message = (data && data.errors && data.errors[0] && data.errors[0].message) || 'Something went wrong. Please try again or call us directly.';
                        feedback.className = 'form-feedback error';
                        feedback.textContent = message;
                    }
                } catch (err) {
                    feedback.className = 'form-feedback error';
                    feedback.textContent = 'Network issue. Please check your connection and try again.';
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
            });
        })();
