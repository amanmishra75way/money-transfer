import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Fade,
  Stack,
} from "@mui/material";
import {
  ArrowDownward as DepositArrowIcon,
  ArrowUpward as WithdrawArrowIcon,
  CompareArrows as TransferArrowIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

const OverviewTab = ({ currentUserData, userTransactions, formatCurrency, formatDate, getRecipientName }) => {
  const approvedTransactions = userTransactions.filter((txn) => txn.status === "approved");
  const pendingTransactions = userTransactions.filter((txn) => txn.status === "pending");
  const thisMonthTransactions = userTransactions.filter((txn) => {
    const date = new Date(txn.timestamp);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  return (
    <Box sx={{ mt: 3 }}>
      {/* Balance Card */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Balance
          </Typography>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {formatCurrency(currentUserData?.balance || 0)}
          </Typography>
          <Typography variant="body2">Available for transfer</Typography>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {userTransactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {pendingTransactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                This Month
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {thisMonthTransactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {userTransactions.length > 0 ? (
            <List>
              {userTransactions.slice(0, 5).map((txn) => (
                <Fade in key={txn.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            txn.type === "deposit"
                              ? "success.main"
                              : txn.type === "withdraw"
                              ? "error.main"
                              : "primary.main",
                        }}
                      >
                        {txn.type === "deposit" ? (
                          <DepositArrowIcon />
                        ) : txn.type === "withdraw" ? (
                          <WithdrawArrowIcon />
                        ) : (
                          <TransferArrowIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        txn.type === "deposit"
                          ? "Deposit"
                          : txn.type === "withdraw"
                          ? "Withdrawal"
                          : txn.fromId === currentUserData.id
                          ? `To ${getRecipientName(txn.toId)}`
                          : `From ${getRecipientName(txn.fromId)}`
                      }
                      secondary={formatDate(txn.timestamp)}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body1"
                          color={
                            txn.fromId === currentUserData.id && txn.type !== "deposit" ? "error.main" : "success.main"
                          }
                        >
                          {txn.fromId === currentUserData.id && txn.type !== "deposit" ? "-" : "+"}
                          {formatCurrency(txn.amount)}
                        </Typography>
                        <Chip
                          size="small"
                          label={txn.status}
                          color={txn.status === "pending" ? "warning" : "success"}
                          icon={txn.status === "pending" ? <PendingIcon /> : <ApprovedIcon />}
                        />
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Fade>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No transactions yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverviewTab;
