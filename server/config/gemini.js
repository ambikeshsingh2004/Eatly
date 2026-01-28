const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Model name
const MODEL_NAME = 'gemini-2.5-flash';

module.exports = {
  genAI,
  MODEL_NAME
};
