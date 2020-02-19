// файл для сохранение данных в базу данных

        const postsCollection = require('../mongoDB').db().collection('posts');
        const ObjectId = require('mongodb').ObjectID; //  .ObjectID позволяет преобразовывать переданные строки в объекты

        let Post = function (data, userId) {
            this.data = data;
            this.errors = [];  // пустой массив позволяет далее применять метод push() с выводом сообщения об ошибке
            this.userId = userId
        };


        Post.prototype.cleanUp = function (){

            if(typeof (this.data.title) !== 'string'){this.data.title = ''}
            if(typeof (this.data.body) !== 'string'){this.data.body = ''}

            //    get rid of any bogus properties
            this.data = {
                title: this.data.title.trim(),
                body: this.data.body.trim(),
                createdDate: new Date(),  // in Js there is a built-in blueprint for a date
                author: ObjectId(this.userId)  // в среде mongo есть практика не сохранять ID просто как строку, а как объект
            }
        };


        Post.prototype.validate = function (){

            if(this.data.title === ''){this.errors.push('You must provide a title.')}
            if(this.data.body === ''){this.errors.push('You must provide some text.')}
         };


        Post.prototype.create = function (){
            return new Promise((resolve, reject) => {
            this.cleanUp();
            this.validate();

            if (!this.errors.length){ // проверка на наличие ошибок в массиве errors

            //    save post into database
                postsCollection.insertOne(this.data)
                    .then(() => resolve())
                    .catch(() => this.errors.push('Please, try again later.'));
                reject(this.errors);

            } else {
                reject(this.errors);
            }
            })
        };


module.exports = Post;
