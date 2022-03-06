const {l, extractBookingCode, round} = require('../utils/utils');
const {getBookingByBookingCode} = require('../apis/simplybook');
const {transfer, getStripeAccountByID} = require('../apis/stripe');
const {sendDiscordMessage, paymentHandled} = require('../apis/discord');

/**
 * Handles a one on one payment from SimplyBook by crediting the tutor's Stripe account.
 *
 * @param {object} payment_intent The retrieved payment intent using Stripe API.
 */
async function handleSimplyBookPayment(payment_intent) {
  try {
    const startMS = Date.now();
    const charge = payment_intent.charges.data[0];
    const country = charge.payment_method_details.country;
    l(`----- Payment received. -----`);

    // Extracting Booking Code from Payment Metadata
    const metadata = payment_intent.metadata.item_1;
    const bookingCode = extractBookingCode(metadata);
    if (bookingCode == null) {
      throw new Error(`Unable to extract booking code. Metadata: ${metadata}`);
    }
    l(`Booking code: ${bookingCode}`);

    // Find Provider Using SimplyBook API
    const booking = await getBookingByBookingCode(bookingCode);
    if (booking == null) {
      throw new Error(`Tutor's data could not be found. Booking Code: ${bookingCode}.`);
    }
    const tutor = booking.provider;
    l(`Provider: ${tutor.name} | Provider ID: ${tutor.id}`);

    // Payment Calculations
    const amount = payment_intent.amount / 100; // Total Amount Received in Stripe (Including GST)
    const gst = booking.service.price * 0.1; // Calculate GST from original service price
    const stripeFee = amount * (country === 'AU' ? 0.0175 : 0.029) + 0.3; // Stripe API fees (deducted from total amount received)

    const tutorPay = ((amount - gst ) * 0.7) - stripeFee; // Tutors are paid 70% of the total amount less gst, strip fees.
    const commission = amount - tutorPay; // Novicate keeps whatever is left less gst.

    l(`Price: ${round(amount)} AUD | Commission: ${round(commission)} AUD | Tutor Pay: ${round(tutorPay)} AUD`);
    l(`Stripe Fees: ${round(stripeFee)} AUD | GST: ${round(gst)}`);

    // Find stripe account by searching Stripe Connected Accounts
    const stripeAccount = await getStripeAccountByID(`${tutor.id}`);
    if (stripeAccount == null) {
      throw new Error(`No stripe account was found for tutor ${tutor.name}. (SimplyBook ID: ${tutor.id})`);
    }

    // Transfer payment amount to connected stripe account.
    await transfer(tutorPay, stripeAccount, charge.id);
    l(`Transferred ${round(tutorPay)} AUD to stripe account ${stripeAccount}.`);

    // Send a discord message to confirm the transfer was correctly handled.
    await paymentHandled(bookingCode, {
      amount: round(amount),
      commission: round(commission),
      fee: round(stripeFee),
      tutor_pay: round(tutorPay),
      gst: round(gst)
    }, tutor);

    l(`----- Payment handled. Time taken: ${round((Date.now() - startMS) / 1000)} seconds. -----`);
  } catch (e) {
    // Stripe Errors include a human-readable string (e.message)
    const msg = `[${payment_intent.id}] ${e.message ? e.message : e}`;

    l(msg);
    await sendDiscordMessage('Error occured during transfer!', msg, `FF0000`);
  }
}

module.exports = {handleSimplyBookPayment};
