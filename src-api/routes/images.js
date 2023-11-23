const express = require('express');
const router = express.Router()
const multer = require("multer");
const path = require('path');
const mongoose = require('mongoose');
const Image = require('../models/Image')
const User = require('../models/User');
const {body, validationResult} = require('express-validator');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/../public/images/'))
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const multi_upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            console.log(file.mimetype)
            cb(null, false);
            const err = new Error('Only .png, .jpeg and .jpg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    }
}).array('files');

/**
 * Añade una imagen.
 */
router.post('/', 
    body('user')
    .exists()
    .isLength({min:1}), 
    (req, res) => {
    multi_upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            if (err.name == 'ExtensionError') {
                res.status(413).send({ error: { message: err.message } }).end();
            } else {
                res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
            }
            return;
        }
        let userCode;
        User.findOne({name: req.body.user}).exec((a,v)=>{
            console.log( v._id.toString());
            userCode =v._id.toString();
            
            for (const element of req.files) {
                console.log(element.filename)
                Image.create({
                    name:element.filename,
                    code:element.filename,
                    adminOfUpload:userCode
                })
            }
            
        });

        // Everything went fine.
        // show file `req.files`
        // show body `req.body`
        res.status(200).end('Your files uploaded.');
    })
});

/**
 * Obtiene todas imagenes ordenadas por su nombre.
 */
router.get('/', function (req, res, next) {
    Image.find().sort('name').exec(function(err, images){
        if(err) res.status(500).send(err);
        else{ 
            res.status(200).json(images)
        }
    })
})

/**
 * Obtiene los nombres de las imagenes accesibles ordenadas por su nombre.
 */
router.get('/names', function (req, res, next) {
    Image.find({access:true}).sort('name').select({'name':1,'_id':0}).exec(function(err, images){
        if(err) res.status(500).send(err);
        else{ 
            res.status(200).json(images)
        }
    })
})

/**
 * Actualiza el estado de acceso a una imagen.
 */
router.put("/changeAccess",
    body("id")
    .exists()
    .isString(),
    body("access")
    .exists()
    .isBoolean(),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array()
          })
        }
        Image.findByIdAndUpdate(req.body.id, {
            access: req.body.access
          }, function (err, image) {
            if (err) res.status(500).send(err);
            else res.status(200).json(image);
        });
    }
)

module.exports = router;