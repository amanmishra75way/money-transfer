import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authReducer";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo } from "react";
import { api } from "../services/api.ts";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginUserMutation, useLogoutUserMutation } from "../services/api";

const loginSchema = yup.object().shape({
  id: yup.string().required("User ID is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loginUser, { isLoading: isLoginLoading, error: loginError }] = useLoginUserMutation();
  const [logoutUser] = useLogoutUserMutation();

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, error } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const [redirected, setRedirected] = useState(false);

  // useEffect(() => {
  //   if (!redirected && isAuthenticated && currentUser) {
  //     setRedirected(true);
  //     navigate(currentUser.role === "ADMIN" ? "/admin" : "/dashboard");
  //   }
  // }, [isAuthenticated, currentUser, navigate, redirected]);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await loginUser({ email: formData.id, password: formData.password }).unwrap();
      navigate(response.data.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const quickLogin = (id, password) => {
    setValue("id", id);
    setValue("password", password);
    handleSubmit(onSubmit)();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Trial users data
  const trialUsers = useMemo(
    () => [
      { name: "Alice", id: "u1", password: "alice123", role: "User", color: "primary" },
      { name: "Bob", id: "u2", password: "bob123", role: "User", color: "primary" },
      { name: "Administrator", id: "admin", password: "admin123", role: "Admin", color: "success" },
    ],
    []
  );

  if (currentUser) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 3 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Card
            elevation={8}
            sx={{
              width: "100%",
              borderRadius: theme.shape.borderRadius * 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {currentUser.role === "ADMIN" ? (
                  <AdminIcon sx={{ fontSize: 40 }} />
                ) : (
                  <PersonIcon sx={{ fontSize: 40 }} />
                )}
              </Avatar>

              <Typography variant="h4" gutterBottom fontWeight="bold">
                Welcome, {currentUser.name}!
              </Typography>

              <Chip
                label={currentUser.role === "ADMIN" ? "Administrator" : "User"}
                color={currentUser.role === "ADMIN" ? "warning" : "info"}
                sx={{ mb: 4, fontWeight: "bold" }}
              />

              <Stack spacing={2}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate(currentUser.role === "ADMIN" ? "/admin" : "/dashboard")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      },
                      borderRadius: theme.shape.borderRadius * 2,
                      py: 1.5,
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.8)",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                      borderRadius: theme.shape.borderRadius * 2,
                      py: 1.5,
                    }}
                  >
                    Logout
                  </Button>
                </motion.div>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: "flex",
        alignItems: "center",
        py: 3,
      }}
    >
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Card
            elevation={12}
            sx={{
              borderRadius: theme.shape.borderRadius * 3,
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                minHeight: { md: "600px" },
              }}
            >
              {/* Left Panel - Login Form */}
              <Box sx={{ flex: 1, p: { xs: 3, sm: 4, md: 5 } }}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <motion.div whileHover={{ rotate: 5, scale: 1.05 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: "auto",
                        mb: 2,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <LockIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </motion.div>

                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    MoneyTransfer
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    Secure Money Transfer Platform
                  </Typography>
                </Box>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}
                        icon={<LockIcon />}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={3}>
                    <motion.div whileHover={{ scale: 1.01 }}>
                      <TextField
                        fullWidth
                        label="User ID"
                        {...register("id")}
                        error={!!errors.id}
                        helperText={errors.id?.message}
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: <AccountCircleIcon sx={{ color: "action.active", mr: 1 }} />,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: theme.shape.borderRadius,
                          },
                        }}
                      />
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.01 }}>
                      <TextField
                        fullWidth
                        label="Password"
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: <LockIcon sx={{ color: "action.active", mr: 1 }} />,
                          endAdornment: (
                            <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: theme.shape.borderRadius,
                          },
                        }}
                      />
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: theme.shape.borderRadius,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                          boxShadow: theme.shadows[3],
                          "&:hover": {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                          },
                        }}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </motion.div>
                  </Stack>
                </Box>
              </Box>

              {/* Right Panel - Trial Credentials */}
              <Box
                sx={{
                  flex: { md: 0.8 },
                  bgcolor: theme.palette.grey[50],
                  p: { xs: 3, sm: 4, md: 5 },
                  borderLeft: { md: "1px solid" },
                  borderTop: { xs: "1px solid", md: "none" },
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Trial User Credentials
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click on any credential to quick login
                </Typography>

                <Stack spacing={2}>
                  {trialUsers.map((user, index) => (
                    <motion.div key={index} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: theme.shape.borderRadius * 2,
                          cursor: "pointer",
                          transition: theme.transitions.create(["box-shadow", "transform"], {
                            duration: theme.transitions.duration.short,
                          }),
                          "&:hover": {
                            boxShadow: theme.shadows[4],
                            bgcolor: theme.palette.primary.light + "08",
                          },
                        }}
                        onClick={() => quickLogin(user.id, user.password)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 2,
                              bgcolor: user.role === "Admin" ? theme.palette.success.main : theme.palette.primary.main,
                            }}
                          >
                            {user.role === "Admin" ? <AdminIcon /> : <PersonIcon />}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === "Admin" ? "success" : "primary"}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ pl: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            ID:{" "}
                            <Box component="span" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                              {user.id}
                            </Box>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Password:{" "}
                            <Box component="span" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                              {user.password}
                            </Box>
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
