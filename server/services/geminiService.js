const { genAI, MODEL_NAME } = require('../config/gemini');

/**
 * Gemini AI Service
 * Handles all AI-powered features using Gemini Flash
 */

/**
 * Detect ingredients from an image
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns {Promise<object>} Detected ingredients
 */
const detectIngredients = async (imageBase64, mimeType = 'image/jpeg') => {
  const prompt = `You are a food and ingredient recognition expert. Analyze this image and identify all food items and ingredients visible.

For each ingredient found, provide:
1. name: The name of the ingredient
2. quantity: Estimated quantity (e.g., "2 pieces", "500g", "1 bunch")
3. category: One of these - vegetable, fruit, protein, dairy, grain, spice, condiment, beverage, other

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "ingredients": [
    {"name": "tomato", "quantity": "3 pieces", "category": "vegetable"},
    {"name": "onion", "quantity": "2 medium", "category": "vegetable"}
  ],
  "totalItems": 2
}

If no food items are detected, return: {"ingredients": [], "totalItems": 0}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ]
    });

    const text = response.text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { ingredients: [], totalItems: 0, error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini ingredient detection error:', error);
    throw new Error('Failed to analyze image: ' + error.message);
  }
};

// Ask Gemini for some recipe ideas based on what we have.
// We pass the user profile to make sure it respects their diet/goals.
const generateRecipeSuggestions = async (ingredients, userProfile) => {
  const { dietType, goal, dailyCalories, weight, height, age, gender, activityLevel, exercisePreferences, language } = userProfile;

  const lang = language || 'English';
  const langInstruction = lang === 'English'
    ? 'IMPORTANT: For common ingredients, providing the Indian/Hindi name in parentheses is helpful (e.g., "Salt (Namak)", "Clarified Butter (Ghee)").'
    : `IMPORTANT: For all ingredient names and key terms, provide the ${lang} translation in parentheses. Example: "Salt (Translation)".`;

  const userStats = `
- User Stats: ${age} years, ${gender}, ${weight}kg, ${height}cm
- Activity Level: ${activityLevel}
- Max Cooking Time Preference: ${exercisePreferences?.maxTimeMinutes || 30} minutes
- Preferred Language: ${lang}`;

  const prompt = `You are a professional nutritionist and chef. Given these available ingredients: ${ingredients.join(', ')}

Create 3 healthy recipe suggestions for a ${dietType} person with a goal of ${goal}.
${userStats}
Target calories per meal: ${Math.round(dailyCalories / 3)} calories.
${langInstruction}

For each recipe provide:
1. name: Recipe name
2. description: Brief 1-line description
3. ingredientsUsed: List of ingredients from the available list that will be used
4. additionalIngredients: Any basic ingredients needed (salt, oil, etc.)
5. servings: Number of servings
6. prepTime: Preparation time in minutes
7. cookTime: Cooking time in minutes
8. difficulty: easy, medium, or hard
9. nutrition: {calories, protein (g), carbs (g), fats (g)} per serving
10. steps: Array of cooking step strings

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredientsUsed": ["ingredient1", "ingredient2"],
      "additionalIngredients": ["salt", "pepper"],
      "servings": 2,
      "prepTime": 15,
      "cookTime": 20,
      "difficulty": "easy",
      "nutrition": {"calories": 350, "protein": 25, "carbs": 30, "fats": 12},
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    const text = response.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { recipes: [], error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini recipe suggestion error:', error);
    throw new Error('Failed to generate recipes: ' + error.message);
  }
};

