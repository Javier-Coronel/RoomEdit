let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let ValorationSchema = new Schema({
    id:mongoose.Schema.Types.ObjectId,
    user:{
        type:Schema.ObjectId,
        required:true,
        ref:'User'
    },
    room:{
        type:Schema.ObjectId,
        required:true,
        ref:'Room',
        validate: {
            validator: async function(roomId) {
              const valorationCount = await this.constructor.countDocuments({ user: this.user, room: roomId });
              return valorationCount === 0;
            },
            message: 'El usuario ya ha valorado esta habitación.'
          }
    }
    
})

//ValorationSchema.index({user:1,room:1},{unique:true});
module.exports = mongoose.model('Valoration', ValorationSchema);