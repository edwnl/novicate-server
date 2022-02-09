const express = require('express')
const path = require('path');
const {verifyWebhook} = require("./apis/stripe");
const {handleOneOnOnePayment} = require("./webhooks/chargeSucceeded");
const {l, isEmpty} = require("./utils/utils");
const {stripe_api} = require(path.resolve( __dirname, './config.json'))

const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
    let event = request.body;
    // Webhook signature verification.
    if (stripe_api.endpoint_secret) event = await verifyWebhook(request, stripe_api.endpoint_secret);

    // If verification failed, acknowledge by returning a response with code 400.
    if(event == null) return response.sendStatus(400)

    // Handle the event
    switch (event.type) {
        // If the event is of type charge.succeeded
        case 'charge.succeeded':

            // Make sure payment is a from a one-on-one lesson.
            const metaData = event.data.object.metadata;
            if(!isEmpty(metaData) && metaData[1].startsWith('[One-On-One]')) {
                // Handles the One on One Payment.
                await handleOneOnOnePayment(event)
            }
            break;
        default:
            // console.log(`Unhandled Event: ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

app.listen(4242, () => l('Webhook Enabled on port 4242.'));