const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini Flash model for fast responses
const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

// Gemini Flash with vision capabilities for image analysis
const geminiFlashVision = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096,
  }
});

module.exports = {
  genAI,
  geminiFlash,
  geminiFlashVision
};
