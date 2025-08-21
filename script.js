const App = (() => {
    const SKILLS = [
        'PYTHON', 'FASTAPI', 'DOCKER', 'KUBERNETES', 'OWASP MASVS', 'OWASP MASTG',
        'MOBILE SECURITY', 'REVERSE ENGINEERING', 'FRIDA', 'GHIDRA', 'IDA PRO',
        'BURP SUITE', 'POSTGRESQL', 'MICROSERVICES', 'MACHINE LEARNING',
        'VULNERABILITY RESEARCH', 'PENETRATION TESTING', 'MALWARE ANALYSIS',
        'CRYPTOGRAPHY', 'API SECURITY', 'AUTOMATED TESTING', 'DISTRIBUTED SYSTEMS',
        'CELERY', 'RABBITMQ', 'SAST', 'DAST', 'JWT', 'OAUTH', 'TLS/SSL',
        'PROMETHEUS', 'GRAFANA'
    ];

    const CONFIG = {
        scroll: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
        matrix: {
            cellSizes: { mobile: 35, tablet: 42, desktop: 48 },
            animation: { baseAmplitude: 0.6, lerpFactor: 0.15, maxDistance: 200 },
            skill: { displayTime: 3000, fadeTime: 300 }
        },
        mobile: { breakpoint: 768, tabletBreakpoint: 1024 }
    };

    const ScrollAnimations = {
        init() {
            const observer = new IntersectionObserver(
                entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')),
                CONFIG.scroll
            );
            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
    };

    const Utils = {
        debounce(func, wait) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        getCellSize() {
            const { innerWidth } = window;
            const { mobile, tablet, desktop } = CONFIG.matrix.cellSizes;
            return innerWidth < CONFIG.mobile.breakpoint ? mobile 
                 : innerWidth < CONFIG.mobile.tabletBreakpoint ? tablet : desktop;
        },

        removeElement(element) {
            element?.parentNode?.removeChild(element);
        }
    };

    const MatrixEffect = {
        container: null,
        numbers: [],
        mouse: { x: 0, y: 0 },
        currentSkill: null,
        skillTimeout: null,

        init() {
            this.container = document.getElementById('matrix-container');
            if (!this.container) return;

            this.createGrid();
            this.animate();
            this.bindEvents();
        },

        createGrid() {
            const rect = this.container.getBoundingClientRect();
            const cellSize = Utils.getCellSize();
            
            let cols = Math.floor(rect.width / cellSize);
            let rows = Math.floor(rect.height / cellSize);
            
            if (rect.width - (cols * cellSize) > cellSize * 0.5) cols++;
            if (rect.height - (rows * cellSize) > cellSize * 0.5) rows++;
            
            const cellWidth = rect.width / cols;
            const cellHeight = rect.height / rows;
            
            this.container.innerHTML = '';
            this.numbers = [];
            
            this.generateNumberGrid(rows, cols, cellWidth, cellHeight);
        },

        generateNumberGrid(rows, cols, cellWidth, cellHeight) {
            const grid = [];
            
            for (let row = 0; row < rows; row++) {
                grid[row] = [];
                for (let col = 0; col < cols + 1; col++) {
                    const number = this.createNumberElement(row, col, grid, cellWidth, cellHeight);
                    this.container.appendChild(number.element);
                    this.numbers.push(number);
                }
            }
            return grid;
        },

        createNumberElement(row, col, grid, cellWidth, cellHeight) {
            const element = document.createElement('div');
            element.className = 'matrix-number';
            
            const num = this.generateUniqueNumber(row, col, grid);
            element.textContent = num;
            grid[row][col] = num;
            
            const x = col * cellWidth + cellWidth / 2;
            const y = row * cellHeight + cellHeight / 2;
            
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            
            return {
                element, x, y,
                targetOffset: { x: 0, y: 0 },
                currentOffset: { x: 0, y: 0 },
                targetScale: 1, currentScale: 1,
                nextUpdateTime: Date.now() + Math.random() * 200
            };
        },

        generateUniqueNumber(row, col, grid) {
            const neighbors = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
            const forbidden = new Set();
            
            neighbors.forEach(([dr, dc]) => {
                const newRow = row + dr, newCol = col + dc;
                if (newRow >= 0 && newRow < grid.length && 
                    newCol >= 0 && grid[newRow] && newCol < grid[newRow].length &&
                    grid[newRow][newCol] !== undefined) {
                    forbidden.add(grid[newRow][newCol]);
                }
            });
            
            let num, attempts = 0;
            do {
                num = Math.floor(Math.random() * 10);
            } while (attempts++ < 20 && forbidden.has(num));
            
            return num;
        },

        showSkill(x, y) {
            if (this.skillTimeout) {
                clearTimeout(this.skillTimeout);
                this.skillTimeout = null;
            }
            
            this.hideCurrentSkill(true);
            
            const element = document.createElement('div');
            element.className = 'skill-reveal';
            element.textContent = SKILLS[Math.floor(Math.random() * SKILLS.length)];
            
            const offsetX = 30 + Math.random() * 20;
            const offsetY = -20 - Math.random() * 20;
            
            Object.assign(element.style, {
                left: `${x + offsetX}px`,
                top: `${y + offsetY}px`,
                pointerEvents: 'none'
            });
            
            this.container.appendChild(element);
            this.currentSkill = element;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            });
            
            this.skillTimeout = setTimeout(() => this.hideCurrentSkill(), CONFIG.matrix.skill.displayTime);
        },

        hideCurrentSkill(immediate = false) {
            if (!this.currentSkill?.parentNode) return;
            
            if (immediate) {
                Utils.removeElement(this.currentSkill);
                this.currentSkill = null;
                return;
            }
            
            const skillToHide = this.currentSkill;
            
            Object.assign(skillToHide.style, {
                opacity: '0',
                transform: 'scale(0.8)'
            });
            
            setTimeout(() => {
                if (skillToHide.parentNode) {
                    Utils.removeElement(skillToHide);
                    if (this.currentSkill === skillToHide) {
                        this.currentSkill = null;
                    }
                }
            }, CONFIG.matrix.skill.fadeTime);
        },

        updateNumbers() {
            const currentTime = Date.now();
            const { baseAmplitude, lerpFactor, maxDistance } = CONFIG.matrix.animation;
            
            this.numbers.forEach(num => {
                if (currentTime >= num.nextUpdateTime) {
                    num.targetOffset.x = (Math.random() - 0.5) * baseAmplitude;
                    num.targetOffset.y = (Math.random() - 0.5) * baseAmplitude;
                    num.targetScale = 1.0 + (Math.random() * 0.1);
                    num.nextUpdateTime = currentTime + 100 + Math.random() * 200;
                }
                
                num.currentOffset.x += (num.targetOffset.x - num.currentOffset.x) * lerpFactor;
                num.currentOffset.y += (num.targetOffset.y - num.currentOffset.y) * lerpFactor;
                num.currentScale += (num.targetScale - num.currentScale) * lerpFactor;
                
                const dx = this.mouse.x - num.x;
                const dy = this.mouse.y - num.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                let { x: finalX, y: finalY } = num.currentOffset;
                let finalScale = num.currentScale;
                let opacity = 0.6;
                
                if (distance < maxDistance) {
                    const influence = 1 - (distance / maxDistance);
                    finalX += (dx / distance) * influence * 25;
                    finalY += (dy / distance) * influence * 25;
                    finalScale = Math.max(finalScale, 1 + (influence * 1.2));
                    opacity = 0.3 + (influence * 0.7);
                }
                
                Object.assign(num.element.style, {
                    transform: `translate(${finalX}px, ${finalY}px) scale(${finalScale})`,
                    opacity
                });
            });
        },

        animate() {
            this.updateNumbers();
            requestAnimationFrame(() => this.animate());
        },

        bindEvents() {
            this.container.addEventListener('mousemove', e => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            this.container.addEventListener('mouseleave', () => {
                this.mouse.x = this.mouse.y = -9999;
            });

            this.container.addEventListener('click', e => {
                const rect = this.container.getBoundingClientRect();
                this.showSkill(e.clientX - rect.left, e.clientY - rect.top);
            });

            window.addEventListener('resize', Utils.debounce(() => this.createGrid(), 200));
        }
    };

    const MobileMenu = {
        toggle: null,
        nav: null,
        links: null,

        init() {
            this.toggle = document.querySelector('.mobile-menu-toggle');
            this.nav = document.querySelector('.nav-links');
            this.links = document.querySelectorAll('.nav-links a');
            
            if (!this.toggle || !this.nav) return;
            
            this.bindEvents();
        },

        toggleMenu() {
            const isActive = this.nav.classList.toggle('active');
            this.toggle.classList.toggle('active', isActive);
            this.toggle.setAttribute('aria-expanded', isActive);
            
            if (isActive) this.links[0]?.focus();
        },

        closeMenu() {
            this.toggle.classList.remove('active');
            this.nav.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
        },

        handleKeydown(e) {
            const focusableItems = Array.from(this.links);
            const currentIndex = focusableItems.indexOf(document.activeElement);
            
            const actions = {
                Escape: () => {
                    this.closeMenu();
                    this.toggle.focus();
                },
                ArrowDown: () => {
                    const nextIndex = (currentIndex + 1) % focusableItems.length;
                    focusableItems[nextIndex]?.focus();
                },
                ArrowUp: () => {
                    const prevIndex = currentIndex === 0 ? focusableItems.length - 1 : currentIndex - 1;
                    focusableItems[prevIndex]?.focus();
                }
            };

            if (actions[e.key]) {
                e.preventDefault();
                actions[e.key]();
            }
        },

        bindEvents() {
            this.toggle.addEventListener('click', () => this.toggleMenu());
            
            this.toggle.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                }
            });

            this.nav.addEventListener('keydown', e => this.handleKeydown(e));
            this.links.forEach(link => link.addEventListener('click', () => this.closeMenu()));

            document.addEventListener('click', e => {
                if (!this.nav.contains(e.target) && !this.toggle.contains(e.target) && 
                    this.nav.classList.contains('active')) {
                    this.closeMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > CONFIG.mobile.breakpoint && this.nav.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }
    };

    return {
        init() {
            ScrollAnimations.init();
            MatrixEffect.init();
            MobileMenu.init();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => App.init());