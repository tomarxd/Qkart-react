import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const username = localStorage.getItem("username");

  const history = useHistory();

  const logotButton = () => {
    history.push("/");
    window.location.reload();
    localStorage.clear();
  };

  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          onClick={() => history.push("/")}
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Back to explore
        </Button>
      </Box>
    );
  } else {
    return (
      <Box className="header">
        <Box className="header-title">
          <Link to="/">
            <img src="logo_light.svg" alt="QKart-icon"></img>
          </Link>
        </Box>
        {children}

        {username ? (
          <Stack direction="row" spacing={2}>
            <Avatar alt={username} src="/public/avatar.png" />
            <div className="username">{username}</div>
            <Button onClick={logotButton} variant="text">
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button variant="text" onClick={() => history.push("/login")}>
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => history.push("/register")}
            >
              Register
            </Button>
          </Stack>
        )}
      </Box>
    );
  }
};

export default Header;
