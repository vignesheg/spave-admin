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
        let i = 1;
        let x = 1;
        let y = 0;
        Object.keys(teams).forEach((teamId) => {
            Object.keys(teams[teamId].events).forEach((event) => {

                const details = teams[teamId].events[event].details;
                const row = document.createElement("tr");
                details.member2.name != "" ? x++ : x;
                details.member3.name != "" ? x++ : x;
                if(details.hasOwnProperty("member4")){details.member4.name != "" ? x++ : x;}
                row.innerHTML = `
                    <td class="p-3">${i}</td>
                    <td class="p-3">${x}</td>
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
                        
                    </td>
                `;
               
                tableBody.appendChild(row);

                // Store data for Excel generation
                eventData.push({
                    College: details.college,
                    No_of_members: x,
                    Title: details.title,
                    verified:details.verified,
                    Department: details.department,
                    Head_Name: details.head.name,
                    Roll_No: details.head.rollNo,
                    Member_2: details.hasOwnProperty("member2") ? details.member2.name : "N/A",
                    Member_2_Roll_No: details.hasOwnProperty("member2") ? details.member2.rollNo : "N/A",
                    Member_3: details.hasOwnProperty("member3") ? details.member3.name : "N/A",
                    Member_3_Roll_No: details.hasOwnProperty("member3") ? details.member3.rollNo : "N/A",
                    Member_4: details.hasOwnProperty("member4") ? details.member4.name : "N/A",
                    Member_4_Roll_No: details.hasOwnProperty("member4") ? details.member4.rollNo : "N/A",
                    Event: event,
                    'Phone No': details.phone
                });
                i++;
                y+=x;
                x = 1;
            });
        });
        console.log(i);
        console.log(y);
        
        const row = document.createElement("tr");
        document.getElementById("count").innerHTML = `Total Participants : ${y}`

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
// 🔹 Download as Spreadsheet with Sorted Data (by Head Name)
const downloadExcel = (eventType) => {
    let filteredData = eventData.filter(entry => entry.Event.toLowerCase() === eventType.toLowerCase());

    if (filteredData.length === 0) {
        alert(`No data available for ${eventType}`);
        return;
    }

    // 🔹 Sort data alphabetically by 'Head Name'
    filteredData.sort((a, b) => a["Head_Name"].localeCompare(b["Head_Name"]));

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
