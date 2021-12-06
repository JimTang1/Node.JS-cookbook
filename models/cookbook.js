const db = require('../util/database');

module.exports = class Cookbook {
  constructor(Id,UserId,Name) {
    this.Id = Id;
    this.UserId = UserId;
    this.Name = Name;
  }

  getById(Id){
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,UserId,Name FROM Cookbooks WHERE Id=?",[Id])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
            this.Id = r.Id;
            this.UserId = r.UserId;
            this.Name = r.Name;
          resolve(this);
        }
        reject(undefined);
      })
      .catch(err => {
        console.log(err)
        reject(undefined);
      });
    });
  }


  recipeExists(Id) {
    return new Promise((resolve, reject) => {
        db.execute("SELECT RecipeId FROM Cookbooks_Recipes WHERE CookbookId = ? AND RecipeId = ?",
        [this.Id,Id])
        .then(result => {
            resolve(result[0]);
        })
        .catch(err => {
        console.log(err)
        reject(undefined);
        });
  })
}


  addRecipe(Id) {
      return new Promise((resolve, reject) => {
          db.execute("INSERT INTO Cookbooks_Recipes (CookbookId,RecipeId) VALUES(?,?)",
          [this.Id,Id])
          .then(result => {
              resolve(true);
          })
          .catch(err => {
          console.log(err)
          reject(undefined);
          });
    })
  }  

removeRecipe(Id) {
    return new Promise((resolve, reject) => {
        db.execute("DELETE FROM Cookbooks_Recipes WHERE CookbookId=? AND RecipeId=? LIMIT 1",
        [this.Id,Id])
        .then(result => {
            resolve(true);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
  })
}
  

  save() {
    return new Promise((resolve, reject) => {
        if (this.Id === null) {
            db.execute("INSERT INTO Cookbooks (UserId,Name) VALUES(?,?)",
            [this.UserId,this.Name])
            .then(result => {
                this.Id = result[0].insertId;
                resolve(this);
            })
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        } else {
            db.execute("UPDATE Cookbooks SET UserId=?,Name=? WHERE Id=?",
            [this.UserId, this.Name, this.Id])
            .then(resolve(this))
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        }
    })
  }
}