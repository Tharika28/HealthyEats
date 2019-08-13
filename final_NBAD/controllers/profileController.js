var itemObj = require('./../models/itemDB');
var userObj = require('./../models/userDB');
var offerObj = require('./../models/offerDB');
var feedbackObj = require('../models/FeedbackDB');
const { check, validationResult} = require('express-validator/check');
var bcrypt = require('bcrypt');
var BCRYPT_SALT_ROUNDS = 12;

exports.profile_get = function (request, response) {
  var action = ['update','accept', 'reject', 'withdraw', 'offer', 'delete', 'signout'];

  var itemCodes=[];
  var items = [];
  var userItems=[];

  var sessionUser = request.session.theUser;

  if(sessionUser){
    theItem= itemObj.getUserItems(sessionUser);
    theItem.then(function(userItems1){
      userItems1.forEach(function(eachItem){
        userItems.push(eachItem);
      });
      if(request.params.action){
        action.indexOf(request.params.action) > -1;
        var itemCode = request.params.itemCode;
        if (request.params.action==='update'){
          userItems.forEach(function(userItem){
            if(itemCode != undefined  && userItem.status === 'Pending'&& itemCode==userItem.itemCode){
              response.redirect('/mySwaps')
            }
            if(itemCode != undefined  && (userItem.status === 'Swapped'|| userItem.status === 'Available') && itemCode==userItem.itemCode){
              response.redirect('/categories')
            }
            if(itemCode != undefined  && userItem.status === 'Offered' && itemCode==userItem.itemCode){
              response.redirect('/mySwaps')
            }
          });
        } else if (request.params.action==='delete'){
          userItems.forEach(function(userItem){
            if(itemCode != undefined && itemCode==userItem.itemCode){
              var statusSetOut = itemObj.setItemStatus(itemCode,"Deleted");
              statusSetOut.then(function(result00){
              });
            }
            response.redirect('/myItems');
          });
        } else if (request.params.action==='offer'){
          var itemCodeOffer=  request.body.itemCode;
          userItems.forEach(function(userItem){
            if(itemCodeOffer != undefined && itemCodeOffer==userItem.itemCode){
              var addOffer = offerObj.addOffer(request.session.theUser,itemCodeOffer, request.params.itemCode,"Offered");
              addOffer.then(function(r){
                var statusSetOut = itemObj.setItemStatus(itemCodeOffer,"Offered");
                statusSetOut.then(function(result00){
                  var otherUser = itemObj.getItem(request.params.itemCode);
                  otherUser.then(function(result4){
                    var userid=result4[0].userId;
                    add1 = offerObj.addOffer(userid,request.params.itemCode,itemCodeOffer,"Pending");
                    add1.then(function(result){
                      var statusSet= itemObj.setItemStatus(request.params.itemCode,"Pending");
                      statusSet.then(function(resultIn){
                        response.redirect('/myItems');
                      });
                    });
                  });
                });
              });
            }
          });
        }
      }
      else{
        var items = [];
        var currentUser = request.session.theUser;
        var theItemTemp = itemObj.getUserItems(currentUser);
        theItemTemp.then(function(resultTemp1){
          resultTemp = resultTemp1;
          response.render('myItems',{items: resultTemp})
        });
      }
    });
  }
  else {
    response.redirect('/login');
  }
}

exports.mySwaps= async function(req, res,next){
  var items = [];
  var userItems=[];
  var swapItems = [];
  var status = [];
  var userSession = req.session.theUser;
  if(userSession === undefined){
    res.redirect('/login');
  }
  else {
    if(req.params.action){
      if(req.params.action=='accept'){
        var update = offerObj.updateOffer(req.params.theItem,"Swapped");
        update.then(async function(result){
          var offers=offerObj.getOfferbyItemId(req.params.theItem);
          offers.then(async function(resultOffer){
            var statusSetOut1 = await itemObj.setItemStatus(resultOffer[0].itemCodeWant,"Swapped");
            var statusSetOut = await itemObj.setItemStatus(req.params.theItem,"Swapped");
            res.redirect('/myItems');
          });
        });
      }
      if(req.params.action=='reject'||req.params.action=='withdraw'){
        var offers=offerObj.getOffer(userSession);
        offers.then(function(resultOffer){
          var statusSetOut1 = itemObj.setItemStatus(resultOffer[0].itemCodeWant,"Available");
          statusSetOut1.then(function(result2){
            var statusSetOut = itemObj.setItemStatus(req.params.theItem,"Available");
            statusSetOut.then(function(result1){
              var deletOff = offerObj.deleteOffer(req.params.theItem);
              deletOff.then(function(result){
                res.redirect('/myItems');
              });
            });
          });
        });
      }
    }else {
      var offers=offerObj.getOffer(userSession);
      offers.then(function(resultOffer){
        resultOffer.forEach(function(eachOffer){
          if(eachOffer.itemStatus === 'Pending' || eachOffer.itemStatus == 'Offered'){
            userItems.push(eachOffer.itemCodeOwn);
            swapItems.push(eachOffer.itemCodeWant);
          }
        });
        var allItems = itemObj.getGroupItems(userItems);
        allItems.then(function(eachItem){
          swapItemsTemp = itemObj.getGroupItems(swapItems);
          swapItemsTemp.then(function(resultSwaps){
            res.render('mySwaps',{items: eachItem, swapItem:resultSwaps})
          })
        })
      });
    }
  }
}
exports.swap= async function(req, res,next){
  var userSession= req.session.theUser;
  if(req.params.itemCode!=undefined){
    var itemId = req.params.itemCode;
    var itemVal = itemObj.getItem(itemId);
    itemVal.then(function(result){
      item = result[0];
      if(item !=undefined){
        if(userSession!=undefined){
          var userItems=[];
          theItems2= itemObj.getUserItems(userSession);
          theItems2.then(function(result2){
            result2.forEach(function(eachItem){
              if(eachItem.status ==='Available'){
                userItems.push(eachItem)
              }
            });
            res.render('../views/swap',{item:item,userItem:userItems});
          });
        }else{
          res.render('../views/swap',{item:item,userItem:'null'});
        }
      }else {
        res.redirect("/categories");
      }
    });
  }
}

