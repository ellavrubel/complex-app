    const express = require('express');
    const router = express.Router();
    const userController = require('./controllers/userController');



        // /* GET home page. */

       router.get('/', userController.home);


       // POST to /register

       router.post('/register', userController.register);


        // POST to /login

        router.post('/login', userController.login);

        // POST to/logout

        router.post('/logout', userController.logout);








        module.exports = router;

