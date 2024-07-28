
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(express.static('../Frontend/redesign/'));
app.use(cors());
app.use(bodyParser.json());

let users = []; // Simulated database for users
let builds = []; // Simulated database for builds

// User Registration Endpoint
app.post('/api/users/register', async (req, res) => {
    const { username, email, password } = req.body;
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, email, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ message: 'User created successfully' });
});

// User Login Endpoint
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

// Save Build Endpoint
app.post('/api/builds/save', (req, res) => {
    const { cpu, gpu } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'secret');
        builds.push({ userId: decoded.userId, cpu, gpu });
        res.json({ message: 'Build saved successfully' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

//added this for the redesgin of the website

// function addItem(partId) {
//     fetch('/add-part', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ partId: partId })
//     })
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(error => console.error('Error:', error));
// }

// function deleteItem(partId) {
//     fetch('/delete-part', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ partId: partId })
//     })
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(error => console.error('Error:', error));
// }

// app.get('/api/prices', (req, res) => {
//     // Assume `db` is your database connection, e.g., MongoDB, PostgreSQL, etc.
//     db.collection('parts').find({}).toArray((err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });

// Catch-all handler for 404 responses
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));