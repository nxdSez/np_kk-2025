import React, { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { payment } from "../../api/Stripe";
import useNpStore from "../../store/nopporn-stores";
import CheckoutForm from "../../components/CheckoutForm";

const stripePromise = loadStripe(
  "pk_test_51RxURmEgBfjIh6AVMArhKoft7tsP8SN6OW0hSo91szXO2MCan2WmsavTk1qc14ljz29i2JK97jLFIvspIL8j2Tln00S6U3GwC5"
);

const Payment = () => {
  const token = useNpStore((s) => s.token);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    payment(token)
      .then((res) => {
        setClientSecret(res.data.clientSecret);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const appearance = {
    theme: "stripe",
  };

  const loader = "auto";

  return (
    <div>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
            loader,
          }}
        >
          <h1>Payment Form</h1>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default Payment;
