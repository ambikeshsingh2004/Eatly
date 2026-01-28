const { geminiFlashVision, geminiFlash } = require('../config/gemini');

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
    const result = await geminiFlashVision.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64
        }
      }
    ]);

    const response = result.response.text();

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { ingredients: [], totalItems: 0, error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini ingredient detection error:', error);
    throw new Error('Failed to analyze image: ' + error.message);
  }
};

/**
 * Generate recipe suggestions from ingredients
 * @param {array} ingredients - List of available ingredients
 * @param {object} userProfile - User's diet preferences and goals
 * @returns {Promise<object>} Recipe suggestions
 */
const generateRecipeSuggestions = async (ingredients, userProfile) => {
  const { dietType, goal, dailyCalories } = userProfile;

  const prompt = `You are a professional nutritionist and chef. Given these available ingredients: ${ingredients.join(', ')}

Create 3 healthy recipe suggestions for a ${dietType} person with a goal of ${goal}.
Target calories per meal: ${Math.round(dailyCalories / 3)} calories.

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
    const result = await geminiFlash.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { recipes: [], error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini recipe suggestion error:', error);
    throw new Error('Failed to generate recipes: ' + error.message);
  }
};

/**
 * Generate a meal plan with grocery list
 * @param {object} userProfile - User's complete profile
 * @param {number} days - Number of days (default 3)
 * @returns {Promise<object>} Meal plan and grocery list
 */
const generateMealPlan = async (userProfile, days = 3) => {
  const { dietType, goal, dailyCalories, dailyProtein, dailyCarbs, dailyFats } = userProfile;

  const prompt = `You are a professional meal planning nutritionist. Create a ${days}-day meal plan for:
- Diet type: ${dietType}
- Goal: ${goal}
- Daily targets: ${dailyCalories} calories, ${dailyProtein}g protein, ${dailyCarbs}g carbs, ${dailyFats}g fats

Include for each day:
- Breakfast, Lunch, Dinner, and 1-2 Snacks
- Each meal should have name, brief description, and nutrition info

At the end, provide a complete grocery list organized by category.

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
    const result = await geminiFlash.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { mealPlan: [], groceryList: {}, error: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini meal plan error:', error);
    throw new Error('Failed to generate meal plan: ' + error.message);
  }
};

/**
 * Get detailed recipe for a specific dish
 * @param {string} dishName - Name of the dish
 * @param {object} userProfile - User's diet preferences
 * @returns {Promise<object>} Detailed recipe
 */
const getRecipeDetails = async (dishName, userProfile) => {
  const { dietType } = userProfile;

  const prompt = `You are a professional chef and nutritionist. Provide a detailed recipe for "${dishName}" suitable for a ${dietType} diet.

Include:
1. Recipe name and description
2. Servings and prep/cook time
3. Complete ingredients list with quantities
4. Step-by-step cooking instructions
5. Nutrition information per serving
6. Tips for healthier variations
7. Common mistakes to avoid

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
    const result = await geminiFlash.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
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
