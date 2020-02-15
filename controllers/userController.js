           const User = require('../models/User');

            // LO|GIN

            exports.login = function (req, res) {
                let user = new User(req.body);
                user.login().then(function (result) {  // then() - предлагает действия в случае успеха и catch() - действия в случае провала
                    res.send(result);

                }).catch(function (err) {
                    res.send(err);

                });
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
                res.render('home-guest');
            };