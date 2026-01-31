import { db, auth } from "./auth.js";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// State to track current tab
let currentTab = 'weekly'; 

export async function loadLeaderboard(timeframe = 'weekly') {
    currentTab = timeframe;
    const container = document.getElementById('leaderboardContent');
    
    // 1. Setup UI Structure (if not already set)
    // We re-render the tabs to update the 'active' class based on selection
    container.innerHTML = `
        <div id="leaderboard-ui">
            <div class="lb-page-header">
                <i class="fas fa-chart-line" style="color:#2563EB;"></i> Leaderboard
            </div>

            <div class="lb-tabs">
                <div class="lb-tab ${timeframe === 'daily' ? 'active' : ''}" onclick="window.switchLbTab('daily')">Daily</div>
                <div class="lb-tab ${timeframe === 'weekly' ? 'active' : ''}" onclick="window.switchLbTab('weekly')">Weekly</div>
                <div class="lb-tab ${timeframe === 'alltime' ? 'active' : ''}" onclick="window.switchLbTab('alltime')">All Time</div>
            </div>

            <!-- User Banner -->
            <div id="lbUserBanner" class="user-rank-banner">
                <div class="banner-stat">
                    <div class="banner-label" style="color:#cbd5e1">Your Rank</div>
                    <div class="banner-value">--</div>
                </div>
                <div class="banner-center">
                    <div class="banner-avatar-ring">
                        <i class="fas fa-user" style="color:white; font-size:1.5rem"></i>
                    </div>
                    <div class="banner-text">YOU</div>
                </div>
                <div class="banner-stat">
                    <div class="banner-label" style="color:#cbd5e1">Score</div>
                    <div class="banner-value">--</div>
                </div>
            </div>

            <!-- List -->
            <div id="lbScrollList" class="lb-scroll-list">
                <div style="text-align:center; padding:30px; color:#6B7280;">
                    <i class="fas fa-circle-notch fa-spin"></i> Loading ${timeframe}...
                </div>
            </div>
        </div>
    `;

    try {
        const usersRef = collection(db, "users");
        
        // NOTE: In a real app, you would have fields like 'dailyScore', 'weeklyScore'.
        // For this demo, we use 'highScore' for Weekly/AllTime and 'totalScore' for Daily as a mock differentiation.
        // Or simply use highScore for all to prevent breaking.
        
        let sortField = "highScore";
        if(timeframe === 'alltime') sortField = "totalScore"; 
        
        // Fetch Top 50
        const q = query(usersRef, orderBy(sortField, "desc"), limit(50));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            document.getElementById('lbScrollList').innerHTML = `<div style="text-align:center; color:#9ca3af; margin-top:20px;">No data available.</div>`;
            return;
        }

        let listHTML = "";
        let rank = 1;
        let currentUserRank = ">50";
        let currentUserScore = 0;
        let currentUserPhoto = null;
        
        const currentUid = auth.currentUser ? auth.currentUser.uid : null;

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const score = user[sortField] || 0;
            const name = user.displayName || "Unknown";
            const photo = user.photoBase64;
            const uid = docSnap.id;

            // Check if current user
            if (currentUid && currentUid === uid) {
                currentUserRank = "#" + rank;
                currentUserScore = score;
                currentUserPhoto = photo;
            }

            // Render top 20 list
            if (rank <= 20) {
                let avatarHtml = photo ? `<img src="${photo}" class="lb-img">` : `<div class="lb-img" style="background:#f3f4f6; display:flex; align-items:center; justify-content:center;"><i class="fas fa-user" style="color:#9ca3af"></i></div>`;
                
                let rankClass = "";
                if(rank === 1) rankClass = "rank-1";
                if(rank === 2) rankClass = "rank-2";
                if(rank === 3) rankClass = "rank-3";

                listHTML += `
                    <div class="lb-card ${rankClass}">
                        <div class="lb-left-group">
                            <div class="lb-pos">${rank}</div>
                            ${avatarHtml}
                            <div class="lb-details">
                                <span class="lb-username">${name}</span>
                            </div>
                        </div>
                        <div class="lb-points">${score.toLocaleString()}</div>
                    </div>
                `;
            }
            rank++;
        });

        document.getElementById('lbScrollList').innerHTML = listHTML;

        // Update Banner if user wasn't found in top list
        if (currentUid && currentUserRank === ">50") {
            const myDoc = await getDoc(doc(db, "users", currentUid));
            if (myDoc.exists()) {
                currentUserScore = myDoc.data()[sortField] || 0;
                currentUserPhoto = myDoc.data().photoBase64;
            }
        }

        // Render Banner
        const bannerEl = document.getElementById('lbUserBanner');
        let myAvatarHtml = `<i class="fas fa-user" style="color:white; font-size:1.5rem"></i>`;
        if(currentUserPhoto) {
            myAvatarHtml = `<img src="${currentUserPhoto}" class="banner-avatar-img">`;
        }

        bannerEl.innerHTML = `
            <div class="banner-stat">
                <div class="banner-label" style="color:#cbd5e1">Your Rank</div>
                <div class="banner-value">${currentUserRank}</div>
            </div>
            <div class="banner-center">
                <div class="banner-avatar-ring">${myAvatarHtml}</div>
                <div class="banner-text">YOU</div>
            </div>
            <div class="banner-stat">
                <div class="banner-label" style="color:#cbd5e1">Score</div>
                <div class="banner-value">${currentUserScore.toLocaleString()}</div>
            </div>
        `;

    } catch (error) {
        console.error("Leaderboard error:", error);
        document.getElementById('lbScrollList').innerHTML = `<div style="text-align:center; color:#EF4444; margin-top:20px;">Failed to load.</div>`;
    }
}

// Make functions available globally so HTML onclick works
window.loadLeaderboard = loadLeaderboard;
window.switchLbTab = (tab) => {
    loadLeaderboard(tab);
};