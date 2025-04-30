import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref as dbRef, set as dbSet } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Show status message
function showStatus(message, isError = false) {
  const statusElement = document.getElementById('statusMessage');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status-message ${isError ? 'error' : 'success'}`;
    statusElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  } else {
    alert(message);
  }
}

// Form validation
function validateForm(data) {
  // Basic validation
  for (const key in data) {
    if (data[key] === '' && key !== 'username') {
      showStatus(`Please fill in the ${key} field`, true);
      return false;
    }
  }

  // Password validation
  if (data.password !== data.confirmPassword) {
    showStatus('Passwords do not match', true);
    return false;
  }

  if (data.password.length < 8) {
    showStatus('Password must be at least 8 characters long', true);
    return false;
  }

  if (!/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
    showStatus('Password must include at least one uppercase letter and one number', true);
    return false;
  }

  return true;
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transportRegistrationForm');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        role: document.getElementById('role').value,
        contact: document.getElementById('contact').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        address: document.getElementById('address').value.trim(),
        dropoff: document.getElementById('dropoff').value.trim(),
        pickupTime: document.getElementById('pickupTime').value,
        returnTime: document.getElementById('returnTime').value
      };
      
      // Validate form
      if (!validateForm(formData)) {
        return;
      }
      
      // Disable submit button to prevent multiple submissions
      const submitButton = form.querySelector('.submit-button');
      submitButton.disabled = true;
      submitButton.textContent = 'Registering...';
      
      try {
        // Create user account with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Generate username from email if not provided
        const username = formData.email.split('@')[0];
        
        // Save user profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
          fullName: formData.fullName,
          email: formData.email,
          contact: formData.contact,
          role: formData.role,
          createdAt: new Date(),
          uid: user.uid
        });
        
        // Save transport information to Realtime Database
        await dbSet(dbRef(database, `transports/${user.uid}`), {
          fullName: formData.fullName,
          email: formData.email,
          contact: formData.contact,
          role: formData.role,
          address: formData.address,
          dropoff: formData.dropoff,
          pickupTime: formData.pickupTime,
          returnTime: formData.returnTime,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        // Show success message
        showStatus('Registration successful! You will be redirected shortly.');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
        
      } catch (error) {
        console.error('Registration error:', error);
        
        // Show appropriate error message
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered. Please use a different email or login.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        }
        
        showStatus(errorMessage, true);
      } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Registration';
      }
    });
  } else {
    console.error('Transport registration form not found');
  }
});

 
   

 
