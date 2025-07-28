const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const SUPABASE_URL = "https://zdnlebbdntgwfdmqelkc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbmxlYmJkbnRnd2ZkbXFlbGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTAwNzAsImV4cCI6MjA2NzE2NjA3MH0.tY9pKR3ffgvN4KGOTF0Rl5ivUsg1mVMFcV8TR2W3W94";  // ⬅️ Replace with your real Supabase API key

app.post("/upload", async (req, res) => {
  try {
    const payload = req.body;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sensor_data`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    res.send("Success");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/', (req, res) => {
  res.send('Supabase bridge is running!');
});
app.listen(PORT, () => {
  console.log(`Bridge running on http://localhost:${PORT}`);
});
