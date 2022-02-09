const {l, extractBookingCode, round} = require("../utils/utils");
const {getTutorByBookingCode} = require("../apis/simplybook");
const {getStripeAccount} = require("../database/mongodb");
const {transfer} = require("../apis/stripe");

/**
 * Handles a one on one payment from SimplyBook by crediting the tutor's Stripe account.
 *
 * @param event The charge.succeeded event.
 */
async function handleOneOnOnePayment(event){
    const startMS = Date.now();
    l(`Payment for One-On-One Session received.`)

    const charge = event.data.object;

    // Payment - Fees are not provided by stripe, maybe can be calculated?
    const amount = charge.amount / 100;
    const tutorPay = amount * 0.7;
    l(`Price: ${amount} AUD | Novicate Commission: ${amount * 0.3} AUD | Tutor Pay: ${tutorPay} AUD`)

    // Extracting Booking Code from Payment Metadata
    const bookingCode = extractBookingCode(charge.metadata[1])
    l(`Booking code: ${bookingCode}`)

    // Find Provider Using SimplyBook API
    const tutor = await getTutorByBookingCode(bookingCode);
    l(`Provider: ${tutor.name} | Provider ID: ${tutor.id}`)

    // Find stripe account using MongoDB Database
    const stripeAccount = await getStripeAccount(tutor.id);
    if(stripeAccount != null) {
        // Transfer payment amount to connected stripe account.
        await transfer(tutorPay, stripeAccount)
        l(`${tutorPay} AUD transferred to stripe account ${stripeAccount}.` )
    } else {
        // If Stripe account was not found.
        l(`Error! Payment received but transfer could not be made:`)
        l(`No stripe account was found for tutor ${tutor.name}(${tutor.id}.`)
    }
    l(`Payment for One-On-One Session handled. Time taken: ${round((Date.now() - startMS) / 1000)} seconds.`)
}

module.exports = {handleOneOnOnePayment}