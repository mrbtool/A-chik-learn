/* ==========================================
   RANK SYSTEM CONTROLLER (UPDATED FOR NEW DASHBOARD)
   ========================================== */

// Configuration: 'limit' is the score required to REACH the NEXT rank
// Example: Bronze ends at 999. At 1000, you become Silver.
const RANK_SYSTEM = [
    { id: 'tier-bronze',   name: 'Bronze',   limit: 1000,    desc: 'Beginner (0 - 999 pts)' },
    { id: 'tier-silver',   name: 'Silver',   limit: 2000,   desc: 'Learner (1000 - 1999 pts)' },
    { id: 'tier-gold',     name: 'Gold',     limit: 3000,   desc: 'Expert (2000 - 2999 pts)' },
    { id: 'tier-platinum', name: 'Platinum', limit: 4000,  desc: 'Professional (3000 - 3999 pts)' },
    { id: 'tier-diamond',  name: 'Diamond',  limit: 5000,  desc: 'Elite (4000 - 4999 pts)' },
    { id: 'tier-master',   name: 'Master',   limit: 6000,  desc: 'Guru (5000 - 5999 pts)' },
    { id: 'tier-legend',   name: 'Legend',   limit: 999999, desc: 'Godlike (6000+ pts)' }
];

window.renderRankScreen = (forcedScore = null) => {
    // 1. GET CURRENT SCORE
    let score = 0;
    if (forcedScore !== null) {
        score = forcedScore;
        window.userTotalScore = forcedScore;
    } else if (typeof window.userTotalScore !== 'undefined') {
        score = window.userTotalScore;
    }

    // 2. DETERMINE CURRENT RANK
    // We iterate to find the specific tier the user is currently in
    let activeIndex = 0;
    for (let i = 0; i < RANK_SYSTEM.length; i++) {
        // If score is less than the limit of this tier, then we are INSIDE this tier
        if (score < RANK_SYSTEM[i].limit) {
            activeIndex = i;
            break;
        }
        // If we are at the last item and still haven't broken, we are in the last tier
        if (i === RANK_SYSTEM.length - 1) {
            activeIndex = i;
        }
    }

    const currentRank = RANK_SYSTEM[activeIndex];
    
    // 3. UPDATE HERO SECTION (TEXT & ICONS)
    const titleEl = document.getElementById('rankBadgeTitle');
    const scoreEl = document.getElementById('displayScore');
    const heroIconEl = document.getElementById('rankHeroIcon');
    const nextTextEl = document.getElementById('nextRankText');
    const statRankEl = document.getElementById('statRankName');
    const statHighEl = document.getElementById('highScoreStat');

    if(titleEl) titleEl.innerText = currentRank.name;
    if(scoreEl) scoreEl.innerText = score;
    if(statRankEl) statRankEl.innerText = currentRank.name;
    if(statHighEl && window.userScore) statHighEl.innerText = window.userScore;

    // Inject Hero Image using rank-design.js
    if(heroIconEl && window.getRankSVG) {
        // Only update if innerHTML is empty or ID changed (prevents animation reset)
        // logic: simplistic check, just overwrite for now to ensure state
        heroIconEl.innerHTML = window.getRankSVG(currentRank.id);
    }

    // 4. CALCULATE CIRCULAR PROGRESS
    let progressPercent = 0;
    
    // Previous tier limit (floor)
    const prevLimit = activeIndex === 0 ? 0 : RANK_SYSTEM[activeIndex - 1].limit;
    // Current tier limit (ceiling)
    const nextLimit = currentRank.limit;

    if (activeIndex < RANK_SYSTEM.length - 1) {
        const pointsInTier = score - prevLimit;
        const tierSpan = nextLimit - prevLimit;
        
        progressPercent = (pointsInTier / tierSpan) * 100;
        progressPercent = Math.min(100, Math.max(0, progressPercent)); // Clamp 0-100

        const needed = nextLimit - score;
        if(nextTextEl) nextTextEl.innerText = `${needed} XP to ${RANK_SYSTEM[activeIndex+1].name}`;
    } else {
        // Max Rank
        progressPercent = 100;
        if(nextTextEl) nextTextEl.innerText = "Maximum Rank Achieved!";
    }

    // Update SVG Circle Stroke (circumference approx 377 for r=60)
    const circle = document.getElementById('rankSvgProgress');
    if(circle) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius; 
        const offset = circumference - (progressPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // 5. RENDER VERTICAL JOURNEY LIST
    const journeyContainer = document.getElementById('rankJourneyList');
    if(journeyContainer) {
        // Preserve the vertical line divs
        const lines = journeyContainer.querySelectorAll('.journey-line, .journey-fill');
        journeyContainer.innerHTML = ''; 
        lines.forEach(l => journeyContainer.appendChild(l));

        let html = "";
        RANK_SYSTEM.forEach((rank, index) => {
            const isUnlocked = index <= activeIndex;
            const isActive = index === activeIndex;
            
            let statusClass = "locked";
            let statusText = "Locked";
            let pointsReq = rank.limit; 

            // Logic for "Required Points" label
            // If it's the current rank, show "Current"
            // If passed, show the limit that was beaten
            if (isActive) { 
                statusClass = "active unlocked"; 
                statusText = "Current Rank"; 
                // Display the limit needed to finish this rank
                pointsReq = `${rank.limit} XP Goal`; 
            } else if (isUnlocked) { 
                statusClass = "unlocked"; 
                statusText = "Completed";
                pointsReq = "Done";
            } else {
                pointsReq = `${rank.limit} XP`;
            }

            // Use Image from rank-design.js
            const iconHtml = window.getRankSVG ? window.getRankSVG(rank.id) : '<i class="fas fa-lock"></i>';

            html += `
            <div class="rank-step ${statusClass}">
                <div class="step-icon-box">
                    ${iconHtml}
                </div>
                <div class="step-card">
                    <div class="step-info">
                        <h3>${rank.name}</h3>
                        <span>${statusText}</span>
                    </div>
                    <div class="step-req">${pointsReq}</div>
                </div>
            </div>`;
        });
        
        // Append HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        while(tempDiv.firstChild) journeyContainer.appendChild(tempDiv.firstChild);

        // 6. ANIMATE VERTICAL LINE FILL
        const fillLine = document.getElementById('journeyFillLine');
        if(fillLine) {
            if(RANK_SYSTEM.length > 1) {
                // Calculate height of the fill line
                // Base: Active Index / Total Steps
                const stepSize = 100 / (RANK_SYSTEM.length - 1);
                
                // Base height (completed steps)
                let totalHeight = activeIndex * stepSize;
                
                // Add the progress of the current step
                // If we are 50% through Silver, the line should be halfway between Silver and Gold
                if (activeIndex < RANK_SYSTEM.length - 1) {
                    totalHeight += (progressPercent / 100) * stepSize;
                }

                fillLine.style.height = Math.min(100, totalHeight) + "%";
            }
        }
    }
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