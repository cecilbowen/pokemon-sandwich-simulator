import { 
  getIngredientsFromRecipe, 
  getIngredientsSums, 
  checkPresetSandwich,
  craftSandwich } 
  from './util.mjs'

export const generate_recipe = (recipe_text) => {
  const ingredients = getIngredientsFromRecipe(recipe_text);
  if (!ingredients || ingredients.fillings.length === 0 || ingredients.condiments.length === 0) {
    return undefined;
  }
  const fillings = ingredients.fillings;
  const condiments = ingredients.condiments;
  const sums = getIngredientsSums(fillings, condiments);

  const foundSandwich = checkPresetSandwich(sums, fillings, condiments);
  const generatedSandwich = craftSandwich(fillings, condiments, sums, foundSandwich);

  if (foundSandwich && foundSandwich?.number) {
    return (foundSandwich)
  } else if (generatedSandwich) {
    return (generatedSandwich)
  } else {
    // Cannot find a recipe.
    return undefined 
  }
};