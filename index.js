const axios = require("axios");
const cron = require("node-cron");
const express = require("express");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE_NAME = "sensor_data";

let lastUploadedTimestamp = null; // 🧠 Track last uploaded timestamp

async function forwardThingSpeakData() {
  try {
    const response = await axios.get(
      "https://api.thingspeak.com/channels/2947640/feeds.json?api_key=H15AO4ZITEOZMUEJ&results=1"
    );

    const latestFeed = response.data.feeds[0];
    if (!latestFeed) {
      console.log("No data received from ThingSpeak.");
      return;
    }

    const latestTimestamp = latestFeed.created_at;

    // ✅ Skip upload if timestamp hasn't changed
    if (latestTimestamp === lastUploadedTimestamp) {
      console.log("⏩ No new data. Skipping upload.");
      return;
    }

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

    console.log("📦 Payload to Supabase:", payload);
    const supaRes = await axios.post(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, [payload], {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    });

    lastUploadedTimestamp = latestTimestamp; // 🧠 Update the last uploaded timestamp
    console.log("✅ Data forwarded to Supabase at", new Date().toLocaleString());

  } catch (err) {
  if (err.response) {
    console.error("❌ Supabase Error:", err.response.data);
    console.error("❌ Status Code:", err.response.status);
  } else {
    console.error("❌ Error:", err.message);
  }
}
}

// 🕒 Run every 5 minutes
cron.schedule("*/5 * * * *", () => {
  forwardThingSpeakData();
});

// 🌐 Optional: basic route
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("ThingSpeak → Supabase bridge is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
