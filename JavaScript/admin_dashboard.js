
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
  
  // Initialize Firebase with compat version
  firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();
  const database = firebase.database();
  const storage = firebase.storage();
  
  // Get Firebase-compatible key from email
  function getStudentKey(row) {
      const email = row.querySelector("td:nth-child(4)").textContent.trim();
      return email.replace(/[.@]/g, "_");
  }
  
  // Update status in Firebase
  function updateStudentStatus(studentKey, newStatus, row) {
      const statusPath = `applications/${studentKey}/status`;
  
      database.ref(statusPath).set(newStatus)
          .then(() => {
              console.log(`Status updated for ${studentKey}: ${newStatus}`);
  
              const badge = row.querySelector(".status-badge");
              badge.textContent = newStatus;
              badge.classList.remove("status-approved", "status-rejected", "status-pending");
              badge.classList.add(`status-${newStatus.toLowerCase()}`);
              
              // Update the action buttons
              updateActionButtons(row, newStatus);
              
              // Update the stats
              updateStats();
          })
          .catch(error => {
              console.error("Database update failed:", error);
          });
  }
  
  // Update action buttons based on status
  function updateActionButtons(row, status) {
      const actionCell = row.querySelector("td:last-child");
      
      // Keep the dropdown button
      const dropdownButton = actionCell.querySelector(".action-button");
      actionCell.innerHTML = '';
      actionCell.appendChild(dropdownButton);
      
      // Add approve/reject buttons only for pending items
      if (status === "Pending") {
          const approveButton = document.createElement("button");
          approveButton.className = "action-button action-approve";
          approveButton.textContent = "✓";
          approveButton.addEventListener("click", () => {
              const studentKey = getStudentKey(row);
              updateStudentStatus(studentKey, "Approved", row);
          });
          
          const rejectButton = document.createElement("button");
          rejectButton.className = "action-button action-reject";
          rejectButton.textContent = "✕";
          rejectButton.addEventListener("click", () => {
              const studentKey = getStudentKey(row);
              updateStudentStatus(studentKey, "Rejected", row);
          });
          
          actionCell.appendChild(approveButton);
          actionCell.appendChild(rejectButton);
      }
  }
  
  // Attach approve/reject logic
  function attachActionListeners() {
      const approveButtons = document.querySelectorAll(".action-approve");
      const rejectButtons = document.querySelectorAll(".action-reject");
  
      approveButtons.forEach(btn => {
          btn.addEventListener("click", () => {
              const row = btn.closest("tr");
              const studentKey = getStudentKey(row);
              updateStudentStatus(studentKey, "Approved", row);
          });
      });
  
      rejectButtons.forEach(btn => {
          btn.addEventListener("click", () => {
              const row = btn.closest("tr");
              const studentKey = getStudentKey(row);
              updateStudentStatus(studentKey, "Rejected", row);
          });
      });
  }
  
  // Count applications by status and update stats
  function updateStats() {
      database.ref("applications").once("value")
          .then(snapshot => {
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  let total = 0, approved = 0, rejected = 0, pending = 0;
  
                  for (const key in data) {
                      total++;
                      switch (data[key].status) {
                          case "Approved": approved++; break;
                          case "Rejected": rejected++; break;
                          case "Pending": pending++; break;
                      }
                  }
  
                  document.querySelectorAll(".stat-card")[0].querySelector(".stat-value").textContent = total;
                  document.querySelectorAll(".stat-card")[1].querySelector(".stat-value").textContent = approved;
                  document.querySelectorAll(".stat-card")[2].querySelector(".stat-value").textContent = rejected;
                  document.querySelectorAll(".stat-card")[3].querySelector(".stat-value").textContent = pending;
              }
          })
          .catch(error => {
              console.error("Error fetching application stats:", error);
          });
  }
  
  // Load and render applications
  function loadApplications() {
      database.ref("applications").once("value")
          .then(snapshot => {
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  const tbody = document.querySelector(".applications-table tbody");
                  tbody.innerHTML = "";
  
                  // Update stats
                  updateStats();
  
                  // Create and append each row
                  for (const key in data) {
                      const app = data[key];
                      const row = document.createElement("tr");
                      
                      row.innerHTML = `
                          <td>${app.name || "N/A"}</td>
                          <td>${app.school || "N/A"}</td>
                          <td>${app.phone || "N/A"}</td>
                          <td>${app.email || "N/A"}</td>
                          <td>${app.vehicle || "N/A"}</td>
                          <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
                          <td>
                              <button class="action-button">↓</button>
                          </td>
                      `;
                      
                      tbody.appendChild(row);
                      
                      // Add approve/reject buttons for pending applications
                      if (app.status === "Pending") {
                          updateActionButtons(row, "Pending");
                      }
                  }
              } else {
                  console.log("No applications found.");
              }
          })
          .catch(error => {
              console.error("Failed to fetch applications:", error);
          });
  }
  
  // Handle search
  function setupSearch() {
      const searchInput = document.querySelector(".search-input");
      const searchButton = document.querySelector(".search-button");
      
      function performSearch() {
          const searchTerm = searchInput.value.trim().toLowerCase();
          const rows = document.querySelectorAll(".applications-table tbody tr");
          
          rows.forEach(row => {
              const name = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
              const school = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
              const email = row.querySelector("td:nth-child(4)").textContent.toLowerCase();
              
              if (name.includes(searchTerm) || school.includes(searchTerm) || email.includes(searchTerm)) {
                  row.style.display = "";
              } else {
                  row.style.display = "none";
              }
          });
      }
      
      searchButton.addEventListener("click", performSearch);
      searchInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
              performSearch();
          }
      });
  }
  
  // Setup menu navigation
  function setupMenu() {
      const menuItems = document.querySelectorAll(".menu-item");
      
      menuItems.forEach(item => {
          item.addEventListener("click", function() {
              // Remove active class from all items
              menuItems.forEach(i => i.classList.remove("active"));
              
              // Add active class to clicked item
              this.classList.add("active");
              
              // Handle logout
              if (this.textContent.includes("Logout")) {
                  if (confirm("Are you sure you want to logout?")) {
                      window.location.href = "login.html";
                  }
              }
          });
      });
  }
  
  // Run on load
  document.addEventListener("DOMContentLoaded", () => {
      loadApplications();
      setupSearch();
      setupMenu();
  });