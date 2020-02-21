           const User = require('../models/User');
            const Post = require('../models/Post');


                                                                                                // Пример Promise
                                                                                               //                   eatBreakfast()
                                                                                               //            //     .then(() => eatLunch())
                                                                                               //            //     .then(() => eatDinner())
                                                                                               //            //     .catch(function(e)){
                                                                                               //            //      console.log(e);
                                                                                               //            // }

                                                    // then() - предлагает действия в случае успеха и catch() - действия в случае провала
                                                                                               // async function runOurAction (){
                                                                                               //     try{
                                                                                               //         await eatBreakfast()
                                                                                               //         await eatLunch()
                                                                                               //         await eatDinner()
                                                                                               //         await eatDessert()
                                                                                               //     } catch (err){
                                                                                               //         console.log(err)
                                                                                               //     }
                                                                                               // }
                                                                                               // runOurAction()

           exports.mustBeLoggedIn = function(req, res, next) {
               if (req.session.user) {
                   next();
               } else {
                   req.flash('errors', 'You must be logged in to perform this action.');
                   req.session.save(function () {
                       res.redirect('/');
                   })
               }
           };




           // LOGIN

           exports.login = function (req, res) {

                let user = new User(req.body);

                user.login()
                    .then(function(){
                        req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id};
                        req.session.save(function () {
                            res.redirect('/');  // callback function, сначала данные сохраняются в db и потом показывается страница

                        })

                })   .catch(function(err) {
                    req.flash('errors', err); // первый аргумент -имя списка сообщений, любое. второй аргумент - само сообщение
                    req.session.save(function () {
                        res.redirect('/');

                    })
                })

            };

            //LOGOUT

            exports.logout = function (req, res) {
                req.session.destroy(function () {
                    res.redirect('/');   // this is callback function устанавливает очередность действий

                });

            };

            // REGISTER

            exports.register = function (req, res) {
               let user = new User(req.body);
               user.register()
                   .then(() => {
                   req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id};
                   req.session.save(function () {     // callback function
                       res.redirect('/');
                   });

                 }).catch((regErrors) => {
                  regErrors.forEach(function (error) {   //функция сработает для каждой ошибки
                       req.flash('regErrors', error);
                   });
                   req.session.save(function () {     // callback function
                       res.redirect('/');

                   })
               })
            };


            // HOME

            exports.home = function (req, res) {
                if(req.session.user){
                    res.render('home-dashboard');

                } else {
                    res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')});
                }
            };

            // Profile page

            exports.ifUserExists = function (req, res, next) {
                User.findByUsername(req.params.username)
                    .then(function (userDocument){
                        req.profileUser = userDocument;
                        next()
                    })
                    .catch(function () {
                    res.render('404');
                    })
            };

            exports.profilePostsScreen = function (req, res) {

                // ask our post model for a certain author id

                Post.findAuthorById(req.profileUser._id)
                    .then(function (posts) {  // posts - то, что будет результатом findAuthorById()
                        res.render('profile', {
                            posts: posts,
                            profileUsername: req.profileUser.username,
                            profileAvatar: req.profileUser.avatar
                        }); // в объекте передается то, что будет включено в ejs

                    })
                    .catch(function () {
                        res.render('404')
                    });





            };















































