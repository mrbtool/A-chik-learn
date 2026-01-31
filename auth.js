/* ==========================================
   AUTH.JS - HANDLES LOGIN & FIREBASE
   ========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCGqzSqonv0THJ33BEZbO5PJhaHd8I-IQg",
    authDomain: "a-chik-learn.firebaseapp.com",
    projectId: "a-chik-learn",
    storageBucket: "a-chik-learn.firebasestorage.app",
    messagingSenderId: "960876567489",
    appId: "1:960876567489:web:13f34adb81759a88ed6d40",
    measurementId: "G-97YK0CPMXL"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use in main file
export { app, db, auth };

/* ==========================================
   UI HELPER FUNCTIONS
   ========================================== */

// Switch between Login/Signup/Forgot forms
window.showAuthForm = (id) => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');
    document.getElementById(id + '-form').classList.remove('hidden');
};

function showError(el, msg) {
    el.innerText = msg;
    el.style.display = 'block';
}

function showLoader(show) {
    const l = document.getElementById('app-loader');
    if(l) l.style.display = show ? 'flex' : 'none';
}

function getFriendlyError(code) {
    switch(code) {
        case 'auth/invalid-credential': return "Incorrect Email or Password.";
        case 'auth/invalid-email': return "Invalid email address format.";
        case 'auth/user-disabled': return "This user account has been disabled.";
        case 'auth/user-not-found': return "No account found with this email.";
        case 'auth/wrong-password': return "Incorrect password.";
        case 'auth/email-already-in-use': return "Email is already in use.";
        case 'auth/weak-password': return "Password should be stronger.";
        case 'auth/popup-closed-by-user': return "Sign in cancelled.";
        default: return "Error: " + code;
    }
}

/* ==========================================
   AUTHENTICATION LOGIC
   ========================================== */

// 1. LOGIN
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const errBox = document.getElementById('login-error');
    
    if(!email || !pass) { showError(errBox, "Please fill in all fields"); return; }
    
    showLoader(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // State change listener in index.html will handle the redirect
    } catch (error) {
        showLoader(false);
        showError(errBox, getFriendlyError(error.code));
    }
};

// 2. SIGN UP
window.handleSignup = async () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    const errBox = document.getElementById('signup-error');

    if(!name || !email || !pass) { showError(errBox, "All fields are required"); return; }
    if(pass.length < 6) { showError(errBox, "Password must be at least 6 characters"); return; }

    showLoader(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        
        // Generate ID
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newId = '';
        for (let i = 0; i < 6; i++) newId += chars.charAt(Math.floor(Math.random() * chars.length));
        
        await updateProfile(user, { displayName: name });
        
        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
            displayName: name,
            email: email,
            uniqueId: newId,
            createdAt: new Date(),
            highScore: 0
        });
        // Listener handles redirect
    } catch (error) {
        showLoader(false);
        showError(errBox, getFriendlyError(error.code));
    }
};

// 3. GOOGLE AUTH
window.handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    showLoader(true);
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        showLoader(false);
        alert("Google Sign In Failed: " + getFriendlyError(error.code));
    }
};

// 4. FORGOT PASSWORD
window.handleForgot = async () => {
    const email = document.getElementById('forgot-email').value;
    const errBox = document.getElementById('forgot-error');
    const succBox = document.getElementById('forgot-success');
    
    errBox.style.display = 'none';
    succBox.style.display = 'none';

    if(!email) { showError(errBox, "Please enter your email"); return; }

    showLoader(true);
    try {
        await sendPasswordResetEmail(auth, email);
        showLoader(false);
        succBox.innerText = "Password reset link sent! Check your inbox.";
        succBox.style.display = 'block';
    } catch (error) {
        showLoader(false);
        showError(errBox, getFriendlyError(error.code));
    }
};

// 5. LOGOUT
window.handleLogout = () => {
    // We use a simple confirm here, or the custom alert from main app if available
    const confirmLogout = () => {
        signOut(auth).then(() => {
            // Close drawers/modals if they exist
            if(window.closeSettings) window.closeSettings();
            if(window.closeDrawer) window.closeDrawer();
            window.location.reload(); 
        });
    };

    if(window.appAlert) {
        window.appAlert("Sign Out", "Are you sure you want to log out?", confirmLogout);
    } else {
        if(confirm("Are you sure you want to log out?")) confirmLogout();
    }
};

/* ==========================================
   PROFILE MANAGEMENT
   ========================================== */

// Profile Upload
window.handleProfileUpload = async (input) => {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const currentUser = auth.currentUser;
        
        if (!currentUser) return;

        const avatarBox = document.getElementById('drawerAvatarIcon');
        if(avatarBox) avatarBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const compressedBase64 = await compressImage(file);
            
            await setDoc(doc(db, "users", currentUser.uid), {
                photoBase64: compressedBase64,
                email: currentUser.email,
                lastUpdated: new Date()
            }, { merge: true });

            if(avatarBox) avatarBox.innerHTML = `<img src="${compressedBase64}" alt="Profile">`;
            
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
            if(avatarBox) avatarBox.innerHTML = '<i class="fas fa-user"></i>';
        }
    }
};

// Save Name Changes
window.saveProfileSettings = async () => {
    const newName = document.getElementById('settingsName').value;
    const currentUser = auth.currentUser;

    if(!currentUser) return;
    if(!newName) { alert("Name cannot be empty"); return; }

    const btn = document.querySelector('.settings-btn');
    if(btn) { btn.innerText = "Saving..."; btn.disabled = true; }

    try {
        await updateProfile(currentUser, { displayName: newName });
        
        await setDoc(doc(db, "users", currentUser.uid), {
            displayName: newName,
            email: currentUser.email,
            lastUpdated: new Date()
        }, { merge: true });

        document.getElementById('userNameDisplay').innerText = newName;
        if(window.appAlert) window.appAlert("Success", "Profile updated successfully!");
        if(window.closeSettings) window.closeSettings();

    } catch(e) {
        console.error("Save failed", e);
        alert("Failed to update profile: " + e.message);
    } finally {
        if(btn) { btn.innerText = "Save Changes"; btn.disabled = false; }
    }
};

// Utility: Image Compression
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_DIM = 500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
                } else {
                    if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}