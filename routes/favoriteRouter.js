var express = require('express');
var authenticate = require('../authenticate');
const bodyParser = require('body-parser');
var Favorites = require('../models/favorite');

const FavoriteRouter = express.Router();
FavoriteRouter.use(bodyParser.json());

FavoriteRouter.route('/')
.get(authenticate.verifyUser,(req,res,next) => {
    Favorites.find({})
    .populate('dishes') 
    .populate('user')
   
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,  (req, res, next) => {
    Favorites.findOne({"user": req.user._id})    
    .then((favorite) => {
        if(favorite === null){
            favorite = new Favorites({"user":req.user._id });
        }
        for (var i = 0; i < req.body.length; i++) {
          console.log(req.body[i]); 
          if (!favorite.dishes.some((dish) =>{ return dish.equals(req.body[i]._id)}))
            favorite.dishes.push(req.body[i]);   
        }
        
        favorite.save()
        .then((favorite) => {
               
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                       
            }, (err) => next(err));
       
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,  (req, res, next) => {
     Favorites.findOne({"user":req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            favorite.dishes = []          
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Delete dishes error');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));   
})


FavoriteRouter.route('/:dishid')
.post(authenticate.verifyUser,  (req, res, next) => {
    Favorites.findOne({"user": req.user._id})    
    .then((favorite) => {
        if(favorite === null){
            favorite = new Favorites({"user":req.user._id });
        }
        
        if (!favorite.dishes.some((dish) =>{ return dish.equals(req.params.dishid)}))
            favorite.dishes.push({"_id": req.params.dishid});       
        
        favorite.save()
        .then((favorite) => {
               
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                       
            }, (err) => next(err));
       
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,  (req, res, next) => {
     Favorites.findOne({"user":req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            for (var i = 0; i < favorite.dishes.length; i++) {
              if (favorite.dishes[i].equals(req.params.dishid))
                    favorite.dishes.splice(i,1)
            }      
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Delete dishes error');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));   
})

module.exports = FavoriteRouter;