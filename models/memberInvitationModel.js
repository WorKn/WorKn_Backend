const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const memberInvitationSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: [true, 'Una invitación debe provenir de una organización.']
      },
    email:{
        type: String,
        //validate: [validator.isEmail, 'Por favor, ingrese un correo electrónico válido.'],
        required: [true, 'Una invitación debe ir dirigida a una persona.']
    },
    token: {
        type: String,
        unique: true,
        required: [true]
    },
    invitedRole: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        required: [true, 'No puedes invitar a una persona sin un rol.'],
    },
    expirationDate: Date
});

memberInvitationSchema.pre('save', function (next) {
    this.token = crypto.createHash('sha256').update(this.token).digest('hex'); // saved the encripted token  
    //Converting to miliseconds. token will expire in 48h
    this.expirationDate = Date.now() + 48 * 60 * 60 * 1000;
    next();
  });

memberInvitationSchema.pre('save', async function (next) { 
    this.email = crypto.createHash('sha256').update(this.email).digest('hex') // encrypt user/target email for privacy
    next();
  });

memberInvitationSchema.methods.validateToken = async function (candidateToken) {
    encryptedIncomming = crypto.createHash('sha256').update(candidateToken).digest('hex');
    result = false;
    if(encryptedIncomming == this.token){
        result = true;
    }
    return result;
};
const MemberInvitation = mongoose.model('MemberInvitation', memberInvitationSchema);

module.exports = MemberInvitation;
