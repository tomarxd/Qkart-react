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
import Cart from "./Cart";

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

  const [card, setCard] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [timerId, udpateTimerId] = useState("");
  const token = localStorage.getItem("token");
  console.log(token);

  useEffect(() => {
    performAPICall();
  }, []);

  const productsURL = config.endpoint + "/products";

  const performAPICall = async () => {
    setLoading(true);
    await axios
      .get(productsURL)
      .then((response) => {
        setCard(response.data);
        setLoading(false);
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
        setCard(response.data);
        console.log(response.data);
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
          // onChange={(text) => {performSearch(text.target.value);}}
        />

        <Grid container>
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
                </div>
              </div>
            ) : card.length > 0 ? (
              <Grid container spacing={2}>
                {card.map((product) => (
                  <Grid item md={3} xs={6} key={product._id}>
                    <ProductCard product={product} />
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
            {token ? (
              <Grid items xs={12} md={3}>
                <Cart />
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
