const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const Valoration = require('../models/Valoration');
const Room = require('../models/Room');
const User = require('../models/User');
const {
  body,
  validationResult
} = require('express-validator');
const db = mongoose.connection;

/**
 * Añade una valoracion.
 */
router.post('/',
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }
    User.findOne({
      name: req.body.name
    }, function (err, user) {
      if (err) res.status(500).send('¡Error comprobando el usuario!');
      if (user != null) {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (err) return next(err);
          if (isMatch) {
            Valoration.create({
              user: user._id,
              room: mongoose.Types.ObjectId(req.body.room)
            }).then(valoration => {
              res.json(valoration);
            })
          }
        });
      } else res.status(401).send({
        message: 'Usuario no encontrado'
      });
    });
  }
);
router.get('/findValoration/:name/:room',
  (req, res) => {
    User.findOne({
      name: req.params.name
    }, function (err, user) {
      if (err) res.status(500).send('¡Error comprobando el usuario!');
      if (user != null) {
        Valoration.findOne({
          user: user._id,
          room: mongoose.Types.ObjectId(req.params.room)
        }, function (err, valoration) {
          if (err) res.status(500).send(err);
          else if (valoration == null) {
            res.sendStatus(204)
          } else {
            res.json(valoration);
          }
        })
      } else res.status(401).send({
        message: 'Usuario no encontrado'
      });
    })
  })

router.get('/findByUser/:user', (req, res) => {
  User.findOne({
    name: req.params.user
  }, function (err, user) {
    if (err) res.status(500).send('¡Error comprobando el usuario!');
    if (user != null) {
      Valoration.find({
        user: user._id
      }, function (err, valorations) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200).json(valorations);
      })
    } else res.status(401).send({
      message: 'Usuario no encontrado'
    });
  })
})
router.get('/findByRoom/:room', (req, res) => {
  Valoration.find({
    room: req.params.room
  }, function (err, valorations) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200).json(valorations);
  })
})
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
    User.findOne({
      name: req.body.name
    }, function (err, user) {
      if (err) res.status(500).send('¡Error comprobando el usuario!');
      if (user != null) {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (err) return next(err);
          if (isMatch) {
            Valoration.findOneAndDelete({
              user: user._id,
              room: req.body.room
            }, function (err, valoration) {
              if (err) res.status(500).send(err);
              else res.sendStatus(200);
            });
          }
        });
      } else res.status(401).send({
        message: 'Usuario no encontrado'
      });
    });
  });

module.exports = router;