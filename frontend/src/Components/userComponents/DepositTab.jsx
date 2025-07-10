import React from "react";
import { Box, Card, CardContent, Typography, Stack, TextField, Alert, Button } from "@mui/material";
import { Add as DepositIcon, Pending as PendingIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const depositSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required"),
});

const DepositTab = ({ currentUserData, dispatch, requestTransaction }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  });

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  const handleDeposit = (data) => {
    const amount = parseFloat(data.amount);
    dispatch(
      requestTransaction({
        fromId: "external",
        toId: currentUserData.id,
        amount,
        type: "deposit",
        isInternational: false,
      })
    );
    reset();
    alert("Deposit request submitted for admin approval!");
  };

  return (
    <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add Funds
          </Typography>
          <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
            Deposit requests require admin approval before funds are added to your account.
          </Alert>
          <form onSubmit={handleSubmit(handleDeposit)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                inputProps={{ step: "0.01", min: "0.01" }}
                {...register("amount")}
                error={!!errors.amount}
                helperText={errors.amount?.message}
                required
              />

              <Typography variant="body2" color="text.secondary">
                Current Balance: {formatCurrency(currentUserData?.balance || 0)}
              </Typography>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<DepositIcon />}
                sx={{
                  background: "linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)",
                  boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                }}
              >
                Request Deposit
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DepositTab;
