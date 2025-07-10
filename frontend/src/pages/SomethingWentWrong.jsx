import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const SomethingWentWrong = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f7fafc", // Light background
        textAlign: "center",
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "4rem", md: "6rem" }, color: "#4299e1" }}>
            Oops!
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h4" sx={{ color: "#2d3748", mt: 2 }}>
            Something Went Wrong
          </Typography>
          <Typography variant="body1" sx={{ color: "#4a5568", mt: 2 }}>
            We apologize, but an unexpected error has occurred. Please try again later.
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
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
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5a67d8",
                backgroundColor: "rgba(102, 126, 234, 0.1)",
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

export default SomethingWentWrong;
