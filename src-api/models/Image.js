let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ImageSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
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
});

module.exports = mongoose.model('Image', ImageSchema);