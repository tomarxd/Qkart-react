import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, Grid, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import { useHistory } from "react-router-dom";
import "./Cart.css";

export const generateCartItemsFrom = (cartData, productsData) => {
  const productsInCart = [];
  cartData?.map((item) => {
    productsData.map((product) => {
      if (product._id === item.productId) {
        const data = {
          ...item,
          name: product.name,
          category: product.category,
          cost: product.cost,
          rating: product.rating,
          image: product.image,
          _id: product._id,
        };
        productsInCart.push(data);
      }
    });
  });
  return productsInCart;
};

export const getTotalCartValue = (items = []) => {
  let total = 0;
  items.forEach((element) => {
    total += element.cost * element.qty;
  });
  return total;
};

export const getTotalItems = (items = []) => {
  let totalItems = 0;
  items.map((prod) => {
    totalItems += prod.qty;
  });
  return totalItems;
};

const ItemQuantity = ({ value, handleAdd, handleDelete }) => {
  if (!handleAdd) {
    return (
      <Box padding="0.5rem" data-testid="item-qty">
        Qty: {value}
      </Box>
    );
  } else {
    return (
      <Stack direction="row" alignItems="center">
        <IconButton size="small" color="primary" onClick={handleDelete}>
          <RemoveOutlined />
        </IconButton>
        <Box padding="0.5rem" data-testid="item-qty">
          {value}
        </Box>
        <IconButton size="small" color="primary" onClick={handleAdd}>
          <AddOutlined />
        </IconButton>
      </Stack>
    );
  }
};

const Cart = ({ products, items = [], handleQuantity, isReadOnly = false }) => {
  const history = useHistory();
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      {!isReadOnly ? (
        <Box className="cart">
          <Box
            display="flex"
            alignItems="flex-start"
            padding="1rem"
            sx={{ flexDirection: "column" }}
          >
            {items.map((item, index) => {
              return (
                <Grid key={index}>
                  <Box className="image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      width="100%"
                      height="100%"
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                  >
                    <div>{item.name}</div>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <ItemQuantity
                        Add
                        required
                        props
                        by
                        checking
                        implementation
                        handleAdd={async () => {
                          await handleQuantity(item.productId, item.qty + 1);
                        }}
                        handleDelete={async () => {
                          await handleQuantity(item.productId, item.qty - 1);
                        }}
                        value={item.qty}
                      />
                      <Box padding="0.5rem" fontWeight="700">
                        ${item.cost}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Box>
          <Box
            padding="1rem"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box color="#3C3C3C" alignSelf="center">
              Order total
            </Box>
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
              data-testid="cart-total"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => {
                history.push("/checkout");
                console.log("Checked out succesfully");
              }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      ) : (
        items.map((products) => (
          <Box>
            <Box
              key={products._id}
              display="flex"
              alignItems="flex-start"
              padding="12px"
            >
              <Box className="image-container">
                <img
                  src={products.image}
                  alt={products.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>{products.name}</div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>Qty:{products.qty}</Box>
                  <Box padding="0.5rem" fontWeight="700">
                    {" "}
                    ${products.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))
      )}
    </>
  );
};

export default Cart;
