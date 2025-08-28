const prisma = require("../config/prisma")

exports.payment = async (req, res) => {
  try {
    //code
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id)
      }
    })
    const stripe = require("stripe")("sk_test_51RxURmEgBfjIh6AVb3W0sVOx1UPIPHjdaAtiwn1lmF8dCCTfcwHbipqFBkIEAhK0qu12N35UenUWGYGScgOsGuou00qUvl8qae", {
      apiVersion: "2025-07-30.basil",
    });
    const amountTHB = cart.cartTotal * 100 // Convert to cents
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Payment Error" })
  }
}