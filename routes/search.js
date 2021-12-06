const path = require('path');

const express = require('express');

const recipeController = require('../controllers/recipe');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/searchRecipes', recipeController.searchRecipes);

module.exports = router;
