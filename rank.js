/* ==========================================
   RANK SYSTEM CONFIGURATION (UPDATED)
   ========================================== */
const RANK_SYSTEM = [
    { id: 'tier-bronze',   name: 'Bronze',   limit: 50,    desc: 'Beginner (0 - 49 pts)' },
    { id: 'tier-silver',   name: 'Silver',   limit: 200,   desc: 'Learner (50 - 199 pts)' },
    { id: 'tier-gold',     name: 'Gold',     limit: 500,   desc: 'Expert (200 - 499 pts)' },
    { id: 'tier-platinum', name: 'Platinum', limit: 1000,  desc: 'Professional (500 - 999 pts)' },
    { id: 'tier-diamond',  name: 'Diamond',  limit: 2500,  desc: 'Elite (1000 - 2499 pts)' },
    { id: 'tier-master',   name: 'Master',   limit: 5000,  desc: 'Guru (2500 - 4999 pts)' },
    { id: 'tier-legend',   name: 'Legend',   limit: 99999, desc: 'Godlike (5000+ pts)' }
];

window.renderRankScreen = (forcedScore = null) => {
    // 1. Determine Score
    let score = 0;
    if (forcedScore !== null) {
        score = forcedScore;
        window.userTotalScore = forcedScore;
    } else if (typeof window.userTotalScore !== 'undefined') {
        score = window.userTotalScore;
    } else if (typeof window.userScore !== 'undefined') {
        score = window.userScore;
    }

    const scoreDisplay = document.getElementById('userTotalScore');
    if(scoreDisplay) scoreDisplay.innerText = score;

    // 2. Render Timeline
    const container = document.getElementById('rankTimelineContainer');
    if (container && container.innerHTML.trim() === "") {
        let html = "";
        RANK_SYSTEM.forEach(rank => {
            let svgIcon = '<i class="fas fa-medal"></i>';
            if(window.getRankSVG) svgIcon = window.getRankSVG(rank.id);
            html += `<div class="rank-tier locked" id="${rank.id}"><div class="tier-icon-wrapper">${svgIcon}</div><div class="tier-info"><h4>${rank.name}</h4><p>${rank.desc}</p></div></div>`;
        });
        container.innerHTML = html;
    }
    
    // 3. Calculate Rank Index
    let activeIndex = 0;
    for (let i = 0; i < RANK_SYSTEM.length - 1; i++) {
        if (score >= RANK_SYSTEM[i].limit) activeIndex = i + 1; 
        else break; 
    }

    const currentRank = RANK_SYSTEM[activeIndex];
    const nextRank = RANK_SYSTEM[activeIndex + 1];

    // 4. Update Header
    const iconBox = document.getElementById('currentRankIcon');
    const titleBox = document.getElementById('currentRankTitle');
    
    if(iconBox && window.getRankSVG) {
        // Only update if changed to prevent flicker
        if(!iconBox.getAttribute('data-rank') || iconBox.getAttribute('data-rank') !== currentRank.id) {
            iconBox.innerHTML = window.getRankSVG(currentRank.id);
            iconBox.setAttribute('data-rank', currentRank.id);
            const svg = iconBox.querySelector('img'); 
            if(svg) svg.style.animation = "rankFloat 3s ease-in-out infinite";
        }
    }
    if(titleBox) titleBox.innerText = currentRank.name;
    
    // 5. Update Progress Bar
    const progressBar = document.getElementById('rankProgressBar');
    const progressText = document.getElementById('pointsToNext');

    if (nextRank) {
        const prevLimit = activeIndex === 0 ? 0 : RANK_SYSTEM[activeIndex - 1].limit;
        const totalNeeded = nextRank.limit - prevLimit;
        const pointsEarned = score - prevLimit;
        // Clamp percentage between 0 and 100
        const pct = Math.min(100, Math.max(0, (pointsEarned / totalNeeded) * 100));
        
        if(progressBar) progressBar.style.width = pct + "%";
        if(progressText) progressText.innerText = `${nextRank.limit - score} pts to ${nextRank.name}`;
    } else {
        if(progressBar) progressBar.style.width = "100%";
        if(progressText) progressText.innerText = "Max Rank Reached";
    }

    // 6. Update List Styles
    RANK_SYSTEM.forEach((r, idx) => {
        const el = document.getElementById(r.id);
        if (!el) return; 
        
        el.className = "rank-tier"; 
        const img = el.querySelector('img');
        if(img) img.style.filter = "none"; 

        if (idx < activeIndex) {
            el.classList.add('active'); 
            el.style.opacity = "0.7"; 
        } else if (idx === activeIndex) {
            el.classList.add('active');
            el.style.border = "2px solid var(--primary)";
            el.style.transform = "scale(1.02)";
            el.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
            el.style.opacity = "1";
        } else {
            el.classList.add('locked');
            if(img) img.style.filter = "grayscale(100%) opacity(0.5)";
        }
    });
};

/**
 * Called by Index.html after saving points to update UI immediately
 */
window.updateRankUI = (newTotalScore) => {
    window.userTotalScore = newTotalScore;
    const rankView = document.getElementById('ranks-view');
    // If rank view is active, re-render it
    if(rankView && rankView.classList.contains('active')) {
        window.renderRankScreen(newTotalScore);
    }
};