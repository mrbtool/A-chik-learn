// navbar.js

function renderNavBar() {
    const navContainer = document.getElementById('navbar-container');
    
    if (!navContainer) return;

    navContainer.innerHTML = `
        <nav class="bottom-nav">
            <div class="nav-item active" onclick="switchTab('home', this)">
                <i class="fas fa-home"></i> 
                <span>Home</span>
            </div>

            <div class="nav-item" onclick="switchTab('dailygoal', this)">
                <i class="fas fa-calendar-day"></i> 
                <span>Daily goal</span>
            </div>
            
            <div class="nav-item" onclick="switchTab('books', this)">
                <i class="fas fa-book"></i> 
                <span>Books</span>
            </div>
            
            <div class="nav-item" onclick="switchTab('ranks', this)">
                <i class="fas fa-trophy"></i> 
                <span>Ranks</span>
            </div>
            
            <div class="nav-item" onclick="switchTab('games', this)">
                <i class="fas fa-gamepad"></i> 
                <span>Games</span>
            </div>
        </nav>
    `;
}

// Run this function immediately when the script loads
renderNavBar();
