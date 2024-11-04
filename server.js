const express = require("express");
const { default: generateApiKey } = require("generate-api-key");
const app = express();
const port = 1337;
require("dotenv").config();

//Variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const DOMAIN = "http://localhost:1337";
//middleware
app.use(express.static("public"));

//routes
app.post("/create-checkout-session/:product", async (req, res) => {
  const { product } = req.params;
  let mode, price_ID, line_items;

  if (product === "sub") {
    price_ID = "price_1QHS0aDK9ZIEJoNto07emEHs";
    mode = "subscription";
    line_items = [
      {
        price: price_ID,
      },
    ];
  } else if (product === "pre") {
    price_ID = "price_1QHRqzDK9ZIEJoNtjpd0OZ1x";
    mode = "payment";
    line_items = [
      {
        price: price_ID,
        quantity: 1,
      },
    ];
  } else {
    return res.sendStatus(403);
  }

  const newAPIKey = generateApiKey();
  const customer = await stripe.customers.create({
    metadata: {
      APIkey: newAPIKey,
    },
  });

  const stripeCustomerId = customer.id;
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    metadata: {
      APIkey: newAPIKey,
      payment_type: product,
    },
    line_items: line_items,
    mode: mode,
    success_url: `${DOMAIN}/success.html?api_key=${newAPIKey}`,
    cancel_url: `${DOMAIN}/cancel.html`,
  });

  //create firebase record

  //use webhook to access the firebase entry for that api key and ensure that billing info is updated

  res.redirect(303, session.url);
});

app.listen(port, () => console.log(`Server has started on port:${port}`));
