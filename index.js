const axios = require("axios");
const cron = require("node-cron");

require("dotenv").config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE_NAME = "sensor_data"; 

async function forwardThingSpeakData() {
  try {
    // Fetch latest 1 entry from ThingSpeak
    const response = await axios.get(
      "https://api.thingspeak.com/channels/2947640/feeds.json?api_key=H15AO4ZITEOZMUEJ&results=1"
    );

    const latestFeed = response.data.feeds[0]; // 🟢 Only the latest feed
    if (!latestFeed) {
      console.log("No data received from ThingSpeak.");
      return;
    }

    // Example: Map ThingSpeak fields to Supabase format
    const payload = {
      air_temperature: parseFloat(latestFeed.field1),
      air_humidity: parseFloat(latestFeed.field2),
      soil_tds: parseFloat(latestFeed.field3),
      light_intensity: parseFloat(latestFeed.field4),
      soil_moisture: parseFloat(latestFeed.field5),
      soil_temperature: parseFloat(latestFeed.field6),
      soil_conductivity: parseFloat(latestFeed.field7),
      soil_ph: parseFloat(latestFeed.field8),
      timestamp: latestFeed.created_at
    };

    // Send to Supabase
    const supaRes = await axios.post(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, [payload], {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    });

    console.log("✅ Data forwarded to Supabase at", new Date().toLocaleString());
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Run every 15 minutes
cron.schedule("*/15 * * * *", () => {
  forwardThingSpeakData();
});

// Optional: basic status route (if you open the app URL)
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("ThingSpeak → Supabase bridge is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
