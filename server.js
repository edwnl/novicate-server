const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const {verifyWebhook} = require('./apis/stripe');
const {handleSimplyBookPayment} = require('./webhooks/chargeSucceeded');
const {l, isEmpty, sleep} = require('./utils/utils');
const {stripe_api} = require(path.resolve( __dirname, './config.json'));
const stripe = require('stripe')(`${stripe_api.secret_key}`);

const app = express();

app.post('/novicate/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  let event = request.body;
  // Webhook signature verification.
  if (stripe_api.endpoint_secret) {
    event = await verifyWebhook(request, stripe_api.endpoint_secret);
  }

  // If verification failed, acknowledge by returning a response with code 400.
  if (event == null) return response.sendStatus(400);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const obj = event.data.object;

      if(obj.mode === 'subscription' || obj.payment_intent == null) break;

      // Waiting 2 seconds to allow for any updates.
      await sleep(2000);

      // Retrieve the payment once the metadata is inserted by SimplyBook
      const paymentIntent = await stripe.paymentIntents.retrieve(obj.payment_intent);

      // If the payment has metadata
      if (!isEmpty(paymentIntent.metadata)) {
        const service = paymentIntent.metadata.item_1;
        // Using the service to verify that the payment was from SimplyBook.
        if (service.startsWith('1-on-1') || service.startsWith('Group')) {
          await handleSimplyBookPayment(paymentIntent);
        }
      }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object
        const invoicePaymentIntent = invoice.payment_intent
        const description = invoice.lines.data[0].description

        await stripe.paymentIntents.update(invoicePaymentIntent, {
          description: `${description}`
        })

        l(`Description of payment ${invoicePaymentIntent} updated to: ${description}.`)
    break;
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// serve the API with signed certificate on 4242 (SSL/HTTPS) port
const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/dragsim.co/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/dragsim.co/fullchain.pem'),
}, app);

httpsServer.listen(4242, () => {
  l('HTTPS Server enabled and listening on port 4242.');
});

// app.listen(4242, () => l('App enabled and listening on port 4242.'));
