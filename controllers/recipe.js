const User = require('../models/user');
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const errorController = require('./error');
const Category = require('../models/category');
const Measurements = require('../models/measurement');
const Rating = require('../models/rating');

const numberPerPage = 15;


exports.getIndex = (req, res, next) => {
   res.render('recipe/index', {
      pageTitle: 'Recipe',
      path: '/recipe',
      user: req.user != undefined ? req.user : 'Guest'
   });
};


/*
 * getHostName
 * Gets the name of the host to allow for access to resources reguardless of if the
 * developer is on the server or a local copy.
 * As shown on https://stackoverflow.com/questions/21987311/check-is-nodejs-connection-come-from-localhost
 */
const getHostName = (req) => {
   if (req.socket.remoteAddress.replace(/^.*:/, '') == "1") {
      // On localhost
      return "http://localhost:5000/"
   }
   // On server
   return "https://cse341-cookbook.herokuapp.com/"
}


/*
 * determineRecipesPage
 * Will determine the current page based on the index of the recipe + 1
 */
const determineRecipePage = (recipeIndexPlus1) => {
   if (recipeIndexPlus1 % numberPerPage != 0) {
      return Math.floor((recipeIndexPlus1 / numberPerPage)) + 1;
   } else {
      return Math.floor((recipeIndexPlus1 / numberPerPage));
   }
}


/*
 * renderRecipesPage
 * Contains logic for rendering the recipes page when a sub-category is selected or
 * the recipes page is changed.
 */
const renderRecipesPage = (req, res, next, currentPage, command, categoryId, queryFunction, isMemberRecipes) => {
   // Reset recipesPage and command session values to their default.
   req.session.recipesPage = 1;
   req.session.recipesPageCommand = "first";

   if (isMemberRecipes && !req.user) {
      console.log("Issue getting member recipes page, no user defined.");
      return;
   }

   // Get the category.
   console.log(res.url);
   let category = new Category();
   category.getById(categoryId)
   .then(result => {

      // Get the recipe names and ids.
      queryFunction.apply(null, (isMemberRecipes ? [categoryId, req.user.Id] : [categoryId]))
      .then(result => {

         if (result.length > 0) {
            let lastPage;
            let targetRecipeIndex = -1;

            // Set the last page value.
            lastPage = determineRecipePage(result.length);

            if (req.query.recipeId) {
               // Set page based on the passed in recipeId.
               targetRecipeIndex = result.findIndex(item => {return item.Id == req.query.recipeId});

               if (targetRecipeIndex > -1) {
                  currentPage = determineRecipePage(targetRecipeIndex + 1);
                  // Set targetRecipeIndex to the correct page index.
                  targetRecipeIndex = targetRecipeIndex % numberPerPage;
               } else {
                  console.log("No recipe with ID " + req.query.recipeId + " found for subcategory " + categoryId);
                  console.log("Defaulting to first recipe in subcategory.");
               }
            }
            
            if (targetRecipeIndex < 0) {
               // If there was no recipe specified.
               // Change the current page depending on what page is being switched to.
               targetRecipeIndex = 0;

               if (command == "first") {
                  currentPage = 1;
               } else if (command == "prev") {
                  if (currentPage > 1) {
                     currentPage = currentPage - 1;
                  }
               } else if (command == "next") {
                  if (currentPage * numberPerPage < result.length) {
                     currentPage = currentPage + 1;
                  }
               } else if (command == "last") {
                  currentPage = lastPage;
               }
            }

            let recipes = [];
            let startIndex = (currentPage - 1) * numberPerPage;

            // Only load in recipes from the desired page.
            for (let i = startIndex; i < (startIndex + numberPerPage) && i < result.length; i++) {
               recipes.push(result[i]);
            }

            if (recipes.length > 0) {
               let recipe = new Recipe();
               recipe.getById(recipes[targetRecipeIndex].Id)
               .then(result => {
                  res.render('member/recipe', {
                     pageTitle: 'Recipes',
                     path: '/member/recipes',
                     hostName: getHostName(req),
                     currentPage: currentPage,
                     totalPages: lastPage, // Must be some function of numberPerPage and the number of recipies in the subcategory
                     subCategory: category,
                     recipe: recipe,
                     recipes: recipes,
                     user: req.user != undefined ? req.user : 'Guest',
                     isMemberRecipes: isMemberRecipes,
                     fullUser: req.user,
                     csrfToken: req.csrfToken()
                  });
               });
            } else {
               console.log("Issue getting page " + currentPage + " for sub-category with id " + categoryId);
            }
         } else {
            console.log("No recipes found for sub-category with id " + categoryId);
         }
      });

   });
}


exports.loadRecipes = (req, res, next, queryFunction, isMemberRecipes) => {
   if (req.query && req.query.id) {
      renderRecipesPage(req, res, next, req.session.recipesPage, req.session.recipesPageCommand, req.query.id, queryFunction, isMemberRecipes);
   } else {
      console.log("Could not find category with id " + req.query ? req.query.id : "[No query defined]");
      errorController.get404(req, res, next);
   }
}


exports.recipesPageChange = (req, res, next, member) => {
   req.session.recipesPage = parseInt(req.query.page);
   req.session.recipesPageCommand = req.query.command;

   res.redirect((member ? "/member" : "") + "/recipes?id=" + parseInt(req.query.categoryId));
}


/*
 * loadRecipesPage
 * Will retrieve and display the sub-cateogry name, sub-category recipies,
 * and the first recipe.
 */
