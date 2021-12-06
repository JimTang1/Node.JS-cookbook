const {
    restart
} = require('nodemon');
const User = require('../models/user');
const Category = require('../models/category');
const Ingredient = require('../models/ingredient');
const Measurement = require('../models/measurement');

exports.getIndex = (req, res, next) => {
    res.render('admin/index', {
        pageTitle: 'Cookbook Admin',
        path: '/admin',
        user: req.user
    });
};

exports.getCategories = (req, res, next) => {
    res.render('admin/categories', {
        pageTitle: 'Cookbook Admin - Categories',
        path: '/admin/categories',
        user: req.user
    });
};

exports.getUsers = (req, res, next) => {
    let users = User.getAllUsers()
    .then((users) => {
        res.render('admin/users', {
            pageTitle: 'Cookbook Admin - Users',
            path: '/admin/users',
            user: req.user,
            users: users
        });
    });
};

exports.getIngredients = (req, res, next) => {
    res.render('admin/ingredients', {
        pageTitle: 'Cookbook Admin - Ingredients',
        path: '/admin/ingredients',
        user: req.user
    });
};

exports.getMeasurements = (req, res, next) => {
    res.render('admin/measurements', {
        pageTitle: 'Cookbook Admin - Measurements',
        path: '/admin/measurements',
        user: req.user
    });
};

exports.getAjax = (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    let data = {
        message: "Error"
    }
    switch (req.query.action) {
        case "addCategory":
            // Add logic to see if it already exists
            let cat = new Category(null, req.query.category, req.query.parentId);
            cat.save()
                .then(category => {
                    Category.getCategories()
                        .then(categories => {
                            data = {
                                category: category,
                                allCategories: categories
                            }
                            res.json(data);
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "getAllCategories":
            Category.getCategories()
                .then(categories => {
                    res.json(categories);
                }).catch(err => {
                    console.log(err);
                    res.json({
                        message: "Error"
                    });
                });
            break;
        case "getRootCategories":
            Category.getRootCategories()
                .then(categories => {
                    res.json(categories);
                }).catch(err => {
                    console.log(err);
                    res.json({
                        message: "Error"
                    });
                });
            break;
        case "getAllIngredients":
            Ingredient.getAllIngredients()
                .then(ingredients => {
                    res.json(ingredients);
                }).catch(err => {
                    console.log(err);
                    res.json({
                        message: "Error"
                    });
                });
            break;
        case "addIngredient":
            // Add logic to see if it exists
            let ingredient = new Ingredient(null, req.query.ingredient);
            ingredient.save()
                .then(ingredient => {
                    res.json(ingredient);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "updateIngredient":
            let i = new Ingredient();
            i.getById(req.query.id)
                .then((result) => {
                    i.Name = req.query.name;
                })
                .then((result) => {
                    return i.save();
                })
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "deleteIngredient":
            let di = new Ingredient();
            di.getById(req.query.id)
                .then((result) => {
                    return di.delete();
                })
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "updateMeasurement":
            let m = new Measurement();
            m.getById(req.query.id)
                .then((result) => {
                    m.Name = req.query.name;
                })
                .then((result) => {
                    return m.save();
                })
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "deleteMeasurement":
            let dm = new Measurement();
            dm.getById(req.query.id)
                .then((result) => {
                    return dm.delete();
                })
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;
        case "makeAdmin":
            let user = new User();
            user.getById(req.query.id)
            .then(() => {
                user.IsAdmin = 1;
                user.save();
                res.json({message: "Success"});
            });
            break;
        case "removeAdmin":
            let ruser = new User();
            ruser.getById(req.query.id)
            .then(() => {
                ruser.IsAdmin = 0;
                ruser.save();
                res.json({message: "Success"});
            });
            break;
        case "getAllMeasurements":
            Measurement.getAllMeasurements()
                .then(measurements => {
                    res.json(measurements);
                }).catch(err => {
                    console.log(err);
                    res.json({
                        message: "Error"
                    });
                });
            break; 
        case "addMeasurement":
            // Add logic to see if it exists
            let measurement = new Measurement(null, req.query.measurement);
            measurement.save()
                .then(measurement => {
                    res.json(measurement);
                })
                .catch(err => {
                    console.log(err);
                    res.json(data);
                });
            break;           
    }
}