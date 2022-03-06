const axios = require('axios');
const {simply_book} = require('../config.json');

let token = '';
let refreshToken = '';

/**
 * Obtains a new token if required.
 *
 * If {@link refreshToken} is present, it will be used to obtain a new token.
 *
 * Otherwise, login details from {@link simply_book} will be used, and the refresh token
 * obtained from that will be stored for next time.
 */
const getNewToken = async () => {
  try {
    // Body of the request. Fields depend on if a refresh token is present or not.
    const body = {
      company: simply_book.name,
      ...refreshToken && {
        refresh_token: refreshToken,
      },
      ...!refreshToken && {
        login: simply_book.user,
        password: simply_book.password,
      },
    };

    // Post an axios response to obtain a token.
    // Documentation: https://simplybook.me/en/api/developer-api/tab/rest_api
    const res = await axios.post(`${simply_book.api_base_url}/admin/auth${refreshToken && '/refresh-token'}`, body);

    // Update variables with new values.
    refreshToken = res.data.refresh_token;
    token = res.data.token;
  } catch (e) {
    console.log(e);
  }
};

/**
 * Obtains tutor data by a booking's code, using SimplyBook's REST API.
 *
 * @param {string} code Booking code from SimplyBook.
 * @return {object} Tutor data, including id, name, profile pic, etc.
 */
const getBookingByBookingCode = async (code) => {
  try {
    // If no token is present, obtain a new one.
    if (!token) await getNewToken();

    // Using the admin SimplyBook REST API, filter bookings by booking code.
    const res = await axios.get(`${simply_book.api_base_url}/admin/bookings?filter[search]=` + code, {
      // Attach token in header for authentication
      headers: {
        'Content-Type': 'application/json',
        'X-Company-Login': simply_book.name,
        'X-Token': token,
      },
    });

    // Return provider details.
    return res.data.data[0];
  } catch (e) {
    // If the request was denied access, obtain a new token and try again.
    const status = e.response.status;
    if (status === 401) {
      await getNewToken();
      return getBookingByBookingCode(code);
    } else {
      console.log(`Error! Status ${status}.`);
      return null;
    }
  }
};

// async function test(){
//   console.log(await getBookingByBookingCode('1abd2oi4q'))
// }
//
// test()

module.exports = {getBookingByBookingCode};
