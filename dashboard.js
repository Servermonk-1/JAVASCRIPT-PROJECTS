document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const dashboard = document.getElementById('dashboard');
    
    // Load user email if available
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('user-email').textContent = userEmail;
    }

    // Card click handlers
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const tool = card.dataset.tool;
            openTool(tool);
        });
    });

    // Back button handlers
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllSections();
        });
    });

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html'; // Adjust to your login page
        }
    });

    // Escape key to go back
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllSections();
        }
    });

    function openTool(tool) {
        // Tools that open in separate pages
        const externalTools = {
            'calculator': 'CALCULATOR/calc.html',
            'todo': 'TODO_LIST/index.html',
            'agecalc': 'AGE_CALC/index.html',
            'quiz': 'QUIZ-APP/index.html',
            'stopwatch': 'STOPWATCH/index.html',
            'quote': 'RANDOM-QUOTES/index.html',
            'weather': 'SIMPLE-WEATHER CONDITION/index.html',
			'currency': 'CURRENCY-CONVERTER/currency.html',
			'tracker': 'CRYPTO-TRACKER/index.html'
        };

        if (externalTools[tool]) {
            // Add loading state
            const card = document.querySelector(`[data-tool="${tool}"]`);
            const originalText = card.textContent;
            card.textContent = 'Loading...';
            card.style.opacity = '0.7';
            
            setTimeout(() => {
                window.location.href = externalTools[tool];
            }, 500);
            return;
        }

        // Tools that open in sections (for future implementation)
        const section = document.getElementById(`${tool}-section`);
        if (section) {
            closeAllSections();
            section.classList.add('active');
            dashboard.style.display = 'none';
        }
    }

    function closeAllSections() {
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.remove('active');
        });
        dashboard.style.display = 'grid';
    }

    // Add some interactive effects
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});