const express = require('express')
const path = require('path');
const {verifyWebhook} = require("./apis/stripe");
const {handleSimplyBookPayment} = require("./webhooks/chargeSucceeded");
const {l, isEmpty, sleep} = require("./utils/utils");
const {stripe_api} = require(path.resolve( __dirname, './config.json'))
const stripe = require('stripe')(`${stripe_api.secret_key}`);

const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
    let event = request.body;
    // Webhook signature verification.
    if (stripe_api.endpoint_secret) event = await verifyWebhook(request, stripe_api.endpoint_secret);

    // If verification failed, acknowledge by returning a response with code 400.
    if(event == null) return response.sendStatus(400)

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const payment_intent = event.data.object.payment_intent;

            // Waiting 2 seconds to allow for any updates.
            await sleep(2000)

            // Retrieve the payment from stripe (once the metadata is inserted by SimplyBook)
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent)

            // If the payment has metadata
            if(!isEmpty(paymentIntent.metadata)){
                const service = paymentIntent.metadata.item_1
                // Using the service to verify that the payment was from SimplyBook.
                if(service.startsWith('1-on-1') || service.startsWith('Group')){
                    await handleSimplyBookPayment(paymentIntent)
                }
            }
            break
        default:
            // console.log(`Unhandled Event: ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

app.listen(4242, () => l('Webhook Enabled on port 4242.'));