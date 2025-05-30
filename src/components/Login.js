import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  const formData = {
    username: "",
    password: "",
  };

  const [values, setValues] = useState(formData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const loginUrl = config.endpoint + "/auth/login";

  const login = async () => {
    setLoading(true);
    if (validateInput(data)) {
      await axios
        .post(loginUrl, {
          username: values.username,
          password: values.password,
        })
        .then((response) => {
          if (response.status === 201) {
            persistLogin(response.data.token,response.data.username,response.data.balance);
            enqueueSnackbar("Logged in successfully", { variant: "success" });
            history.push("/");
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            enqueueSnackbar(error.response.data.message, { variant: "error" });
          } else {
            enqueueSnackbar(
              "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
              { variant: "error" }
            );
          }
        });
    }
    setLoading(false);
  };

  const data = {
    username: values.username,
    password: values.password,
  };

  const validateInput = (data) => {
    if (data.username === "") {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    } else if (data.password === "") {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    } else {
      return true;
    }
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token",token);
    localStorage.setItem("username",username);
    localStorage.setItem("balance",balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>

          <TextField
            id="username"
            label="Username"
            name="username"
            variant="outlined"
            placeholder="Enter Username"
            fullWidth
            value={values.username}
            onChange={handleInputChange}
          />

          <TextField
            id="password"
            label="Password"
            name="password"
            variant="outlined"
            type="password"
            placeholder="Enter Password"
            fullWidth
            value={values.password}
            onChange={handleInputChange}
          />
          {loading ? (
            <div className="circular">
              <CircularProgress />
            </div>
          ) : (
            <Button onClick={login} variant="contained">
              LOGIN TO QKART
            </Button>
          )}

          <p>
            Don’t have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
