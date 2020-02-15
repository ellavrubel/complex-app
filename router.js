    const express = require('express');
    const router = express.Router();

    const userController = require('./controllers/userController');



        // /* GET home page. */

       router.get('/', userController.home);


       // POST to /register

       router.post('/register', userController.register);


        // POST to /login

        router.post('/login', userController.login);






        module.exports = router;

