    const express = require('express');
    const router = express.Router();
    const userController = require('./controllers/userController');
    const postController = require('./controllers/postController');
    const followController = require('./controllers/followController');



        //User related routes
        // /* GET home page. */
       router.get('/', userController.home);

       // POST to /register
       router.post('/register', userController.register);

        // POST to /login
        router.post('/login', userController.login);

        // POST to/logout
        router.post('/logout', userController.logout);



        // Profile related routes

    router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen);



        // post related routes

    router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen);  // после указания адреса можно добавлять сколько угодно функций, которые нужно применить к нему
    router.post('/create-post', userController.mustBeLoggedIn, postController.create);
    router.get('/post/:id', postController.viewSingle);  // :id - make it flexible

    router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen);
    router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.edit);
    router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.delete);

        // search

    router.post('/search', postController.search);

        // follow related routes

    router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow);
    router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow);










        module.exports = router;

