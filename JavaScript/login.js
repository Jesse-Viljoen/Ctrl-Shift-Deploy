// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase (check if already initialized to avoid errors)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const analytics = firebase.analytics();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  
  if (!form) {
    console.error("Login form not found");
    return;
  }

  // Add loading state management
  function setLoading(isLoading) {
    const loginButton = form.querySelector('button[type="submit"]');
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.textContent = isLoading ? "Logging in..." : "Login";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      // Check if email is verified (if you're using email verification)
      if (userCredential.user.emailVerified) {
        // Successful login
        console.log("Login successful");
        window.location.href = "dashboard.html";
      } else {
        // Email not verified
        alert("Please verify your email before logging in. Check your inbox for a verification email.");
        
        // Option to resend verification email
        await userCredential.user.sendEmailVerification();
        alert("A new verification email has been sent to your email address.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error codes
      switch(error.code) {
        case 'auth/user-not-found':
          alert("No account found with this email address.");
          break;
        case 'auth/wrong-password':
          alert("Incorrect password. Please try again.");
          break;
        case 'auth/too-many-requests':
          alert("Too many unsuccessful login attempts. Please try again later or reset your password.");
          break;
        default:
          alert("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  });
  
  // Debug check to verify Firebase is loaded correctly
  console.log("Firebase Auth initialized:", !!auth);
});
