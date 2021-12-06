const db = require('../util/database');
const bcrypt = require('bcryptjs');
const Cookbook = require('./cookbook');

module.exports = class User {
  constructor(Id,Email,Password,FirstName,LastName,IsAdmin) {
    this.Id = Id;
    this.Email = Email;
    this.Password = Password;
    this.FirstName = FirstName;
    this.LastName = LastName;
    this.IsAdmin = IsAdmin;
  }

  getByEmail(email) {
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Email,Password,FirstName,LastName,IsAdmin FROM Users WHERE Email=?",[email])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
          this.Id = r.Id;
          this.Email = r.Email;
          this.Password = r.Password;
          this.FirstName = r.FirstName;
          this.LastName = r.LastName;
          this.IsAdmin = r.IsAdmin;
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

  getCookbook() {
    return new Promise((resolve, reject) => {
      db.execute("SELECT Id FROM Cookbooks WHERE UserId=?",[this.Id])
      .then(result => {
        let r = result[0][0];
        if(r == undefined) {
          let c = new Cookbook(null,this.Id,"My Cookbook");
          c.save()
          .then (() => {
            resolve(c.Id)
          })
        } else {
          console.log(r);
          resolve(r.Id);
        }
      });
    });
  }

  getById(Id){
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Email,Password,FirstName,LastName,IsAdmin FROM Users WHERE Id=?",[Id])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
          this.Id = r.Id;
          this.Email = r.Email;
          this.Password = r.Password;
          this.FirstName = r.FirstName;
          this.LastName = r.LastName;
          this.IsAdmin = r.IsAdmin;
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
        if (this.Id == null || this.Id == 0) {
            db.execute("INSERT INTO Users (Email,Password,FirstName,LastName,IsAdmin) VALUES(?,?,?,?,?)",
            [this.Email,this.Password,this.FirstName,this.LastName,this.IsAdmin])
            .then(result => {
                this.Id = result[0].insertId;
                resolve(this);
            })
            .catch(err => {
            console.log(err)
            reject(undefined);
            });
        } else {
            db.execute("UPDATE Users SET Email=?,Password=?,FirstName=?,LastName=?,IsAdmin=? WHERE Id=?",
            [this.Email,this.Password,this.FirstName,this.LastName,this.IsAdmin,this.Id])
            .then(resolve(this))
            .catch(err => {
            console.log(err)  
            reject(undefined);
            });
        }
    })
  }

  static findOne(email) {
    return new Promise((resolve,reject) => {
      db.execute("SELECT Id,Email,Password,FirstName,LastName,IsAdmin FROM Users WHERE Email=?",[email])
      .then(result => {
        let r = result[0][0];
        if(r != undefined) {
          this.Id = r.Id;
          this.Email = r.Email;
          this.Password = r.Password;
          this.FirstName = r.FirstName;
          this.LastName = r.LastName;
          this.IsAdmin = r.IsAdmin;
          resolve(this);
        }
        resolve();
      })
      .catch(err => {
        console.log(err)
        reject();
      });
    });
  }

  static getAllUsers() {
    return new Promise((resolve,reject) => {
      db.execute("SELECT * FROM Users ORDER BY FirstName,LastName")
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