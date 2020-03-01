
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

        Follow.prototype.validate = async function(action){

        //    followedUsername must exist in database
            let followedAccount = await usersCollection.findOne({username: this.followedUsername});

            if(followedAccount){
                this.followedId = followedAccount._id
            } else{
                this.errors.push('You can not follow a user that does not exists.')
            }
            let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)});

            if (action ===  'create') {
                if (doesFollowAlreadyExist) {this.errors.push('You are already following this user.')}
            }
            if (action ===  'delete') {
                if (!doesFollowAlreadyExist) {this.errors.push('You can not stop following someone you do not follow.')}
            }

        //    should not ba able to follow yourself
            if(this.followedId.equals(this.authorId)){
                this.errors.push('You can not follow yourself.')
            }
        };


        Follow.prototype.create = function(){
          return new Promise ( async (resolve, reject) => {
              this.cleanUp();
              await this.validate('create');

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

Follow.prototype.delete = function(){
    return new Promise ( async (resolve, reject) => {
        this.cleanUp();
        await this.validate('delete');

        if(!this.errors.length) {
            await followsCollection.deleteOne({
                followedId: this.followedId,
                authorId: new ObjectId(this.authorId)
            });
            resolve()
        } else {
            reject(this.errors)
        }
    })
};


        Follow.isVisitorFollowing = async function(followedId, visitorId) {

            let followDoc = await followsCollection.findOne({followedId: followedId, authorId: new ObjectId(visitorId)});

            if (followDoc){
                return true

            } else {
                return false
            }
        };




        module.exports = Follow;
