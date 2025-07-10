import React from "react";
import { Box, Card, CardContent, Typography, Stack, TextField, Alert, Button } from "@mui/material";
import { Remove as WithdrawIcon, Pending as PendingIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRequestTransactionMutation } from "../../services/api";

const WithdrawTab = ({ currentUserData }) => {
  const withdrawSchema = yup.object().shape({
    amount: yup
      .number()
      .typeError("Amount must be a number")
      .positive("Amount must be positive")
      .required("Amount is required")
      .test("balance-check", "Insufficient balance", function (value) {
        return value <= currentUserData?.balance;
      }),
  });

  const [requestTransaction] = useRequestTransactionMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(withdrawSchema),
    context: { currentUserData },
    defaultValues: {
      amount: "",
    },
  });

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  const handleWithdraw = async (data) => {
    try {
      const amount = parseFloat(data.amount);
      await requestTransaction({
        fromId: currentUserData.id,
        toId: "external",
        amount,
        type: "withdraw",
        isInternational: false,
      }).unwrap();
      reset();
      alert("Withdrawal request submitted for admin approval!");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed: " + (error.data?.message || "Unknown error"));
    }
  };

  return (
    <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Withdraw Funds
          </Typography>
          <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
            Withdrawal requests require admin approval before funds are deducted from your account.
          </Alert>
          <form onSubmit={handleSubmit(handleWithdraw)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                inputProps={{
                  step: "0.01",
                  min: "0.01",
                }}
                {...register("amount")}
                error={!!errors.amount}
                helperText={errors.amount?.message}
                required
              />

              <Typography variant="body2" color="text.secondary">
                Available balance: {formatCurrency(currentUserData?.balance || 0)}
              </Typography>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<WithdrawIcon />}
                sx={{
                  background: "linear-gradient(45deg, #f44336 30%, #c62828 90%)",
                  boxShadow: "0 3px 5px 2px rgba(244, 67, 54, .3)",
                }}
              >
                Request Withdrawal
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WithdrawTab;
