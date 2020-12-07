const Organization = require('../models/organizationModel');
const User = require('../models/userModel');
const Interaction = require('../models/InteractionModel');

const catchAsync = require('../utils/catchAsync');

exports.getLandingPageStats = catchAsync(async (req, res, next) => {
  const usersCount = await User.countDocuments();
  const organizationsCount = await Organization.countDocuments();
  const matchesCount = await Interaction.countDocuments({ state: 'match' });

  res.status(200).json({
    status: 'success',
    data: {
      users: usersCount,
      organizations: organizationsCount,
      matches: matchesCount,
    },
  });
});
