const axios = require('axios');
const pool = require('../config/Pdb');
require('dotenv').config({ path: '../.env' });
const buildPrompt = require('../prompt');

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

exports.askHR = async (req, res) => {
  const { question } = req.body;
  const prompt = buildPrompt(question);

  try {
    // 1. Ask Gemini to generate SQL
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    let sql = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    sql = sql.replace(/```sql|```|"""sql|"""/gi, '').replace(/`/g, '"').trim();

    // 2. Enforce SELECT-only rule
    if (!/^\s*(with|select)\s+/i.test(sql)) {
      return res.status(400).json({
        error: 'Only SELECT queries are allowed.',
        queryRejected: sql,
      });
    }

    console.log('[askHR SQL]', sql);

    // 3. Execute the SQL
    const result = await pool.query(sql);
    const rows = result.rows;

 const explanationPrompt = `
You are an HR assistant. Explain the result of this SQL query to a non-technical HR manager in a clear and professional tone.

Question:
${question}

SQL Query:
${sql}

Query Result:
${JSON.stringify(rows, null, 2)}

Instructions:
- Provide a friendly, professional explanation of the results.
- Use plain, conversational language—avoid SQL or technical terminology.
- Focus on what IS true, not what is NOT.
- If the result is empty ([]), respond positively and contextually. Examples:
  - For absence or leave queries: "Everyone is present today."
  - For lateness: "Everyone arrived on time today."
  - For holidays: "There are no upcoming holidays scheduled."
  - For training sessions: "There are no training sessions currently scheduled."
- If results contain data:
  - Highlight the key takeaways—how many, who, when, etc.
  - Group or summarize data if the result is long.
  - Mention employee names or dates if useful and relevant.
- Do not repeat the question unless necessary.
- Avoid speculation or assumptions.
- Do not say “The SQL shows…” or anything technical.
- Use a tone that sounds like an empathetic HR professional.
- Keep the explanation under 100 words unless listing multiple items.
- Use short paragraphs or bullet points for readability if needed.

Examples:
- "Three employees are currently on leave: Alice, Bob, and Charlie."
- "Everyone arrived on time today."
- "The upcoming holidays are Independence Day (July 4) and Labor Day (September 2)."

Now, give a short and clear summary of what this data means for the HR manager.
`;



    const { data: explainData } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: explanationPrompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const explanation = explainData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
console.log('[askHR Explanation]', explanation);
    // 5. Return everything
    res.status(200).json({
      sql,
      data: rows,
      explanation
    });

  } catch (error) {
    console.error('[askHR Error]', error.message);
    res.status(500).json({
      error: 'Failed to generate or execute SQL.',
      details: error.message,
    });
  }
};
