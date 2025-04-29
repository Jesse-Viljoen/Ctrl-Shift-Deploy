import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, update, get, child } from "firebase/database";
import { getStorage } from "firebase/storage";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();
const storage = getStorage(app);

// Get Firebase-compatible key from email
function getStudentKey(row) {
    const email = row.querySelector("td:nth-child(4)").textContent.trim();
    return email.replace(/[.@]/g, "_");
}

// Update status in Firebase
function updateStudentStatus(studentKey, newStatus, row) {
    const statusPath = `applications/${studentKey}/status`;

    update(ref(database), {
        [statusPath]: newStatus
    }).then(() => {
        console.log(`Status updated for ${studentKey}: ${newStatus}`);

        const badge = row.querySelector(".status-badge");
        badge.textContent = newStatus;
        badge.classList.remove("status-approved", "status-rejected", "status-pending");
        badge.classList.add(`status-${newStatus.toLowerCase()}`);
    }).catch(error => {
        console.error("Database update failed:", error);
    });
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

// Load and render applications
function loadApplications() {
    const dbRef = ref(database);
    get(child(dbRef, "applications")).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const tbody = document.querySelector(".applications-table tbody");
            tbody.innerHTML = "";

            let total = 0, approved = 0, rejected = 0, pending = 0;

            for (const key in data) {
                const app = data[key];
                total++;
                if (app.status === "Approved") approved++;
                else if (app.status === "Rejected") rejected++;
                else pending++;

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
                        ${app.status === "Pending" ? `
                            <button class="action-button action-approve">✓</button>
                            <button class="action-button action-reject">✕</button>` : ""}
                    </td>
                `;
                tbody.appendChild(row);
            }

            document.querySelectorAll(".stat-card")[0].querySelector(".stat-value").textContent = total;
            document.querySelectorAll(".stat-card")[1].querySelector(".stat-value").textContent = approved;
            document.querySelectorAll(".stat-card")[2].querySelector(".stat-value").textContent = rejected;
            document.querySelectorAll(".stat-card")[3].querySelector(".stat-value").textContent = pending;

            attachActionListeners(); // Attach to new rows
        } else {
            console.log("No applications found.");
        }
    }).catch(error => {
        console.error("Failed to fetch applications:", error);
    });
}

// Run on load
document.addEventListener("DOMContentLoaded", () => {
    loadApplications();
});
