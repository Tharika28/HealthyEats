var express = require('express');
var app=express();
var itemObj = require('../models/itemDB');
var bodyParser = require('body-parser');
var session= require('express-session');
var urlencodeParser=bodyParser.urlencoded({extended:false});
var profile_controller = require(process.cwd()+'/controllers/profileController');
var catalog_controller = require(process.cwd()+'/controllers/catalogController');
var userObj = require('./../models/userDB');
var offerObj = require('./../models/offerDB');
const { check, validationResult} = require('express-validator/check');

app.set('view engine','ejs');
app.use('/resources',express.static('resources'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  res.locals.user = req.session.theUser;
  next();
});

app.get('/',function(req,res){
  res.render('../views/index');
});

app.get('/index',function(req,res){
  res.render('../views/index');
});

app.get('/about',function(req,res){
  res.render('../views/about');
});
app.get('/categories', catalog_controller.categories_get);

app.get('/categories/:catalogCategory',function(req,res){
  var catalogCategory1 =[];
  var reqCategory = req.params.catalogCategory;
  if(reqCategory != "undefined"){
    var category = itemObj.getCategory();
    category.then(function(cat){
      if(cat.includes(reqCategory)){
        catalogCategory1.push(reqCategory);
        var items = itemObj.getCategory(reqCategory);
        res.render('../views/categories',{items:items,category:catalogCategory1});
      }else{
        res.redirect("/categories");
      }
    })
  }else{
    res.redirect("/categories");
  }
});

app.get('/contact',function(req,res){
  res.render('../views/contact');
});


app.get('/item',function(req,res){
  res.redirect("/categories");
});

app.get('/item/:itemCode',profile_controller.item);

app.get('/mySwaps', profile_controller.mySwaps );
app.get('/mySwaps/:action/:theItem', profile_controller.mySwaps );

app.get('/myItems', profile_controller.profile_get);
app.get('/myItems/:action/:itemCode',profile_controller.profile_get);

app.post('/myItems', profile_controller.profile_get);
app.post('/myItems/:action/:itemCode',urlencodeParser,profile_controller.profile_get);

app.get('/swap/:itemCode', profile_controller.swap );

app.get('/login',function(req,res){
  var errors;
  res.render('../views/login',{errors:errors});
});

app.get('/logout',function(req,res){
  req.session.destroy();
  res.redirect('login')
});

app.post('/login',urlencodeParser,
[
  check('email').trim().isEmail().withMessage('Email Id is not valid')
], profile_controller.login);

app.get('/register', function(req, res){
  res.render('register',{errors:""});
});

app.post('/register',urlencodeParser,
check('firstName','Error').trim().isAlpha().withMessage('First Name should only contain alphabets'),
check('lastName').trim().isAlpha().withMessage('Last Name should only contain alphabets'),
check('email')
.isEmail().withMessage('Please enter a valid email address')
.trim()
.normalizeEmail()
.custom(value => {
  return userObj.getUserProfileByEmail1(value).then(User => {
  })
}),
check('userId')
.trim()
.custom(value => {
  return userObj.getUserById(value).then(User => {
  })
}),
check('city').trim().matches("[a-zA-Z\s]").withMessage('City should only contain alphabets'),
check('state').trim().matches("[a-zA-Z\s]").withMessage('State should only contain alphabets'),
check('postCode').trim().isNumeric().isLength(5).withMessage('Postcode should be valid zipcode'),
check('country').trim().matches("[a-zA-Z\s]").withMessage('Country should only contain alphabets'),
profile_controller.register);

app.get('/rate/:itemCode', profile_controller.get_rate);
app.post('/rate/:ownership/:itemCode',urlencodeParser,profile_controller.post_rate);


app.get('/*', function(req, res){
  res.send('404 ERROR : OOPS ! Page Not Found');
});

app.listen(8080);
