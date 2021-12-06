const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

router.get('/', isAdmin, adminController.getIndex);

router.get('/categories', isAdmin, adminController.getCategories);

router.get('/ingredients', isAdmin, adminController.getIngredients);

router.get('/measurements', isAdmin, adminController.getMeasurements);

router.get('/ajax', isAdmin, adminController.getAjax);

router.get('/users', isAdmin, adminController.getUsers);

module.exports = router;
