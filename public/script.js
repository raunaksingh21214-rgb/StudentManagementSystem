
const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("search");

let students = [];
let editRoll = null;

// Load students from JSON through backend
async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error(error);
        alert("Students load nahi ho rahe!");
    }
}

// Display students in the table
function displayStudents(studentList) {
    studentTable.innerHTML = "";

    studentList.forEach(function(student) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>
                <button onclick="editStudent('${student.roll}')">Edit</button>
                <button onclick="deleteStudent('${student.roll}')">Delete</button>
            </td>
        `;

        studentTable.appendChild(row);
    });
}

// Add or update a student
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        roll: document.getElementById("roll").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim()
    };

    try {
        let response;

        if (editRoll !== null) {
            response = await fetch(
                "/api/students/" + editRoll,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }
            );
        } else {
            response = await fetch("/api/students", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Operation failed");
            return;
        }

        editRoll = null;
        studentForm.reset();

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Server se connection nahi ho raha!");
    }
});

// Search students
searchInput.addEventListener("input", function() {
    const query = searchInput.value.toLowerCase();

    const filteredStudents = students.filter(function(student) {
        return student.name.toLowerCase().includes(query) ||
               student.roll.toLowerCase().includes(query);
    });

    displayStudents(filteredStudents);
});

// Edit student
function editStudent(roll) {
    const student = students.find(s => s.roll === roll);

    if (!student) return;

    document.getElementById("name").value = student.name;
    document.getElementById("roll").value = student.roll;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;

    editRoll = roll;
}

// Delete student
async function deleteStudent(roll) {
    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch("/api/students/" + roll, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Delete failed");
            return;
        }

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Server se connection nahi ho raha!");
    }
}

// Load data when page opens
loadStudents();
