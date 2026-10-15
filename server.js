
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "data", "students.json");
console.log("JSON file path:", dataFile);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read all students
function readStudents() {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
}

// Save all students
function saveStudents(students) {
    fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
}

// Get all students
app.get("/api/students", (req, res) => {
    res.json(readStudents());
});

// Add a student
app.post("/api/students", (req, res) => {
    const { name, roll, email, course } = req.body;

    if (!name || !roll || !email || !course) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const students = readStudents();

    if (students.some(student => student.roll === roll)) {
        return res.status(409).json({ message: "Roll number already exists" });
    }

    const student = { name, roll, email, course };

    students.push(student);
    saveStudents(students);

    res.status(201).json(student);
});

// Update a student
app.put("/api/students/:roll", (req, res) => {
    const students = readStudents();
    const index = students.findIndex(
        student => student.roll === req.params.roll
    );

    if (index === -1) {
        return res.status(404).json({ message: "Student not found" });
    }

    const { name, roll, email, course } = req.body;

    if (!name || !roll || !email || !course) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (students.some((student, i) => i !== index && student.roll === roll)) {
        return res.status(409).json({ message: "Roll number already exists" });
    }

    students[index] = { name, roll, email, course };
    saveStudents(students);

    res.json(students[index]);
});

// Delete a student
app.delete("/api/students/:roll", (req, res) => {
    const students = readStudents();
    const updatedStudents = students.filter(
        student => student.roll !== req.params.roll
    );

    if (updatedStudents.length === students.length) {
        return res.status(404).json({ message: "Student not found" });
    }

    saveStudents(updatedStudents);
    res.json({ message: "Student deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
