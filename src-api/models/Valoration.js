let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let User = require('../models/User.js');
let Room = require('../models/Room.js');
let ValorationSchema = new Schema({
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
    
});

module.exports = mongoose.model('Valoration', ValorationSchema);