const {l, extractBookingCode, round} = require("../utils/utils");
const {getTutorByBookingCode} = require("../apis/simplybook");
const {transfer, getStripeAccountByID} = require("../apis/stripe");
const {sendDiscordMessage, chargeHandled} = require("../apis/discord");

/**
 * Handles a one on one payment from SimplyBook by crediting the tutor's Stripe account.
 *
 * @param event The charge.succeeded event.
 */
async function handleSimplyBookPayment(payment_intent) {
    try {
        const startMS = Date.now();
        const countryCode = payment_intent.charges.data[0].payment_method_details.country;
        l(`----- Payment for Tutoring Session received. -----`)

        // Payment
        const amount = payment_intent.amount / 100;
        const commission = amount * 0.3
        const fee = round((countryCode === "AU" ? (amount * 0.0175) : (amount * 0.029)) + 0.3)
        const tutorPay = Math.round(amount - commission - fee);

        l(`Price: ${amount} AUD | Commission: ${commission} AUD | Stripe Fees: ${fee} AUD | Tutor Pay: ${tutorPay} AUD`)

        // Extracting Booking Code from Payment Metadata
        const bookingCode = extractBookingCode(payment_intent.metadata.item_1)
        l(`Booking code: ${bookingCode}`)

        // Find Provider Using SimplyBook API
        const tutor = await getTutorByBookingCode(bookingCode);
        l(`Provider: ${tutor.name} | Provider ID: ${tutor.id}`)

        // Find stripe account by searching Stripe Connected Accounts
        const stripeAccount = await getStripeAccountByID(`${tutor.id}`);
        if (stripeAccount != null) {
            // Transfer payment amount to connected stripe account.
            tutor.stripe_account = stripeAccount
            await transfer(tutorPay, stripeAccount)
            l(`${tutorPay} AUD transferred to stripe account ${stripeAccount}.`)
        } else {
            // If Stripe account was not found.
            l(`Error! Payment received but transfer could not be made: No stripe account was found for tutor ${tutor.name} (${tutor.id}).`)

            await sendDiscordMessage("Stripe Account Not Found", `${tutorPay} AUD could not be transferred to ${tutor.name} (ID: ${tutor.id}). \n
                Please attach the SimplyBook ID for the tutor's connected account as metadata on Stripe.`, `FF0000`)
            return
        }

        await chargeHandled(bookingCode, {
            amount: amount, commission: commission, fee: fee, tutor_pay: tutorPay
        }, tutor)

        l(`----- Payment for Tutoring Session handled. Time taken: ${round((Date.now() - startMS) / 1000)} seconds. -----`)
    } catch (e) {
        const stripe_error = e.message
        const msg = stripe_error ? stripe_error : e

        l(msg)
        await sendDiscordMessage(stripe_error ? "Stripe Error" : "Unknown Error", msg, `FF0000`)
    }
}

module.exports = {handleSimplyBookPayment}