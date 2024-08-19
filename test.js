// Declare variables at the top level
let unitGuid = ''; // Variable to store the selected unitGuid
let salVald = '';  // Variable to store the selected schema ID
let tillfällig_kommun = ''; // Variable to store the selected kommun
let fetchedTimetableData = null; // Variable to store fetched timetable data

// Event listener for form submission
document.getElementById("initialForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const hostName = document.getElementById("hostName").value;
    const schemaID = document.getElementById("schemaID").value;

    try {
        const response = await fetch("https://different-jealous-silica.glitch.me/api/timetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName, schemaID })
        });

        const data = await response.json();

        if (response.ok) {
            const schoolsDropdown = document.getElementById("schoolsDropdown");
            schoolsDropdown.innerHTML = '';

            data.forEach(school => {
                const option = document.createElement("option");
                option.value = school.unitGuid;
                option.textContent = school.unitName || "Unnamed School";
                schoolsDropdown.appendChild(option);
            });

            document.getElementById("schoolSelection").style.display = "block";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error fetching schools:", error);
        alert("An error occurred while fetching schools.");
    }
});

// Event listener for fetch timetable button
document.getElementById("fetchTimetable").addEventListener("click", async () => {
    try {
        const hostName = document.getElementById("hostName").value;
        const schemaID = document.getElementById("schemaID").value;
        const selectedUnitGuid = document.getElementById("schoolsDropdown").value;

        const response = await fetch("https://different-jealous-silica.glitch.me/api/timetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName, schemaID, unitGuid: selectedUnitGuid })
        });

        const timetableData = await response.json();

        if (response.ok) {
            document.getElementById("timetableData").textContent = JSON.stringify(timetableData, null, 2);
            document.getElementById("timetable").style.display = "block";
        } else {
            alert(timetableData.message);
        }
    } catch (error) {
        console.error("Error fetching timetable:", error);
        alert("An error occurred while fetching the timetable.");
    }
});

// Import kommuner from kommuner.js
import kommuner from './kommuner.js';

const nameList = document.getElementById('nameList');
const searchInput = document.getElementById('search');

// Display names from the kommuner.js file
function displayNames(names) {
    nameList.innerHTML = ''; // Clear the list
    names.forEach(name => {
        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.textContent = name;
        nameItem.addEventListener('click', () => {
            tillfällig_kommun = name; // Set tillfällig_kommun when clicked
            kommun_vald(); // Call the function after setting the variable
        });
        nameList.appendChild(nameItem);
    });
}

// Filter names to match the beginning of the word
function filterNames(query) {
    const filteredNames = kommuner.filter(name =>
        name.toLowerCase().startsWith(query.toLowerCase())
    );
    displayNames(filteredNames);
}

searchInput.addEventListener('input', () => {
    filterNames(searchInput.value);
});

// Initial display of names
displayNames(kommuner.slice(0, 10)); // Display the first 10 names

// Enable scrolling to show more names
nameList.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = nameList;
    if (scrollTop + clientHeight >= scrollHeight) {
        const currentDisplayCount = nameList.childNodes.length;
        displayNames(kommuner.slice(0, currentDisplayCount + 10)); // Load 10 more names
    }
});

// Code for new rooms
const add_screen = document.getElementById("add_screen");
const search_name = document.getElementById("search_name");
const id_val = document.getElementById("id_val");
const skolVal = document.getElementById("skol_val");
const geNamn = document.getElementById("ge_namn");
const namnVal = document.getElementById("namnVal");

document.getElementById("add").addEventListener("click", ny_sal);
document.getElementById("exit1").addEventListener("click", exit_1);
document.getElementById("next1").addEventListener("click", next_1);
document.getElementById("spara").addEventListener("click", () => {
    setTimeout(() => {
        spara_ny();
    }, 0);
});

function ny_sal() {
    add_screen.style.display = "flex";
    search_name.style.display = "flex";
}

function exit_1() {
    add_screen.style.display = "none";
    search_name.style.display = "none";
    id_val.style.display = "none";
    searchInput.value = '';
    salen.value = "";
}

function kommun_vald() {
    tillfällig_kommun = tillfällig_kommun.toLowerCase();
    console.log(tillfällig_kommun);
    search_name.style.display = "none";
    id_val.style.display = "flex";
}

const salen = document.getElementById("idval");

function next_1() {
    id_val.style.display = "none";
    salVald = salen.value; // Store the selected schema ID
    console.log(salVald);
    searchInput.value = '';
    fetch_skolor(salVald);
    skolVal.style.display = "block";
}

