/**
 * Extracts booking code from metadata provided by SimplyBook.
 *
 * @param {string} s The metadata attached to SimplyBook payment. See below for an example:
 *
 * Example: [One-On-One] VCE 3/4 Chemistry Tutoring (10-02-2022 12:00 PM, 1abd16g0p) x 1 (75 AUD)
 * The booking code is 1abd16g0p.
 */
const extractBookingCode = (s) => {
    const startRegex = /^[^,]*, /;
    const endRegex = /\)(.*)/;
    s = s.replace(startRegex, '')
    s = s.replace(endRegex, '')
    return s;
}

/**
 * Logs a string in console with a time stamp.
 * @param s The string to log.
 */
const l = (s) => {
    const date = new Date;
    const timeStmp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    console.log(`[Novicate-Server ${timeStmp}] ${s}`)
}

/**
 * Determines if an object is empty.
 *
 * Code from: https://stackoverflow.com/a/59787784/13008698
 *
 * @param object The object to check.
 * @returns True if the object is empty. False if its not.
 */
const isEmpty = (object) => {
    for(const i in object) return false
    return true
}

/**
 * Rounds a number to 2 decimal places.
 *
 * @param num Number to round.
 * @return {number} Rounded number.
 */
const round = (num) => {
    return Math.round(num * 100) / 100
}

module.exports = {extractBookingCode, l, isEmpty, round}