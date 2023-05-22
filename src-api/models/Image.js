let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ImageSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    numberOfStates:{
        type:Number,
        required:true,
        default:0
    },
    states:[{
        type:String
    }],
    adminOfUpload:{
        type:Schema.ObjectId,
        required:true,
        ref:'User'
    },
    access:{
        type:Boolean,
        required:true,
        default:true
    }
})
module.exports = mongoose.model('Image', ImageSchema);