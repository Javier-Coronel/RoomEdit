let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let Image = require('../models/Image.js');
let RoomSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true
    },
    backgroundImage:{
        type:String,
        required:true,
        default:""
    },
    images:[{
        posX:String,
        posY:String,
        url:String
    }],
    NValorations:{
        type:Number,
        required:true,
        default:0
    },
    NComments:{
        type:Number,
        required:true,
        default:0
    },
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
        required:true
    }
}) 
module.exports = mongoose.model('Room', RoomSchema);