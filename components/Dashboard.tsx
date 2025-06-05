import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dataManager, SpendingEntry, SavingsAccount, Investment } from '../utils/dataManager';
import { NumberFormatter } from '../utils/numberFormatter';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DashboardProps {
  onUpdateTarget: (target: number) => void;
  monthlyTarget: number;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  categoryColors: Record<string, string>;
}

export function Dashboard({ onUpdateTarget, monthlyTarget, currencySymbol, formatCurrency, categoryColors }: DashboardProps) {
  const [spending, setSpending] = useState<SpendingEntry[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [targetInput, setTargetInput] = useState(monthlyTarget.toString());
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateChartData();
    generateCategoryData();
  }, [spending, monthlyTarget]);

  useEffect(() => {
    setTargetInput(monthlyTarget.toString());
  }, [monthlyTarget]);

  const loadData = () => {
    setSpending(dataManager.getSpendingEntries());
    setSavings(dataManager.getSavingsAccounts());
    setInvestments(dataManager.getInvestments());
  };

  const generateChartData = () => {
    const last6Months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthSpending = dataManager.getMonthlySpending(date.getFullYear(), date.getMonth());
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        target: monthlyTarget,
        actual: monthSpending,
        difference: monthlyTarget - monthSpending
      });
    }
    
    setChartData(last6Months);
  };

  const generateCategoryData = () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    
    const categorySpending = dataManager.getSpendingByCategory(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    const categoryArray = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount,
      fill: categoryColors[category] || '#6b7280'
    }));
    
    setCategoryData(categoryArray);
  };

  const handleUpdateTarget = () => {
    const newTarget = parseFloat(targetInput);
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdateTarget(newTarget);
      setShowTargetModal(false);
      toast.success('Monthly target updated successfully');
    } else {
      toast.error('Please enter a valid positive amount');
    }
  };

  const totalSavings = savings.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const currentMonthSpending = dataManager.getMonthlySpending(
    new Date().getFullYear(),
    new Date().getMonth()
  );

  const netWorth = totalSavings + totalInvestments;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financial Overview</h1>
        <Dialog open={showTargetModal} onOpenChange={setShowTargetModal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Monthly Spending Target</DialogTitle>
              <DialogDescription>
                Set your monthly spending target to track your budget progress and generate meaningful insights.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="target">Monthly Target ({currencySymbol})</Label>
                <Input
                  id="target"
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter your monthly spending target"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="p-4 bg-muted rounded-lg space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Current target:</span> {formatCurrency(monthlyTarget)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">This month's spending:</span> {formatCurrency(currentMonthSpending)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Remaining budget:</span> 
                  <span className={`ml-1 font-semibold ${monthlyTarget - currentMonthSpending >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(monthlyTarget - currentMonthSpending)}
                  </span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTargetModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTarget}>
                Update Target
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthSpending)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthSpending <= monthlyTarget ? (
                <span className="text-green-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Under budget
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Over budget
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              Across {savings.length} account{savings.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">
              {investments.length} investment{investments.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
            <p className="text-xs text-muted-foreground">
              Savings + Investments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending vs Target Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending vs Target (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    stroke="currentColor" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    fontSize={12}
                    tickFormatter={(value) => NumberFormatter.formatForChart(value, currencySymbol)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'target' ? 'Target' : 'Actual Spending']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="var(--muted-foreground)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'var(--muted-foreground)', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category (Last Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis 
                      dataKey="category" 
                      stroke="currentColor" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="currentColor" 
                      fontSize={12}
                      tickFormatter={(value) => NumberFormatter.formatForChart(value, currencySymbol)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      labelStyle={{ color: 'var(--foreground)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill={(entry: any) => entry.fill}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No spending data for the last month
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}