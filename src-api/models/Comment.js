let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let Comment = require('../models/Comment.js');
let CommentSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        required:true,
        ref:'User'
    },
    room:{
        type:Schema.ObjectId,
        required:true,
        ref:'Room'
    },
    content:{
        type:String,
        required:true
    },
    dateOfCreation:{
        type:Date,
        required:true,
        default:Date.now
    },
    reported:{
        type:Number,
        required:true,
        default:0
    }
});

module.exports = mongoose.model('Comment', CommentSchema);