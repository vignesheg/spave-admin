import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Firebase Configuration
const firebaseConfig = {

    apiKey: "AIzaSyBgPxkEiG6AdyeL-ciyflhMkRZeCHO-LF8",
  
    authDomain: "spave-215af.firebaseapp.com",
  
    databaseURL: "https://spave-215af-default-rtdb.firebaseio.com",
  
    projectId: "spave-215af",
  
    storageBucket: "spave-215af.firebasestorage.app",
  
    messagingSenderId: "337436272091",
  
    appId: "1:337436272091:web:951fdd078824a5f28d73fe",
  
    measurementId: "G-3L5W2R65YP"
  
  };
  

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 Fetch and Display Data
let eventData = [];

const fetchData = async () => {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";
    eventData = [];

    const teamsRef = ref(db, "teams");
    const snapshot = await get(teamsRef);

    if (snapshot.exists()) {
        const teams = snapshot.val();

        Object.keys(teams).forEach((teamId) => {
            Object.keys(teams[teamId].events).forEach((event) => {
                const details = teams[teamId].events[event].details;
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td class="p-3">${details.college}</td>
                    <td class="p-3">${details.phone}</td>
                    <td class="p-3">${details.upi}</td>
                    <td class="p-3">${details.department}</td>
                    <td class="p-3">${details.head.name}</td>
                    <td class="p-3">${details.head.rollNo}</td>
                    <td class="p-3">${event}</td>
                    <td class="p-3">
                        ${details.verified ? '<span class="text-green-500 font-bold">✅ Yes</span>' : '<span class="text-red-500 font-bold">❌ No</span>'}
                    </td>
                    <td class="p-3">
                        <button class="bg-green-500 text-white px-3 py-1 rounded confirm-btn" data-team="${teamId}" data-event="${event}">Confirm</button>
                        <button class="bg-yellow-500 text-white px-3 py-1 rounded unconfirm-btn" data-team="${teamId}" data-event="${event}">Unconfirm</button>
                        <button class="bg-red-500 text-white px-3 py-1 rounded delete-btn" data-team="${teamId}" data-event="${event}">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);

                // Store data for Excel generation
                eventData.push({
                    College: details.college,
                    Department: details.department,
                    "Head Name": details.head.name,
                    "Roll No": details.head.rollNo,
                    Event: event,
                    Verified: details.verified ? "Yes" : "No"
                });
            });
        });

        attachEventListeners();
    } else {
        tableBody.innerHTML = "<tr><td colspan='7' class='text-center p-3'>No data available</td></tr>";
    }
};

// 🔹 Attach Event Listeners
const attachEventListeners = () => {
    document.querySelectorAll(".confirm-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const teamId = e.target.dataset.team;
            const event = e.target.dataset.event;
            await update(ref(db, `teams/${teamId}/events/${event}/details`), { verified: true });
            fetchData();
        });
    });

    document.querySelectorAll(".unconfirm-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const teamId = e.target.dataset.team;
            const event = e.target.dataset.event;
            await update(ref(db, `teams/${teamId}/events/${event}/details`), { verified: false });
            fetchData();
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const teamId = e.target.dataset.team;
            const event = e.target.dataset.event;
            if (confirm("Are you sure you want to delete this entry?")) {
                await remove(ref(db, `teams/${teamId}/events/${event}`));
                fetchData();
            }
        });
    });
};

// 🔹 Download as Spreadsheet
const downloadExcel = (eventType) => {
    const filteredData = eventData.filter(entry => entry.Event.toLowerCase() === eventType.toLowerCase());
    if (filteredData.length === 0) {
        alert(`No data available for ${eventType}`);
        return;
    }

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, eventType);
    XLSX.writeFile(wb, `${eventType}_Event.xlsx`);
};

// 🔹 Event Listeners for Download Buttons
document.getElementById("download-paper").addEventListener("click", () => downloadExcel("paper"));
document.getElementById("download-poster").addEventListener("click", () => downloadExcel("poster"));
document.getElementById("download-project").addEventListener("click", () => downloadExcel("project"));

// 🔹 Load Data on Page Load
window.onload = fetchData;
