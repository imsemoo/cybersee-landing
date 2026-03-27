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

    // ===== HERO LIVE COUNTER (incrementing threat count) =====
    const heroCounter = document.getElementById('heroLiveCounter');
    if (heroCounter) {
        const baseVal = parseInt(heroCounter.dataset.base) || 14847;
        let currentVal = baseVal;

        function updateHeroCounter() {
            // Random increment 1-4 every 3-8 seconds
            const increment = Math.floor(Math.random() * 4) + 1;
            currentVal += increment;
            heroCounter.textContent = currentVal.toLocaleString();
            // Flash effect on update
            heroCounter.classList.remove('hero-counter--flash');
            void heroCounter.offsetWidth; // force reflow
            heroCounter.classList.add('hero-counter--flash');
        }

        function scheduleNextUpdate() {
            const delay = 3000 + Math.random() * 5000; // 3-8s
            setTimeout(() => {
                updateHeroCounter();
                scheduleNextUpdate();
            }, delay);
        }

        scheduleNextUpdate();
    }

    // ===== HERO TICKER — Auto-cycling live activity feed =====
    const heroTicker = document.getElementById('heroTicker');
    if (heroTicker) {
        const tickerItems = heroTicker.querySelectorAll('.hero__ticker-item');
        let tickerIndex = 0;
        const itemHeight = 42; // matches CSS min-height

        setInterval(() => {
            tickerIndex = (tickerIndex + 1) % tickerItems.length;
            heroTicker.style.transform = `translateY(-${tickerIndex * itemHeight}px)`;
        }, 3500);
    }

    // ===== LIVE THREAT FEED — Auto-cycling new threats =====
    const liveFeed = document.getElementById('liveThreatFeed');
    if (liveFeed) {
        const incomingThreats = [
            { severity: 'critical', category: 'Data Breach', text: 'Database dump containing 18K customer records posted on dark web marketplace', time: 'just now' },
            { severity: 'high', category: 'Credential Leak', text: 'C-suite executive credentials found in stealer log collection — ***@company.com', time: 'just now' },
            { severity: 'critical', category: 'Ransomware', text: 'New ransomware variant targeting your industry detected — IOCs match your infrastructure', time: 'just now' },
            { severity: 'high', category: 'Phishing', text: 'Cloned login page detected on newly registered domain — SSL active', time: 'just now' },
            { severity: 'medium', category: 'Recon', text: 'Threat actor advertising access to your network segment on underground forum', time: 'just now' },
            { severity: 'critical', category: 'Exposure', text: 'Internal Jenkins server credentials found in public GitHub repository', time: 'just now' },
        ];

        let threatCycleIndex = 0;
        let feedActive = false;

        const feedCycleObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                feedActive = entry.isIntersecting;
            });
        }, { threshold: 0.2 });

        feedCycleObserver.observe(liveFeed);

        setInterval(() => {
            if (!feedActive) return;

            const threat = incomingThreats[threatCycleIndex % incomingThreats.length];
            threatCycleIndex++;

            const newItem = document.createElement('div');
            newItem.className = `threat-item threat-item--${threat.severity} threat-item--flash-in`;
            newItem.innerHTML = `
                <span class="threat-item__severity">${threat.severity.toUpperCase()}</span>
                <span class="threat-item__category">${threat.category}</span>
                <span class="threat-item__text">${threat.text}</span>
                <span class="threat-item__time">${threat.time}</span>
            `;

            // Remove last item, insert new at top
            const items = liveFeed.querySelectorAll('.threat-item');
            if (items.length >= 6) {
                items[items.length - 1].remove();
            }
            liveFeed.insertBefore(newItem, liveFeed.firstChild);

            // Remove flash class after animation
            setTimeout(() => {
                newItem.classList.remove('threat-item--flash-in');
            }, 800);
        }, 6000);
    }

    // ===== PLATFORM BAR CHART ANIMATION =====
    const platformBars = document.querySelectorAll('.platform__bar');
    if (platformBars.length) {
        const barObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = entry.target.querySelectorAll('.platform__bar');
                    bars.forEach((bar, i) => {
                        setTimeout(() => {
                            bar.style.height = bar.style.getPropertyValue('--bar-height');
                        }, i * 150);
                    });
                    barObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const barChart = document.getElementById('platformBarChart');
        if (barChart) barObserver.observe(barChart);
    }

    // ===== PLATFORM CARD TILT (subtle 3D on mouse move) =====
    const platformCards = document.querySelectorAll('.platform__card');
    if (platformCards.length && window.innerWidth > 768) {
        platformCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ===== PLATFORM ALERT STAGGER =====
    const alertList = document.querySelector('.platform__alert-list');
    if (alertList) {
        const alertItems = alertList.querySelectorAll('.platform__alert-item');
        const alertObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    alertItems.forEach((item, i) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateX(-16px)';
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                        }, i * 120);
                    });
                    alertObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        alertObserver.observe(alertList);
    }

    // ===== PLATFORM LOG ROW STAGGER =====
    const logTable = document.querySelector('.platform__log-table');
    if (logTable) {
        const logRows = logTable.querySelectorAll('.platform__log-row');
        const logObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    logRows.forEach((row, i) => {
                        row.style.opacity = '0';
                        row.style.transform = 'translateY(8px)';
                        setTimeout(() => {
                            row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            row.style.opacity = '1';
                            row.style.transform = 'translateY(0)';
                        }, i * 100);
                    });
                    logObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        logObserver.observe(logTable);
    }

    // ===== FLOATING THREAT TOAST =====
    const toast = document.getElementById('threatToast');
    const toastText = document.getElementById('threatToastText');
    if (toast && toastText) {
        const toastMessages = [
            'Critical credential exposure — executive accounts compromised',
            'Ransomware group claiming new victim in your sector',
            'Phishing campaign targeting your domain detected',
            'Employee credentials found in dark web marketplace',
            'Sensitive documents listed for sale on underground forum',
            'New lookalike domain registered — matches your brand',
            'Stealer log collection contains your corporate emails',
            'Threat actor discussing your infrastructure on private channel',
        ];

        let toastIndex = 0;
        let toastTimeout;

        function showToast() {
            toastText.textContent = toastMessages[toastIndex % toastMessages.length];
            toastIndex++;
            toast.classList.add('threat-toast--visible');

            // Auto-hide after 5 seconds
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('threat-toast--visible');
            }, 5000);
        }

        // First toast after 12 seconds, then every 25-40 seconds
        setTimeout(() => {
            showToast();
            setInterval(() => {
                showToast();
            }, 25000 + Math.random() * 15000);
        }, 12000);
    }

    // ===== PROBLEM STAT COUNTUP =====
    const problemStats = document.querySelectorAll('.problem__card-stat[data-stat]');
    if (problemStats.length) {
        const statCountObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.stat);
                    const prefix = el.dataset.prefix || '';
                    const suffix = el.dataset.suffix || '';
                    const isFloat = target % 1 !== 0;
                    const duration = 1800;
                    const start = performance.now();

                    el.classList.add('counted');

                    function update(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = eased * target;

                        el.textContent = prefix + (isFloat ? current.toFixed(2) : Math.floor(current)) + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            el.textContent = prefix + (isFloat ? target.toFixed(2) : target) + suffix;
                        }
                    }
                    requestAnimationFrame(update);
                    statCountObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        problemStats.forEach(el => statCountObserver.observe(el));
    }

    // ===== THREAT FEED LIVE TIME TICKER =====
    // Update all visible threat times every 60 seconds
    setInterval(() => {
        const timeEls = document.querySelectorAll('.threat-item__time');
        timeEls.forEach(el => {
            const text = el.textContent.trim();
            if (text === 'just now') {
                el.textContent = '1m ago';
            } else {
                const match = text.match(/^(\d+)(m|h) ago$/);
                if (match) {
                    let val = parseInt(match[1]);
                    const unit = match[2];
                    if (unit === 'm') {
                        val += 1;
                        el.textContent = val >= 60 ? '1h ago' : val + 'm ago';
                    }
                    // hours stay stable — don't over-increment
                }
            }
        });
    }, 60000);

});
