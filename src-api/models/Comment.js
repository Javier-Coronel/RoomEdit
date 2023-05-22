let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let Comment = require('../models/Comment.js')
let CommentSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
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
    visible:{
        type:Boolean,
        required:true,
        default:true
    },
    responseOf:{
        type:Schema.ObjectId,
        required:false,
        ref:'Comment'
    }
})
module.exports = mongoose.model('Comment', CommentSchema);