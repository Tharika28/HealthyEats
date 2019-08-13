var item = require('../models/itemDB');
exports.categories_get  = function(req, res){
  var sessionUser = req.session.theUser;
  var subCategories = [];
  if(sessionUser){
    var differentCategories;
    var items = item.getItems();
    items.then(function(result){
      itemss = result;
      var categories = item.getCategory();
      categories.then(function(cat){
        differentCategories= cat;
        itemsName = [];

        theItem= item.getUserItems(sessionUser);
        theItem.then(function(result1){
          result1.forEach(function(individualItem){
            if(individualItem.status != 'Deleted'){
              itemsName.push(individualItem.itemName);
            }
          });
          newItems = [].concat(
            itemsName.filter(obj1 => itemss.every(obj2 => obj1 !== obj2.itemName)),
            itemss.filter(obj2 => itemsName.every(obj1 => obj2.itemName !== obj1))
          );
          res.render('../views/categories',{items:newItems,category:differentCategories});
        });
      });
    }) ;
  }else {
    var differentCategories;
    var items = item.getItems();
    items.then(function(result){
      var categories = item.getCategory();
      categories.then(function(cat){
        differentCategories= cat;
        res.render('categories', {items: result, category : differentCategories});
      });
    });

  }
}
