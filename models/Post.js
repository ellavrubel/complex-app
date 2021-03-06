// файл для сохранение данных в базу данных

        const postsCollection = require('../mongoDB').db().collection('posts');
        const followsCollection = require('../mongoDB').db().collection('follows');
        const ObjectId = require('mongodb').ObjectID; //  .ObjectID позволяет преобразовывать переданные строки в объекты
        const User = require('./User');
        const sanitizeHTML = require('sanitize-html');

        let Post = function (data, userId, requestedPostId) {
            this.data = data;
            this.errors = [];  // пустой массив позволяет далее применять метод push() с выводом сообщения об ошибке
            this.userId = userId;
            this.requestedPostId = requestedPostId
        };


        Post.prototype.cleanUp = function (){

            if(typeof (this.data.title) !== 'string'){this.data.title = ''}
            if(typeof (this.data.body) !== 'string'){this.data.body = ''}

            //    get rid of any bogus properties
            this.data = {
                title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
                body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
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
                    .then((info) => resolve(info.ops[0]._id))  // выбор из массива информации от mongo только id
                    .catch(() => this.errors.push('Please, try again later.'));

            } else {
                reject(this.errors);
            }
            })
        };

        Post.prototype.update = function(){
            return new Promise(async (resolve, reject) => {
                try{
                    let post = await Post.findSingleById(this.requestedPostId, this.userId);
                if(post.isVisitorOwner){
                    //    actually update the db
                    let status = await this.actuallyUpdate();
                         resolve(status)
                } else { reject() }

                } catch{
                    reject()
                }
            })
        };

        Post.prototype.actuallyUpdate = function(){
          return new Promise(async (resolve, reject) =>{
              this.cleanUp();
              this.validate();

              if(!this.errors.length){
                  await postsCollection.findOneAndUpdate({_id: new ObjectId(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}}); // The $set operator replaces the value of a field with the specified value.
                  resolve('success')
              } else{
                  resolve('failure')
              }
          })
        };


Post.reusablePostQuery = (function (uniqueOperations, visitorId) {

    return new Promise(async function (resolve, reject) {

        let aggOperations = uniqueOperations.concat([ // concat() method is used to merge two or more arrays. This method does not change the existing arrays, but instead returns a new array.

            {$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'authorDocument'}}, // поиск/просмотр по коллекциям для выбора нужного документа
            {$project: { // Используется для выбора некоторых специальных полей из коллекции.
                    title: 1, // 1 == true
                    body: 1,
                    createdDate: 1,
                    authorId: '$author', //   в среде mongo '' и $ в них означает не строку,  непосредственно поле - author
                    author: {$arrayElemAt: ['$authorDocument', 0]}  // Returns the element at the specified array index
                }}
        ]);

        let posts = await postsCollection.aggregate(aggOperations).toArray(); //aggregate() - используется когда нужно выполнить несколько операций. Объединит uniqueOperations и aggOperations.

        // Clean up author property in each post object

        posts = posts.map(function (post) {

            post.isVisitorOwner = post.authorId.equals(visitorId); // equals() возвращает true/false
            post.authorId = undefined; // убираем данные из доступа, когда осуществляется поиск по сайту во frontend

            post.author = {
                username: post.author.username,
                avatar: new User (post.author, true).avatar
            };
            return(post)
        });
            resolve(posts)
    })
});


        Post.findSingleById = (function (id, visitorId) {

           return new Promise(async function (resolve, reject) {

               if (typeof (id) !=='string' || !ObjectId.isValid(id)){  //isValid() - boolean, true -if the document represents an existing document, false -
                   reject();
                   return;  // прерывает выполнение функции/ Функция немедленно останавливается в точке, где вызывается return
               }

               let posts = await Post.reusablePostQuery([
                   {$match: {_id: new ObjectId(id)}}
               ], visitorId);

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


        Post.delete = function(postIdToDelete, currentUserId){

            return new Promise(async (resolve, reject) => {

                try{
                    let post = await  Post.findSingleById(postIdToDelete, currentUserId);
                    if(post.isVisitorOwner){

                        await postsCollection.deleteOne({_id: new ObjectId(postIdToDelete)});
                        resolve()

                    } else{
                        reject()
                    }
                } catch{
                    reject()
                }
            })
        };


        Post.search = function(searchTerm){

            return new Promise(async (resolve, reject) => {

                if (typeof (searchTerm) == 'string'){

                    let posts = await Post.reusablePostQuery([
                        {$match: {$text: {$search: searchTerm}}}, // поиск широкий
                        {$sort: {score: {$meta: 'textScore'}}}  // вверху будет максимально совпадающий текст
                    ]);
                    resolve(posts)

                } else {
                    reject()
                }
            })
        };


        Post.countPostsByAuthor = function(id){

            return new Promise(async (resolve, reject) =>{
                let postCount = await postsCollection.countDocuments({author: id});

                resolve(postCount)
            })
        };


        Post.getFeed = async function(id){

        //  create an array of the user ids that the current user follows

            let followedUsers = await followsCollection.find({authorId: new ObjectId(id)}).toArray();
            followedUsers = followedUsers.map(function (followDoc) {
                return followDoc.followedId

            });

        //    look for posts where the author is in the above array of followed users
            return Post.reusablePostQuery([
                {$match: {author: {$in: followedUsers}}}, // найти любой пост, где аuthor находится внутри списка followedUsers
                {$sort: {createdDate: -1}} // -1 - новые сверху
            ])

        };





module.exports = Post;
