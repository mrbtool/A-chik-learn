/* ==========================================
   RANK DESIGN: IMAGES & VISUALS (NEW THEME)
   ========================================== */

// 1. INJECT CUSTOM CSS FOR NEW DASHBOARD
// This ensures images fit perfectly inside the new Glassmorphic circles
const rankVisualStyles = `
<style>
    /* --- ANIMATIONS --- */
    @keyframes rankFloat {
        0% { transform: translateY(0px); filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); }
        50% { transform: translateY(-8px); filter: drop-shadow(0 10px 20px rgba(255,255,255,0.5)); }
        100% { transform: translateY(0px); filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); }
    }

    /* --- HERO IMAGE STYLING (Big Center Circle) --- */
    .rank-avatar-inner img {
        width: 75% !important;      /* Fill 75% of the glass circle */
        height: 75% !important;
        object-fit: contain;        /* Keep aspect ratio */
        animation: rankFloat 3.5s ease-in-out infinite; /* Floating effect */
        pointer-events: none;       /* Prevent dragging */
    }

    /* --- TIMELINE LIST IMAGES (Small Side Circles) --- */
    .step-icon-box img {
        width: 65% !important;      /* Fill 65% of the white circle */
        height: 65% !important;
        object-fit: contain;
        display: block;
    }

    /* Ensure the container doesn't collapse */
    .step-icon-box {
        overflow: hidden; /* Clean edges */
    }
</style>
`;

// Inject styles into Head
document.head.insertAdjacentHTML("beforeend", rankVisualStyles);


// 2. DEFINE IMAGE URLs
// Ensure these IDs match the 'id' fields in your rank.js RANK_SYSTEM array
const RANK_IMAGES = {
    'tier-bronze':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/bronze.png',
    'tier-silver':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/silver.png',
    'tier-gold':     'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/gold.png',
    'tier-platinum': 'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/platinum.png',
    'tier-diamond':  'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/diamond.png',
    'tier-master':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/master.png',
    'tier-legend':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/legend.png' 
};

// 3. EXPORT HELPER FUNCTION
window.getRankSVG = (tierId) => {
    // Default to bronze if ID not found
    const url = RANK_IMAGES[tierId] || RANK_IMAGES['tier-bronze'];
    
    // Return formatted Image Tag
    return `<img src="${url}" alt="${tierId}" loading="lazy" />`;
};