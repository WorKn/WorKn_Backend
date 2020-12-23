const Interaction = require('./../models/InteractionModel');

const closeInteractions = (offerId) => {
  Interaction.updateMany({ offer: offerId }, { isOfferClosed: true }, (err, result) => {
    if (err) console.log(err);
    else console.log(`SUCCESS: Interaction closed.`);
  });
};

module.exports = closeInteractions;
