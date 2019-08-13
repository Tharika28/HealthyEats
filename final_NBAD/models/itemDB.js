var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/healthyEating');
var await = require('asyncawait/await');

var item = mongoose.Schema({
  itemCode:String,
  itemName: String,
  catalogCategory:String,
  subCategory:String,
  description:String,
  rating:Number,
  imageUrl:String,
  userId:String,
  status:String
},{collection:'items'});

var Items = mongoose.model('items',item);
const getItems = async function(){
  const arr = await Items.find({ });
  return arr;
}
const getItem = async function(itemId){
  const arr = await Items.find({itemCode:itemId});
  return arr;
}

const getUserItems = async function(userId){
  const arr = await Items.find({userId:userId});
  return arr;
}

const getGroupItems = async function(itemIds){
  const arr = await Items.find({itemCode:{$in:itemIds}});
  return arr;
}
const getCategory = async function(){
  const arr = await Items.distinct("catalogCategory");
  return arr;
}
const getDistinctItems = async function(){
  const arr = await Items.distinct("itemCode");
  return arr;
}

const setItemStatus = async function(itemId,status){
  const arr = await Items.update({itemCode: itemId},{$set:{status:status}}).exec();
  return arr;
}

const updateItemRating= async function(itemId, rating){
  const arr = await Items.update({itemCode:itemId},{$set: {rating:rating}}).exec();
  return arr
}

module.exports = {
  getItems:getItems,
  getItem:getItem,
  getUserItems:getUserItems,
  getGroupItems:getGroupItems,
  getCategory:getCategory,
  setItemStatus:setItemStatus,
  getDistinctItems:getDistinctItems,
  updateItemRating: updateItemRating
}
