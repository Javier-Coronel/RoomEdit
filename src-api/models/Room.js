let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let Image = require('../models/Image.js');
let RoomSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        required:true,
        ref:'User'
    },
    name:{
        type:String,
        required:false,
        default:""
    },
    backgroundColor:{
        type:String,
        required:true,
        default:"#000000"
    },
    images:[{
        posX:String,
        posY:String,
        url:String
    }],
    modificationDate:{
        type:Date,
        required:true,
        default:Date.now
    },
    originalRoom:{
        type:Schema.ObjectId,
        required:false,
        ref: 'Room'
    },
    roomAsImage:{
        type:String,
        required:false,
        default:""
    },
    reported:{
        type:Number,
        required:true,
        default:0
    }
});

module.exports = mongoose.model('Room', RoomSchema);