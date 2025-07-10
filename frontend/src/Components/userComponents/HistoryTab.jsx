import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Fade,
} from "@mui/material";
import {
  ArrowDownward as DepositArrowIcon,
  ArrowUpward as WithdrawArrowIcon,
  CompareArrows as TransferArrowIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Public as InternationalIcon,
  LocalAtm as LocalIcon,
} from "@mui/icons-material";

const HistoryTab = ({ currentUserData, userTransactions, getRecipientName }) => {
  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Transaction History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {userTransactions.length > 0 ? (
            <List>
              {userTransactions.map((txn) => (
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
                          ? `Transfer to ${getRecipientName(txn.toId)}`
                          : `Transfer from ${getRecipientName(txn.fromId)}`
                      }
                      secondary={
                        <>
                          {formatDate(txn.timestamp)} •{" "}
                          {txn.isInternational ? (
                            <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                              <InternationalIcon fontSize="small" />
                              <span>International</span>
                            </Stack>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                              <LocalIcon fontSize="small" />
                              <span>Domestic</span>
                            </Stack>
                          )}
                          {txn.commission > 0 && (
                            <Box component="span" display="block" fontSize="0.75rem">
                              Commission: {formatCurrency(txn.commission)}
                            </Box>
                          )}
                        </>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="column" alignItems="flex-end" spacing={1}>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
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
                No transactions found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default HistoryTab;
