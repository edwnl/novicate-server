# Novicate Backend Server
Novicate is a tutoring company based in Melbourne offering quality tutors at a discounted price. Novicate uses SimplyBook (https://simplybook.me/en/) to handle bookings and Stripe to handle payment.

When a booking is made and payment is received, this app will transfer the specified tutor a 70% cut, keeping 30% for Noviate. Note this amount is not exact as Stripe charges fees with all payments.

Once finished, a message is sent to a specified discord channel.

<img width="441" alt="Screenshot 2023-08-14 at 4 18 57 pm" src="https://github.com/edwnl/novicate-server/assets/19798018/86f37a2a-57c5-4379-af44-39ee20ece362">

To run the server, create a file named `config.js` with the following format:
```
{
  "stripe_api": {
    "endpoint_secret": "",
    "secret_key": ""
  },
  "simply_book": {
    "name": "",
    "user": "",
    "password": "",
    "api_base_url": "https://user-api-v2.simplybook.me"
  },
  "mongo_db": {
    "user": "",
    "password": "",
    "host": ""
  }
}
```

Then, run `npm install` to install the dependencies.
