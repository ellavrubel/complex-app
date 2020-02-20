
        // файл для сохранение данных в базу данных

        const userCollection = require('../mongoDB').db().collection('users');
        const bcrypt = require('bcryptjs');
        const validator = require('validator');
        const md5 = require('md5');



                let User  = function (data, getAvatar) {
                  this.data = data;  // this.data - data - может быть любое название
                  this.errors = [];

                  if(getAvatar === undefined){getAvatar = false}
                  if (getAvatar){this.getAvatar()}
                };

                // Очистка данных

                User.prototype.cleanUp = function(){
                  if(typeof (this.data.username) !== "string"){
                      this.data.username = "";
                  }

                    if(typeof (this.data.email) !== "string"){
                        this.data.email = "";
                    }

                    if(typeof (this.data.password) !== "string"){
                        this.data.password = "";
                    }

                //    get rid of any bogus properties
                    this.data = {
                        username: this.data.username.trim().toLowerCase(),         // trim() - удаляет пробелы вначале и конце, toLowerCase() - все переведет в маленькие буквы
                        email: this.data.email.trim().toLowerCase(),
                        password: this.data.password

                    }
                };

                User.prototype.validate = function(){
                    return new Promise(async (resolve, reject) => {
                        if(this.data.username === ""){this.errors.push('You must provide a username')}
                        if(this.data.username !== "" && !validator.isAlphanumeric(this.data.username)){this.errors.push('Username can only contain letters and numbers.')}

                        if(!validator.isEmail(this.data.email)){this.errors.push('You must provide a valid email address')}
                        if(this.data.password === ""){this.errors.push('You must provide a password')}
                        if(this.data.password.length > 0 && this.data.password.length < 12){this.errors.push('The password must be at least 12 characters')}
                        if(this.data.password.length > 50){this.errors.push('Password can not exceed 50 characters')}
                        if(this.data.username.length > 0 && this.data.username.length < 3){this.errors.push('The username must be at least 3 characters')}
                        if(this.data.username.length > 30){this.errors.push('The username can not exceed 30 characters')}

                        // Onli if a username is valid then check to see if it is already taken

                        if(this.data.username.length > 2 && this.data.username < 31 && validator.isAlphanumeric(this.data.username)) {
                            let usernameExists = await userCollection.findOne({username: this.data.username}); // если нет данных - вернется Null - false, а usernameExists - is true
                            if(usernameExists){this.errors.push('That username is already taken.')}
                        }

                        // Onli if email is valid then check to see if it is already taken

                        if(validator.isEmail(this.data.email)) {
                            let emailExists = await userCollection.findOne({email: this.data.email}); // если нет данных - вернется Null - false, а usernameExists - is true
                            if(emailExists){this.errors.push('That email is already being used.')}
                        }

                        resolve();

                    })
                };

                //

                User.prototype.login = function(){

                    return new Promise((resolve, reject) => {
                        this.cleanUp();

                        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
                            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password )){
                                this.data = attemptedUser;  // т.к. login запрашивает только username/password - дает доступ к email, соответственно доступ к фото по email
                                this.getAvatar();
                                resolve('Congrats!');
                            } else{
                                reject('Invalid username/password.');
                            }
                        }).catch(function () {
                            reject('Try again later.');
                        });
                    });
                };


                User.prototype.register = function () {
                    return new Promise(async (resolve, reject) => {

                        // Step #1 - Validate User Data

                        this.cleanUp();
                        await this.validate();

                        // Step #2 - Only if there are no validation errors then save the user data into a database

                        if(!this.errors.length){
                            // hash user password
                            let salt = bcrypt.genSaltSync(10);
                            this.data.password = bcrypt.hashSync(this.data.password, salt);
                            await userCollection.insertOne(this.data);
                            this.getAvatar();
                            resolve();
                        } else {
                            reject(this.errors);
                        }
                    })
                };


                User.prototype.getAvatar = function(){
                    this.avatar = `http://gravatar.com/avatar/${md5(this.data.email)}?s=128`

                };

                // Profile page function

                User.findByUsername = function(username){
                    return new Promise(function (resolve, reject) {
                        if(typeof (username) !=='string') {
                            reject();
                            return
                        }
                        userCollection.findOne({username: username})
                            .then(function (userDoc) {
                                if(userDoc){
                                    userDoc = new User(userDoc, true);  // true позволяет извлесь avatar из полученных данных
                                    userDoc = {
                                        _id: userDoc.data._id,
                                        username: userDoc.data.username,
                                        avatar: userDoc.avatar
                                    };
                                    resolve(userDoc)
                                } else {
                                    reject()
                                }
                            })
                            .catch(function () {
                                reject()
                            })
                    })
                };


                module.exports = User;