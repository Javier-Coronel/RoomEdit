const express = require('express');
const router = express.Router()
const path = require('path');
const multer = require("multer");
const fs = require('fs');
const unlink = require('fs/promises')
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const Valoration = require('../models/Valoration')
const Comments = require('../models/Comment')
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
 * Obtiene todas las salas y sus usuarios si estos no esta 
 * baneados ordenados por la ultima modificacion a la sala.
 */
router.get('/', (req, res) => {
  Room.find({
      roomAsImage: {
        $ne: ""
      }
    })
    .sort('-modificationDate')
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
 * Obtiene todas las salas y sus usuarios si estos no esta 
 * baneados ordenados por la cantidad de valoraciones, si
 * la sala no tiene valoraciones tampoco aparecera la sala.
 */
router.get('/sortByValorations',
  (req, res) => {

    Valoration.aggregate([{
      $group: {
        _id: "$room",
        count: {
          $sum: 1
        }
      }
    }, {
      $project: {
        room: '$_id',
        count: 1
      }
    }]).sort('-count -modificationDate').exec(function (err, valorations) {
      if (err) res.status(500).send(err);
      else {
        Room.find().exec(function (err, rooms) {
          let valoratedRoomsIds = valorations.map((i) => i.room._id.valueOf())
          rooms.forEach(element => {
            if (!valoratedRoomsIds.includes(element._id.valueOf())) valorations.push({
              _id: new mongoose.Types.ObjectId(),
              room: element._id,
              count: 0
            })
          });
          Room.populate(valorations, {
            path: "room",
            match: {
              roomAsImage: {
                $ne: ""
              }
            }
          }, (err, valorations) => {
            if (err) res.status(500).send(err);
            else {
              User.populate(valorations, {
                path: 'room.userId',
                match: {
                  banned: false
                }
              }, (err, valorations) => {
                if (err) res.status(500).send(err);
                else res.status(200).json(valorations.filter((valoration) => valoration.room.roomAsImage != "" && valoration.room.userId))
              })
            }
          })
        })
      }
    })
  });

/**
 * Obtiene todas las salas y sus usuarios si estos no esta 
 * baneados ordenados por la cantidad de comentarios, si
 * la sala no tiene comentarios tampoco aparecera la sala.
 */
router.get('/sortByComments',
  (req, res) => {
    Comments.aggregate([{
      $group: {
        _id: "$room",
        count: {
          $sum: 1
        }
      }
    }, {
      $project: {
        room: '$_id',
        count: 1
      }
    }]).sort('-count -modificationDate').exec(function (err, comments) {
      if (err) res.status(500).send(err);
      else {
        Room.find().exec(function (err, rooms) {
          let commentedRoomsIds = comments.map((i) => i.room._id.valueOf())
          rooms.forEach(element => {
            if (!commentedRoomsIds.includes(element._id.valueOf())) comments.push({
              _id: new mongoose.Types.ObjectId(),
              room: element._id,
              count: 0
            })
          });
          Room.populate(comments, {
            path: "room",
            match: {
              roomAsImage: {
                $ne: ""
              }
            }
          }, (err, comments) => {
            if (err) res.status(500).send(err);
            else {
              console.log(comments)
              User.populate(comments, {
                path: 'room.userId',
                match: {
                  banned: false
                }
              }, (err, comments) => {
                if (err) res.status(500).send(err);
                else res.status(200).json(comments.filter((comment) => comment.room.roomAsImage != "" && comment.room.userId))
              })
            }
          })
        })
      }
    })
  });

/**
 * Obtiene los comentarios que han sido reportados.
 */
router.get('/reportedRooms', function (req, res, next) {
  Room.find({
      reported: {
        $gt: 0
      }
    })
    .sort('-reported')
    .populate({
      path: 'userId'
    })
    .exec(function (err, rooms) {
      if (err) res.status(500).send(err);
      else res.status(200).json(rooms);
    })
})

/**
 * Actualiza una sala con los datos dados.
 */
router.post('/updateRoom', upload.single("image"),
  (req, res) => {
    console.log(req.body.images.length)
    Room.findByIdAndUpdate(req.body.roomcode, {
      backgroundColor: req.body.BackgroudColor,
      images: req.body.images.length == 1 ? [] : JSON.parse(req.body.images),
      roomAsImage: req.file.filename,
      modificationDate: Date.now(),
      $unset: {
        originalRoom: 1
      }
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
  body('name')
  .exists()
  .isString(),
  async (req, res) => {
    User.findOne({
      name: req.body.name
    }).exec(function (err, user) {
      if (err) res.status(500).send(err);
      else Room.findById(
        req.body.copiedRoom
      ).exec(async function (err, copiedRoom) {
        if (err) res.status(500).send(err);
        else Room.findOneAndUpdate({
          userId: user._id
        }, {
          backgroundColor: copiedRoom.backgroundColor,
          images: copiedRoom.images,
          roomAsImage: copiedRoom.roomAsImage,
          name: "Copia de " + copiedRoom.name,
          originalRoom: copiedRoom._id,
          modificationDate: copiedRoom.modificationDate
        }).exec(async function (err, copyOfRoom) {
          if (err) res.status(500).send(err)
          else {
            fs.copyFile("./public/rooms/" + copiedRoom.roomAsImage, "./public/rooms/" + copyOfRoom._id + ".png", (err) => {
              if (err) res.status(500).send(err)
              else res.status(200).json(copyOfRoom);
            })
          }
        })
      })
    })
  })

/**
 * Cambia el nombre de una sala.
 */
router.put('/renameRoom',
  body('id')
  .exists()
  .isString(),
  body('name')
  .exists()
  .isString(),
  function (req, res, next) {
    console.log(req.body.id)
    console.log(req.body.name)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }
    Room.findByIdAndUpdate(req.body.id,{
      name:req.body.name
    }).exec(function (err, room) {
      if (err) res.status(500).send(err);
      else res.status(200).json(room);
    })
  })

/**
 * Reporta una sala.
 */
router.put('/reportRoom',
  body('id')
  .exists()
  .isString(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }
    Room.findByIdAndUpdate(req.body.id, {
      $inc: {
        reported: 1
      }
    }).exec(function (err, room) {
      if (err) res.status(500).send(err);
      else res.status(200).json(room);
    })
  }
)

/**
 * Elimina los reportes de una sala.
 */
router.put('/unReportRoom',
  body('id')
  .exists()
  .isString(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }
    Room.findByIdAndUpdate(req.body.id, {
      reported: 0
    }).exec(function (err, room) {
      if (err) res.status(500).send(err);
      else res.status(200).json(room);
    })
  })

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
      },
      reported: 0
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