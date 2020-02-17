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
                        req.session.user = {favColor: 'blue', username: user.data.username};
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
               user.register();

               if (user.errors.length) {
                   res.send(user.errors);
               } else{
                   res.send('Congrats!');
               }
            };


            // HOME

            exports.home = function (req, res) {
                if(req.session.user){
                    res.render('home-dashboard', {username: req.session.user.username});

                } else {
                    res.render('home-guest', {errors: req.flash('errors')});
                }
            };