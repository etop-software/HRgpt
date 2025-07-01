const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./config/Pdb.js'); 

const gptRoutes = require('./routes/gpt.js'); 

const app = express();

app.use(express.json({ limit: '100mb' }));

app.use(cors({
    origin: '*', 
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization', 
    credentials: true 
}));

app.options('*', cors()); 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/test', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/gpt', gptRoutes);

process.on('SIGINT', async () => {
    console.log('Closing PostgreSQL pool');
    await pool.end(); 
    console.log('PostgreSQL pool closed');
    process.exit(0); 
});

process.on('SIGTERM', async () => {
    console.log('Closing PostgreSQL pool');
    await pool.end();
    console.log('PostgreSQL pool closed');
    process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
