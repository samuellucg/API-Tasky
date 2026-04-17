const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController.js');

router.get('/', taskController.getAll);
router.get('/from-user',taskController.getAllFromUser);
router.post('/', taskController.create);
router.put('/', taskController.update);
router.delete('/:taskId', taskController.delete);
router.get('/healthcheck', taskController.healthcheck);
router.get('/test', taskController.test);

module.exports = router;
