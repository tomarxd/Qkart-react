import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  Table,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, {
  getTotalCartValue,
  generateCartItemsFrom,
  getTotalItems,
} from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";
import PayPalButton from "./PayPalButton";


const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) => {
          newAddress.value = e.target.value;
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => {
            addAddress(token, newAddress.value);
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            handleNewAddress({ isAddingNewAddress: false, value: "" });
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      console.log(addresses);
      console.log(response.data);
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress },
        { headers: headers }
      );
      console.log(response.data);
      setAddresses({ ...addAddress, all: response.data });
      setNewAddress({ isAddingNewAddress: false, value: "" });
      return response;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        { headers: headers }
      );
      console.log(response);
      setAddresses({ ...addresses, all: response.data });
      return response;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    let passed = true;
    const cartValue = getTotalCartValue(items);
    const walletBalance = localStorage.getItem("balance");
    if (cartValue > walletBalance) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      passed = false;
    } else if (!addresses) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      passed = false;
    } else if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      passed = false;
    }
    return passed;
  };

  const performCheckout = async (token, items, addresses) => {
    const validated = validateRequest(items, addresses);
    console.log(validated);

    if (validated) {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.post(
          `${config.endpoint}/cart/checkout`,
          { addressId: addresses.selected },
          { headers: headers }
        );
        console.log(response.data);

        const walletBalance =
          localStorage.getItem("balance") - getTotalCartValue(items);
        console.log(walletBalance);
        localStorage["balance"] = walletBalance;
        enqueueSnackbar("Order placed successfully", { variant: "success" });
        history.push("/Thanks");

        return response;
      } catch (error) {
        enqueueSnackbar(error.message, {
          variant: "warning",
        });
      }

      if (!token) {
        enqueueSnackbar("You must be logged in to access checkout page", {
          variant: "info",
        });
      }
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
      const allAddress = getAddresses(token);
    };
    onLoadHandler();
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {addresses.all.length ? (
                addresses.all.map((addre) => (
                  <Box
                    onClick={() => {
                      setAddresses({ ...addresses, selected: addre._id });
                    }}
                    className={
                      addresses.selected === addre._id
                        ? "address-item selected"
                        : "address-item not-selected"
                    }
                    value={addre._id}
                    key={addre._id}
                  >
                    <Typography>{addre.address} </Typography>
                    <Button
                      onClick={() => {
                        deleteAddress(token, addre._id);
                      }}
                      startIcon={<Delete />}
                    >
                      DELETE
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              )}
            </Box>

            {newAddress.isAddingNewAddress ? (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            ) : (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: "#388e3c", fontSize: "1rem", marginY: "1rem" }}
            >
              If payment fails, transfers of funds isn't available in PayPal
              sandbox right now. PayPal will automatically start transferring
              your funds to your preferred bank account.
            </Typography>
            <Button
              type="hidden"
              name="upload"
              value="1"
              my="2rem"
              onClick={() => {
                performCheckout(token, items, addresses);
              }}
            >
              <PayPalButton
                amount={getTotalCartValue(items).toFixed(2)}
                disabled={!addresses.selected}
              />
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
          <Box p={1}>
            <Grid padding="1rem" item bgcolor="#ffffff">
              <Typography variant="h4" fontWeight="800">
                Order Details
              </Typography>
              <br />
              <Table>
                <tr>
                  <td>Products</td>
                  <td>
                    <Box textAlign="right">{getTotalItems(items)}</Box>
                  </td>
                </tr>
                <br />
                <tr>
                  <td>Subtotal</td>
                  <td>
                    <Box textAlign="right">${getTotalCartValue(items)}</Box>
                  </td>
                </tr>
                <br />
                <tr>
                  <td>Shipping Charges</td>
                  <td>
                    <Box textAlign="right">$0</Box>
                  </td>
                </tr>
                <br />
                <tr>
                  <td>
                    <h3>Total</h3>
                  </td>
                  <td>
                    <h3>
                      <Box textAlign="right"> ${getTotalCartValue(items)}</Box>
                    </h3>
                  </td>
                </tr>
              </Table>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};
export default Checkout;
