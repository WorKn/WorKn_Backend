const mongoose = require('mongoose');

const paymentLogSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: [true, "Un pago debe ser emitido por una organización."]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
      },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    amount:{
        type: Number,
        required: [true, "Un pago debe contener el monto."],
    },
})
const paymentLog = mongoose.model('PaymentLog',paymentLogSchema);

module.exports = paymentLog;