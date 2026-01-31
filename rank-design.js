/* ==========================================
   RANK DESIGN: IMAGES & ANIMATIONS
   ========================================== */

// 1. INJECT CUSTOM CSS FOR ANIMATIONS
const rankStyles = `
<style>
    /* Floating Animation for Active Rank */
    @keyframes rankFloat {
        0% { transform: translateY(0px); filter: drop-shadow(0 5px 5px rgba(0,0,0,0.1)); }
        50% { transform: translateY(-8px); filter: drop-shadow(0 15px 10px rgba(0,0,0,0.2)); }
        100% { transform: translateY(0px); filter: drop-shadow(0 5px 5px rgba(0,0,0,0.1)); }
    }

    /* Pulse for Progress Bar */
    @keyframes barPulse {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* -----------------------------------------------
       FIX: FORCE IMAGE SIZES TO PREVENT GIANT ICONS
       ----------------------------------------------- */
    
    /* 1. The Header Icon (Big one at top) */
    .current-rank-icon img {
        animation: rankFloat 3s ease-in-out infinite;
        width: 100% !important;
        height: 100% !important;
        max-width: 120px; /* Safety cap */
        max-height: 120px;
        object-fit: contain;
    }

    /* 2. The List Icons (Small ones in timeline) */
    .tier-icon-wrapper img, 
    .tier-icon img {
        width: 45px !important;  /* Force small width */
        height: 45px !important; /* Force small height */
        object-fit: contain;     /* Keep aspect ratio */
        display: block;
    }
    
    /* Ensure the wrapper itself doesn't stretch */
    .tier-icon-wrapper {
        width: 60px;
        height: 60px;
        min-width: 60px; /* Prevent crushing */
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
`;
document.head.insertAdjacentHTML("beforeend", rankStyles);


// 2. DEFINE IMAGE URLs
// REPLACE THESE URLs WITH YOUR ACTUAL IMAGE LINKS
const RANK_IMAGES = {
    'tier-bronze':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/bronze.png',
    'tier-silver':   'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/silver.png',
    'tier-gold':     'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/gold.png',
    'tier-platinum': 'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/platinum.png',
    'tier-diamond':  'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/diamond.png',
    'tier-master': 'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/master.png',
    'tier-legend':  'https://raw.githubusercontent.com/mrbtool/A-chik-learn/refs/heads/main/legend.png' 
};

// 3. EXPORT FUNCTION
window.getRankSVG = (tierId) => {
    const url = RANK_IMAGES[tierId] || RANK_IMAGES['tier-bronze'];
    // Return img tag
    return `<img src="${url}" alt="${tierId}" loading="lazy" />`;
};