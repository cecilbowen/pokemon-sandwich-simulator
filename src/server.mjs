import express from 'express'

import { 
  getIngredientsFromRecipe, 
  getIngredientsSums, 
  checkPresetSandwich,
  craftSandwich } 
  from './util.mjs'

const app = express();

// Use React page as the main page 
app.use(express.static("build"))
app.use(express.static("public"))

// Provide REST API service to generate JSON result
app.get("/sandwich/:recipe", (req, res) => {
  const ingredients = getIngredientsFromRecipe(req.params.recipe);
  if (!ingredients || ingredients.fillings.length === 0 || ingredients.condiments.length === 0) {
    res.status(500).send('Cannot find a recipe.')
  }
  
  const fillings = ingredients.fillings;
  const condiments = ingredients.condiments;
  const sums = getIngredientsSums(fillings, condiments);

  const foundSandwich = checkPresetSandwich(sums, fillings, condiments);
  const generatedSandwich = craftSandwich(fillings, condiments, sums, foundSandwich);

  if (foundSandwich && foundSandwich?.number) {
    res.json(foundSandwich)
  } else if (generatedSandwich) {
    res.json(generatedSandwich)
  } else {
    res.status(500).send('Cannot find a recipe.')
  }
});

const port = process.env.PORT || 3000; // Set the port

// Start the server
app.listen(port);
console.log('RESTful API server started on: ' + port);

