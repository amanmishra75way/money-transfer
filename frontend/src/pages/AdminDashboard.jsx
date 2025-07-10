import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveTransaction } from "../redux/txnSlice";
import { updateBalance, logout } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Grid,
  Fade,
  Grow,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Public as InternationalIcon,
  LocalAtm as LocalIcon,
  AccountBalance as BalanceIcon,
  History as HistoryIcon,
  People as UsersIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  ArrowUpward as DepositIcon,
  ArrowDownward as WithdrawIcon,
  CompareArrows as TransferIcon,
  MonetizationOn as CommissionIcon,
  Today as TodayIcon,
  Receipt as TransactionsIcon,
} from "@mui/icons-material";
import ErrorMaker from "../Components/ErrorMaker";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { transactions } = useSelector((state) => state.txn);
  const { users, currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("pending");

  const pendingTxns = transactions.filter((txn) => txn.status === "pending");
  const approvedTxns = transactions.filter((txn) => txn.status === "approved");

  // Calculate stats
  const totalCommission = approvedTxns.reduce((sum, txn) => sum + (txn.commission || 0), 0);
  const today = new Date().toDateString();
  const todayTxns = transactions.filter((txn) => new Date(txn.timestamp).toDateString() === today);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTxns = transactions.filter((txn) => {
    const txnDate = new Date(txn.timestamp);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });

  const getUserName = (id) => {
    if (id === "external") return "External Account";
    const user = users.find((u) => u.id === id);
    return user ? `${user.name} (${id})` : id;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handleApprove = (txn) => {
    dispatch(approveTransaction(txn.id));

    // Handle balance updates
    if (txn.type === "deposit") {
      dispatch(updateBalance({ userId: txn.toId, amount: txn.amount }));
    } else if (txn.type === "withdraw") {
      dispatch(updateBalance({ userId: txn.fromId, amount: -txn.amount }));
    } else if (txn.type === "transfer") {
      // Deduct from sender
      dispatch(updateBalance({ userId: txn.fromId, amount: -txn.amount }));

      // Credit to receiver (excluding commission)
      const netAmount = txn.amount - txn.commission;
      dispatch(updateBalance({ userId: txn.toId, amount: netAmount }));

      // Add commission to admin (find admin user)
      const adminUser = users.find((u) => u.isAdmin);
      if (adminUser && txn.commission > 0) {
        dispatch(updateBalance({ userId: adminUser.id, amount: txn.commission }));
      }
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "deposit":
        return "success";
      case "withdraw":
        return "error";
      case "transfer":
        return "primary";
      default:
        return "default";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Pending Transactions ({pendingTxns.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Review and approve pending transactions below
                </Typography>
                <Divider sx={{ my: 2 }} />

                {pendingTxns.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>From</TableCell>
                          <TableCell>To</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Commission</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingTxns.map((txn) => (
                          <TableRow key={txn.id} hover>
                            <TableCell>
                              <Chip label={txn.type} color={getTransactionTypeColor(txn.type)} size="small" />
                            </TableCell>
                            <TableCell>{getUserName(txn.fromId)}</TableCell>
                            <TableCell>{getUserName(txn.toId)}</TableCell>
                            <TableCell>{formatCurrency(txn.amount)}</TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography>{formatCurrency(txn.commission || 0)}</Typography>
                                {txn.isInternational && (
                                  <Tooltip title="International">
                                    <InternationalIcon fontSize="small" color="primary" />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>{formatDate(txn.timestamp)}</TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleApprove(txn)}
                                startIcon={<ApprovedIcon />}
                              >
                                Approve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending transactions
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case "history":
        return (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Transaction History ({approvedTxns.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  All approved transactions
                </Typography>
                <Divider sx={{ my: 2 }} />

                {approvedTxns.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>From</TableCell>
                          <TableCell>To</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Commission</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {approvedTxns.slice(0, 20).map((txn) => (
                          <TableRow key={txn.id} hover>
                            <TableCell>
                              <Chip label={txn.type} color={getTransactionTypeColor(txn.type)} size="small" />
                            </TableCell>
                            <TableCell>{getUserName(txn.fromId)}</TableCell>
                            <TableCell>{getUserName(txn.toId)}</TableCell>
                            <TableCell>{formatCurrency(txn.amount)}</TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography>{formatCurrency(txn.commission || 0)}</Typography>
                                {txn.isInternational && (
                                  <Tooltip title="International">
                                    <InternationalIcon fontSize="small" color="primary" />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>{formatDate(txn.timestamp)}</TableCell>
                            <TableCell>
                              <Chip label={txn.status} color="success" size="small" icon={<ApprovedIcon />} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transaction history
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case "users":
        return (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  User Management ({users.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overview of all users and their balances
                </Typography>
                <Divider sx={{ my: 2 }} />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Transactions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => {
                        const userTxns = transactions.filter((txn) => txn.fromId === user.id || txn.toId === user.id);
                        return (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: user.isAdmin ? "error.main" : "primary.main" }}>
                                  {user.name.charAt(0)}
                                </Avatar>
                                <Typography>{user.name}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {user.balance !== undefined ? formatCurrency(user.balance) : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.isAdmin ? "Admin" : "User"}
                                color={user.isAdmin ? "error" : "primary"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{userTxns.length}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case "analytics":
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {/* Commission Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <CommissionIcon color="primary" />
                      <Typography variant="h6">Commission Breakdown</Typography>
                    </Stack>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Domestic Transfers (2%)
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(
                            approvedTxns
                              .filter((txn) => txn.type === "transfer" && !txn.isInternational)
                              .reduce((sum, txn) => sum + (txn.commission || 0), 0)
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          International Transfers (10%)
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(
                            approvedTxns
                              .filter((txn) => txn.type === "transfer" && txn.isInternational)
                              .reduce((sum, txn) => sum + (txn.commission || 0), 0)
                          )}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Total Commission
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(totalCommission)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Monthly Summary */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <TodayIcon color="primary" />
                      <Typography variant="h6">This Month's Summary</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Transactions
                          </Typography>
                          <Typography variant="h6">{monthlyTxns.length}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Today's Transactions
                          </Typography>
                          <Typography variant="h6">{todayTxns.length}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "success.50", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Deposits
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {monthlyTxns.filter((txn) => txn.type === "deposit").length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Transfers
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {monthlyTxns.filter((txn) => txn.type === "transfer").length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "error.50", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Withdrawals
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {monthlyTxns.filter((txn) => txn.type === "withdraw").length}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Transaction Distribution */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <TransactionsIcon color="primary" />
                      <Typography variant="h6">Transaction Types Distribution</Typography>
                    </Stack>
                    <Grid container spacing={3} justifyContent="center">
                      <Grid item xs={6} sm={4} md={2}>
                        <Stack alignItems="center">
                          <Avatar sx={{ bgcolor: "success.light", width: 56, height: 56 }}>
                            <DepositIcon color="success" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Deposits
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {transactions.filter((txn) => txn.type === "deposit").length}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Stack alignItems="center">
                          <Avatar sx={{ bgcolor: "primary.light", width: 56, height: 56 }}>
                            <TransferIcon color="primary" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Transfers
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {transactions.filter((txn) => txn.type === "transfer").length}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Stack alignItems="center">
                          <Avatar sx={{ bgcolor: "error.light", width: 56, height: 56 }}>
                            <WithdrawIcon color="error" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Withdrawals
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {transactions.filter((txn) => txn.type === "withdraw").length}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
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
                  bgcolor: "error.main",
                  color: "white",
                  width: 40,
                  height: 40,
                }}
              >
                <AdminIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Admin Panel
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="body2" fontWeight="medium">
                  Welcome, {currentUser?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrator
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

      {/* Stats Overview */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.light" }}>
                    <PendingIcon color="warning" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending Approvals
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {pendingTxns.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.light" }}>
                    <ApprovedIcon color="success" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {transactions.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <CommissionIcon color="primary" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Commission
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(totalCommission)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <TodayIcon color="info" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Today's Transactions
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {todayTxns.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pb: 4 }}>
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
            <Tab value="pending" label="Pending" icon={<PendingIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab value="history" label="History" icon={<HistoryIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab value="users" label="Users" icon={<UsersIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              value="analytics"
              label="Analytics"
              icon={<AnalyticsIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
