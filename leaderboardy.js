import { db } from "./auth.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function loadLeaderboard() {
    const listContainer = document.getElementById('leaderboardList');
    
    // Show loading state
    listContainer.innerHTML = `
        <div style="text-align:center; padding:20px; color:#6B7280;">
            <i class="fas fa-spinner fa-spin"></i> Loading top players...
        </div>`;

    try {
        const usersRef = collection(db, "users");
        // Get top 10 users ordered by highScore
        const q = query(usersRef, orderBy("highScore", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        let html = "";
        let rank = 1;

        if (querySnapshot.empty) {
            listContainer.innerHTML = `<div style="text-align:center; padding:10px;">No players found yet.</div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const score = user.highScore || 0;
            const name = user.displayName || "Unknown Learner";
            const photo = user.photoBase64 || null; // Assuming you store base64 or URL

            // Logic for Top 3 Crowns
            let rankIcon = `<span class="rank-number">${rank}</span>`;
            let rowClass = "";

            if (rank === 1) {
                rankIcon = `<div class="rank-badge gold"><i class="fas fa-crown"></i></div>`;
                rowClass = "top-1";
            } else if (rank === 2) {
                rankIcon = `<div class="rank-badge silver"><i class="fas fa-crown"></i></div>`;
                rowClass = "top-2";
            } else if (rank === 3) {
                rankIcon = `<div class="rank-badge bronze"><i class="fas fa-crown"></i></div>`;
                rowClass = "top-3";
            }

            // Profile Image Logic
            let avatarHtml = `<div class="lb-avatar-placeholder"><i class="fas fa-user"></i></div>`;
            if (photo) {
                avatarHtml = `<img src="${photo}" class="lb-avatar-img" alt="Profile">`;
            }

            html += `
                <div class="lb-row ${rowClass}">
                    <div class="lb-left">
                        <div class="lb-rank">${rankIcon}</div>
                        <div class="lb-avatar">${avatarHtml}</div>
                        <div class="lb-name">${name}</div>
                    </div>
                    <div class="lb-right">
                        <span class="lb-score">${score}</span> <span class="pts-label">pts</span>
                    </div>
                </div>
            `;
            rank++;
        });

        listContainer.innerHTML = html;

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        listContainer.innerHTML = `<div style="text-align:center; color:red;">Failed to load leaderboard.</div>`;
    }
}