const db = require('../util/database');

module.exports = class Ingredient {
  constructor(Id,Name) {
    this.Id = Id;
    this.Name = Name;
  }

  getById(Id){
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Name FROM Measurements WHERE Id=?",[Id])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
            this.Id = r.Id;
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

  save() {
    return new Promise((resolve, reject) => {
        if (this.Id === null) {
            db.execute("INSERT INTO Measurements (Name) VALUES(?)",
            [this.Name])
            .then(result => {
                this.Id = result[0].insertId;
                resolve(this);
            })
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        } else {
            db.execute("UPDATE Measurements SET Name=? WHERE Id=?",
            [this.Name,this.Id])
            .then(resolve(this))
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        }
    })
  }

  delete() {
    return new Promise((resolve, reject) => {
      db.execute("SELECT COUNT(*) AS Count FROM Recipes_Ingredients WHERE MeasurementId = ?",
      [this.Id])
      .then(result => {
          let data = {};
          let r = result[0][0];
          console.log(r);
          if (r.Count > 0) {
            data = {
              Message: `${this.Name} is being used in ${r.Count} ingredient(s) and cannot be deleted.`,
              Name: this.Name,
              Id: this.Id
            };
            resolve(data);
          } else {
            db.execute("DELETE FROM Measurements WHERE Id = ? LIMIT 1",[this.Id])
            .then(result => {
              data = {
                Message: `Success`,
                Name: this.Name,
                Id: this.Id
              };
              resolve(data);
            })
          }
      })
      .catch(err => {
      console.log(err)
      reject(undefined);
      });
    })
  }  

  static getAllMeasurements() {
    return new Promise((resolve,reject) => {
        db.execute("SELECT Id,Name FROM Measurements ORDER BY Name")
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