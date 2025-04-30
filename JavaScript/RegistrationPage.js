// This file assumes firebase.js has already initialized Firebase
// firebase.js should contain your firebaseConfig and initialization

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form element
    const signupForm = document.getElementById('signupForm');
    
    // Handle form submission
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get user inputs
        const name = document.getElementById("name").value.trim();
        const surname = document.getElementById("surname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const repassword = document.getElementById("repassword").value.trim();
        
        // Basic validation
        if (!name || !surname || !email || !password) {
          alert("Please fill in all fields");
          return;
        }
        
        // Password match validation
        if (password !== repassword) {
          alert("Passwords do not match");
          return;
        }
        
        // Create user with email and password
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // User signed up successfully
            const user = userCredential.user;
            
            // Save additional user data to Firebase database
            const userId = user.uid; // Using Firebase's safe unique ID
            
            // Create user data object
            const userData = {
              name: name,
              surname: surname,
              email: email,
              createdAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            // Save to database
            firebase.database().ref('users/' + userId).set(userData)
              .then(() => {
                alert("Registration successful!");
                // Redirect to another page if needed
                // window.location.href = "dashboard.html";
              })
              .catch((error) => {
                console.error("Error saving user data:", error);
                alert("Registration completed but there was an error saving your profile details.");
              });
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Registration error:", errorCode, errorMessage);
            
            // Display user-friendly error messages
            if (errorCode === 'auth/email-already-in-use') {
              alert("This email is already registered. Please login instead.");
            } else if (errorCode === 'auth/weak-password') {
              alert("Password is too weak. Please choose a stronger password.");
            } else {
              alert("Registration error: " + errorMessage);
            }
          });
      });
    } else {
      console.error("Signup form not found in the document");
    }
  });
  
  // Password strength visualization function (called from HTML)
  function handlePasswordChange(event) {
    const password = event.target.value;
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator) return;
    
    // Basic password strength logic
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains numbers
    if (/\d/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains special chars
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Update UI based on strength
    if (strength === 0) {
      strengthIndicator.textContent = "";
    } else if (strength <= 2) {
      strengthIndicator.textContent = "Weak";
      strengthIndicator.style.color = "red";
    } else if (strength <= 4) {
      strengthIndicator.textContent = "Medium";
      strengthIndicator.style.color = "orange";
    } else {
      strengthIndicator.textContent = "Strong";
      strengthIndicator.style.color = "green";
    }
  }
  
  // Password visibility toggle function (called from HTML)
  function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  }