const {l} = require("../utils/utils");
const {stripe_api} = require('../config.json')
const stripe = require('stripe')(`${stripe_api.secret_key}`);

async function transfer(amount, accountID){
    const amountInCents = amount * 100;

    return await stripe.transfers.create({
        amount: amountInCents,
        currency: 'aud',
        destination: accountID
    });
}

async function verifyWebhook(request, endpointSecret){
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
        return await stripe.webhooks.constructEvent(
            request.body,
            signature,
            endpointSecret
        );
    } catch (e) {
        l(`Webhook signature verification failed.`, e.message);
        return null;
    }
}

// async function test(){
//     await transfer(1, 'acct_1KRAqi4C13TazfVL')
// }

// test()


module.exports = {transfer, verifyWebhook}
