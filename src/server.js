// import { getIngredientsFromRecipe } from './util';

const sandwich_util = require('./util_module.js')
const express = require('express');
const app = express();

// console.log(util.getIngredientsFromRecipe)

// Use React page as the main page 
app.use(express.static("build"))
app.use(express.static("public"))

// Provide REST API service to generate JSON result
app.get("/recipe/:recipe", (req, res) => {
  const ingredients = sandwich_util.getIngredientsFromRecipe(req.params.recipe);
  let foundSandwich = undefined;
  if (ingredients && ingredients.fillings.length > 0 && ingredients.condiments.length > 0) 
  {
    const fillings = ingredients.fillings;
    const condiments = ingredients.condiments;

    // const megaSandwichMode = false;
    // if (fillings.length > MAX_FILLINGS || condiments.length > MAX_CONDIMENTS) {
    //   megaSandwichMode = true;
    // }

    const sorted_ingredients = [
      ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
      ...condiments.sort((a, b) => a.name.localeCompare(b.name))
    ];
    const sums = sandwich_util.getIngredientsSums(fillings, condiments);
    activeSums = sums;

    foundSandwich = sandwich_util.checkPresetSandwich(sums, fillings, condiments);
    // const generatedSandwich = craftSandwich(fillings, condiments, sums, foundSandwich);
    // activeSandwich = foundSandwich?.number;
  } else {
    res.status(500).send('Cannot find a recipe.')
  }
  if (foundSandwich) {
    res.json(foundSandwich)
  }else {
    res.status(500).send('Cannot find a recipe.')
  }
})

port = process.env.PORT || 3000; // Set the port

// Start the server
app.listen(port);
console.log('RESTful API server started on: ' + port);

