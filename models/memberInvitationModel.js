const mongoose = require('mongoose');

const memberInvitationSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: [true, 'Una invitación debe provenir de una organización']
      },
    email:{
        type: String,
        validate: [validator.isEmail, 'Por favor, ingrese un correo electrónico válido.'],
        required: [true, 'Una invitación debe ir dirigida a una persona']
    },
    token: {
        type: String,
        unique: true,
        required: [true, 'Una invitación debe contener un token']
    },
    invitedRole: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        required: [true, 'No puedes invitar a una persona sin un rol'],
    },
    expirationDate: Date
});

memberInvitationSchema.methods.createToken = function () {

    const invToken = crypto.randomBytes(32).toString('hex'); // create
    this.token = crypto.createHash('sha256').update(invToken).digest('hex'); // saved the encripted token  
    //Converting to miliseconds. token will expire in 5h
    this.expirationDate = Date.now() + 48 * 60 * 60 * 1000;
    return invToken;

  };

memberInvitationSchema.pre('save', async function (next) { 
    this.email = await bcrypt.hash(this.email, 12); // encrypt user/target email for privacy
    next();
  });

const invitation = mongoose.model('MemberInvitation', offerSchema);

module.exports = invitation;
