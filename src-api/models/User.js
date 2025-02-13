let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcryptjs');
let SALT_WORK_FACTOR = 10;
let UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique : true
    },
    code: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['User', 'Mod', 'Admin'],
        default: 'User'
    },
    banned: {
        type: Boolean,
        required: true,
        default: false
    }
})


UserSchema.pre(['save', 'update', 'updateOne', 'findOneAndUpdate'], function (next) {
    var user = this;
    console.log(user);
    try {
        console.log(user.password);
        // solo aplica una función hash al password si ha sido modificado (o es nuevo)
        if (!user.isModified('password ')) return next();
        // genera la salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);
            // aplica una función hash al password usando la nueva salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                // sobrescribe el password escrito con el “hasheado”
                user.password = hash;
                next();
            });
        });
    } catch (E) {
        console.log(user);
        // solo aplica una función hash al password si ha sido modificado (o es nuevo)
        if (!user._update.password) return next();
        // genera la salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);
            // aplica una función hash al password usando la nueva salt
            bcrypt.hash(user._update.password, salt, function (err, hash) {
                if (err) return next(err);
                // sobrescribe el password escrito con el “hasheado”
                user._update.password = hash;
                next();
            });
        });
    }
});
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema)