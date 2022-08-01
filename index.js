const express = require('express');
const uuid = require('uuid.v4');
const snakecase = require('snake-case');
const { Pool } = require('pg');

const { updateDatabase } = require('./db');

const path = require('path');
const app = express();

try {
  require('dotenv').config();
} catch (ex) {
  console.warn('no environment variables loaded from .env');
}

const dbCredentials = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD || null,
  port: process.env.PG_PORT,
};

console.log(dbCredentials);

const port = process.env.PORT || 8080;

app.use(express.static(__dirname));

// setup connection pool
const pool = new Pool(dbCredentials);
updateDatabase(pool);

app.get('/', (req, res) => {
  res.sendFile(path.join(base, 'index.html'));
});

app.post('/api/loan', async (req, res) => {
  console.log('POST /api/loan', req.body);
  const {
    amount = 0,
    interestRate = 0,
    term = 0,
    payment = 0,
  } = req.body;
  const id = uuid();

  // save loan to database
  await pool.query(
    'INSERT INTO loans(id, amount, interest_rate, term, payment) VALUES ($1, $2, $3, $4, $5)',
    [id, amount, interestRate, term, payment]
  );

  res.json(id);
});

app.get('/api/loan/:id', async (req, res) => {
  console.log('GET /api/loan/:id', req.params);
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM loans WHERE id = $1', [id]);
  const [_, amount, interestRate, term, payment] = result.rows[0];
  res.json({ id, amount, interestRate, term, payment });
});

app.patch('/api/loan/:id', async (req, res) => {
  console.log('PATCH /api/loan/:id', req.params, req.body);
  const { id } = req.params;
  const { body } = req;
  const values = [];
  const setters = [];
  Object.entries(body).forEach(([key, value]) => {
    setters.push(`${snakecase(key)}=$${values.length + 1}`);
    values.push(value);
  });
  await pool.query(`UPDATE loans SET ${setters.join(' ')} WHERE id = $${values.length + 1}`, [...values, id]);
  res.json(true);
});

app.listen(port, () => console.log(`loanstreet api running on PORT ${process.env.PORT}`));

// todo - close connection pool on program halt