exports.item= async function(req, res,next){
  var itemId= req.params.itemCode;
  var userSession = req.session.theUser;
  var itemVal = itemObj.getItem(itemId);
  var userflag = 0;
  itemVal.then(async function(result){
    item = result[0];
    if(item!=undefined){
      if(userSession === undefined){
        res.render('../views/item',{item:item,flags:-1,userflag:userflag});
      }  else{
        flags = 0;
        var userItems = await itemObj.getUserItems(userSession);
        userItems.forEach(function(eachItem){
          if(itemId == eachItem.itemCode && eachItem.status == "Available" ){
            userflag =1;
          }
          else if(itemId == eachItem.itemCode && eachItem.status != "Available" ){
            userflag =2;
          }
        })
        var offer = offerObj.getOffer(userSession);
        offer.then(function(result){
          result.forEach(function(result1){
            if(result1.itemCodeWant === itemId && result1.itemStatus === 'Swapped'){
              flags =1;
            }
            if(result1.itemCodeWant === itemId && result1.itemStatus === 'Offered'){
              flags =2;
            }
          });
          if(item !=""){
            res.render('../views/item',{item:item,flags:flags,userflag:userflag});
          }
        });
      }
    }
    else{
      flag =-1;
      res.send('404 ERROR : OOPS ! Page Not Found');
    }
  });
}
exports.login= async function(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('../views/login',{errors:errors.mapped().email.msg});
    return ;
  }
  var userId = req.session.theUser;
  if(userId !=undefined){
    res.redirect('/myItems');
  } else {
    var email = req.body.email;
    await userObj.getUserProfileByEmail(email)
    .then(function(user) {
      if(user!=null){
        var password = req.body.psw;
        bcrypt.compare(password, user.password)
        .then(function(samePassword) {
          if(samePassword){
            var userId = user.userId;
            req.session.theUser = userId;
            res.redirect('/myItems');
          }else{
            var errors1 = "Username or Password is Incorrect. Please try again.";
            res.render('../views/login',{errors:errors1});
          }
        });
      }else{
        var errors2 = "Username or Password is Incorrect. Please try again."
        res.render('../views/login',{errors:errors2});
      }

    });
  }
}

exports.register= async function(req, res){
  const error = validationResult(req);
  if (!error.isEmpty()) {
    res.render('register',{errors:error.mapped()});
    return ;
  }
  var password = req.body.psw;
  bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
  .then(async function(hashedPassword) {
    await userObj.addUser(req.body.userId,req.body.firstName,req.body.lastName,req.body.email,
      hashedPassword,req.body.address1,req.body.address2,req.body.city,
      req.body.state,req.body.postCode,req.body.country);
      req.session.theUser = req.body.userId;
      res.redirect('/myItems')
    })
    .catch(function(error){
      console.log(error);
    });
  }

  exports.get_rate= async function(req, res){
    if(req.session.theUser ==""||req.session.theUser==undefined){
      res.render('login',{errors:"",dberror:""});
    }else{
      item = await itemObj.getItem(req.params.itemCode)
      if(item[0].status == "Available"){
        res.render('rate',{item:item[0],ownership:"own"});
      }
      else if(item[0].status == "Swapped"){
        res.render('rate',{item:item[0],ownership:"swap"});
      }
    }
  }

  exports.post_rate= async function(req, res){
    itemCode = req.params.itemCode;
    if(req.session.theUser !=""||req.session.theUser!=undefined){
      if(req.params.ownership=="own"){
        rating= req.body.ItemRating;
        await itemObj.updateItemRating(itemCode,rating);
        res.redirect('/myitems');
      }

      else if(req.params.ownership=="swap" ){
        itemRating= req.body.swappedItemRating;
        userRating=req.body.swapOwnerRating;
        const offerDetail= await offerObj.getOfferbyItemIdWant(itemCode);
        var swapperDetail = await itemObj.getItem(itemCode);
        feedbackObj.addFeedback(offerDetail._id, req.session.theUser, swapperDetail[0].userID, itemCode, userRating,itemRating);
        res.redirect('/myitems');
      }
    }
    else{
      res.send('No Page Found');
    }
  }
