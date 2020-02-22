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

        // страница с редактируемым постом
        exports.viewEditScreen = async function (req, res) {
           try {
               let post = await Post.findSingleById(req.params.id);
               res.render('edit-post', {post: post});
           } catch  {
               res.render('404')
           }
        };

        exports.edit = function (req, res) {
            let post = new Post(req.body, req.visitorId, req.params.id);
            post.update()
                .then((status) => {
                //     the post was successfully updated in the DB or user did have permission, but there were validation errors
                    if(status === 'success'){
                    //    post was updated in DB
                        req.flash('success', 'post successfully updated');
                        req.session.save(function () {
                            res.redirect(`/post/${req.params.id}/edit`)
                        })

                    } else{
                    //    there were a validation errors
                        post.errors.forEach(function (error) {
                            req.flash('errors', error)
                        });
                        req.session.save(function () {
                            res.redirect(`/post/${req.params.id}/edit`)
                        })
                    }
                })
                .catch(() => {
                //    a post with the requested id doesn't exist or if the current visitor is not the owner of the post
                req.flash('errors', 'You do not have permission to perform that action');
                req.session.save(function () {
                    res.redirect('/')
                })


                })
        };

























