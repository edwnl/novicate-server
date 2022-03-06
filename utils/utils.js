/**
 * Extracts booking code from metadata provided by SimplyBook.
 *
 * @param {string} s The metadata attached to SimplyBook payment. See below for an example:
 * @return {string|null} The extracted booking code. Null if the string is empty.
 *
 * Example: 1-on-1 Test (Wednesday, Feb 16 2022 07:00 AM, 1abd2pdr1) - 1 x 2.20
 * The booking code is 1abd2pdr1.
 */
const extractBookingCode = (s) => {
  if (!s) return null;

  // Regex can be optimised.
  const startRegex = /^[^,]*, [^,]*, /; // Matches all up to the second ', '
  const endRegex = /\)(.*)/; // Matches all after ')'
  s = s.replace(startRegex, '');
  s = s.replace(endRegex, '');
  return s;
};

/**
 * Logs a string in console with a time stamp.
 * @param {string} s The string to log.
 */
const l = (s) => {
  const date = new Date;
  const timeStmp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  console.log(`[Novicate-Server ${timeStmp}] ${s}`);
};

/**
 * Determines if an object is empty.
 *
 * Code from: https://stackoverflow.com/a/59787784/13008698
 *
 * @param {object} object The object to check.
 * @return {boolean} True if the object is empty. False if its not.
 */
const isEmpty = (object) => {
  for (const i in object) return false;
  return true;
};

/**
 * Rounds a number to 2 decimal places.
 *
 * @param {number} num Number to round.
 * @return {number} Rounded number.
 */
const round = (num) => {
  return Math.round(num * 100) / 100;
};

/**
 * "Sleeps" for a specified amount of time.
 * @param delay Delay in milliseconds.
 * @return {Promise<unknown>} A promise which resolves in a specified amount of time.
 */
const sleep = (delay) => new Promise(((resolve) => setTimeout(resolve, delay)));

module.exports = {extractBookingCode, l, isEmpty, round, sleep};
