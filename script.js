const AppConfig = {
    SKILLS: [
        'PYTHON', 'MOBILE SECURITY', 'REVERSE ENGINEERING', 'OWASP MASVS',
        'OWASP MASTG', 'VULNERABILITY RESEARCH', 'MALWARE ANALYSIS', 'PENETRATION TESTING',
        'FRIDA', 'GHIDRA', 'ZAP', 'BURP SUITE', 'FASTAPI', 'DOCKER',
        'MICROSERVICES', 'AUTOMATED TESTING', 'SAST', 'DAST', 'JAVA',
        'SWIFT', 'SQL', 'API SECURITY', 'KOTLIN',
        'TWEAK DEVEOPMENT', 'JWT', 'MQTT', 'AMQP', 'ANDROID SECURITY',
        'IOS SECURITY', 'SOFTWARE DEVELOPMENT', 'LINUX ADMINSTRATION'
    ],
    SCROLL: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    MATRIX: {
        cellSizes: { mobile: 35, tablet: 42, desktop: 48 },
        animation: { baseAmplitude: 0.6, lerpFactor: 0.15, maxDistance: 200 },
        skill: { displayTime: 3000, fadeTime: 300 }
    },
    BREAKPOINTS: { mobile: 768, tablet: 1024 },
    ANIMATION_DELAYS: { stagger: 200, initial: 100, heroLoad: 200 }
};

const Utils = {
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    getCellSize() {
        const { innerWidth } = window;
        const { mobile, tablet, desktop } = AppConfig.MATRIX.cellSizes;
        return innerWidth < AppConfig.BREAKPOINTS.mobile ? mobile 
             : innerWidth < AppConfig.BREAKPOINTS.tablet ? tablet : desktop;
    },

    removeElement(element) {
        element?.parentNode?.removeChild(element);
    }
};

