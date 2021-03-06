const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const getClientHost = require('../utils/getClientHost');
const AppError = require('./../utils/appError');
const Email = require('../utils/email');

// const locationSchema = require('../schemas/locationSchema');
const tagSchema = require('../schemas/sharedTagSchema');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, provea su nombre.'],
    },
    lastname: {
      type: String,
      required: [true, 'Por favor, provea su apellido.'],
    },
    bio: {
      type: String,
      maxlength: 3000,
    },
    identificationNumber: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
      validate: [
        {
          validator: validator.isNumeric,
          message: 'El número de identificación debe poseer solo caracteres numéricos.',
        },
        {
          validator: function (el) {
            return el.length == 11;
          },
          message: 'El número de identificación debe poseer 11 dígitos.',
        },
      ],
    },
    phone: {
      type: String,
      select: false,
      validate: [
        validator.isNumeric,
        'El número telefónico debe poseer solo caracteres numéricos.',
      ],
    },
    email: {
      type: String,
      required: [true, 'Por favor, provea su correo electrónico.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Por favor, ingrese un correo electrónico válido.'],
    },
    birthday: {
      type: Date,
      max: function () {
        let maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 16);
        return maxDate;
      },
      required: [true, 'Por favor, ingrese su fecha de nacimiento.'],
    },
    chats: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Chat',
        },
      ],
      select: false,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    // location: {
    //   type: locationSchema,
    //   select: false,
    // },
    location: {
      type: String,
      maxlength: 3000,
      select: false,
    },
    password: {
      type: String,
      required: [true, 'Por favor, provea una contraseña.'],
      minlength: [8, 'Las contraseñas deben poseer como mínimos 8 caracteres.'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Por favor, confirme su contraseña.'],
      validate: {
        //This only works on Create() and Save()
        validator: function (el) {
          return el === this.password;
        },
        message: 'Las contraseñas no son iguales.',
      },
    },
    passwordChangedAt: Date,
    tokens: {
      type: [
        {
          tokenType: {
            type: String,
            enum: ['email', 'password'],
            required: true,
          },
          token: {
            type: String,
            required: true,
          },
          expireDate: {
            type: Date,
          },
          _id: false,
        },
      ],
      select: false,
    },
    isEmailValidated: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    userType: {
      type: String,
      enum: ['offerer', 'applicant', 'admin'],
      required: [true, 'Se requiere el tipo de usuario.'],
    },
    signUpMethod: {
      type: String,
      enum: ['workn', 'google'],
      default: 'workn',
    },
    organization: {
      type: mongoose.Schema.ObjectId,
      ref: 'Organization',
    },
    organizationRole: {
      type: String,
      enum: ['owner', 'supervisor', 'member'],
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    profilePicture: {
      type: String,
      default:
        'https://res.cloudinary.com/workn/image/upload/v1599076826/resources/blank-profile-picture_lvbhnr.png',
    },
    tags: {
      type: [tagSchema],
      //This is for preventing mongoose to create an empty array by default.
      default: void 0,
      validate: [
        {
          validator: function (el) {
            return el.length < 11;
          },
          message: 'La cantidad máxima de tags que se puede seleccionar es 10.',
        },
        {
          validator: function (el) {
            return el.length > 2;
          },
          message: 'La cantidad mínima de tags que se puede seleccionar es 3.',
        },
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('isSignupCompleted').get(function () {
  if (this.userType === 'offerer') return true;
  else if (this.userType === 'applicant') {
    return this.category != undefined && this.tags != undefined;
  }
});

userSchema.pre('save', async function (next) {
  //If password have not been modified, do not execute this function
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

//When the user modify its password and its not new, we want to update the passwordChangedAt field
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Substracting 1 second will ensure that the token be created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.post('save', function(error, doc, next) {
  if (error.code === 11000 && error.keyPattern.email){
    next( new AppError(`Ya existe una cuenta con el correo ${this.email}. Por favor, ingrese uno distinto.`, 400));
  }
  next(error)  
}); 
userSchema.methods.verifyPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generateToken = function (tokenType) {
  let newToken = {};
  const token = crypto.randomBytes(32).toString('hex');

  //Create a new Tokens's object
  newToken.token = crypto.createHash('sha256').update(token).digest('hex');

  //Converting to miliseconds. Reset token for passwords will expire in 10 minutes
  if (tokenType === 'password') newToken.expireDate = Date.now() + 10 * 60 * 1000;

  newToken.tokenType = tokenType;

  //Clean unwanted data in tokens.array
  if (this.tokens) {
    this.tokens = this.tokens.filter((el, index, arr) => {
      return el.tokenType != tokenType;
    });

    this.tokens.push(newToken);
  } else this.tokens = [newToken];

  //Send unencrypted token
  return token;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //Convert date to miliseconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.sendValidationEmail = async function (req) {
  validationToken = this.generateToken('email');
  const validationURL = `${getClientHost(req)}/emailvalidation/${validationToken}`;

  try {
    await new Email(this.email, validationURL).sendEmailValidation();
  } catch (err) {
    console.log(err);
    this.cleanTokensArray('email');
  }
};

userSchema.methods.sendPasswordResetEmail = async function (req) {
  const resetToken = this.generateToken('password');
  const resetURL = `${getClientHost(req)}/resetPassword/${resetToken}`;

  await new Email(this.email, resetURL).sendPasswordReset();
};

userSchema.methods.cleanTokensArray = async function (tokenType) {
  if (this.tokens) {
    this.tokens = this.tokens.filter((el, index, arr) => {
      return el.tokenType != tokenType;
    });

    if (this.tokens.length == 0) this.tokens = undefined;
  }
};

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
