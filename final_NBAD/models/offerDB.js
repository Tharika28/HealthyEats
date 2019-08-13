var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/healthyEating');
var await = require('asyncawait/await');

var offers = mongoose.Schema({
  userId:String,
  offerId:String,
  itemCodeOwn: String,
  itemCodeWant:String,
  itemStatus:String

},{collection:'offers'});

var Offers = mongoose.model('offers',offers);
const addOffer = async function(userId, itemCodeOwn, itemCodeWant, itemStatus){
  var offer = new Offers({
    userId: userId,
    itemCodeOwn:itemCodeOwn,
    itemCodeWant:itemCodeWant,
    itemStatus:itemStatus
  })
  offer.save();
}

const updateOffer = async function(itemId, itemStatus){
  await Offers.update({itemCodeOwn: itemId},{$set:{itemStatus:itemStatus}}).exec();
  await Offers.update({itemCodeWant: itemId},{$set:{itemStatus:itemStatus}}).exec();
}

const deleteOffer = async function(itemId){
  await Offers.findOneAndRemove({itemCodeOwn: itemId});
  await Offers.findOneAndRemove({itemCodeWant: itemId});
}

const getOffer = async function(userId){
  const arr = await Offers.find({userId:userId});
  return arr;
}

const getOfferbyItemId = async function(itemId){
  const arr = await Offers.find({itemCodeOwn:itemId});
  return arr;
}
const getOfferbyItemIdWant = async function(itemId){
  const arr = await Offers.findOne({itemCodeWant:itemId});
  return arr;
}
module.exports = {
  addOffer:addOffer,
  updateOffer:updateOffer,
  deleteOffer:deleteOffer,
  getOffer:getOffer,
  getOfferbyItemId:getOfferbyItemId,
  getOfferbyItemIdWant:getOfferbyItemIdWant
}
