const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const cors = require("cors");

const BASE_URL = 'https://web.skola24.se';
const HEADERS = {
    'Content-Type': 'application/json',
    'X-Scope': '8a22163c-8662-4535-9050-bc5e1923df48'
};

const app = express();

// Enable CORS for all routes
app.use(cors());

// __filename and __dirname are already available in CommonJS, so no need for import.meta.url
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index2.html"));
});
console.log(path.join(__dirname, "index2.html"));

app.post("/api/timetable", async (req, res) => {
    const { schemaID, hostName, unitGuid } = req.body;

    try {
        if (!unitGuid) {
            const unitGuids = await fetchUnitGuid(hostName);

            if (!unitGuids.length) {
                res.status(404).json({ message: "No units found for the provided host name." });
                return;
            }

            const schoolNames = unitGuids.map(unit => ({
                unitName: unit.unitName,
                unitGuid: unit.unitGuid
            }));

            res.json(schoolNames);
        } else {
            const signature = await getSignature(schemaID);
            const key = await fetchKey();
            const schoolYear = await getSchoolYear(hostName);
            const currentWeek = getCurrentWeek(); // Calculate the current week here

            console.log("Ny person har använt appen:");
            console.log("Schema ID:", schemaID);
            const schoolNames = await fetchUnitGuid(hostName);
            const school = schoolNames.find(school => school.unitGuid === unitGuid);
            if (school) {
                console.log("School Name:", school.unitName);  // Log unitName here
            }

            if (!schoolYear || !key || !signature) {
                res.status(500).json({ message: "Failed to fetch necessary data for timetable" });
                return;
            }

            const timetableParams = {
                renderKey: key,
                selection: signature,
                scheduleDay: 0,
                week: currentWeek,  // Use the current week
                year: 2024,
                host: `${hostName}.skola24.se`,
                unitGuid,
                schoolYear,
                startDate: null,
                endDate: null,
                blackAndWhite: false,
                width: 125,
                height: 550,
                selectionType: 4,
                showHeader: false,
                periodText: "",
                privateFreeTextMode: false,
                privateSelectionMode: null,
                customerKey: "",
            };

            const timetableResponse = await fetchTimetable(timetableParams);
            if (timetableResponse && timetableResponse.data && timetableResponse.data.lessonInfo) {
                res.json(timetableResponse.data.lessonInfo);
            } else {
                res.status(404).json({ message: "No lesson information found." });
            }
        }
    } catch (error) {
        console.error('Error processing timetable request:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/users", (req, res) => {
    const users = [
        { id: "12222222", name: "bror" },
        { id: "234", name: "bajs" },
        { id: "345", name: "bobby" },
    ];
    res.json(users);
});

app.post("/api/search", (req, res) => {
    const { name } = req.body;

    const users = [
        { id: "12222222", name: "bror" },
        { id: "234", name: "bajs" },
        { id: "345", name: "bobby" }
    ];

    const user = users.find(user => user.name.toLowerCase() === name.toLowerCase());

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.listen(3000, () => {
});

async function getSignature(id) {
    try {
        const response = await fetch(`${BASE_URL}/api/encrypt/signature`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ signature: id }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data.data ? data.data.signature : null;
    } catch (error) {
        console.error('Error in getSignature:', error);
        return null;
    }
}

async function fetchKey() {
    try {
        const response = await fetch(`${BASE_URL}/api/get/timetable/render/key`, {
            method: 'POST',
            headers: HEADERS
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data.data ? data.data.key : null;
    } catch (error) {
        console.error('Error fetching key:', error);
        return null;
    }
}

async function getSchoolYear(hostName) {
    try {
        const response = await fetch(`${BASE_URL}/api/get/active/school/years`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                hostName: `${hostName}.skola24.se`,
                checkSchoolYearsFeatures: false,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        if (data.data && data.data.activeSchoolYears && data.data.activeSchoolYears.length > 0) {
            return data.data.activeSchoolYears[0].guid;
        } else {
            console.error('No active school years found');
            return null;
        }
    } catch (error) {
        console.error('Error in getSchoolYear:', error);
        return null;
    }
}

async function fetchUnitGuid(hostName) {
    try {
        const response = await fetch(`${BASE_URL}/api/services/skola24/get/timetable/viewer/units`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                getTimetableViewerUnitsRequest: { hostName: `${hostName}.skola24.se` }
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        if (data.data && data.data.getTimetableViewerUnitsResponse) {
            return data.data.getTimetableViewerUnitsResponse.units.map(unit => ({
                unitName: unit.unitId,
                unitGuid: unit.unitGuid
            }));
        } else {
            console.error('No unit GUID data found');
            return [];
        }
    } catch (error) {
        console.error('Error fetching unit GUIDs:', error);
        return [];
    }
}

async function fetchTimetable(params) {
    try {
        const response = await fetch(`${BASE_URL}/api/render/timetable`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data;
        
        
    } catch (error) {
        console.error('Error fetching timetable:', error);
    }
}

function getCurrentWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;

    return Math.ceil(((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)+1);
}
