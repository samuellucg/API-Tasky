const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController.js');

router.get('/',taskController.getAll);
router.post('/',taskController.create);
router.put('/',taskController.update); // verificar
router.delete('/',taskController.delete); // verificar
router.get('/healthcheck',taskController.healthcheck);

module.exports = router;