exports.loadRecipesPage = (req, res, next) => {
   exports.loadRecipes(req, res, next, Recipe.getRecipeNameAndIdsByCategoryId, false);
}


/*
 * changeRecipesPage
 * Handels page change requests on the recipes page.
 */
exports.changeRecipesPage = (req, res, next) => {
   exports.recipesPageChange(req, res, next, false);
};


exports.getRecipe = (req, res, next) => {
   if (req.params.recipeId) {
      let recipe = new Recipe();
      recipe.getById(req.params.recipeId)
      .then(result => {
         if (result) {
            res.status(200).json({
               recipe: result,
               hostName: getHostName(req),
               message: "Recipe retrived."
            });
         } else {
            res.status(200).json({
               recipe: null,
               message: "Issue getting recipe."
            });
         }
      })
      .catch(err => {
         res.status(500).json({
            addedToBook: false,
            message: "Internal Server Error"
         })
      });
   } else {
      console.log("Could not find recipe with id " + req.params.recipeId);
      errorController.get404(req, res, next);
   }
};


exports.getMatchingIngredients = (req, res, next) => {
   Ingredient.searchIngredients(req.query.q)
      .then(result => {
         res.json(result);
      });
};

exports.rateRecipe = (req, res, next) => {
   console.log("In the Controller for Rating");
   let rating = new Rating();
   console.log(rating)
   rating.getByUserAndRecipe(req.user.Id,req.body.id)
      .then(result => {
         rating.Rating = req.body.rating;
         console.log("Ready to save.");
         rating.save()
         .then(result => {
            res.json({
               message: "Success"
            })
         });
      });
};

exports.getRecipeBuilder = (req, res, next) => {
   let id = req.query.id || 0;
   let recipe = new Recipe();
   let measurements = Measurements.getAllMeasurements()
   .then(m => {
      measurements = m;
   })
   .then(() => {
      recipe.getById(req.query.id)
      .then(() => {
         return Category.getCategories();
      })
      .then((categories) => {
         res.render('member/builder', {
            pageTitle: 'Recipe Builder',
            path: '/member/recipe/builder',
            recipe: recipe,
            categories: categories,
            user: req.user != undefined ? req.user : 'Guest',
            measurements: measurements
         });
      });  
   });
};

exports.searchRecipes = (req, res, next) => {

   const searchTerm = req.body.q;    
   Recipe.search(searchTerm)
   .then((recipeList) => {
      res.render('results', {
         pageTitle: 'Search Results',
         path: '/results',
         recipeList: recipeList,
         user: req.user != undefined ? req.user : 'Guest',
      });
   })
   .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

};

exports.postRecipeBuilder = (req, res, next) => {
   console.log('In postRecipeBuilder in recipe controller');
   const image = req.file;
   const submittedRecipe = JSON.parse(req.body.recipe);
   let recipe = new Recipe();
   recipe.getById(submittedRecipe.Id)
   .then(r => {
      recipe.Name = submittedRecipe.Name;
      recipe.CategoryId = submittedRecipe.CategoryId;
      recipe.Directions = submittedRecipe.Directions;
      recipe.Description = submittedRecipe.Description;
      recipe.PrepTime = submittedRecipe.PrepTime;
      recipe.CookTime = submittedRecipe.CookTime;
      recipe.Servings = submittedRecipe.Servings;
      recipe.IngredientsText = submittedRecipe.IngredientsText;
      recipe.UserId = req.user.Id;
      if (image) {
         recipe.ImageUrl = image.path.replace(/\\/g,"/");
      }
      recipe.save()
      .then(re => {
         console.log(re);
         // Delete all existing recipe-ingredients for this recipe
         Recipe.deleteIngredients(re.Id)
         .then(() => {
            // Loop through all the ingredients
            // Add all recipe-ingredients for this recipe
            submittedRecipe.Ingredients.forEach(i => {
               Recipe.addIngredient(re.Id,i.IngredientId,i.Quantity,i.MeasurementId);
            });
            res.redirect('/member');
         });
      });
   });

};

exports.deleteRecipe = (req, res, next) => {
   if (req.user) {
      let recipe = new Recipe();
      recipe.getById(req.params.recipeId)
      .then(result => {
         if (recipe.UserId == req.user.Id /*|| req.user.IdAdmin*/) {
            // Check if recipe has any associated cookbooks.
            Recipe.getCookbooks(req.params.recipeId)
            .then(result => {
               if ((result.length < 1) || (result.length == 1 && result[0].CookbookId == req.session.cookbookId)/* If it only exists in the current user's cookbook */
                     /*|| req.user.IdAdmin*/) {
                  // Delete recipe from database if no cookbook contains this recipe..
                  recipe.delete(req.user.Id)
                  .then(result => {
                     res.status(200).json({
                        couldDelete: true,
                        message: "Recipe deleted."
                     });
                  })
                  .catch(err => {
                     res.status(200).json({
                        couldDelete: false,
                        message: "Issue while deleting recipe. " + err
                     });
                  });
               } else {
                  res.status(200).json({
                     couldDelete: false,
                     message: "Recipe exists in another user's cookbook."
                  });
               }
            })
            .catch(err => {
               res.status(200).json({
                  couldDelete: false,
                  message: "Recipe exists in someone elses. " + err
               });
            });
         } else {
            res.status(200).json({
               couldDelete: false,
               message: "Only recipe owners and admins can delete recipes."
            });
         }
      })
      .catch(err => {
         res.status(500).json({
            couldDelete: false,
            message: "Internal Server Error"
         })
      });
   } else {
      res.status(200).json({
         couldDelete: false,
         message: "No user defined."
      });
   }
}
