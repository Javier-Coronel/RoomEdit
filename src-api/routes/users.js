const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const db = mongoose.connection;
router.post('/',
  body('name')
    .exists()
    .isString(),
  body('email', "Este campo debe ser un email")
    .exists()
    .isEmail(),
  body('password')
    .exists()
    .isString(),
  body('confirmPassword')
    .exists()
    .isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() && req.body.password != req.body.confirmPassword){
      return res.status(400).json({errors: errors.array()})
    }

    User.create({
      name: req.body.name,
      email: req.body.email,
      code: req.body.name,
      password: req.body.password
    }).then(user => res.json(user));
  }
);

router.post('/signin', function(req, res, next) {
  User.findOne({ name: req.body.name }, function(err, user) {
    if (err) res.status(500).send('¡Error comprobando el usuario!');
    if (user != null) {
      user.comparePassword(req.body.password, function(err, isMatch) {
      if (err) return next(err);
      if (isMatch)
        res.status(200).send({ message: 'Ok'});
      else
        res.status(200).send({ message: 'La contraseña no coincide' });
      });
    } else res.status(401).send({ message: 'Usuario no registrado'});
  });
});

module.exports = router;