// This is the big one - generates a full meal plan + shopping list.
// We try to nudge the AI to use common ingredients to save money/waste.
const generateMealPlan = async (userProfile, days = 3, limit = 20, shoppingMode = 'economical') => {
  const { dietType, goal, dailyCalories, dailyProtein, dailyCarbs, dailyFats, weight, height, age, gender, activityLevel, exercisePreferences, language } = userProfile;

  const lang = language || 'English';
  const langInstruction = lang === 'English'
    ? 'Use Indian/Hindi names for common ingredients where appropriate (e.g., "Salt (Namak)") in descriptions and lists.'
    : `Provide ${lang} translations for ingredients and meal names in parentheses.`;

  const userStats = `
- User Stats: ${age} years, ${gender}, ${weight}kg, ${height}cm
- Activity Level: ${activityLevel}
- Max Cooking Time Preference: ${exercisePreferences?.maxTimeMinutes || 30} minutes
- Preferred Language: ${lang}`;

  const modeInstruction = shoppingMode === 'premium'
    ? "Exclude common budget items. Focus on HIGH QUALITY, organic, and premium ingredients. Suggest varied and gourmet recipes."
    : "Focus on ECONOMICAL, budget-friendly ingredients. Suggest recipes that share common low-cost ingredients to minimize waste and cost.";

  const prompt = `You are a professional meal planning nutritionist. Create a ${days}-day meal plan for:
- Diet type: ${dietType}
- Goal: ${goal}
${userStats}
- Daily targets: ${dailyCalories} calories, ${dailyProtein}g protein, ${dailyCarbs}g carbs, ${dailyFats}g fats
- Shopping Mode: ${shoppingMode.toUpperCase()} (${modeInstruction})

Include for each day:
- Breakfast, Lunch, Dinner, and 1-2 Snacks
- Each meal should have name, brief description, and nutrition info
- ${langInstruction}

At the end, provide a complete grocery list organized by category.
IMPORTANT: Consolidate ingredients and limit the TOTAL number of items in the grocery list to maximum ${limit}. Prioritize the most essential ingredients for the core meals.

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "mealPlan": [
    {
      "day": 1,
      "meals": {
        "breakfast": {"name": "Meal name", "description": "Brief desc", "calories": 400, "protein": 20, "carbs": 45, "fats": 15},
        "lunch": {"name": "Meal name", "description": "Brief desc", "calories": 500, "protein": 30, "carbs": 50, "fats": 18},
        "dinner": {"name": "Meal name", "description": "Brief desc", "calories": 550, "protein": 35, "carbs": 45, "fats": 20},
        "snacks": [{"name": "Snack name", "description": "Brief desc", "calories": 150, "protein": 8, "carbs": 15, "fats": 6}]
      },
      "totalNutrition": {"calories": 1600, "protein": 93, "carbs": 155, "fats": 59}
    }
  ],
  "groceryList": {
    "vegetables": ["item1", "item2"],
    "fruits": ["item1", "item2"],
    "proteins": ["item1", "item2"],
    "dairy": ["item1", "item2"],
    "grains": ["item1", "item2"],
    "pantry": ["item1", "item2"]
  }
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    const text = response.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { mealPlan: [], groceryList: {}, error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini meal plan error:', error);
    throw new Error('Failed to generate meal plan: ' + error.message);
  }
};

// Fetch the full details for a specific recipe.
// We force the AI to give us structured JSON so the frontend doesn't explode.
const getRecipeDetails = async (dishName, userProfile) => {
  const { dietType, language } = userProfile;

  const lang = language || 'English';
  const langInstruction = lang === 'English'
    ? 'For the ingredient list: If the ingredient is "Salt", strictly put "Namak" in the "notes" field. For other common ingredients, you may add the Hindi name in notes if useful.'
    : `For the ingredient list: Provide the ${lang} translation for the item in the "notes" field.`;

  const prompt = `You are a professional chef and nutritionist. Provide a detailed recipe for "${dishName}" suitable for a ${dietType} diet.

Include:
1. Recipe name and description
2. Servings and prep/cook time
3. Complete ingredients list with quantities
4. Step-by-step cooking instructions
5. Nutrition information per serving
6. Tips for healthier variations
7. Common mistakes to avoid

${langInstruction}

IMPORTANT: Return ONLY valid JSON in this exact format, no other text:
{
  "recipe": {
    "name": "${dishName}",
    "description": "Brief description of the dish",
    "servings": 4,
    "prepTime": 20,
    "cookTime": 30,
    "difficulty": "medium",
    "ingredients": [
      {"item": "ingredient name", "quantity": "amount", "notes": "optional notes"}
    ],
    "instructions": [
      {"step": 1, "instruction": "Step description"},
      {"step": 2, "instruction": "Step description"}
    ],
    "nutrition": {
      "perServing": {"calories": 400, "protein": 25, "carbs": 35, "fats": 18}
    },
    "tips": ["Tip 1", "Tip 2"],
    "healthierAlternatives": ["Alternative 1", "Alternative 2"],
    "commonMistakes": ["Mistake 1", "Mistake 2"]
  }
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    const text = response.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { recipe: null, error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini recipe details error:', error);
    throw new Error('Failed to get recipe: ' + error.message);
  }
};

module.exports = {
  detectIngredients,
  generateRecipeSuggestions,
  generateMealPlan,
  getRecipeDetails
};
