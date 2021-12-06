const db = require('../util/database');

module.exports = class Rating {
  constructor(Id,RecipeId,UserId,Rating) {
    this.Id = Id;
    this.RecipeId = RecipeId;
    this.UserId = UserId;
    this.Rating = Rating;
  }

  getById(Id){
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,RecipeId,UserId,Rating FROM Ratings WHERE Id=?",[Id])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
            this.Id = r.Id;
            this.RecipeId = r.RecipeId;
            this.UserId = r.UserId;
            this.Rating = r.Rating;
            resolve(this);
        }
        resolve(undefined);
      })
      .catch(err => {
        console.log(err)
        reject(undefined);
      });
    });
  }

  getByUserAndRecipe(userId,recipeId) {
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,RecipeId,UserId,Rating FROM Ratings WHERE UserId=? AND RecipeId=?",[userId,recipeId])
      .then(result => {
        let r = result[0][0];
        console.log(r);
        if(r != undefined) {
            this.Id = r.Id;
            this.RecipeId = r.RecipeId;
            this.UserId = r.UserId;
            this.Rating = r.Rating;
            console.log(this);
            resolve(this);
        } else {
          console.log(userId,recipeId);
          this.UserId = userId;
          this.RecipeId = recipeId;
          resolve(this);
        }
      })
      .catch(err => {
        console.log(err)
        reject(undefined);
      });
    });  
  }

  save() {
    return new Promise((resolve, reject) => {
        if (this.Id === null || this.Id === undefined) {
            console.log("I'm ready to insert.",this.RecipeId, this.UserId, this.Rating)
            db.execute("INSERT INTO Ratings (RecipeId,UserId,Rating) VALUES(?,?,?)",
            [this.RecipeId,this.UserId,this.Rating])
            .then(result => {
                this.Id = result[0].insertId;
                resolve(this);
            })
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        } else {
            console.log(this.Id)
            db.execute("UPDATE Ratings SET RecipeId=?,UserId=?,Rating=? WHERE Id=?",
            [this.RecipeId,this.UserId,this.Rating,this.Id])
            .then(resolve(this))
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        }
    })
  }
}