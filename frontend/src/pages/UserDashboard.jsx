import React, { lazy, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { requestTransaction } from "../redux/txnSlice";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo } from "react";

// Lazy load components
const OverviewTab = lazy(() => import("../Components/userComponents/OverviewTab.jsx"));
const TransferTab = lazy(() => import("../Components/userComponents/TransferTab.jsx"));
const DepositTab = lazy(() => import("../Components/userComponents/DepositTab.jsx"));
const WithdrawTab = lazy(() => import("../Components/userComponents/WithdrawTab.jsx"));
const HistoryTab = lazy(() => import("../Components/userComponents/HistoryTab.jsx"));

import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  SwapHoriz as TransferIcon,
  Add as DepositIcon,
  Remove as WithdrawIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

// Yup validation schemas
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

const depositSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required"),
});

const withdrawSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required")
    .test("balance-check", "Insufficient balance", function (value) {
      const currentUserData = this.options.context?.currentUserData;
      return currentUserData ? value <= currentUserData.balance : false;
    }),
});

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, users } = useSelector((state) => state.user);
  const { transactions } = useSelector((state) => state.txn);

  const [activeTab, setActiveTab] = useState("overview");

  // Get current user data from users array (to get updated balance)
  const currentUserData = useMemo(() => {
    return users.find((u) => u.id === currentUser?.id) || currentUser;
  }, [users, currentUser]);

  // React Hook Form setup for each form
  const {
    register: registerTransfer,
    handleSubmit: handleTransferSubmit,
    watch: watchTransfer,
    formState: { errors: transferErrors },
    reset: resetTransfer,
  } = useForm({
    resolver: yupResolver(transferSchema),
    context: { currentUserData }, // Pass currentUserData for balance validation
    defaultValues: {
      recipientId: "",
      amount: "",
      isInternational: false,
    },
  });
  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: resetDeposit,
  } = useForm({
    resolver: yupResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  });

  const {
    register: registerWithdraw,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors },
    reset: resetWithdraw,
  } = useForm({
    resolver: yupResolver(withdrawSchema),
    context: { currentUserData }, // Pass currentUserData for balance validation
    defaultValues: {
      amount: "",
    },
  });

  const watchTransferFields = watchTransfer();

  // Get user's transactions
  const userTransactions = useMemo(() => {
    return transactions.filter((txn) => txn.fromId === currentUserData?.id || txn.toId === currentUserData?.id);
  }, [transactions, currentUserData?.id]);

  const handleTransfer = (data) => {
    const amount = parseFloat(data.amount);
    const commission = data.isInternational ? amount * 0.1 : amount * 0.02;

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: data.recipientId,
        amount,
        type: "transfer",
        isInternational: data.isInternational,
      })
    );

    resetTransfer();
    alert("Transfer request submitted for admin approval!");
  };
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

    resetDeposit();
    alert("Deposit request submitted for admin approval!");
  };

  const handleWithdraw = (data) => {
    const amount = parseFloat(data.amount);

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: "external",
        amount,
        type: "withdraw",
        isInternational: false,
      })
    );

    resetWithdraw();
    alert("Withdrawal request submitted for admin approval!");
  };

  const getRecipientName = (recipientId) => {
    if (recipientId === "external") return "External Account";
    const recipient = users.find((u) => u.id === recipientId);
    return recipient ? recipient.name : recipientId;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Calculate stats
  const approvedTransactions = useMemo(() => {
    return userTransactions.filter((txn) => txn.status === "approved");
  }, [userTransactions]);

  const pendingTransactions = useMemo(() => {
    return userTransactions.filter((txn) => txn.status === "pending");
  }, [userTransactions]);

  const thisMonthTransactions = useMemo(() => {
    const now = new Date();
    return userTransactions.filter((txn) => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
    });
  }, [userTransactions]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            currentUserData={currentUserData}
            userTransactions={userTransactions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getRecipientName={getRecipientName}
          />
        );

      case "transfer":
        return (
          <TransferTab
            users={users}
            currentUserData={currentUserData}
            dispatch={dispatch}
            requestTransaction={requestTransaction}
          />
        );

      case "deposit":
        return (
          <DepositTab currentUserData={currentUserData} dispatch={dispatch} requestTransaction={requestTransaction} />
        );

      case "withdraw":
        return (
          <WithdrawTab currentUserData={currentUserData} dispatch={dispatch} requestTransaction={requestTransaction} />
        );

      case "history":
        return (
          <HistoryTab
            currentUserData={currentUserData}
            userTransactions={userTransactions}
            getRecipientName={getRecipientName}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      {/* App Bar */}
      <Paper
        elevation={1}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderRadius: 0,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: 40,
                  height: 40,
                }}
              >
                MT
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                MoneyTransfer
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="body2" fontWeight="medium">
                  Welcome, {currentUserData?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Balance: {formatCurrency(currentUserData?.balance || 0)}
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  dispatch(logout());
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              },
            }}
          >
            <Tab value="overview" label="Overview" icon={<BalanceIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              value="transfer"
              label="Transfer"
              icon={<TransferIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab value="deposit" label="Deposit" icon={<DepositIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              value="withdraw"
              label="Withdraw"
              icon={<WithdrawIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab value="history" label="History" icon={<HistoryIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
          </Tabs>
        </Paper>

        {renderTabContent()}
      </Container>
    </Box>
  );
};

export default UserDashboard;
