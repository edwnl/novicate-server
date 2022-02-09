# Novicate Backend Server
Novicate is a tutoring company based in Melbourne offering quality tutors at a discounted price.

Website: `novicate.com` (in development)

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
