const User = require('../models/user');
const Category = require('../models/category');


exports.getIndex = (req, res, next) => {
   Category.getCategories(cats => {
      return cats;
   }).then(cats => {
      res.render('visitor/index', {
         pageTitle: 'Cookbook',
         path: '/',
         categories: cats,
         user: req.user != undefined ? req.user : 'Guest'
      });
   })

};

exports.getSubCategories = (req, res, next) => {
   Category.getSubCategories(req.query.id)
      .then(cats => {
         res.json(cats);
      });
};