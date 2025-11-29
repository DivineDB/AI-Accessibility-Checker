const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' }); 

async function check() {
  // CHANGED: Using GEMINI_API_KEY as found in .env.local
  const key = process.env.GEMINI_API_KEY;
  if (!key) { console.log("❌ No API Key found in .env.local"); return; }
  
  console.log("Checking models for key ending in...", key.slice(-4));
  const genAI = new GoogleGenerativeAI(key);
  
  try {
    // 1. Try to list models (The "Truth" Source)
    // Note: The SDK wrapper might not expose listModels directly in all versions, 
    // so we try a "Hello World" on the 3 most likely candidates.
    
    const candidates = [
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.0-flash-lite"
    ];

    console.log("\n--- TESTING CONNECTIVITY ---");
    for (const modelName of candidates) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent("Hello");
        console.log("✅ AVAILABLE");
      } catch (e) {
        console.log(`❌ ERROR for ${modelName}:`, e.message); // Log full error
      }
    }

    // NEW: Call ListModels API directly
    // console.log("\n--- LISTING ALL AVAILABLE MODELS (REST API) ---");
    // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    // const data = await response.json();
    
    // if (data.error) {
    //     console.error("ListModels Error:", data.error);
    // } else if (data.models) {
    //     console.log("Found models:");
    //     data.models.forEach(m => console.log(`- ${m.name}`));
    // } else {
    //     console.log("No models found in response:", data);
    // }
    
  } catch (error) {
    console.error("Fatal Error:", error);
  }
}

check();
