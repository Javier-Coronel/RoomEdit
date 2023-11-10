const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment')
const Room = require('../models/Room');
const User = require('../models/User');
const {
    body,
    validationResult
} = require('express-validator');
const db = mongoose.connection;

/**
 * Añade un comentario.
 */
router.post('/',
    body('user')
    .exists()
    .isString()
    .isLength({
        min: 1
    }),
    body('content')
    .exists()
    .isString()
    .isLength({
        min: 1
    }),
    body('room')
    .exists()
    .isString()
    .isLength({
        min: 1
    })
    /*,
        body('password')
        .exists()
        .isString()
        .isLength()*/
    ,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        let userCode;
        User.findOne({
            name: req.body.user
        }).exec((a, v) => {
            console.log(v._id.toString());
            userCode = v._id.toString();
            console.log("user" + req.body.user + "usercode" + userCode + "content" + req.body.content + "room" + req.body.room)

            Comment.create({
                user: userCode,
                content: req.body.content,
                room: req.body.room
            }).then(comment => res.json(comment))
        });

    }

)

/**
 * Obtiene todos los comentarios de una sala mediante su id.
 */
router.get('/roomid/:id', function (req, res, next) {
    console.log(req.params.id)
    Comment.find({
            room: mongoose.Types.ObjectId(req.params.id)
        })
        .sort('dateOfCreation')
        .populate({
            path: 'user',
            match: {
                banned: false
            }
        })
        .find()
        .exec(function (err, comments) {
            if (err) res.status(500).send(err);
            else res.status(200).json(comments.filter((comment) => comment.user));
        })
});

/**
 * Obtiene todos los comentarios de un usuario mediante su id.
 */
router.get('/userid/:id', function (req, res, next) {
    console.log(req.params.id)
    Comment.find({
        user: mongoose.Types.ObjectId(req.params.id)
    }).sort('dateOfCreation').populate('user').exec(function (err, comments) {
        if (err) res.status(500).send(err);
        else res.status(200).json(comments);
    })
});

/**
 * Obtiene todos los comentarios de una sala mediante
 * el nombre del usuario que tiene esa sala.
 */
router.get('/roomofuser/:name', function (req, res, next) {
    User.findOne({
        name: req.params.name
    }).exec(function (err, user) {
        Room.findOne({
            userId: user._id
        }).exec(function (err, room) {
            if (err) res.status(500).send(err);
            else {
                Comment.find({
                        room: room._id
                    })
                    .sort('dateOfCreation')
                    .populate({
                        path: 'user',
                        match: {
                            banned: false
                        }
                    }).exec(function (err, comments) {
                        if (err) res.status(500).send(err);
                        else res.status(200).json(comments.filter((comment) => comment.user));
                    })
            }
        })
    })
});

/**
 * Obtiene los comentarios que han sido reportados.
 */
router.get('/reportedComments', function (req, res, next) {
    Comment.find({
            reported: {
                $gt: 0
            }
        })
        .sort('-reported')
        .populate({
            path: 'user'
        })
        .exec(function (err, comments) {
            if (err) res.status(500).send(err);
            else res.status(200).json(comments);
        })
})

/**
 * Reporta un comentario.
 */
router.put('/reportComment',
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
        Comment.findByIdAndUpdate(req.body.id, {
            $inc: {
                reported: 1
            }
        }).exec(function (err, comment) {
            if (err) res.status(500).send(err);
            else res.status(200).json(comment);
        })
    }
)

/**
 * Elimina los reportes de un comentario.
 */
router.put('/unReportComment',
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
        Comment.findByIdAndUpdate(req.body.id, {
            reported: 0
        }).exec(function (err, comment) {
            if (err) res.status(500).send(err);
            else res.status(200).json(comment);
        })
    }
)

/**
 * Elimina un comentario pasando el id del comentario.
 */
router.delete('/',
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
        console.log(req.body.id)
        Comment.findByIdAndDelete(req.body.id).exec(function (err, comment) {
            if (err) res.status(500).send(err);
            else res.status(200).json(comment);
        })
    }
)
module.exports = router;