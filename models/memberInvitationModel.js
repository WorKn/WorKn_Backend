const mongoose = require('mongoose');

const memberInvitationSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: [true, 'Una invitación debe provenir de una organización']
      },
    email:{
        type: String,
        validate: [validator.isEmail, 'Correo electrónico no válido, por favor, ingrese otro'],
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
    expirationDate:{
        type: Date,
        required: [true, 'Por motivos de seguridad, una invitación no puede permanecer abierta indefinidamente'],
    }
});

memberInvitationSchema.methods.createToken = function () {

    const invToken = crypto.randomBytes(32).toString('hex'); // create
    this.token = crypto.createHash('sha256').update(invToken).digest('hex'); // saved the encripted token
  
    //Converting to miliseconds. token will expire in 5h
    this.expirationDate = Date.now() + 5 * 60 * 60 * 1000;
    return invToken;

  };

memberInvitationSchema.pre('save', async function (next) { 
    this.email = await bcrypt.hash(this.email, 12); // encrypt user/target email for privacy
    this.organization = await bcrypt.hash(this.organization, 12); // encrypt organization/source email for privacy
    next();
  });

const invitation = mongoose.model('MemberInvitation', offerSchema);

module.exports = invitation;
