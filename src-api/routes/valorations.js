const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const Valoration = require('../models/Valoration');
const Room = require('../models/Room');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const db = mongoose.connection;

/**
 * Añade una valoracion.
 */
router.post('/',
  body('user')
    .exists()
    .isString(),
  body('room')
    .exists()
    .isString(),
  body('password')
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

/**
 * Elimina una valoracion de un usuario a una sala.
 */
router.delete('/',
  body('name')
    .exists()
    .isString(),
  body('room')
    .exists()
    .isString(),
  body('password')
    .exists()
    .isString(),
  (req, res) => {
    User.findOne({ name: req.body.name }, function(err, user) {
      if (err) res.status(500).send('¡Error comprobando el usuario!');
      if (user != null) {
        user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) return next(err);
        if (isMatch){
          Valoration.findOneAndDelete({user:req.body.name, room:req.body.room}, function (err, albums) {
            if(err)res.status(500).send(err);
            else res.sendStatus(200);
          });
        }});
      } else res.status(401).send({ message: 'Usuario no encontrado'});
    });
});

module.exports = router;