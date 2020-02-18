           const User = require('../models/User');


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

           // LOGIN

           exports.login = function (req, res) {

                let user = new User(req.body);

                user.login()
                    .then(function(result){
                        req.session.user = {avatar: user.avatar, username: user.data.username};
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
               user.register().then(() => {

                   req.session.user = {username: user.data.username, avatar: user.avatar};
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
                    res.render('home-dashboard', {username: req.session.user.username, avatar: req.session.user.avatar});

                } else {
                    res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')});
                }
            };