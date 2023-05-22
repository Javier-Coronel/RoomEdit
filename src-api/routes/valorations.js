var express = require('express');
var router = express.Router()

var mongoose = require('mongoose');
var Valoration = require('../models/Valoration');
var Room = require('../models/Room');
var User = require('../models/User');

const { body, validationResult } = require('express-validator');
const db = mongoose.connection;
router.post('/',
  body('user')
    .exists()
    .isString(),
  body('room')
    .exists()
    .isString(),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }
    new Valoration({
        user: req.body.user,
        room: req.body.room
    }).save()
        
    //}).then(valoration => res.json(valoration));
    
    
  }
);


module.exports = router;