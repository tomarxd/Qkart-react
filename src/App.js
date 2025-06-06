import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export const config = {
  endpoint: `https://qkart-backend-lgkr.onrender.com/api/v1`,
};
function App() {
  return (
    <div className="App">
      <PayPalScriptProvider
        options={{
          "client-id": process.env.REACT_APP_CLIENT_ID,
          currency: "USD",
        }}
      >
        <Switch>
          <Route exact path="/">
            <Products />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/checkout">
            <Checkout />
          </Route>
          <Route path="/Thanks">
            <Thanks />
          </Route>
        </Switch>
      </PayPalScriptProvider>
    </div>
  );
}

export default App;
