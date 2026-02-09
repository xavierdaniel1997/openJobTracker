require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'OpenJobTracker API is running 🚀' });
});

// Routes (Placeholders)
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/jobs', async (req, res) => {
    const { title, company, platform, location, salary, job_url, status, description, hr_name, hr_email, hr_phone, date } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO jobs (title, company, platform, location, salary, job_url, status, description, hr_name, hr_email, hr_phone, posted_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [title, company, platform, location, salary, job_url, status || 'applied', description, hr_name, hr_email, hr_phone, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
