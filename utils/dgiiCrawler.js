const axios = require('axios');

exports.isOrgRegisteredInDGII = async (rnc) => {
  try {
    const response = await axios.get(`${process.env.DGII_CRAWLER_HOST}/api/v1/rnc/${rnc}`, {
      rnc,
    });
    return true;
  } catch (e) {
    e.response.status != 404 ? console.log(e.response.data) : undefined;
    return false;
  }
};
