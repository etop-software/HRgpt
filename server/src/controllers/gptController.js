const axios = require('axios');
const pool = require('../config/Pdb');
require('dotenv').config({ path: '../.env' });
const buildPrompt = require('../prompt');

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY; 

exports.askHR = async (req, res) => {
 
  const { question } = req.body;

  const prompt = buildPrompt(question);
 
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    let sql = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean SQL: remove triple quotes, markdown tags, backticks
    sql = sql
      .replace(/```sql|```|"""sql|"""/gi, '')
      .replace(/`/g, '"')
      .trim();


      if (!/^\s*(with|select)\s+/i.test(sql)) {
        return res.status(400).json({
          error: 'Only SELECT queries are allowed.',
          queryRejected: sql,
        });
      }
      console.log('[askHR SQL]', sql);
    const result = await pool.query(sql);

    res.status(200).json({
      sql,
      data: result.rows,
    });
  } catch (error) {
    console.log('[askHR Error]', error.message);
    console.error('[askHR Error]', error.message);
    res.status(500).json({
      error: 'Failed to generate or execute SQL.',
      details: error.message,
    });
  }
};
