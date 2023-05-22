var express = require('express');
var router = express.Router()

var mongoose = require('mongoose');
var Room = require('../models/Room');
const { body, validationResult } = require('express-validator');
var db = mongoose.connection;
router.post('/',
  body('name')
    .exists()
    .isString()
    .isLength({min:1}),
  body('backgroundImage')
    .exists()
    .isString()
    .isLength({min:1}),
  body('images')
    .exists()
    .isArray(),
  body('originalRoom')
    .optional()
    .isObject(),
  body('roomAsImage')
    .exists()
    .isString()
    .isLength({min:1}),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }

    Room.create({
      name: req.body.name,
      backgroundImage: req.body.backgroundImage,
      images: req.body.images,
      originalRoom: req.body.originalRoom,
      roomAsImage: req.body.roomAsImage
    }).then(room => res.json(room));
  }
);


module.exports = router;