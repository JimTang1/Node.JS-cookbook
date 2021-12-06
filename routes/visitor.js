const path = require('path');

const express = require('express');

const visitorController = require('../controllers/visitor');
const recipeController = require('../controllers/recipe');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', visitorController.getIndex);

router.get('/getSubCategories',visitorController.getSubCategories);

// Load data for new recipe on to client's side.
router.post('/recipe/:recipeId', recipeController.getRecipe);

// /recipes?id=13
router.get('/recipes', recipeController.loadRecipesPage);

router.get('/get-category-page', recipeController.changeRecipesPage)

module.exports = router;