const App = (() => {
    const SKILLS = Utils.shuffleArray(AppConfig.SKILLS);

    const ScrollAnimations = {
        selectors: '.animate, .fade-in-up, .fade-in-scale, .slide-in-left, .slide-in-right, .terminal-button',

        init() {
            this.observeElements();
            this.animateOnLoad();
        },

        observeElements() {
            const observer = new IntersectionObserver(this.handleIntersection, AppConfig.SCROLL);
            document.querySelectorAll(this.selectors).forEach(el => observer.observe(el));
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.unobserve(entry.target);
                }
            });
        },

        animateOnLoad() {
            setTimeout(() => {
                const heroElements = document.querySelectorAll('.hero .animate');
                heroElements.forEach((el, index) => {
                    setTimeout(() => el.classList.add('loaded'), 
                        index * AppConfig.ANIMATION_DELAYS.heroLoad);
                });
            }, AppConfig.ANIMATION_DELAYS.initial);
        }
    };

    const MatrixEffect = {
        container: null,
        numbers: [],
        mouse: { x: 0, y: 0 },
        currentSkill: null,
        skillTimeout: null,
        hideTimeout: null,
        discoveredSkills: new Set(),
        totalSkills: SKILLS.length,
        currentSkillIndex: 0,

        init() {
            this.container = document.getElementById('matrix-container');
            if (!this.container) return;

            this.createGrid();
            this.animate();
            this.bindEvents();
            this.setupResizeObserver();
        },
        
        setupResizeObserver() {
            if (typeof ResizeObserver === 'undefined') return;
            
            this.resizeObserver = new ResizeObserver(Utils.debounce(() => {
                this.createGrid();
            }, 150));
            
            this.resizeObserver.observe(this.container);
        },

        createGrid() {
            if (!this.container) return;
            
            const rect = this.container.getBoundingClientRect();
            const cellSize = Utils.getCellSize();
            
            if (rect.width === 0 || rect.height === 0) {
                requestAnimationFrame(() => this.createGrid());
                return;
            }
            
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
                for (let col = 0; col <= cols + 1; col++) {
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

        showSkill() {

            if (this.skillTimeout) {
                clearTimeout(this.skillTimeout);
                this.skillTimeout = null;
            }
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
            
            this.hideCurrentSkill(true);
            
            if (this.currentSkillIndex >= SKILLS.length) return;
            
            const skill = SKILLS[this.currentSkillIndex];
            this.discoveredSkills.add(skill);
            this.currentSkillIndex++;
            
            const element = document.createElement('div');
            element.className = 'skill-reveal';
            element.textContent = skill;
            
            this.container.appendChild(element);
            this.currentSkill = element;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translate(-50%, -50%) scale(1)';
            });
            
            this.updateProgress();
            
            this.skillTimeout = setTimeout(() => this.hideCurrentSkill(), AppConfig.MATRIX.skill.displayTime);
        },

        updateProgress() {
            const progressPercentage = Math.round((this.discoveredSkills.size / this.totalSkills) * 100);
            const elements = {
                fill: document.getElementById('progress-fill'),
                text: document.getElementById('progress-text')
            };
            
            if (elements.fill && elements.text) {
                elements.fill.style.width = `${progressPercentage}%`;
                elements.text.textContent = `${progressPercentage}%`;
                
                if (progressPercentage === 100) {
                    setTimeout(() => this.showCompletion(), 1000);
                }
            }
        },

        showCompletion() {
            const celebration = document.getElementById('completion-celebration');
            const matrixNumbers = document.querySelectorAll('.matrix-number');
            
            this.animateMatrixCompletion(matrixNumbers);
            this.showCelebrationDialog(celebration);
        },

        animateMatrixCompletion(numbers) {
            numbers.forEach((num, index) => {
                setTimeout(() => {
                    Object.assign(num.style, {
                        animation: 'celebrationFlash 0.5s ease-in-out',
                        color: '#00ff00'
                    });
                }, index * 20);
            });
        },

        showCelebrationDialog(celebration) {
            setTimeout(() => {
                celebration.style.display = 'flex';
                setTimeout(() => {
                    Object.assign(celebration.style, {
                        opacity: '1',
                        transform: 'scale(1)'
                    });
                }, 100);
            }, 1500);
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
                transform: 'translate(-50%, -50%) scale(0.1)'
            });
            
            setTimeout(() => {
                if (skillToHide.parentNode) {
                    Utils.removeElement(skillToHide);
                    if (this.currentSkill === skillToHide) {
                        this.currentSkill = null;
                    }
                }
            }, 300);
        },

        updateNumbers() {
            const currentTime = Date.now();
            const { baseAmplitude, lerpFactor, maxDistance } = AppConfig.MATRIX.animation;
            
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
                
                if (this.currentSkill && !this.hideTimeout) {
                    this.hideTimeout = setTimeout(() => {
                        this.hideCurrentSkill();
                        this.hideTimeout = null;
                    }, 800);
                }
            });

            this.container.addEventListener('mouseleave', () => {
                this.mouse.x = this.mouse.y = -9999;
            });

            this.container.addEventListener('click', () => {
                this.showSkill();
            });

            window.addEventListener('resize', Utils.debounce(() => this.createGrid(), 200));
        }
    };

    const FullscreenToggle = {
        monitorScreen: null,
        toggleButton: null,
        hireButton:null,

        init() {
            this.monitorScreen = document.querySelector('.monitor-screen');
            this.toggleButton = document.getElementById('fullscreen-toggle');
            this.hireButton = document.getElementById("hire-button")
            
            if (!this.monitorScreen || !this.toggleButton) return;
            
            this.bindEvents();
        },

        bindEvents() {
            this.toggleButton.addEventListener('click', () => this.toggle());
            this.hireButton.addEventListener('click', () => this.exitFullscreen())
            
            const handleFullscreenChange = () => {
                this.updateButton();
            };
            
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        },


enterFullscreen() {
    const el = this.monitorScreen;
    const call = (fn, ctx) => {
        const result = fn?.call(ctx);
        if (result?.catch) result.catch(console.error);
    };

    call(
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen,
        el
    );
},
        exitFullscreen() {
            const doc = document;
            const call = (fn, ctx) => {
                const result = fn?.call(ctx);
                if (result?.catch) result.catch(console.error);
            };

            call(
                doc.exitFullscreen ||
                doc.webkitExitFullscreen ||
                doc.mozCancelFullScreen,
                doc
            );
        },

        toggle() {
            const doc = document;
            const isFullscreen =
                doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement;

            if (isFullscreen) {
                this.exitFullscreen();
            } else {
                this.enterFullscreen();
            }
        },
        updateButton() {
            const isFullscreen = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement;
            
            if (isFullscreen) {
                this.toggleButton.innerHTML = '<i class="fas fa-compress" aria-hidden="true"></i>';
                this.toggleButton.setAttribute('aria-label', 'Exit fullscreen');
            } else {
                this.toggleButton.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
                this.toggleButton.setAttribute('aria-label', 'Enter fullscreen');
            }
        }
    };

    const MobileMenu = {
        checkbox: null,
        nav: null,
        links: null,

        init() {
            this.checkbox = document.querySelector('.mobile-menu-checkbox');
            this.nav = document.querySelector('.nav-links');
            this.links = document.querySelectorAll('.nav-links a');
            
            if (!this.checkbox || !this.nav) return;
            
            this.bindEvents();
        },

        closeMenu() {
            this.checkbox.checked = false;
        },

        handleKeydown(e) {
            if (!this.checkbox.checked) return;
            
            const focusableItems = Array.from(this.links);
            const currentIndex = focusableItems.indexOf(document.activeElement);
            
            const actions = {
                Escape: () => {
                    this.closeMenu();
                    document.querySelector('.mobile-menu-toggle').focus();
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
            this.checkbox.addEventListener('change', () => {
                if (this.checkbox.checked) {
                    this.links[0]?.focus();
                }
            });

            this.nav.addEventListener('keydown', e => this.handleKeydown(e));
            this.links.forEach(link => link.addEventListener('click', () => this.closeMenu()));

            document.addEventListener('click', e => {
                if (!this.nav.contains(e.target) && !e.target.closest('.mobile-menu-toggle') && 
                    !e.target.closest('.mobile-menu-checkbox') && this.checkbox.checked) {
                    this.closeMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > AppConfig.BREAKPOINTS.mobile && this.checkbox.checked) {
                    this.closeMenu();
                }
            });
        }
    };

    const SessionTimer = {
        startTime: null,
        timerElement: null,
        
        init() {
            this.timerElement = document.getElementById('session-time');
            if (!this.timerElement) return;
            
            this.startTime = Date.now();
            this.updateTimer();
            setInterval(() => this.updateTimer(), 1000);
        },
        
        updateTimer() {
            if (!this.timerElement || !this.startTime) return;
            
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.timerElement.textContent = timeString;
        }
    };

    return {
        init() {
            ScrollAnimations.init();
            MatrixEffect.init();
            FullscreenToggle.init();
            MobileMenu.init();
            SessionTimer.init();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => App.init());