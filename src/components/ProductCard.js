import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  
  return (
    <Card className="card" sx={{ mt: 3 }}>
      <CardMedia
        component="img"
        height="230px"
        width="100%"
        image={product.image}
        alt={product.category}
        sx={{ objectFit: "contain" }}
      />
      <CardContent>
        <Typography variant="subtitle1">{product.name}</Typography>
        <Typography sx={{fontWeight:"bold", m:1}}>${product.cost}</Typography>
        <Rating value={product.rating} readOnly />
        <CardActions className="card-actions" style={{ justifyContent: "center" }}>
          <Button className="card-button" onClick={()=>handleAddToCart} fullWidth variant="contained">
            {" "}
            <AddShoppingCartOutlined />
            Add to cart
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;