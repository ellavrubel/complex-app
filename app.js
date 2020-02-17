// var createError = require('http-errors');
//
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
//
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
//
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// module.exports = app;

// Complex-App

        const express = require('express');
        const  app  = express();


        const session = require('express-session');
        const MongoStore = require('connect-mongo')(session);  // MongoStore - also a blueprint

        let sessionOptions = session({
                secret: 'Js is so cool!',
                store: new MongoStore({client: require('./mongoDB')}),
                resave: false,
                saveUninitialized: false,
                cookie: {maxAge: 1000 * 60 * 60 *24, http: true}
        });

        const router = require('./router');




        app.use(sessionOptions);
        app.use(express.urlencoded({extended:false})); // для доступа к данным пользователя, которые он вводит в форму регистрации (req.body)
        app.use(express.json());


        app.use(express.static('public'));

        app.set('views', 'views');    // первый аргумент - всегда 'views', второй - название папки
        app.set('view engine', 'ejs');

        app.use('/', router);

        module.exports = app;  // экспортирует данные из файла

