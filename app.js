
        const express = require('express');
        const session = require('express-session');
        const MongoStore = require('connect-mongo')(session);  // MongoStore - also a blueprint
        const flash = require('connect-flash');

        const  app  = express();

        let sessionOptions = session({
                secret: 'Js is so cool!',
                store: new MongoStore({client: require('./mongoDB')}),
                resave: false,
                saveUninitialized: false,
                cookie: {maxAge: 1000 * 60 * 60 *24, http: true}
        });


        app.use(sessionOptions);
        app.use(flash());

        app.use(function (req, res, next) {
                //make user id available on the req object
                if(req.session.user){
                        req.visitorId = req.session.user._id
                } else {
                        req.visitorId = 0
                }

                // make user session data available from within view templates
                res.locals.user = req.session.user;  // .locals  делает объект user доступным в ejs файле
                next();
        });


        const router = require('./router');


        app.use(express.urlencoded({extended:false})); // для доступа к данным пользователя, которые он вводит в форму регистрации (req.body)
        app.use(express.json());


        app.use(express.static('public'));

        app.set('views', 'views');    // первый аргумент - всегда 'views', второй - название папки
        app.set('view engine', 'ejs');

        app.use('/', router);

        module.exports = app;  // экспортирует данные из файла

