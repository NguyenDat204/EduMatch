const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Testing API Key...");
    
    // Attempting to list models - note: listModels might not be available on all versions of the SDK in the same way
    // but we can try to find what's available
    console.log("Listing available models (this might fail if the method is changed in SDK):");
    // Some versions use fetch, some use the client. Let's try the direct approach if possible.
    // However, the simplest way is to just test them one by one.
    
    const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log(`[SUCCESS] Model ${m} is available. Response: ${response.text().substring(0, 20)}...`);
      } catch (err) {
        console.log(`[FAILED] Model ${m}: ${err.message}`);
      }
    }
  } catch (e) {
    console.error("Global Error:", e.message);
  }
}

checkModels();
