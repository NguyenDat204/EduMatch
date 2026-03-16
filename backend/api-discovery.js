const axios = require('axios');
require('dotenv').config();

async function discovery() {
  const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  console.log("Using API Key starting with:", key.substring(0, 7) + "...");

  const versions = ['v1', 'v1beta'];
  
  for (const v of versions) {
    console.log(`\n--- Testing API Version: ${v} ---`);
    try {
      const url = `https://generativelanguage.googleapis.com/${v}/models?key=${key}`;
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data && response.data.models) {
        console.log(`Found ${response.data.models.length} models.`);
        response.data.models.forEach(m => {
          if (m.supportedGenerationMethods.includes('generateContent')) {
             console.log(` [OK] ${m.name}`);
          } else {
             console.log(` [  ] ${m.name} (No generateContent)`);
          }
        });
      }
    } catch (err) {
      console.error(`Failed for ${v}: ${err.response ? `${err.response.status} ${err.response.statusText}` : err.message}`);
      if (err.response && err.response.data) {
        console.error("Details:", JSON.stringify(err.response.data.error || err.response.data, null, 2));
      }
    }
  }
}

discovery();
