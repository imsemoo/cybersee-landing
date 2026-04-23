/* ===========================================================================
   CyberSee Landing Page — Main JavaScript
   Theme attribute: data-bs-theme (matches dashboard)
   ===========================================================================*/

document.addEventListener('DOMContentLoaded', () => {

    const html = document.documentElement;

    // ===== AOS =====
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: window.innerWidth < 768 ? 'phone' : false
    });

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');

    const savedTheme = localStorage.getItem('cybersee-theme') || 'dark';
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-bs-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-bs-theme', next);
        localStorage.setItem('cybersee-theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
    }, { passive: true });

    // ===== MOBILE MENU =====
    const navBurger = document.getElementById('navBurger');
    const navMenu   = document.getElementById('navMenu');

    navBurger.addEventListener('click', () => {
        navBurger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
            navBurger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ===== ACTIVE NAV LINK =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__link');

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sections.forEach(s => sectionObserver.observe(s));

    // ===== COUNTER ANIMATION =====
    const statNumbers = document.querySelectorAll('.hero__stat-number[data-count]');

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el) {
        const target   = parseFloat(el.dataset.count);
        const duration = 2000;
        const start    = performance.now();
        const isFloat  = target % 1 !== 0;

        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = eased * target;

            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = isFloat ? target.toFixed(1) : target;
            }
        }
        requestAnimationFrame(update);
    }

    // ===== RISK BAR ANIMATION =====
    const riskBars = document.querySelectorAll('.threats__risk-fill');

    const riskObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.style.getPropertyValue('--fill');
                riskObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    riskBars.forEach(bar => {
        bar.style.width = '0%';
        riskObserver.observe(bar);
    });

    // ===== PARTICLE CANVAS =====
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let mouseX = 0;
        let mouseY = 0;

        function resizeCanvas() {
            const hero = canvas.parentElement;
            canvas.width  = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function getParticleColor() {
            // Read from CSS custom property set per theme
            const style = getComputedStyle(html);
            return style.getPropertyValue('--lp-particle-rgb').trim() || '130, 91, 255';
        }

        class Particle {
            constructor() { this.reset(); }

            reset() {
                this.x      = Math.random() * canvas.width;
                this.y      = Math.random() * canvas.height;
                this.size   = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw(color) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function drawLines(color) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        const opacity = (1 - dist / 150) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = getParticleColor();
            particles.forEach(p => {
                p.update();
                p.draw(color);
            });
            drawLines(color);
            animationId = requestAnimationFrame(animate);
        }

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        initParticles();
        animate();

        // Pause when out of view
        const heroObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animate();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        }, { threshold: 0 });

        heroObserver.observe(canvas.parentElement);
    }

    // ===== THREAT FEED STAGGER =====
    const threatFeed = document.querySelector('.threats__feed');
    if (threatFeed) {
        const items = threatFeed.querySelectorAll('.threat-item');
        const feedObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach((item, i) => {
                        item.style.opacity   = '0';
                        item.style.transform = 'translateX(-20px)';
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                            item.style.opacity    = '1';
                            item.style.transform  = 'translateX(0)';
                        }, i * 150);
                    });
                    feedObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        feedObserver.observe(threatFeed);
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== THREAT STAT COUNTER =====
    const threatStatValue = document.querySelector('.threats__stat-value--animate');
    if (threatStatValue) {
        const targetVal = parseInt(threatStatValue.textContent);
        const statObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let current = 0;
                    const increment = Math.ceil(targetVal / 60);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= targetVal) {
                            current = targetVal;
                            clearInterval(timer);
                        }
                        threatStatValue.textContent = current.toLocaleString();
                    }, 30);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statObserver.observe(threatStatValue);
    }

    // ===== NAVBAR DROPDOWNS (click behavior for mobile/touch) =====
    const dropdownToggles = document.querySelectorAll('.navbar__link--dropdown');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = toggle.closest('.navbar__item');
            const wasOpen = parent.classList.contains('is-open');
            // Close all other dropdowns first
            document.querySelectorAll('.navbar__item.is-open').forEach(item => {
                if (item !== parent) item.classList.remove('is-open');
            });
            parent.classList.toggle('is-open', !wasOpen);
            toggle.setAttribute('aria-expanded', String(!wasOpen));
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar__item.has-dropdown')) {
            document.querySelectorAll('.navbar__item.is-open').forEach(item => {
                item.classList.remove('is-open');
                const btn = item.querySelector('.navbar__link--dropdown');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // Close dropdowns on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.navbar__item.is-open').forEach(item => {
                item.classList.remove('is-open');
                const btn = item.querySelector('.navbar__link--dropdown');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // ===== DASHBOARD PREVIEW TABS =====
    const dashboardTabs  = document.querySelectorAll('.dashboard-preview__tab');
    const dashboardImage = document.getElementById('dashboard-preview-image');
    const dashboardUrl   = document.getElementById('dashboard-preview-url');

    const tabContent = {
        'brand-protection': {
            src:  'assets/dashboard-preview/brand-protection.png',
            alt:  'Cybersee Brand Protection dashboard — phishing monitoring',
            url:  'platform.cybersee.io/dashboard/phishing',
        },
        'attack-surface': {
            src:  'assets/dashboard-preview/attack-surface.png',
            alt:  'Cybersee Attack Surface Detection dashboard',
            url:  'platform.cybersee.io/dashboard/domain_scan',
        },
        'dark-web': {
            src:  'assets/dashboard-preview/dark-web.png',
            alt:  'Cybersee Dark Web Intelligence dashboard — credential leaks',
            url:  'platform.cybersee.io/dashboard/data_leak',
        },
    };

    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dashboardTabs.forEach(t => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');

            const content = tabContent[tab.dataset.tab];
            if (!content || !dashboardImage) return;

            // Subtle fade transition on image swap
            dashboardImage.style.opacity = '0';
            setTimeout(() => {
                dashboardImage.src = content.src;
                dashboardImage.alt = content.alt;
                if (dashboardUrl) dashboardUrl.textContent = content.url;
                dashboardImage.style.opacity = '1';
            }, 160);
        });
    });

    // Ensure smooth fade is always available on the image
    if (dashboardImage) {
        dashboardImage.style.transition = 'opacity 0.2s ease';
    }

});
