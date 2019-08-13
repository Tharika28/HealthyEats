var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/healthyEating');
var await = require('asyncawait/await');


var users = mongoose.Schema({
  firstName: String,
  lastName:String,
  email:String,
  address1:String,
  address2:String,
  city:String,
  state:String,
  postCode:Number,
  country:String,
  userId:String,
  password:String
},{collection:'users'});


var Users = mongoose.model('users',users);
const getUsers = async function(){
  const arr = await Users.find({ });
  return arr;
}

const getUserProfile = async function(userId){
  const arr = await Users.find({userId:userId});
  return arr;
}
const getUserProfileByEmail = async function(email){
  const arr = await Users.findOne({email:email});
  return arr;
}
const getUserProfileByEmail1 = async function(email){
  if(email){
    return new Promise((resolve, reject) => {
      Users.findOne({email:email})
      .exec((err, user)=>{
        if(err) {
          return reject(new Error('Server Error'))
        }
        if(Boolean(user)) {
          return reject(new Error('E-mail already in use'))
        }
        return resolve(email)
      });
    });
  }
}
const getUserById = async function(userId){
  if(userId){
    return new Promise((resolve, reject) => {
      Users.findOne({userId:userId})
      .exec((err, user)=>{
        if(err) {
          return reject(new Error('Server Error'))
        }
        if(Boolean(user)) {
          return reject(new Error('User Id already in use'))
        }
        return resolve(userId)
      });
    });
  }
}

const addUser = async function(userId,firstName, lastName, email, password,
  address1,address2,city,state,postCode,country){
    var user = new Users({
      firstName: firstName,
      lastName:lastName,
      email:email,
      address1:address1,
      address2:address2,
      city:city,
      state:state,
      postCode:postCode,
      country:country,
      userId:userId,
      password:password
    })
    const arr = user.save();
    console.log(arr);
  }

  module.exports = {
    getUsers:getUsers,
    getUserProfile:getUserProfile,
    getUserProfileByEmail:getUserProfileByEmail,
    addUser: addUser,
    getUserById: getUserById,
    getUserProfileByEmail1:getUserProfileByEmail1
  }
