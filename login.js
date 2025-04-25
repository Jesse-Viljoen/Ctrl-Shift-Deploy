// Toggle forms
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginBtn.onclick = () => {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
};

registerBtn.onclick = () => {
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
};

// Dummy Register
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const registerError = document.getElementById("registerError");

  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match.";
    return;
  }

  // Store user (in-memory example)
  localStorage.setItem("user", JSON.stringify({ username, password }));
  registerError.textContent = "Registration successful! You can now login.";
  registerForm.reset();
});

// Dummy Login
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginError = document.getElementById("loginError");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && username === storedUser.username && password === storedUser.password) {
    loginError.textContent = "";
    alert("Login successful!");
    window.location.href = "dashboard.html"; // placeholder
  } else {
    loginError.textContent = "Invalid username or password.";
  }
});
