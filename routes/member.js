const path = require('path');
const { check, body } = require('express-validator/check');
const express = require('express');

const memberController = require('../controllers/member');
const recipeController = require('../controllers/recipe');
const isAuth = require('../middleware/is-auth');
const User = require('../models/user');

const router = express.Router();

router.get('/', isAuth, memberController.getIndex);

router.post('/recipe/builder',isAuth,recipeController.postRecipeBuilder);

router.post('/recipeRating',isAuth,recipeController.rateRecipe);

// Load data for new recipe on to client's side.
router.post('/recipe/:recipeId', isAuth, recipeController.getRecipe);

// /member/recipes?id=13
router.get('/recipes',  memberController.loadRecipesPage);

router.get('/get-category-page', isAuth, memberController.changeRecipesPage)

router.put('/add-to-cookbook/:recipeId', isAuth, memberController.addToCookbook);

// Should be delete, but for some reason using DELETE throws an error, but get is fine.
router.get('/remove-from-cookbook/:recipeId', isAuth, memberController.removeFromCookbook);

router.get('/recipe/searchIngredients', isAuth, recipeController.getMatchingIngredients);

// Should be delete, but for some reason using DELETE throws an error, but get is fine.
router.get('/delete-recipe/:recipeId', isAuth, recipeController.deleteRecipe);

router.get('/recipe/builder',isAuth,recipeController.getRecipeBuilder);

router.get('/profile', isAuth, memberController.getProfile);

router.post(
    '/profile',
    [
      check('email')
        .custom((value) => {
          return User.findOne(value).then(userDoc => {
            if (userDoc && value != '') {
              return Promise.reject(
                'E-Mail exists already, please pick a different one.'
              );
            }
          });
        })
        .normalizeEmail(),
      body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords have to match!');
          }
          return true;
        })
    ],
    memberController.postProfile
  );

module.exports = router;
