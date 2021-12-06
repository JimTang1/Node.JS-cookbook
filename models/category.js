const db = require('../util/database');

module.exports = class Category {
  constructor(Id,Name,ParentId) {
    this.Id = Id;
    this.Name = Name;
    this.ParentId = ParentId
  }

  getById(Id){
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Name,ParentId FROM Categories WHERE Id=?",[Id])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
            this.Id = r.Id;
            this.Name = r.Name;
            this.ParentId = r.ParentId
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

  save() {
    return new Promise((resolve, reject) => {
        if (this.Id === null) {
            db.execute("INSERT INTO Categories (Name,ParentId) VALUES(?,?)",
            [this.Name,this.ParentId])
            .then(result => {
                this.Id = result[0].insertId;
                resolve(this);
            })
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        } else {
            db.execute("UPDATE Categories SET Name=?,ParentId=? WHERE Id=?",
            [this.Name,this.ParentId,this.Id])
            .then(resolve(this))
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        }
    })
  }

  static getCategories() {
    return new Promise((resolve,reject) => {
        db.execute("SELECT Id,Name,ParentId FROM Categories ORDER BY Name")
        .then(result => {
          let data = []
          let r = result[0];
          let root = r.filter(c => c.ParentId == 0);
          root.forEach(v => {
            let children = r.filter(c => c.ParentId == v.Id);
            data.push({
              Id: v.Id,
              Name: v.Name,
              ParentId: v.ParentId,
              subcategories: children
            });
          });
          if(data != undefined) {
            resolve(data);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
      });     
  }

  static getMemberCategories(userId) {
    return new Promise((resolve,reject) => {
        db.execute("SELECT DISTINCT ca.Id AS Id,ca.Name AS Name,ca2.Id AS ParentId,ca2.Name AS ParentName FROM `Users` u JOIN Cookbooks c ON u.Id = c.UserId JOIN Cookbooks_Recipes cr ON cr.CookbookId = c.Id JOIN Recipes r ON r.Id = cr.RecipeId JOIN Categories ca ON ca.Id = r.CategoryId JOIN Categories ca2 ON ca2.Id = ca.ParentId WHERE u.Id = ? ORDER BY ca2.Name, ca.Name",[userId])
        .then(result => {
          let r = result[0];
          let data = [];
          let root = [];
          let subcats = [];
          let rootIds = [];
          // Get unique parents
          r.forEach(v => {
            if (! rootIds.includes(v.ParentId)) {
              let cur = {
                Id:v.ParentId,
                Name:v.ParentName,
                ParentId:0
              };
              root.push(cur);
              rootIds.push(v.ParentId);
            }
            subcats.push({
              Id:v.Id,
              Name:v.Name,
              ParentId:v.ParentId  
            });
          });
          
          root.forEach(v => {
            let children = subcats.filter(c => c.ParentId == v.Id);
            data.push({
              Id: v.Id,
              Name: v.Name,
              ParentId: v.ParentId,
              subcategories: children
            });
          });
          if(data != undefined) {
            resolve(data);
          }
          reject(undefined);
        })
        .catch(err => {
          console.log(err)
          reject(undefined);
        });
      });     
  }
  

  static getRootCategories() {
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Name,ParentId FROM Categories WHERE ParentId=0 ORDER BY Name")
      .then(result => {
        let r = result[0];
        if(r != undefined) {
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

  static getSubCategories(id) {
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Name,ParentId FROM Categories WHERE ParentId=? ORDER BY Name",[id])
      .then(result => {
        let r = result[0];
        if(r != undefined) {
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

}