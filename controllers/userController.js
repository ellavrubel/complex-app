           const User = require('../models/User');

            // LO|GIN
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


           exports.login = function (req, res) {

                let user = new User(req.body);

                user.login()
                    .then(function(result){
                        req.session.user = {favColor: 'blue', username: user.data.username};
                        res.send(result)

                })   .catch(function(err) {
                    res.send(err)
                })

            };

            //LOGOUT

            exports.logout = function () {

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
                    res.send('Welcome!!!');

                } else {
                    res.render('home-guest');

                }
            };