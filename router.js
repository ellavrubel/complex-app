    const express = require('express');
    const router = express.Router();
    const userController = require('./controllers/userController');
    const postController = require('./controllers/postController');


        //User related routes
        // /* GET home page. */
       router.get('/', userController.home);

       // POST to /register
       router.post('/register', userController.register);

        // POST to /login
        router.post('/login', userController.login);

        // POST to/logout
        router.post('/logout', userController.logout);



        // create-post related routes

    router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen);  // после указания адреса можно добавлять сколько угодно функций, которые нужно применить к нему
    router.post('/create-post', userController.mustBeLoggedIn, postController.create);
    router.get('/post/:id', postController.viewSingle);  // :id - make it flexible





        module.exports = router;

