import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { dataManager, SavingsAccount } from '../utils/dataManager';
import { Plus, Edit, Trash2, ArrowRightLeft, Wallet, Building } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SavingsManagerProps {
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  formatCurrencyWithoutSymbol: (amount: number) => string;
  parseCurrency: (formattedAmount: string) => number;
}

export function SavingsManager({ currencySymbol, formatCurrency, formatCurrencyWithoutSymbol, parseCurrency }: SavingsManagerProps) {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    balance: ''
  });

  // Transfer form state
  const [transferData, setTransferData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const loadedAccounts = dataManager.getSavingsAccounts();
    // Sort by balance descending
    loadedAccounts.sort((a, b) => b.balance - a.balance);
    setAccounts(loadedAccounts);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!formData.balance || isNaN(parseFloat(formData.balance)) || parseFloat(formData.balance) < 0) {
      newErrors.balance = 'Please enter a valid balance (0 or greater)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTransfer = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!transferData.fromAccount) {
      newErrors.fromAccount = 'Please select the source account';
    }

    if (!transferData.toAccount) {
      newErrors.toAccount = 'Please select the destination account';
    }

    if (transferData.fromAccount === transferData.toAccount) {
      newErrors.toAccount = 'Source and destination accounts must be different';
    }

    if (!transferData.amount || isNaN(parseFloat(transferData.amount)) || parseFloat(transferData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    } else {
      const fromAccount = accounts.find(acc => acc.id === transferData.fromAccount);
      if (fromAccount && parseFloat(transferData.amount) > fromAccount.balance) {
        newErrors.amount = 'Transfer amount exceeds available balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      const accountData = {
        bankName: formData.bankName.trim(),
        accountName: formData.accountName.trim(),
        balance: parseFloat(formData.balance)
      };

      if (editingAccount) {
        dataManager.updateSavingsAccount(editingAccount.id, accountData);
        toast.success('Savings account updated successfully');
      } else {
        dataManager.addSavingsAccount(accountData);
        toast.success('Savings account added successfully');
      }

      resetForm();
      loadAccounts();
    } catch (error) {
      toast.error('Failed to save savings account');
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransfer()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      const success = dataManager.transferBetweenAccounts(
        transferData.fromAccount,
        transferData.toAccount,
        parseFloat(transferData.amount)
      );

      if (success) {
        toast.success('Transfer completed successfully');
        resetTransferForm();
        loadAccounts();
      } else {
        toast.error('Transfer failed. Please check account balances.');
      }
    } catch (error) {
      toast.error('Failed to complete transfer');
    }
  };

  const handleEdit = (account: SavingsAccount) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      accountName: account.accountName,
      balance: account.balance.toString()
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    try {
      dataManager.deleteSavingsAccount(id);
      loadAccounts();
      toast.success('Savings account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete savings account');
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountName: '',
      balance: ''
    });
    setEditingAccount(null);
    setShowForm(false);
    setErrors({});
  };

  const resetTransferForm = () => {
    setTransferData({
      fromAccount: '',
      toAccount: '',
      amount: ''
    });
    setShowTransferForm(false);
    setErrors({});
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Savings</CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {accounts.length >= 2 && (
          <Button variant="outline" onClick={() => setShowTransferForm(true)}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer Money
          </Button>
        )}
      </div>

      {/* Add/Edit Account Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowForm(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit' : 'Add'} Savings Account</DialogTitle>
            <DialogDescription>
              {editingAccount 
                ? 'Update the details for this savings account.' 
                : 'Add a new savings account to track your money.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., Chase Bank"
                  className={errors.bankName ? 'border-red-500' : ''}
                />
                {errors.bankName && (
                  <Alert className="mt-1">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.bankName}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className={errors.accountName ? 'border-red-500' : ''}
                />
                {errors.accountName && (
                  <Alert className="mt-1">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.accountName}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance ({currencySymbol})</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="0.00"
                className={errors.balance ? 'border-red-500' : ''}
              />
              {errors.balance && (
                <Alert className="mt-1">
                  <AlertDescription className="text-sm text-red-600">
                    {errors.balance}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAccount ? 'Update' : 'Add'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={showTransferForm} onOpenChange={(open) => {
        if (!open) {
          resetTransferForm();
        }
        setShowTransferForm(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transfer Money</DialogTitle>
            <DialogDescription>
              Transfer money between your savings accounts. The transfer will happen instantly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account</Label>
                <Select 
                  value={transferData.fromAccount} 
                  onValueChange={(value) => setTransferData({ ...transferData, fromAccount: value })}
                >
                  <SelectTrigger className={errors.fromAccount ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountName} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fromAccount && (
                  <Alert className="mt-1">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.fromAccount}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account</Label>
                <Select 
                  value={transferData.toAccount} 
                  onValueChange={(value) => setTransferData({ ...transferData, toAccount: value })}
                >
                  <SelectTrigger className={errors.toAccount ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountName} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.toAccount && (
                  <Alert className="mt-1">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.toAccount}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferAmount">Transfer Amount ({currencySymbol})</Label>
              <Input
                id="transferAmount"
                type="number"
                step="0.01"
                min="0"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <Alert className="mt-1">
                  <AlertDescription className="text-sm text-red-600">
                    {errors.amount}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetTransferForm}>
                Cancel
              </Button>
              <Button type="submit">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No savings accounts yet. Add your first account to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{account.accountName}</CardTitle>
                <p className="text-sm text-muted-foreground">{account.bankName}</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatCurrency(account.balance)}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{account.accountName}" at {account.bankName}? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(account.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Updated: {new Date(account.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}