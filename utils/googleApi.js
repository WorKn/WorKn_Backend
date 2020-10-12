// const queryString = require('query-string');

// const stringifiedParams = queryString.stringify({
// //   client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
//   client_id: "880026887197-g7i7mhncv387gak6oa01ciu9v3io0f3a.apps.googleusercontent.com",
//   redirect_uri: 'http://127.0.0.1:3001/',
// //   redirect_uri: 'http://workn-testing.s3-website.us-east-2.amazonaws.com',
//   scope: [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//   ].join(' '), // space seperated string
//   response_type: 'code',
//   access_type: 'offline',
//   prompt: 'consent',
// });

// const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
// console.log(googleLoginUrl)

const axios = require('axios');

exports.getGoogleAuthAccessToken = async (code, redirect_uri) => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      redirect_uri,
      grant_type: 'authorization_code',
      code,
    });
    // console.log(response);
    return response;
  } catch (e) {
    return e.response;
  }
};

exports.getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log(response);
    return response;
  } catch (e) {
    return e.response;
  }
};
