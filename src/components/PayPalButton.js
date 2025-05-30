import { PayPalButtons } from "@paypal/react-paypal-js";
import { useHistory } from "react-router-dom"; // Add this import

const PayPalButton = ({ amount, disabled }) => {
  const history = useHistory(); // Add this line

  return (
    <div
      style={{
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <PayPalButtons
        style={{
          layout: "horizontal",
          height: 35,
          width: 150,
          label: "pay",
          shape: "rect",
          color: "gold",
        }}
        forceReRender={[amount, disabled]}
        createOrder={(data, actions) => {
          if (disabled) return;
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          });
        }}
        onApprove={(data, actions) => {
          if (disabled) return;
          return actions.order.capture().then((details) => {
            localStorage.removeItem("cart");
            history.push("/Thanks"); // Redirect instead of alert
          });
        }}
        onError={(err) => {
          if (!disabled)
            alert(
              "PayPal Checkout Error: " + err,
              "Please try again after sometime!!!"
            );
        }}
      />
    </div>
  );
};

export default PayPalButton;
