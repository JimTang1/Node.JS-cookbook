const {
  cookie
} = require('express-validator/check');
const db = require('../util/database');


module.exports = class Recipe {
  constructor(Id, Name, Description, Directions, UserId, ImageUrl, PrepTime, CookTime, Servings, Keywords, CategoryId, IngredientsText) {
    this.Id = Id;
    this.Name = Name;
    this.Description = Description;
    this.Directions = Directions;
    this.UserId = UserId;
    this.ImageUrl = ImageUrl;
    this.PrepTime = PrepTime;
    this.CookTime = CookTime;
    this.Servings = Servings;
    this.Keywords = Keywords;
    this.CategoryId = CategoryId;
    this.IngredientsText = IngredientsText;
  }

  getById(Id) {
    return new Promise((resolve, reject) => {
      if (Id == undefined || Id == 0) {
        this.Id = 0;
        this.Name = "New Recipe"
        this.Description = '';
        this.Directions = '';
        this.UserId = 0;
        this.ImageUrl = '';
        this.PrepTime = '';
        this.CookTime = '';
        this.Servings = '';
        this.Keywords = '';
        this.Ingredients = [];
        this.Rating = 0;
        this.CategoryId = 0;
        this.IngredientsText = '';
        resolve(this);
      } else {
        db.execute("SELECT * FROM Recipes WHERE Id=?", [Id])
          .then(result => {
            let r = result[0][0];
            if (r != undefined) {
              this.Id = r.Id;
              this.Name = r.Name;
              this.Description = r.Description;
              this.Directions = r.Directions;
              this.UserId = r.UserId;
              this.ImageUrl = r.ImageUrl;
              this.PrepTime = r.PrepTime;
              this.CookTime = r.CookTime;
              this.Servings = r.Servings;
              this.Keywords = r.Keywords;
              this.CategoryId = r.CategoryId;
              this.IngredientsText = r.IngredientsText;
              return;
            }
            reject(undefined);
          })
          .then(() => {
            this.getRating()
              .then(rating => {
                this.Rating = rating;
              });
          })
          .then(() => {
            this.getIngredients()
              .then(ingredients => {
                this.Ingredients = ingredients;
                console.log("Got recipe with ID: ", this.Id);
                resolve(this)
              })
          })
          .catch(err => {
            console.log(err)
            reject(undefined);
          });
      }
    });

  }

  save() {
    return new Promise((resolve, reject) => {
      if (this.Id === null || this.Id == 0) {
        db.execute("INSERT INTO Recipes (Name,Description,Directions,UserId,ImageUrl,PrepTime,CookTime,Servings,Keywords,CategoryId,IngredientsText) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            [this.Name, this.Description, this.Directions, this.UserId, this.ImageUrl, this.PrepTime, this.CookTime, this.Servings, this.Keywords, this.CategoryId, this.IngredientsText])
          .then(result => {
            this.Id = result[0].insertId;
            resolve(this);
          })
          .catch(err => {
            console.log(err)
            reject(undefined);
          });
      } else {
        db.execute("UPDATE Recipes SET Name=?,Description=?,Directions=?,UserId=?,ImageUrl=?,PrepTime=?,CookTime=?,Servings=?,Keywords=?,CategoryId=?,IngredientsText=? WHERE Id=?",
            [this.Name, this.Description, this.Directions, this.UserId, this.ImageUrl, this.PrepTime, this.CookTime, this.Servings, this.Keywords, this.CategoryId, this.IngredientsText, this.Id])
          .then(resolve(this))
          .catch(err => {
            console.log(err)
            reject(undefined);
          });
      }
    })
  }

  delete(UserId) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT COUNT(*) AS Count FROM Cookbooks_Recipes WHERE RecipeId=?", [this.Id])
        .then(result => {
          let count = +result[0][0]["Count"];
          return count == 0;
        })
        .then(result => {
          if (!result) {
            resolve(false);
          } else {
            db.execute("DELETE FROM Recipes_Ingredients WHERE RecipeId = ?", [this.Id])
              .then(result => {
                return true;
              })
              .then(result => {
                db.execute("DELETE FROM Recipes WHERE Id = ? LIMIT 1", [this.Id])
                  .then(result => {
                    resolve(true);
                  });
              });
          }
        });
    });
  }

  getIngredients() {
    return new Promise((resolve, reject) => {
      db.execute("SELECT IngredientId,Quantity,MeasurementId,LOWER(i.Name) AS Ingredient, m.Name AS Measurement FROM Recipes_Ingredients ri JOIN Ingredients i ON i.Id = ri.IngredientId JOIN Measurements m ON ri.MeasurementId = m.Id WHERE ri.RecipeId=?", [this.Id])
        .then(result => {
          let ingredients = result[0];
          resolve(ingredients);
        });
    });
  }

  getRating() {
    return new Promise((resolve, reject) => {
      console.log("gatRating Id: ", this.Id);
      db.execute("SELECT AVG(Rating) AS Rating FROM Ratings WHERE RecipeId = ?", [this.Id])
        .then(result => {
          let rating = +result[0][0]["Rating"];
          console.log("Rating after fetch:", rating);
          resolve(rating.toFixed(2));
        });
    });
  }

  deleteRecipe() {
    return new Promise((resolve, reject) => {
      db.execute("DELETE FROM Recipes WHERE Id = ?", [this.Id])
        .then(result => {
          resolve(true);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static getCookbooks(Id) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT CookbookId FROM Cookbooks_Recipes WHERE RecipeId = ?", [Id])
        .then(result => {
          resolve(result[0]);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static deleteIngredients(Id) {
    return new Promise((resolve, reject) => {
      db.execute("DELETE FROM Recipes_Ingredients WHERE RecipeId = ?", [Id])
        .then(result => {
          resolve();
        });
    });
  }

  static addIngredient(Id, IngredientId, Quantity, MeasurementId) {
    db.execute("INSERT INTO Recipes_Ingredients (RecipeId,IngredientId,Quantity,MeasurementId) VALUES(?,?,?,?)", [Id, IngredientId, Quantity, MeasurementId])
      .then(result => {
        return;
      });
  }

  static getAllRecipes() {
    return new Promise((resolve, reject) => {
      db.execute("SELECT Id,Name,Description,Directions,UserId,ImageUrl,PrepTime,CookTime,Servings,Keywords FROM Recipes ORDER BY Name")
        .then(result => {
          let r = result[0];
          if (r != undefined) {
            resolve(r);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static getAllRecipesByCategoryId(CategoryId) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT Id,Name,Description,Directions,UserId,ImageUrl,PrepTime,CookTime,Servings,Keywords FROM Recipes WHERE CategoryId=? ORDER BY Name", [CategoryId])
        .then(result => {
          let r = result[0];
          if (r != undefined) {
            resolve(r);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static getAllUserRecipesByCategoryId(CategoryId, UserId) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT r.Id,r.Name,r.Description,r.Directions,r.UserId,r.ImageUrl,r.PrepTime,r.CookTime,r.Servings,r.Keywords FROM Cookbooks c JOIN Cookbooks_Recipes cr ON cr.CookbookId = c.Id JOIN Recipes r ON r.Id = cr.RecipeId AND r.CategoryId = ? WHERE c.UserId = ? ORDER BY r.Name", [CategoryId, UserId])
        .then(result => {
          let r = result[0];
          if (r != undefined) {
            resolve(r);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static getAllUserRecipesNamesAndIdsByCategoryId(CategoryId, UserId) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT r.Id,r.Name FROM Cookbooks c JOIN Cookbooks_Recipes cr ON cr.CookbookId = c.Id JOIN Recipes r ON r.Id = cr.RecipeId AND r.CategoryId = ? WHERE c.UserId = ? ORDER BY r.Name", [CategoryId, UserId])
        .then(result => {
          let r = result[0];
          if (r != undefined) {
            resolve(r);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static getRecipeNameAndIdsByCategoryId(CategoryId) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT Id,Name FROM Recipes WHERE CategoryId=? ORDER BY Name", [CategoryId])
        .then(result => {
          let r = result[0];
          if (r != undefined) {
            resolve(r);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });
  }

  static search(q) {
    return new Promise((resolve, reject) => {
      db.execute("SELECT Id, Name,Description,ImageUrl, CategoryId, MATCH (Name) AGAINST (?) AS rel1, MATCH (Description) AGAINST (?) AS rel2, MATCH (IngredientsText) AGAINST (?) as rel3, MATCH (Directions) AGAINST (?) as rel4 FROM Recipes WHERE MATCH (Name,Description,Directions,IngredientsText,Keywords) AGAINST (?) ORDER BY (rel1*10)+(rel2*2)+(rel3) DESC", [q, q, q, q, q])
        .then(result => {
          resolve(result[0]);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
    });

  }

}