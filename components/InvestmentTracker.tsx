import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { dataManager, Investment } from '../utils/dataManager';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface InvestmentTrackerProps {
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  formatCurrencyWithoutSymbol: (amount: number) => string;
  parseCurrency: (formattedAmount: string) => number;
}

export function InvestmentTracker({ currencySymbol, formatCurrency, formatCurrencyWithoutSymbol, parseCurrency }: InvestmentTrackerProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = () => {
    const loadedInvestments = dataManager.getInvestments();
    // Sort by date descending
    loadedInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setInvestments(loadedInvestments);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Investment name is required';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      const investmentData = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes.trim()
      };

      if (editingInvestment) {
        dataManager.updateInvestment(editingInvestment.id, investmentData);
        toast.success('Investment updated successfully');
      } else {
        dataManager.addInvestment(investmentData);
        toast.success('Investment added successfully');
      }

      resetForm();
      loadInvestments();
    } catch (error) {
      toast.error('Failed to save investment');
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      amount: investment.amount.toString(),
      date: investment.date,
      notes: investment.notes || ''
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    try {
      dataManager.deleteInvestment(id);
      loadInvestments();
      toast.success('Investment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingInvestment(null);
    setShowForm(false);
    setErrors({});
  };

  const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const thisMonthInvestments = investments.filter(investment => {
    const investmentDate = new Date(investment.date);
    const now = new Date();
    return investmentDate.getMonth() === now.getMonth() && investmentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, investment) => sum + investment.amount, 0);

  const thisYearInvestments = investments.filter(investment => {
    const investmentDate = new Date(investment.date);
    const now = new Date();
    return investmentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, investment) => sum + investment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthInvestments)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisYearInvestments)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestments)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Investment Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Investment Portfolio</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowForm(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingInvestment ? 'Edit' : 'Add'} Investment</DialogTitle>
            <DialogDescription>
              {editingInvestment 
                ? 'Update the details for this investment entry.' 
                : 'Add a new investment to track your portfolio growth.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Investment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Apple Stock, S&P 500 ETF"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <Alert className="mt-1">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.name}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Invested ({currencySymbol})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Investment Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <Alert className="mt-1">
                  <AlertDescription className="text-sm text-red-600">
                    {errors.date}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes about this investment, strategy, or performance..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Track your investment strategy, performance notes, or any other relevant information.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingInvestment ? 'Update' : 'Add'} Investment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No investments tracked yet. Add your first investment to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investment Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">
                        {investment.name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(investment.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(investment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {investment.notes ? (
                          <div className="truncate" title={investment.notes}>
                            {investment.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(investment)}
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
                                <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{investment.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(investment.id)}>
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

      {investments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Average Investment</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalInvestments / investments.length)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Largest Investment</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.max(...investments.map(inv => inv.amount)))}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Monthly Average</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(thisYearInvestments / 12)}
                </p>
                <p className="text-xs text-muted-foreground">Based on this year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}