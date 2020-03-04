           const User = require('../models/User');
            const Post = require('../models/Post');
            const Follow = require('../models/Follow');


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

            exports.sharedProfileData = async function(req, res, next){

                let isVisitorsProfile = false;
                let isFollowing = false;

              if(req.session.user) {
                  isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
                  isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
              }
              req.isVisitorsProfile = isVisitorsProfile;
              req.isFollowing = isFollowing;

              //retrieve post, follower, and following counts
                    let postCountPromise = Post.countPostsByAuthor(req.profileUser._id);
                    let followerCountPromise = Follow.countFollowersById(req.profileUser._id);
                    let followingCountPromise = Follow.countFollowingById(req.profileUser._id);
                    let [postCount, followerCount, followingCount ] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise]);

                    req.postCount = postCount;
                    req.followerCount = followerCount;
                    req.followingCount = followingCount;

              next()
            };


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

            exports.home = async function (req, res) {
                if(req.session.user){
                    // fetch feed of posts for current user

                    let posts = await Post.getFeed(req.session.user._id);

                    res.render('home-dashboard', {posts: posts});

                } else {
                    res.render('home-guest', {regErrors: req.flash('regErrors')});
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
                            currentPage: 'posts',
                            posts: posts,
                            profileUsername: req.profileUser.username,
                            profileAvatar: req.profileUser.avatar,
                            isFollowing: req.isFollowing,
                            isVisitorsProfile: req.isVisitorsProfile,
                            counts: {
                                postCount: req.postCount,
                                followerCount: req.followerCount,
                                followingCount: req.followingCount
                            }
                        }); // в объекте передается то, что будет включено в ejs

                    })
                    .catch(function () {
                        res.render('404')
                    });
            };

            exports.profileFollowersScreen = async function (req, res) {

               try {

                   let followers = await Follow.getFollowersById(req.profileUser._id);

                   res.render('profile-followers', {

                       currentPage: 'followers',
                       followers: followers,
                       profileUsername: req.profileUser.username,
                       profileAvatar: req.profileUser.avatar,
                       isFollowing: req.isFollowing,
                       isVisitorsProfile: req.isVisitorsProfile,
                       counts: {
                           postCount: req.postCount,
                           followerCount: req.followerCount,
                           followingCount: req.followingCount
                       }
                   })

               } catch {
                   res.render('404')
               }
            };

           exports.profileFollowingScreen = async function (req, res) {

               try {

                   let following = await Follow.getFollowingById(req.profileUser._id);

console.log(following);
                   res.render('profile-following', {
                       currentPage: 'following',
                       following: following,
                       profileUsername: req.profileUser.username,
                       profileAvatar: req.profileUser.avatar,
                       isFollowing: req.isFollowing,
                       isVisitorsProfile: req.isVisitorsProfile,
                       counts: {
                           postCount: req.postCount,
                           followerCount: req.followerCount,
                           followingCount: req.followingCount
                       }
                   })

               } catch {
                   res.render('404')
               }
           };















































