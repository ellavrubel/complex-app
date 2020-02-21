        const Post = require('../models/Post');


        exports.viewCreateScreen = function (req, res) {
                    res.render('create-post');
                };

        exports.create = function (req, res) {

            let post = new Post(req.body, req.session.user._id);

            post.create()
                .then(function () {
                res.send('New post created') // выдает []
            })
                .catch(function (err) {
                res.send(err)
            });
        };

        // страница с постом
        exports.viewSingle = async function (req, res) {
            try{
                let post = await Post.findSingleById(req.params.id, req.visitorId);  // id - динамическая часть; req.visitorId - определен в app.js
                res.render('single-post-screen', {post: post}); // {} - объект, который передаем в HTML

            } catch {
                res.render('404');
            }
        };

        exports.viewEditScreen = async function (req, res) {
           try {
               let post = await Post.findSingleById(req.params.id);
               res.render('edit-post', {post: post});
           } catch  {
               res.render('404')
           }
        };

























