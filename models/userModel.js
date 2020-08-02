const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, provea su nombre.'],
  },
  identificationNumber: {
    type: String,
    validate: [
      validator.isNumeric,
      'El número de identificación debe poseer solo caracteres numéricos.',
    ],
  },
  phone: {
    type: String,
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
      let minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 16);
      return minDate;
    },
    required: [true, 'Por favor, ingrese su fecha de nacimiento.'],
  },
  chats: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat',
    },
  ],
  category: {
    type: String,
    // type: mongoose.Schema.ObjectId,
    // ref: 'Category',
    required: [
      function () {
        return this.userType == 'applicant';
      },
      'Por favor, seleccione una categoría de interés.',
    ],
    // type: mongoose.Schema.ObjectId,
    // ref: 'Category',
    // default: null,
    // validate: {
    //   validator: function (el) {
    //     console.log('hola?');
    //     if (this.userType == 'applicant') {
    //       return el ? true : false;
    //     } else return true;
    //   },
    //   message: 'Por favor, seleccione una categoría de interés.',
    // },
  },
  location: {
    coordinates: [Number],
    address: String,
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
        return el == this.password;
      },
      message: 'Las contraseñas no son iguales.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedAt: {
    type: Date,
    select: false,
  },
  userType: {
    type: String,
    enum: ['offerer', 'applicant', 'admin'],
    required: [true, 'Se requiere el tipo de usuario.'],
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
  },
  organizationRole: {
    type: String,
    enum: ['owner', 'admin', 'member'],
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  profilePicture: String,
  tags: {
    type: [
      {
        name: String,
        category: String,
      },
    ],
    default: void 0,
    required: [
      function () {
        return this.userType == 'applicant';
      },
      'Por favor, seleccione tags de interés.',
    ],
    validate: {
      validator: function (el) {
        // if(this.userType == 'applicant') el.length <= 0
        return el.length <= 10;
      },
      message: 'Límite de tags (10) excedido.',
    },
  },
});

// //This is a custom validator for 'aplicants'. It triggers when there is no category or tags.
// userSchema.pre('validate', function (next) {
//   if (this.userType == 'applicant') {
//     if (this.category == null) {
//       var error = new mongoose.Error.ValidationError(this);
//       error.errors.category = new mongoose.Error.ValidatorError(
//         {
//           message: 'Por favor, seleccione una categoría de interés.',
//           type: 'required',
//           path: 'category',
//         },
//         this.category
//       );
//       return next(error);
//     }
//     if (this.tags == null) {
//       var error = new mongoose.Error.ValidationError(this);
//       error.errors.category = new mongoose.Error.ValidatorError(
//         {
//           message: 'Por favor, seleccione tags que le sean de interés.',
//           type: 'required',
//           path: 'tags',
//         },
//         this.tags
//       );
//       return next(error);
//     }
//   }

//   return next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
