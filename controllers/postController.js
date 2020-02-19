        const Post = require('../models/Post');


        exports.viewCreateScreen = function (req, res) {
                    res.render('create-post');
                };

        exports.create = function (req, res) {

            let post = new Post(req.body, req.session.user._id);

            post.create()
                .then(function () {
                res.send('New post created')
            })
                .catch(function (err) {
                res.send(err)
            });
        };

        exports.viewSingle = async function (req, res) {
            try{
                let post = await Post.findSingleById(req.params.id);  // id - динамическая часть
                res.render('single-post-screen', {post: post}); // {} - объект, который передаем в HTML

            } catch {
                res.send('404 template will go here.')
            }
        };