const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const {
  body,
  validationResult
} = require('express-validator');
const db = mongoose.connection;

/**
 * Añade a un usuario.
 */
router.post('/',
  body('name')
  .exists()
  .isString(),
  body('password')
  .exists()
  .isString(),
  body('confirmPassword')
  .exists()
  .isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() && req.body.password != req.body.confirmPassword) {
      return res.status(400).json({
        errors: errors.array()
      })
    }
    User.findOne({name:req.body.name}).then(user=>{
      if(user){
        res.status(400).json("Duplicated user")
      }
      else{
        User.create({
          name: req.body.name,
          code: req.body.name,
          password: req.body.password
        }).then(user => {
          Room.create({
            userId: user._id,
            name:"",
            images:[],
            roomAsImage:""
          }).then()
          res.json(user)
        });
      }
    })
    
  }
);

/**
 * Busca a todos los usuarios.
 */
router.get('/', function (req, res, next) {
  User.find().sort('name').exec(function (err, users) {
    if (err) res.status(500).send(err);
    else res.status(200).json(users);
  })
});

/**
 * Busca a todos los usuarios que tengan en el nombre el dato pasado.
 */
router.get('/searchByName/:name', function (req, res, next) {
  User.find({
    name: new RegExp(req.params.name, "i")
  }).sort('name').exec(function (err, users) {
    if (err) res.status(500).send(err);
    else res.status(200).json(users);
  })
});

/**
 * Busca a un usuario por su codigo.
 */
router.get('/searchByCode/:code', function (req, res, next) {
  User.findOne({
    code: req.params.code
  }).exec(function (err, user) {
    if (err) res.status(500).send(err);
    else res.status(200).json(user);
  })
});

/**
 * Actualiza el tipo de usuario de un usuario.
 */
router.put('/changeTypeOfUser',
  body('id')
  .exists()
  .isString(),
  body('type')
  .exists()
  .isString(),
  body('adminPassword')
  //.exists()
  .isString(),
  (req, res) => {
    User.findByIdAndUpdate(req.body.id, {
      type: req.body.type
    }, function (err, user) {
      if (err) res.status(500).send(err);
      else res.status(200).json(user);
    });
  }
);

/**
 * Actualiza el estado de baneo de un usuario.
 */
router.put('/changeBanningOfUser',
  body('id')
  .exists()
  .isString(),
  body('banned')
  .exists()
  .isBoolean(),
  body('adminPassword')
  //.exists()
  .isString(),
  (req, res) => {
    User.findByIdAndUpdate(req.body.id, {
      banned: req.body.banned
    }, function (err, user) {
      if (err) res.status(500).send(err);
      else res.status(200).json(user);
    });
  }
);

/**
 * Actualiza la contraseña de un usuario.
 */
router.put('/changePassword',
  body('code')
  .exists()
  .isString(),
  body('actualPassword')
  .exists()
  .isString(),
  body('password')
  .exists()
  .isString(),
  body('confirmPassword')
  .exists()
  .isString(),
  (req, res) => {
    User.findOne({
      code: req.body.code
    }, function (err, user) {
      if (user != null && req.body.password == req.body.confirmPassword) {
        console.log("usuario encontrado")
        user.comparePassword(req.body.actualPassword, function (err, isMatch) {
          if (err) return next(err);
          if (isMatch){
            console.log("asd")
            User.findOneAndUpdate({
              code: req.body.code
            }, {
              password: req.body.password
            }, function (err, user) {
              if (err) res.status(500).send(err);
              else {
                console.log("Usuario actualizado")
                res.status(200).json(user);
              }
            });}
          else
            res.status(200).send({
              message: 'La contraseña no coincide'
            });
        });
      }
    })

  }
);

/**
 * Comprueba una contraseña de un usuario.
 */
router.post('/signin', function (req, res, next) {
  User.findOne({
    name: req.body.name
  }, function (err, user) {
    if (err) res.status(500).send('¡Error comprobando el usuario!');
    if (user != null) {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) return next(err);
        if (isMatch)
          res.status(200).send({
            message: 'Ok'
          });
        else
          res.status(200).send({
            message: 'La contraseña no coincide'
          });
      });
    } else res.status(401).send({
      message: 'Usuario no registrado'
    });
  });
});

module.exports = router;