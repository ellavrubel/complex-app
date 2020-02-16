
        const userCollection = require('../mongoDB').collection('users');

        const validator = require('validator');

        const bcrypt = require('bcryptjs');

                let User  = function (data) {
                  this.data = data;  // this.data - data - может быть любое название
                  this.errors = [];

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
                    if(this.data.username === ""){this.errors.push('You must provide a username')}
                    if(this.data.username !== "" && !validator.isAlphanumeric(this.data.username)){this.errors.push('Username can only contain letters and numbers.')}

                    if(!validator.isEmail(this.data.email)){this.errors.push('You must provide a valid email address')}
                    if(this.data.password === ""){this.errors.push('You must provide a password')}
                    if(this.data.password.length > 0 && this.data.password.length < 12){this.errors.push('The password must be at least 12 characters')}
                    if(this.data.password.length > 50){this.errors.push('Password can not exceed 50 characters')}
                    if(this.data.username.length > 0 && this.data.username.length < 3){this.errors.push('The username must be at least 3 characters')}
                    if(this.data.username.length > 30){this.errors.push('The username can not exceed 30 characters')}

                };

                //

                User.prototype.login = function(){

                    return new Promise((resolve, reject) => {
                        this.cleanUp();

                        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
                            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password )){
                                resolve('Congrats!');
                            } else{
                                reject('Invalid username/password.');
                            }
                        }).catch(function () {
                            reject('Try again later.');
                        });
                    });
                };


                User.prototype.register = function(){

                    // Step #1 - Validate User Data

                    this.cleanUp();
                    this.validate();

                    // Step #2 - Only if there are no validation errors then save the user data into a database
                    if(!this.errors.length){
                        // hash user password
                        let salt = bcrypt.genSaltSync(10);
                        this.data.password = bcrypt.hashSync(this.data.password, salt);


                        userCollection.insertOne(this.data);
                    }
                };

                module.exports = User;