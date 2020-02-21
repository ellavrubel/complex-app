// файл для сохранение данных в базу данных

        const postsCollection = require('../mongoDB').db().collection('posts');
        const ObjectId = require('mongodb').ObjectID; //  .ObjectID позволяет преобразовывать переданные строки в объекты
        const User = require('./User');

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


Post.reusablePostQuery = (function (uniqueOperations) {

    return new Promise(async function (resolve, reject) {

        let aggOperations = uniqueOperations.concat([ // concat() method is used to merge two or more arrays. This method does not change the existing arrays, but instead returns a new array.

            {$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'authorDocument'}}, // поиск/просмотр по коллекциям для выбора нужного документа
            {$project: { // Используется для выбора некоторых специальных полей из коллекции.
                    title: 1, // 1 == true
                    body: 1,
                    createdDate: 1,
                    author: {$arrayElemAt: ['$authorDocument', 0]}  // Returns the element at the specified array index
                }}
        ]);

        let posts = await postsCollection.aggregate(aggOperations).toArray(); //aggregate() - используется когда нужно выполнить несколько операций. Объединит uniqueOperations и aggOperations.

        // Clean up author property in each post object

        posts = posts.map(function (post) {
            post.author = {
                username: post.author.username,
                avatar: new User (post.author, true).avatar
            };
            return(post)
        });
            resolve(posts)
    })
});



        Post.findSingleById = (function (id) {

           return new Promise(async function (resolve, reject) {

               if (typeof (id) !=='string' || !ObjectId.isValid(id)){  //isValid() - boolean, true -if the document represents an existing document, false -
                   reject();
                   return;  // прерывает выполнение функции/ Функция немедленно останавливается в точке, где вызывается return
               }

               let posts = await Post.reusablePostQuery([
                   {$match: {_id: new ObjectId(id)}}
               ]);

               if(posts.length){
                   console.log(posts[0]);
                   resolve(posts[0]); // возвратит 1-й элемент массива
               } else {
                   reject();
               }
           })
        });

        Post.findAuthorById = function(authorId){
            return Post.reusablePostQuery([
                {$match: {author: authorId}},
                {$sort: {createdDate: -1}}, // -1 - descending order (по убыванию), 1 - ascending
            ])
        };


module.exports = Post;
