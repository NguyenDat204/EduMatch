const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require("dotenv").config();

async function listModels() {
  const logStream = fs.createWriteStream('ai-debug.log');
  const log = (msg) => {
    console.log(msg);
    logStream.write(msg + '\n');
  };

  try {
    log("Starting Gemini test...");
    log("Key (first 5): " + (process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : "NONE"));
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try a few common model names
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    
    for (const modelName of models) {
      log(`Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        log(`Success with ${modelName}: ${response.text()}`);
      } catch (err) {
        log(`Failed with ${modelName}: ${err.message}`);
      }
    }
  } catch (globalErr) {
    log("Global Error: " + globalErr.stack);
  } finally {
    log("Test finished.");
    logStream.end();
  }
}

listModels();
