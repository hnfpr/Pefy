import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { dataManager, SpendingEntry, SavingsAccount } from '../utils/dataManager';
import { Plus, Edit, Trash2, Calendar, DollarSign, ArrowLeftRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SpendingTrackerProps {
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  formatCurrencyWithoutSymbol: (amount: number) => string;
  parseCurrency: (formattedAmount: string) => number;
}

export function SpendingTracker({ 
  categories, 
  onUpdateCategories, 
  currencySymbol, 
  formatCurrency, 
  formatCurrencyWithoutSymbol, 
  parseCurrency 
}: SpendingTrackerProps) {
  const [entries, setEntries] = useState<SpendingEntry[]>([]);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SpendingEntry | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'expense' | 'transfer',
    accountId: '',
    transferToAccountId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEntries(dataManager.getSpendingEntries());
    setAccounts(dataManager.getSavingsAccounts());
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      description: '',
      type: 'expense',
      accountId: '',
      transferToAccountId: ''
    });
    setErrors({});
    setEditingEntry(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.type === 'expense' && !formData.accountId) {
      newErrors.accountId = 'Please select an account to deduct from';
    }

    if (formData.type === 'transfer') {
      if (!formData.accountId) {
        newErrors.accountId = 'Please select a source account';
      }
      if (!formData.transferToAccountId) {
        newErrors.transferToAccountId = 'Please select a destination account';
      }
      if (formData.accountId === formData.transferToAccountId) {
        newErrors.transferToAccountId = 'Source and destination accounts must be different';
      }
    }

    // Check if selected account has sufficient balance
    if (formData.accountId && parseFloat(formData.amount) > 0) {
      const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
      if (selectedAccount && selectedAccount.balance < parseFloat(formData.amount)) {
        newErrors.amount = `Insufficient balance. Available: ${formatCurrency(selectedAccount.balance)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      const entryData = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: formData.type,
        accountId: formData.accountId || undefined,
        transferToAccountId: formData.transferToAccountId || undefined
      };

      if (editingEntry) {
        await dataManager.updateSpendingEntry(editingEntry.id, entryData);
        toast.success('Entry updated successfully');
      } else {
        await dataManager.addSpendingEntry(entryData);
        toast.success('Entry added successfully');
      }

      loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEdit = (entry: SpendingEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      amount: entry.amount.toString(),
      category: entry.category,
      description: entry.description || '',
      type: entry.type,
      accountId: entry.accountId || '',
      transferToAccountId: entry.transferToAccountId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = dataManager.deleteSpendingEntry(id);
      if (success) {
        loadData();
        toast.success('Entry deleted successfully');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the entry');
    }
  };

  const getAccountDisplayName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.bankName} - ${account.accountName}` : 'Unknown Account';
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4 text-blue-500" />;
      case 'expense':
      default:
        return <CreditCard className="w-4 h-4 text-red-500" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'Transfer';
      case 'expense':
      default:
        return 'Expense';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Spending Tracker</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* No accounts warning */}
      {accounts.length === 0 && (
        <Alert>
          <AlertDescription>
            You need to create at least one savings account before you can track spending. 
            Go to the Accounts tab to add your first account.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No spending entries yet. Add your first entry to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionTypeIcon(entry.type)}
                          <Badge variant={entry.type === 'transfer' ? 'secondary' : 'destructive'}>
                            {getTransactionTypeLabel(entry.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-muted text-sm">
                          {entry.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.type === 'transfer' && entry.transferToAccountId ? (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">From:</div>
                            <div>{entry.accountId ? getAccountDisplayName(entry.accountId) : '-'}</div>
                            <div className="text-xs text-muted-foreground">To:</div>
                            <div>{getAccountDisplayName(entry.transferToAccountId)}</div>
                          </div>
                        ) : (
                          entry.accountId ? getAccountDisplayName(entry.accountId) : '-'
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this spending entry? This action cannot be undone and will reverse any account balance changes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Entry Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update the spending entry details.' : 'Enter the details for your new spending entry or transfer.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'expense' | 'transfer') => {
                  setFormData(prev => ({ 
                    ...prev, 
                    type: value,
                    category: value === 'transfer' ? 'Transfer' : prev.category
                  }));
                  setErrors(prev => ({ ...prev, type: '' }));
                }}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Expense</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center space-x-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>Transfer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <Alert>
                  <AlertDescription className="text-sm text-red-600">
                    {errors.type}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }));
                  setErrors(prev => ({ ...prev, date: '' }));
                }}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <Alert>
                  <AlertDescription className="text-sm text-red-600">
                    {errors.date}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({currencySymbol})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, amount: e.target.value }));
                  setErrors(prev => ({ ...prev, amount: '' }));
                }}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <Alert>
                  <AlertDescription className="text-sm text-red-600">
                    {errors.amount}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Source Account */}
            <div className="space-y-2">
              <Label htmlFor="accountId">
                {formData.type === 'transfer' ? 'From Account' : 'Account'}
              </Label>
              <Select 
                value={formData.accountId} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, accountId: value }));
                  setErrors(prev => ({ ...prev, accountId: '' }));
                }}
              >
                <SelectTrigger className={errors.accountId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={`Select ${formData.type === 'transfer' ? 'source' : ''} account`} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{account.bankName} - {account.accountName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <Alert>
                  <AlertDescription className="text-sm text-red-600">
                    {errors.accountId}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Destination Account (for transfers) */}
            {formData.type === 'transfer' && (
              <div className="space-y-2">
                <Label htmlFor="transferToAccountId">To Account</Label>
                <Select 
                  value={formData.transferToAccountId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, transferToAccountId: value }));
                    setErrors(prev => ({ ...prev, transferToAccountId: '' }));
                  }}
                >
                  <SelectTrigger className={errors.transferToAccountId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(account => account.id !== formData.accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{account.bankName} - {account.accountName}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatCurrency(account.balance)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.transferToAccountId && (
                  <Alert>
                    <AlertDescription className="text-sm text-red-600">
                      {errors.transferToAccountId}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Category */}
            {formData.type === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }));
                    setErrors(prev => ({ ...prev, category: '' }));
                  }}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'Transfer').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <Alert>
                    <AlertDescription className="text-sm text-red-600">
                      {errors.category}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={formData.type === 'transfer' ? 'Transfer note...' : 'What did you spend on?'}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={accounts.length === 0}>
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}