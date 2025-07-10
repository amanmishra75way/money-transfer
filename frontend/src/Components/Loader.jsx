import { CircularProgress, Box, useTheme } from "@mui/material";

const Loader = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }} />
    </Box>
  );
};

export default Loader;
