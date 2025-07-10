import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CompareArrows as TransferIcon, Public as InternationalIcon } from "@mui/icons-material";

const transferSchema = yup.object().shape({
  recipientId: yup.string().required("Recipient is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required")
    .test("balance-check", "Insufficient balance including commission", function (value) {
      if (!value) return true;
      const currentUserData = this.options.context?.currentUserData;
      const isInternational = this.parent.isInternational;
      const commission = isInternational ? value * 0.1 : value * 0.02;
      const totalAmount = value + commission;
      return currentUserData ? totalAmount <= currentUserData.balance : false;
    }),
  isInternational: yup.boolean(),
});

const TransferTab = ({ users, currentUserData, dispatch, requestTransaction }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(transferSchema),
    context: { currentUserData },
    defaultValues: {
      recipientId: "",
      amount: "",
      isInternational: false,
    },
  });

  const watchFields = watch();

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  const handleTransfer = (data) => {
    const amount = parseFloat(data.amount);
    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: data.recipientId,
        amount,
        type: "transfer",
        isInternational: data.isInternational,
      })
    );
    reset();
    alert("Transfer request submitted for admin approval!");
  };

  return (
    <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Send Money
          </Typography>
          <form onSubmit={handleSubmit(handleTransfer)}>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!errors.recipientId}>
                <InputLabel id="recipient-label">Recipient</InputLabel>
                <Select labelId="recipient-label" label="Recipient" {...register("recipientId")} required>
                  <MenuItem value="">Select recipient</MenuItem>
                  {users
                    .filter((u) => u.id !== currentUserData?.id && !u.isAdmin)
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.id})
                      </MenuItem>
                    ))}
                </Select>
                {errors.recipientId && (
                  <Typography variant="caption" color="error">
                    {errors.recipientId.message}
                  </Typography>
                )}
              </FormControl>

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

              <FormControlLabel
                control={<Checkbox {...register("isInternational")} />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>International Transfer</Typography>
                    <InternationalIcon fontSize="small" />
                    <Chip label="10% commission" size="small" color="warning" />
                  </Stack>
                }
              />

              {watchFields.amount && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100" }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Commission ({watchFields.isInternational ? "10%" : "2%"}):{" "}
                      {formatCurrency(parseFloat(watchFields.amount || 0) * (watchFields.isInternational ? 0.1 : 0.02))}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Total:{" "}
                      {formatCurrency(
                        parseFloat(watchFields.amount || 0) * (1 + (watchFields.isInternational ? 0.1 : 0.02))
                      )}
                    </Typography>
                    {errors.amount?.type === "balance-check" && (
                      <Typography variant="body2" color="error">
                        {errors.amount.message}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              )}

              <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.50" }}>
                <Typography variant="body2" color="primary">
                  Available Balance: {formatCurrency(currentUserData?.balance || 0)}
                </Typography>
              </Paper>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<TransferIcon />}
                sx={{
                  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
                }}
              >
                Send Money
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransferTab;
