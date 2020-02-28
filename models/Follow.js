
const usersCollection = require('../mongoDB').db().collection('users');
const followsCollection = require('../mongoDB').db().collection('follows');
const ObjectId = require('mongodb').ObjectID;


let Follow = function (followedUsername, authorId ) {
            this.followedUsername = followedUsername;
            this.authorId = authorId;
            this.errors = []
         };

        Follow.prototype.cleanUp = function(){

            if(typeof (this.followedUsername) !== 'string'){this.followedUsername = ''}
        };

        Follow.prototype.validate = async function(){

        //    followedUsername must exist in database
            let followedAccount = await usersCollection.findOne({username: this.followedUsername});

            if(followedAccount){
                this.followedId = followedAccount._id
            } else{
                this.errors.push('You can not follow a user that does not exists.')
            }
        };


        Follow.prototype.create = function(){
          return new Promise ( async (resolve, reject) => {
              this.cleanUp();
              await this.validate();

              if(!this.errors.length) {
                  await followsCollection.insertOne({
                      followedId: this.followedId,
                      authorId: new ObjectId(this.authorId)
                  });
                  resolve()
              } else {
                  reject(this.errors)
              }






          })

        };




        module.exports = Follow;
