import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // or navigate('/') to go home
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fff5f5",
        textAlign: "center",
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h1" sx={{ fontSize: { xs: "5rem", md: "8rem" }, color: "#e53e3e" }}>
            404
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h4" sx={{ color: "#2d3748", mt: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: "#4a5568", mt: 2 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleGoBack}
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            sx={{
              mt: 4,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderColor: "#e53e3e",
              color: "#e53e3e",
              "&:hover": {
                borderColor: "#c53030",
                backgroundColor: "rgba(229, 62, 62, 0.1)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Go Back
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFound;
