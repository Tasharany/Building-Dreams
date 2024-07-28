const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');

app.use(express.static('../Frontend'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // For URL-encoded data (form submissions)


const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'sashen', //Make it you whatever your password is for the database
    port: 5432,
});

app.post('/saveBuild', async (req, res) => {
    console.log('Received build data:', req.body); // Log the received data

    try {
        // Replace 'builds' with the actual name of your table where you want to save build data
        const result = await pool.query(
            'INSERT INTO builds (cpu, gpu, motherboard, memory, cpu_cooler, internal_hard_drive, power_supply, case) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [buildDetails.cpu, buildDetails.gpu, buildDetails.motherboard, buildDetails.memory, buildDetails.cpuCooler, buildDetails.internalHardDrive, buildDetails.powerSupply, buildDetails.case]
        );

        // Send back the saved build
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while saving the build');
    }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
    // Destructure username and password from the request body
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Check if the user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).send('User already exists!');
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        // Return the newly created user
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length > 0) {
            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (validPassword) {
                res.status(200).send('Login successful');
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


async function fetchCpus() {
    const query = `
        SELECT
            c1 AS "model",c2 AS "price",c3 AS "cores",c4 AS "baseClock",c5 AS "boostClock",c6 AS "tdp",
            c7 AS "integratedGraphics",c8 AS "hyperthreading"
        FROM cpu
        LIMIT 50;`;
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


app.get('/cpu', async (req, res) => {
    try {
        const cpuData = await fetchCpus();
        res.json(cpuData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchGpus() {
    const query = `
        SELECT
            c1 AS "model",
            c2 AS "price"
        FROM video_card
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/video_card', async (req, res) => {
    try {
        const gpuData = await fetchGpus();
        res.json(gpuData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchMotherboards() {
    const query = `
        SELECT
            c1 AS "model",c2 AS "price",c3 AS "socket",c4 AS "chipset",c5 AS "formFactor",c6 AS "maxRam"
        FROM motherboard
                 LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/motherboard', async (req, res) => {
    try {
        const motherboardData = await fetchMotherboards();
        res.json(motherboardData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});
async function fetchMemory() {
    const query = `
        SELECT
            c1 AS name, c2 AS price, c3 as speed, c4 as modules
        FROM memory
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/memory', async (req, res) => {
    try {
        const memoryData = await fetchMemory();
        res.json(memoryData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchCpuCooler() {
    const query = `
        SELECT
            c1 AS "model", c2 AS "price"
        FROM cpu_cooler
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/cpu_cooler', async (req, res) => {
    try {
        const coolerData = await fetchCpuCooler(); // Changed variable name to coolerData
        res.json(coolerData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchInternalHD() {
    const query = `
        SELECT
            c1 AS "name",c2 AS "price", c3 as "capacity", c5 as type
        FROM internal_hard_drive
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/internal-hard-drive', async (req, res) => {
    try {
        const hdData = await fetchInternalHD(); // Changed variable name to hdData
        res.json(hdData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchPSU() {
    const query = `
        SELECT
            c1 AS "name",c2 AS "price", c4 as "efficiency", c5 as "wattage"
        FROM power_supply
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/power-supply', async (req, res) => {
    try {
        const psuData = await fetchPSU(); // Changed variable name to psuData
        res.json(psuData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});

async function fetchCase() {
    const query = `
        SELECT
            c1 AS "name",c2 AS "price", c3 as "type", c5 as "color"
        FROM comp_case
        LIMIT 50;`;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
app.get('/compcase', async (req, res) => {
    try {
        const caseData = await fetchCase();
        res.json(caseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error while fetching data" });
    }
});


//database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Database connection successful. Server time is:', res.rows[0].now);
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));