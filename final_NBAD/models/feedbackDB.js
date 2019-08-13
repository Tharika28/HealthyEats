var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/healthyEating');
var await = require('asyncawait/await');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var feedbackSchema = new mongoose.Schema({
  offerId:{type: ObjectId},
  userId:{type:String,
    required: true},
    swapperId:{type:String},
    swappedItemCode:{type:String},
    swapperRating:{type:Number},
    swappedItemRating:{type:Number}
  },{collection:'feedback'});

  var Feedback= mongoose.model('feedback',feedbackSchema );
  var addFeedback= function(offerId, userId, swapperId, swappedItemCode, swapperRating,swappedItemRating){
    Feedback.findOneAndUpdate(
      { offerId: offerId ,
        userId:userId,
        swapperId:swapperId,
        swappedItemCode:swappedItemCode},
        {
          offerId: offerId,
          userId:userId,
          swapperId:swapperId,
          swappedItemCode:swappedItemCode,
          swapperRating:swapperRating,
          swappedItemRating:swappedItemRating
        },
        {new:true , upsert:true},
        (err,doc)=>{
          console.log(err);
          console.log(doc);
        });
      }
      module.exports = {
        addFeedback:addFeedback
      }
