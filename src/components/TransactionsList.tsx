
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Transaction, Person, Location } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Trash2, 
  DollarSign, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle,
  ImageIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionForm from './TransactionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TransactionsListProps {
  person?: Person;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ person }) => {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'money' | 'item'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'credit' | 'repayment'>('all');
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get transactions for the selected person or all transactions
  const personTransactions = person 
    ? state.transactions.filter(t => t.personId === person.id)
    : state.transactions;

  // Apply filters
  const filteredTransactions = personTransactions.filter(transaction => {
    // Search by notes or item name
    const searchMatch = 
      (transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (transaction.type === 'item' && 
       transaction.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Location filter
    const locationMatch = locationFilter === 'all' || transaction.locationId === locationFilter;
    
    // Type filter
    const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
    
    // Status filter
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'credit' && transaction.isCredit) ||
      (statusFilter === 'repayment' && !transaction.isCredit);
    
    return searchMatch && locationMatch && typeMatch && statusMatch;
  });

  // Sort by date, most recent first
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPersonName = (personId: string) => {
    const person = state.people.find(p => p.id === personId);
    return person ? person.name : 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    const location = state.locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  // Available locations for filtering
  const availableLocations = person 
    ? person.locations
    : state.locations;

  // Calculate totals for this filter
  const calculateTotals = () => {
    let total = 0;
    let creditTotal = 0;
    let repaymentTotal = 0;
    
    filteredTransactions.forEach(t => {
      if (t.isCredit) {
        creditTotal += t.amount;
      } else {
        repaymentTotal += t.amount;
      }
    });
    
    total = creditTotal - repaymentTotal;
    
    return { total, creditTotal, repaymentTotal };
  };
  
  const totals = calculateTotals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {person ? `Transactions for ${person.name}` : 'All Transactions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by item name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {availableLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Tabs defaultValue="all" className="flex-1" onValueChange={(v) => setTypeFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="money">Money</TabsTrigger>
              <TabsTrigger value="item">Items</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs defaultValue="all" className="flex-1" onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Status</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="repayment">Repayment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Outstanding</div>
              <div className={`text-2xl font-bold ${totals.total > 0 ? 'text-green-600' : totals.total < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(totals.total)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <ArrowUpCircle className="text-green-500 h-5 w-5" />
              <div>
                <div className="text-sm text-muted-foreground">Total Credit</div>
                <div className="text-lg font-semibold">{formatCurrency(totals.creditTotal)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <ArrowDownCircle className="text-blue-500 h-5 w-5" />
              <div>
                <div className="text-sm text-muted-foreground">Total Repayment</div>
                <div className="text-lg font-semibold">{formatCurrency(totals.repaymentTotal)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {sortedTransactions.length > 0 ? (
          <div className="space-y-3">
            {sortedTransactions.map(transaction => (
              <div key={transaction.id} className="border p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'money' ? (
                        <DollarSign className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {transaction.type === 'money' 
                          ? formatCurrency(transaction.amount) 
                          : `${transaction.itemName} (${formatCurrency(transaction.amount)})`}
                      </span>
                      <Badge variant={transaction.isCredit ? "default" : "secondary"}>
                        {transaction.isCredit ? 'Credit' : 'Repayment'}
                      </Badge>
                    </div>
                    
                    {!person && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Person: {getPersonName(transaction.personId)}
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      Location: {getLocationName(transaction.locationId)}
                    </div>
                    
                    {transaction.notes && (
                      <div className="text-sm mt-2">{transaction.notes}</div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {format(new Date(transaction.date), 'PPP')}
                    </div>

                    {/* Image Preview Button */}
                    {transaction.imageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs flex items-center"
                        onClick={() => setImagePreview(transaction.imageUrl || null)}
                      >
                        <ImageIcon className="h-3 w-3 mr-1" /> View Image
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {personTransactions.length === 0 
              ? "No transactions found. Add a transaction to get started." 
              : "No transactions match the current filters."}
          </div>
        )}

        {/* Edit Transaction Dialog */}
        <Dialog 
          open={!!editTransaction} 
          onOpenChange={(open) => {
            if (!open) setEditTransaction(undefined);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editTransaction && (
              <TransactionForm 
                editTransaction={editTransaction} 
                onComplete={() => setEditTransaction(undefined)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog
          open={!!imagePreview}
          onOpenChange={(open) => {
            if (!open) setImagePreview(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Image</DialogTitle>
            </DialogHeader>
            {imagePreview && (
              <div className="flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Transaction" 
                  className="max-h-[70vh] max-w-full rounded-md object-contain" 
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
