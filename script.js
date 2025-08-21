document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initMatrixEffect();
    initMobileMenu();
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initMatrixEffect() {
    const matrixContainer = document.getElementById('matrix-container');
    if (!matrixContainer) return;
    

    const skills = [
        'PYTHON',
        'FASTAPI',
        'DOCKER',
        'KUBERNETES',
        'OWASP MASVS',
        'OWASP MASTG',
        'MOBILE SECURITY',
        'REVERSE ENGINEERING',
        'FRIDA',
        'GHIDRA',
        'IDA PRO',
        'BURP SUITE',
        'POSTGRESQL',
        'MICROSERVICES',
        'MACHINE LEARNING',
        'VULNERABILITY RESEARCH',
        'PENETRATION TESTING',
        'MALWARE ANALYSIS',
        'CRYPTOGRAPHY',
        'API SECURITY',
        'AUTOMATED TESTING',
        'DISTRIBUTED SYSTEMS',
        'CELERY',
        'RABBITMQ',
        'SAST',
        'DAST',
        'JWT',
        'OAUTH',
        'TLS/SSL',
        'PROMETHEUS',
        'GRAFANA'
    ];

    let matrixNumbers = [];
    let mouseX = 0;
    let mouseY = 0;
    let currentSkillElement = null;
    
    
    function createMatrixGrid() {
        const containerRect = matrixContainer.getBoundingClientRect();
        
        
        let cellSize;
        if (window.innerWidth < 768) {
            cellSize = 35; 
        } else if (window.innerWidth < 1024) {
            cellSize = 42; 
        } else {
            cellSize = 48; 
        }
        
        let cols = Math.floor(containerRect.width / cellSize);
        let rows = Math.floor(containerRect.height / cellSize);
        
        
        if (containerRect.width - (cols * cellSize) > cellSize * 0.5) {
            cols += 1;
        }
        if (containerRect.height - (rows * cellSize) > cellSize * 0.5) {
            rows += 1;
        }
        
        
        const actualCellWidth = containerRect.width / cols;
        const actualCellHeight = containerRect.height / rows;
        
        matrixContainer.innerHTML = '';
        matrixNumbers = [];
        
        
        function generateNumber(row, col, grid) {
            let attempts = 0;
            let num;
            const forbidden = new Set();
            
            
            const neighbors = [
                [-1, -1], [-1, 0], [-1, 1], 
                [0, -1],           [0, 1],  
                [1, -1],  [1, 0],  [1, 1]   
            ];
            
            for (let [dr, dc] of neighbors) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < grid.length && 
                    newCol >= 0 && grid[newRow] && newCol < grid[newRow].length) {
                    if (grid[newRow][newCol] !== undefined) {
                        forbidden.add(grid[newRow][newCol]);
                    }
                }
            }
            
            
            do {
                num = Math.floor(Math.random() * 10);
                attempts++;
            } while (attempts < 20 && forbidden.has(num));
            
            return num;
        }
        
        
        const numberGrid = [];
        
        for (let row = 0; row < rows; row++) {
            numberGrid[row] = [];
            for (let col = 0; col < cols; col++) {
                const number = document.createElement('div');
                number.className = 'matrix-number';
                
                
                const generatedNum = generateNumber(row, col, numberGrid);
                number.textContent = generatedNum;
                numberGrid[row][col] = generatedNum;
                
                const x = col * actualCellWidth + actualCellWidth / 2;
                const y = row * actualCellHeight + actualCellHeight / 2;
                
                number.style.left = x + 'px';
                number.style.top = y + 'px';
                
                matrixContainer.appendChild(number);
                matrixNumbers.push({
                    element: number,
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    baseNumber: number.textContent,
                    targetOffsetX: 0,
                    targetOffsetY: 0,
                    currentOffsetX: 0,
                    currentOffsetY: 0,
                    targetScale: 1,
                    currentScale: 1,
                    nextUpdateTime: Date.now() + Math.random() * 200
                });
            }
        }
    }
    
    
    function showSkill(clickX, clickY, skill) {
        
        if (currentSkillElement && currentSkillElement.parentNode) {
            currentSkillElement.style.opacity = '0';
            currentSkillElement.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (currentSkillElement && currentSkillElement.parentNode) {
                    currentSkillElement.parentNode.removeChild(currentSkillElement);
                }
            }, 300);
        }
        
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-reveal';
        skillElement.textContent = skill;
        
        
        const offsetX = 30 + Math.random() * 20; 
        const offsetY = -20 - Math.random() * 20; 
        
        skillElement.style.left = (clickX + offsetX) + 'px';
        skillElement.style.top = (clickY + offsetY) + 'px';
        
        matrixContainer.appendChild(skillElement);
        currentSkillElement = skillElement;
        
        setTimeout(() => {
            skillElement.style.opacity = '1';
            skillElement.style.transform = 'scale(1)';
        }, 10);
        
        setTimeout(() => {
            if (skillElement.parentNode && skillElement === currentSkillElement) {
                skillElement.style.opacity = '0';
                skillElement.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (skillElement.parentNode && skillElement === currentSkillElement) {
                        skillElement.parentNode.removeChild(skillElement);
                        currentSkillElement = null;
                    }
                }, 300);
            }
        }, 3000);
    }
    
    
    function handleMouseMove(event) {
        const rect = matrixContainer.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    }
    
    
    function updateMatrixNumbers() {
        const currentTime = Date.now();
        const baseAmplitude = 0.6; 
        
        matrixNumbers.forEach(num => {
            
            if (currentTime >= num.nextUpdateTime) {
                
                num.targetOffsetX = (Math.random() - 0.5) * baseAmplitude;
                num.targetOffsetY = (Math.random() - 0.5) * baseAmplitude;
                
                
                num.targetScale = 1.0 + (Math.random() * 0.1);
                
                
                num.nextUpdateTime = currentTime + 100 + Math.random() * 200;
            }
            
            
            const lerpFactor = 0.15; 
            num.currentOffsetX += (num.targetOffsetX - num.currentOffsetX) * lerpFactor;
            num.currentOffsetY += (num.targetOffsetY - num.currentOffsetY) * lerpFactor;
            num.currentScale += (num.targetScale - num.currentScale) * lerpFactor;
            
            
            const dx = mouseX - num.x;
            const dy = mouseY - num.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200; 
            
            let finalOffsetX = num.currentOffsetX;
            let finalOffsetY = num.currentOffsetY;
            let finalScale = num.currentScale;
            let opacity = 0.6;
            
            if (distance < maxDistance) {
                const influence = 1 - (distance / maxDistance);
                const mouseScale = 1 + (influence * 1.2); 
                const mouseOffsetX = (dx / distance) * influence * 25; 
                const mouseOffsetY = (dy / distance) * influence * 25;
                
                finalOffsetX += mouseOffsetX;
                finalOffsetY += mouseOffsetY;
                finalScale = Math.max(finalScale, mouseScale);
                opacity = 0.3 + (influence * 0.7); 
            }
            
            num.element.style.transform = `translate(${finalOffsetX}px, ${finalOffsetY}px) scale(${finalScale})`;
            num.element.style.opacity = opacity;
        });
    }
    
    
    function animate() {
        updateMatrixNumbers();
        requestAnimationFrame(animate);
    }
    
    
    matrixContainer.addEventListener('mousemove', handleMouseMove);
    matrixContainer.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });
    
    
    matrixContainer.addEventListener('click', (event) => {
        const rect = matrixContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
        showSkill(clickX, clickY, randomSkill);
    });
    
    
    createMatrixGrid();
    animate();
    
    
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createMatrixGrid, 200);
    });
}

function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    function toggleMenu() {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        
        if (isExpanded) {
            navLinkItems[0]?.focus();
        }
    }

    function closeMenu() {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }

    mobileMenuToggle.addEventListener('click', toggleMenu);

    mobileMenuToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    navLinks.addEventListener('keydown', function(e) {
        const focusableItems = Array.from(navLinkItems);
        const currentIndex = focusableItems.indexOf(document.activeElement);
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeMenu();
                mobileMenuToggle.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableItems.length;
                focusableItems[nextIndex]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? focusableItems.length - 1 : currentIndex - 1;
                focusableItems[prevIndex]?.focus();
                break;
        }
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function(event) {
        if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target) && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
}