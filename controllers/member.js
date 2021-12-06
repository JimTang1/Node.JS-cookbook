const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Recipe = require('../models/recipe');
const Category = require('../models/category');
const Cookbook = require('../models/cookbook');
const recipeController = require('../controllers/recipe');
const errorController = require('./error');
const { rawListeners } = require('../util/database');

const {
   validationResult
 } = require('express-validator/check');
const { runInNewContext } = require('vm');

exports.getIndex = (req, res, next) => {
   Category.getMemberCategories(req.user.Id)
   .then(categories => {
      res.render('member/index', {
         pageTitle: 'Cookbook',
         path: '/member',
         user: req.user,
         categories: categories,
      });
   });
};


/*
 * loadRecipesPage
 * Will retrieve and display the sub-cateogry name, sub-category recipies,
 * and the first recipe.
 */
exports.loadRecipesPage = (req, res, next) => {
   if (req.user && req.user.FirstName != "") {
      recipeController.loadRecipes(req, res, next, Recipe.getAllUserRecipesNamesAndIdsByCategoryId/* replace with query function that only gets the users reipes by name and id. */, true);
   } else {
      console.log("Could not find category. No user defined.");
      errorController.get404(req, res, next);
   }
}


/*
 * changeRecipesPage
 * Handels page change requests on the recipes page.
 */
exports.changeRecipesPage = (req, res, next) => {
   if (req.user && req.user.FirstName != "") {
      recipeController.recipesPageChange(req, res, next, true);
   } else {
      console.log("Could not change page. No user defined.");
      errorController.get404(req, res, next);
   }
};

exports.getProfile = (req, res, next) => {
   let message = req.flash('error');
   if (message.length > 0) {
     message = message[0];
   } else {
     message = null;
   }
   Category.getMemberCategories(req.user.Id)
   .then(categories => {
      res.render('member/profile', {
         pageTitle: 'My Profile',
         path: '/member/profile',
         user: req.user,
         validationErrors: [],
         errorMessage: message
      });
   });
};

exports.postProfile = (req, res, next) => {
   const Email = req.body.email;
   let Password = req.body.password;
   //if (Password == '') Password = 'Blank'; // Need something for the hash.
   const FirstName = req.body.firstname;
   const LastName = req.body.lastname;


   const errors = validationResult(req);

   if (!errors.isEmpty()) {
     return res.status(422).render('member/profile', {
       path: '/member/profile',
       pageTitle: 'My Profile',
       errorMessage: errors.array()[0].msg,
       user: req.user,
       validationErrors: errors.array()
     });
   }
   bcrypt
     .hash(Password, 12)
     .then(hashedPassword => {
       const user = new User();
       user.getById(req.user.Id)
       .then(u => {
         if (FirstName != '') u.FirstName = FirstName;
         if (LastName != '') u.LastName = LastName;
         if (Password != '') {
            u.Password = hashedPassword
         }
         if (Email != '@') u.Email = Email
         return u.save();
      })
      return true;
     })
     .then(result => {
       res.redirect('/login');
     })
     .catch(err => {
       const error = new Error(err);
       error.httpStatusCode = 500;
       return next(error);
     });
 };


exports.addToCookbook = (req, res, next) => {
   if (req.user && req.session.cookbookId) {
      // Check if cookbook contains the recipe
      let cookbook = new Cookbook();
      cookbook.getById(req.session.cookbookId)
      .then(cookbook => {
         cookbook.recipeExists(req.params.recipeId)
         .then(result => {
            if (result.length == 0) {
               // Add recipe to cookbook.
               cookbook.addRecipe(req.params.recipeId).then(result => {
                  res.status(200).json({
                     addedToBook: true,
                     message: "Added to cookbook."
                  });
               }).catch(err => {
                  res.status(200).json({
                     addedToBook: false,
                     message: "Issue adding cookbook to recipe."
                  });
               });
            } else {
               res.status(200).json({
                  addedToBook: false,
                  message: "Cookbook already contains this recipe."
               });
            }
         }).catch(err => {
            res.status(500).json({
               addedToBook: false,
               message: "Issue getting cookbook. " + err
            });
         });
      }).catch(err => {
         res.status(500).json({
            addedToBook: false,
            message: "Issue getting cookbook. " + err
         });
      });
   } else {
      res.status(200).json({
         addedToBook: false,
         message: "No user defined."
      });
   }
};


exports.removeFromCookbook = (req, res, next) => {
   if (req.user && req.session.cookbookId) {
      // Check if cookbook contains the recipe
      let cookbook = new Cookbook();
      cookbook.getById(req.session.cookbookId)
      .then(cookbook => {
         cookbook.recipeExists(req.params.recipeId)
         .then(result => {
            if (result.length > 0) {
               // Add recipe to cookbook.
               cookbook.removeRecipe(req.params.recipeId).then(result => {
                  res.status(200).json({
                     removedFromBook: true,
                     message: "Removed from cookbook."
                  });
               }).catch(err => {
                  res.status(200).json({
                     removedFromBook: false,
                     message: "Issue removing recipe from cookbook."
                  });
               });
            } else {
               res.status(200).json({
                  removedFromBook: false,
                  message: "Cookbook does not contain this recipe."
               });
            }
         }).catch(err => {
            res.status(500).json({
               removedFromBook: false,
               message: "Issue getting cookbook. " + err
            });
         });
      }).catch(err => {
         res.status(500).json({
            removedFromBook: false,
            message: "Issue getting cookbook. " + err
         });
      })
   } else {
      res.status(200).json({
         removedFromBook: false,
         message: "No user defined."
      });
   }
};


/*exports.createRecipeCopy = (req, res, next) => {
   if (req.user) {
      let recipe = new Recipe();
      recipe.getById(req.params.recipeId)
      .then(result => {
         let recipeCopy = new Recipe(null, recipe.Name, recipe.Description, recipe.Directions, req.user.Id,
            recipe.ImageUrl, recipe.PrepTime, recipe.CookTime, recipe.Servings, recipe.Keywords);

         recipeCopy.save().then(result => {
            req.user.getCookBook().then( result => {
               // Add recipe to cookbook then return this.
               res.status(200).json({
                  copyCreated: true,
                  message: "Saved new Recipe."
               });
            }).catch(err => {
               res.status(500).json({
                  copyCreated: true,
                  message: "Issue saving new recipe in cookbook. " + err
               });
            })
         }).catch(err => {
            res.status(500).json({
               copyCreated: false,
               message: "Issue saving recipe copy. " + err
            });
         });
      })
      .catch(err => {
         res.status(500).json({
            copyCreated: false,
            message: "Internal Server Error"
         })
      });
   } else {
      res.status(200).json({
         copyCreated: false,
         message: "No user defined."
      });
   }
};*/