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
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
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

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */

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

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
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
        // fetchCart(token);
        const cartDetails = await fetchCart(token);
        console.log(cartDetails);
        setCartItems(cartDetails);
        const newcartData = await generateCartItemsFrom(cartDetails, products);
        setCartData(newcartData);
      }
    }
    onLoad();
  }, []);

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */

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

  // Return if a product already is present in the cart
  const isItemInCart = (items, productId) => {
    let itemMatch = false;
    console.log("itInC", items);
    console.log("itInC", productId);
    items.forEach((products) => {
      if (products._id === productId) itemMatch = true;
    });
    return itemMatch;
  };

  //Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    console.log("addToCart");
    // console.log(token, items, products, productId, qty, options);
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

  //to get - + buttons of cart items working
  const handleQuantity = (id, qty) => {
    console.log("handleQuantity");
    addToCart(token, cartData, card, id, qty);
  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
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
          // onChange={(text) => {performSearch(text.target.value);}}
          onChange={(e) => {
            debounceSearch(e.target.value, timerId);
          }}
        />
      </Header>

      {/* Search view for mobiles */}
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
