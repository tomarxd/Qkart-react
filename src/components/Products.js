import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

const Products = () => {

    //storing all products
  const [card, setCard] = useState([]);
  //made for loading animation
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  //made for timer to debounce search
  const [timerId, udpateTimerId] = useState("");
  //storing token in variable
  const token = localStorage.getItem("token");
  //storing cart in a state
  const [cartItems, setCartItems] = useState([]);
  //state to update cart
  const [cartData, setCartData] = useState([]);
  //all prods
  let products = null;

  const productsURL = config.endpoint + "/products";

  const performAPICall = async () => {
    setLoading(true);
    await axios
      .get(productsURL)
      .then((response) => {
        setCard(response.data);
        setLoading(false);
        console.log(response.data);
        products = response.data;
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        if (error.response.status === 400) {
          console.log(error.response.message);
          enqueueSnackbar(error.response.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
            { variant: "error" }
          );
        }
      });
  };

  const performSearch = async (text) => {
    setLoading(true);
    let searchUrl = `${config.endpoint}/products/search?value=${text}`;

    await axios
      .get(searchUrl)
      .then((response) => {
        const products = response.data;
        setCard(products);
        console.log(products);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error.response.data);
        if (error.response.status === 404) {
          setCard(error.response.data);
        } else if (error.response.status === 500) {
          setCard(error.response.data);
          enqueueSnackbar(
            "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
            { variant: "error" }
          );
        }
      });
  };

  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(debounceTimeout);

    let timerId = setTimeout(() => {
      performSearch(event);
    }, 500);
    udpateTimerId(timerId);
  };

  useEffect(() => {
    async function onLoad() {
      performAPICall();
      console.log(products);
      if (token) {
        const cartDetails = await fetchCart(token);
        console.log(cartDetails);
        setCartItems(cartDetails);
        const newcartData = await generateCartItemsFrom(cartDetails, products);
        setCartData(newcartData);
      }
    }
    onLoad();
  }, []);

  const fetchCart = async (token) => {
    console.log("fetching cart start");
    if (!token) return;
    try {
      const cartFetch = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newFetchedItems = cartFetch.data;
      return newFetchedItems;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
      return null;
    }
  };

  const isItemInCart = (items, productId) => {
    let itemMatch = false;
    console.log("itInC", items);
    console.log("itInC", productId);
    items.forEach((products) => {
      if (products._id === productId) itemMatch = true;
    });
    return itemMatch;
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    console.log("addToCart");
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }
    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    } else {
      try {
        console.log("post req start");
        const response = await axios.post(
          `${config.endpoint}/cart`,
          { productId, qty },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("response by add to cart", response.data);
        const newCartItems = generateCartItemsFrom(response.data, products);
        setCartData(newCartItems);
        return newCartItems;
      } catch (error) {
        if (error.response) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not fetch products. Check that the backend is running, reachable and return valid JSON.",
            { variant: "error" }
          );
        }
      }
    }
  };

  const handleQuantity = (id, qty) => {
    console.log("handleQuantity");
    addToCart(token, cartData, card, id, qty);
  };

  return (
    <div>
      <Header>
        <TextField
          sx={{ width: 400 }}
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => {
            debounceSearch(e.target.value, timerId);
          }}
        />
      </Header>

      <div className="body-container">
        <TextField
          className="search-mobile"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(text) => {
            performSearch(text.target.value);
          }}
        />

        <Grid item container>
          <Grid item xs={12} md={token ? 9 : 12}>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
            {loading ? (
              <div className="circular-progress">
                <div>
                  <CircularProgress />
                </div>
                <div>
                  <Typography>Loading Products...</Typography>
                  <Typography>
                    (Might take upto a minute if backend is cold booting)
                  </Typography>
                </div>
              </div>
            ) : card.length > 0 ? (
              <Grid container spacing={2}>
                {card.map((product) => (
                  <Grid item md={3} xs={6} key={product._id}>
                    <ProductCard
                      product={product}
                      handleAddToCart={() => {
                        addToCart(token, cartData, card, product._id, 1, {
                          preventDuplicate: true,
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <div className="no-products">
                <SentimentDissatisfied />
                <div>
                  <h3>No Products Found</h3>
                </div>
              </div>
            )}
          </Grid>
          {token ? (
            <Grid item xs={12} md={3}>
              <Cart
                products={card}
                items={cartData}
                handleQuantity={handleQuantity}
              />
            </Grid>
          ) : null}
        </Grid>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
