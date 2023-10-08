const express = require('express');
const router = express.Router()
const path = require('path');
const multer = require("multer");
const fs = require('fs');
const unlink = require('fs/promises')
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const {
  body,
  validationResult
} = require('express-validator');
const db = mongoose.connection;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/../public/rooms/'))
  },
  filename: function (req, file, cb) {
    cb(null, req.body.roomcode + ".png")
  }
});
const upload = multer({
  storage: storage
})

/**
 * Obtiene todas las salas y sus usuarios si estos no esta baneados
 */
router.get('/', (req, res) => {
  Room.find({
      roomAsImage: {
        $ne: ""
      }
    })
    .sort('modificationDate')
    .populate({
      path: 'userId',
      match: {
        banned: false
      }
    })
    .exec(function (err, rooms) {
      if (err) res.status(500).send(err);
      else res.status(200).json(rooms.filter((room) => room.userId))
    });
});

/**
 * Busca una sala y obtiene todos sus datos por el nombre de su usuario.
 */
router.get('/getAllDataByUser/:name', (req, res) => {
  User.findOne({
    name: req.params.name
  }).exec(function (err, user) {
    Room.findOne({
      userId: user._id
    }).exec(function (err, room) {
      if (err) res.status(500).send(err);
      else {
        try {
          res.status(200).json(room);
        } catch (error) {
          res.status(500).send(err);
        }
      }
    })
  })
});

/**
 * Busca una sala y obtiene su id por el nombre de su usuario.
 */
router.get('/searchByUser/:name',
  (req, res) => {
    User.findOne({
      name: req.params.name
    }).exec(function (err, user) {
      Room.findOne({
        userId: user._id
      }).exec(function (err, room) {
        if (err) res.status(500).send(err);
        else {
          try {
            res.status(200).json(room._id);
          } catch (error) {
            res.status(500).send(err);
          }
        }
      })
    })
  }
);

/**
 * Obtiene las imagenes y el color de una sala
 * a partir de su id.
 */
router.get('/userRoom/:id',
  (req, res) => {
    Room.findById(req.params.id, function (err, room) {
      if (err) {
        res.status(500).send(err)
      } else res.status(200).json({
        "Imagenes": room.images,
        "Color": room.backgroundColor
      });
    })
  }
)

/**
 * Actualiza una sala con los datos dados.
 */
router.post('/updateRoom', upload.single("image"),
  (req, res) => {
    console.log(req.body.images.length)
    Room.findByIdAndUpdate(req.body.roomcode, {
      backgroundColor: req.body.BackgroudColor,
      images: req.body.images.length == 1 ? [] : JSON.parse(req.body.images),
      roomAsImage: req.file.filename
    }, function (err, room) {
      if (err) {
        res.status(500).send(err)
      } else res.status(200).json(room);
    })
  }
)

/**
 * Copia la sala pasada en el body a la sala 
 * del usuario que se ha pasado en el body.
 */
router.put('/copyRoom',
body('copiedRoom')
.exists()
.isString(),
body(''))

/**
 * Elimina todos los datos de la sala pasada,
 * no elimina literalmente la sala sino que 
 * pone todos los datos por los que se puede
 * detectar una sala a nada o a un valor predeterminado.
 */
router.delete('/',
  body('id')
  .exists()
  .isObject(),
  async (req, res) => {
    Room.findOneAndUpdate({
      'id': req.params.id
    }, {
      backgroundColor: "#000000",
      images: [],
      roomAsImage: "",
      name: "",
      $unset: {
        originalRoom: 1
      }
    }, async function (err, roominfo) {
      if (err) res.status(500).send(err);
      else {
        console.log(roominfo.roomAsImage)
        try {
          await fs.unlink("./public/rooms/" + roominfo.roomAsImage, (err) => {
            if (err) throw err;
          })
        } catch (error) {
          console.log(error.message)
        }

        res.sendStatus(200).roominfo;
      }
    });
  });


module.exports = router;