function skola_vald(schoolUnitGuid) {
    unitGuid = schoolUnitGuid; // Store the selected school unitGuid
    console.log(unitGuid);
    skolVal.style.display = "none";
    geNamn.style.display = "flex";
    salen.value = "";
}

function spara_ny() {
    geNamn.style.display = "none";
    add_screen.style.display = "none";
    let tillfällig_namn = namnVal.value; // Define the temporary name
    namnVal.value = "";
    saveHolder(tillfällig_namn);

    setTimeout(() => {
        fetchTimetableDataAfterSave(tillfällig_namn); // Pass the name as a parameter
    }, 0);
}

async function fetch_skolor(salVald) {
    try {
        const hostName2 = tillfällig_kommun; // Ensure this is defined earlier
        const schemaID2 = salVald;
        console.log(hostName2);

        const response = await fetch("https://different-jealous-silica.glitch.me/api/timetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName: hostName2, schemaID: schemaID2 })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }

        const data = await response.json();
        console.log(hostName2);
        console.log(data);

        // Set up initial display of names
        displaySchools(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while fetching data.");
    }
}

// Display schools in the list
function displaySchools(schools) {
    const nameList = document.getElementById('nameList2');
    const searchInput = document.getElementById('search2');

    function createSchoolItem(school) {
        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.textContent = school.unitName || "Unnamed School";
        nameItem.addEventListener('click', () => {
            const unitGuid = school.unitGuid; // Use unitGuid instead of name
            skola_vald(unitGuid);
            console.log(unitGuid); // Log the school unitGuid
        });
        return nameItem;
    }

    function filterSchools(query) {
        const filteredSchools = schools.filter(school =>
            school.unitName.toLowerCase().startsWith(query.toLowerCase())
        );
        nameList.innerHTML = ''; // Clear the list
        filteredSchools.forEach(school => nameList.appendChild(createSchoolItem(school)));
    }

    // Initial display of all schools
    filterSchools('');

    // Event listener for filtering based on input
    searchInput.addEventListener('input', () => {
        filterSchools(searchInput.value);
    });
}




















// Initialize holders from localStorage or as an empty array
let holders = JSON.parse(localStorage.getItem('holders')) || [];
let holderId = holders.length > 0 ? holders[holders.length - 1].id + 1 : 0; // Initialize holderId

// Function to create a new holder element
function createHolderElement(holder) {
    const holderDiv = document.createElement('div');
    holderDiv.className = 'holder';
    holderDiv.dataset.id = holder.id; // Assign the holder's id to the dataset for easy reference

    holderDiv.innerHTML = `
        <p class="remove_sal" style="cursor: pointer;">X</p>
        <p class="sal_namn">${holder.sal_namn}</p>
        <p class="status">${holder.status || 'Är ledig'}</p>
        <p class="tid">${holder.tid || '00:00:00'}</p>
        <p class="lärare">${holder.lärare || 'JANNE'}</p>
        <p class="ämne">${holder.ämne || 'CAD'}</p>
    `;

    // Add click event listener to the remove button
    const removeButton = holderDiv.querySelector('.remove_sal');
    removeButton.addEventListener('click', function() {
        removeHolder(holder.id); // Pass the id of the holder to remove
    });

    return holderDiv;
}

// Function to remove a holder
function removeHolder(id) {
    // Remove the holder with the specified id from the holders array
    holders = holders.filter(holder => holder.id !== id);

    // Update localStorage
    localStorage.setItem('holders', JSON.stringify(holders));

    // Re-render the holders
    renderHolders();
}

// Function to render all holders
function renderHolders() {
    const container = document.getElementById('holders-container');
    container.innerHTML = ''; // Clear existing content

    holders.forEach(holder => {
        container.appendChild(createHolderElement(holder));
    });
}

// Function to save a new holder
function saveHolder(tillfällig_namn) {
    if (!tillfällig_namn) {
        alert('Sal Namn cannot be empty');
        return;
    }

    const newHolder = {
        id: holderId++, // Unique identifier
        sal_namn: tillfällig_namn,
        status: 'Är ledig', // Default value, can be customized
        tid: '00:00:00', // Default value, can be customized
        lärare: 'JANNE', // Default value, can be customized
        ämne: 'CAD' // Default value, can be customized
    };

    holders.push(newHolder);
    localStorage.setItem('holders', JSON.stringify(holders)); // Store in localStorage
    renderHolders(); // Re-render holders

    // Fetch timetable data after saving
    fetchTimetableDataAfterSave(tillfällig_namn);
}

// Render holders on page load
document.addEventListener('DOMContentLoaded', renderHolders);

// Fetch timetable data after saving
async function fetchTimetableDataAfterSave(tillfällig_namn) {
    try {
        const response = await fetch("https://different-jealous-silica.glitch.me/api/timetable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName: tillfällig_kommun, schemaID: salVald, unitGuid: unitGuid })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }

        const timetableData = await response.json();
        document.getElementById("timetableData").textContent = JSON.stringify(timetableData, null, 2);

        // Update holders with timetable data and start countdowns
        mapTimetableToHolder(timetableData, tillfällig_namn);
        timetableData.forEach(lesson => startCountdown(lesson));
    } catch (error) {
        console.error("Error fetching timetable data:", error);
        alert("An error occurred while fetching timetable data.");
    }
}

// Update holder with timetable data
function updateHolderWithLessonData(holder, lesson) {
    holder.status = getLessonStatus(lesson);
    holder.tid = lesson.timeStart;
    holder.lärare = lesson.texts[0]; // Assuming this is the teacher
    holder.ämne = lesson.texts[1]; // Assuming this is the subject
    // Update local storage
    localStorage.setItem('holders', JSON.stringify(holders));
    renderHolders(); // Refresh display
}

// Map timetable data to holders
function mapTimetableToHolder(timetableData, tillfällig_namn) {
    const holder = holders.find(h => h.sal_namn === tillfällig_namn);
    if (!holder) return;

    // Find the closest future lesson
    const closestLesson = findClosestLesson(timetableData);

    if (closestLesson) {
        updateHolderWithLessonData(holder, closestLesson);
    } else {
        console.error('No future lessons found.');
    }
}

// Calculate and display lesson status
function getLessonStatus(lesson) {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

    const lessonStart = new Date(`1970-01-01T${lesson.timeStart}Z`);
    const lessonEnd = new Date(`1970-01-01T${lesson.timeEnd}Z`);
    const current = new Date(`1970-01-01T${currentTime}Z`);

    if (current < lessonStart) {
        return 'ledig'; // Lesson hasn't started yet
    }
    if (current >= lessonStart && current <= lessonEnd) {
        return 'upptagen'; // Lesson is currently ongoing
    }
    return 'ledig'; // Lesson has ended or is not yet relevant
}

// Calculate time remaining for countdown
function calculateTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(`1970-01-01T${endTime}Z`);
    const timeDiff = end - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
}

// Start countdown for a lesson
function startCountdown(lesson) {
    const countdownElement = document.getElementById(`countdown-${lesson.guidId}`);
    if (!countdownElement) return; // Skip if the countdown element is not found

    function updateCountdown() {
        const { hours, minutes, seconds } = calculateTimeRemaining(lesson.timeEnd);
        countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        if (hours <= 0 && minutes <= 0 && seconds <= 0) {
            countdownElement.textContent = "Time's up!";
            clearInterval(timerInterval);
        }
    }

    updateCountdown(); // Initial call
    const timerInterval = setInterval(updateCountdown, 1000); // Update every second
}

// Find the closest lesson
function findClosestLesson(lessons) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) - 6 (Saturday)
    const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
    
    // Create an array to hold lessons for each day of the week
    const lessonsByDay = Array.from({ length: 7 }, () => []);

    // Organize lessons by day of the week
    lessons.forEach(lesson => {
        const dayIndex = lesson.dayOfWeekNumber - 1; // Adjust for 0-based index
        lessonsByDay[dayIndex].push(lesson);
    });

    // Find the next upcoming lesson
    for (let offset = 0; offset < 7; offset++) {
        const dayIndex = (currentDay + offset) % 7;
        const dayLessons = lessonsByDay[dayIndex];

        // Sort lessons by start time for the current day
        const sortedLessons = dayLessons.sort((a, b) => a.timeStart.localeCompare(b.timeStart));

        // Find the closest lesson for the current day
        for (const lesson of sortedLessons) {
            if (offset > 0 || lesson.timeStart > currentTime) {
                return lesson;
            }
        }
    }

    // If no future lesson is found (shouldn't happen if data is correct)
    return null;
}

// Example usage
const lessons = [
    // Define your lessons here...
];

const closestLesson = findClosestLesson(lessons);
console.log(closestLesson);