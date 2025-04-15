
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, Person } from '@/types';
import { Check, Plus, Image, X } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface TransactionFormProps {
  person?: Person;
  editTransaction?: Transaction;
  onComplete?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  person, 
  editTransaction, 
  onComplete 
}) => {
  const { state, dispatch } = useAppContext();
  const [selectedPerson, setSelectedPerson] = useState<string>(person?.id || '');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'money' | 'item'>('money');
  const [amount, setAmount] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCredit, setIsCredit] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const currentPerson = selectedPerson 
    ? state.people.find(p => p.id === selectedPerson) 
    : undefined;

  useEffect(() => {
    if (editTransaction) {
      setSelectedPerson(editTransaction.personId);
      setSelectedLocation(editTransaction.locationId);
      setTransactionType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setItemName(editTransaction.itemName || '');
      setNotes(editTransaction.notes || '');
      setIsCredit(editTransaction.isCredit);
      setImageUrl(editTransaction.imageUrl || '');
      setIsEditing(true);
    }
  }, [editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerson || !selectedLocation || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive number",
          variant: "destructive"
        });
        return;
      }

      const newTransaction: Transaction = {
        id: isEditing ? editTransaction!.id : crypto.randomUUID(),
        personId: selectedPerson,
        locationId: selectedLocation,
        type: transactionType,
        amount: parsedAmount,
        itemName: transactionType === 'item' ? itemName : undefined,
        date: isEditing ? editTransaction!.date : new Date().toISOString(),
        isCredit,
        notes: notes.trim() ? notes : undefined,
        imageUrl: imageUrl.trim() ? imageUrl : undefined
      };

      if (isEditing) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: newTransaction });
        toast({
          title: "Transaction updated",
          description: `Transaction has been updated successfully`
        });
      } else {
        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
        toast({
          title: "Transaction added",
          description: `New transaction has been added successfully`
        });
      }

      // Reset form
      if (!person) {
        setSelectedPerson('');
      }
      setSelectedLocation('');
      setTransactionType('money');
      setAmount('');
      setItemName('');
      setNotes('');
      setImageUrl('');
      setIsCredit(true);
      setIsEditing(false);
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description: "There was an error saving the transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    return selectedPerson && selectedLocation && amount && 
           (!isNaN(parseFloat(amount)) && parseFloat(amount) > 0) && 
           (transactionType !== 'item' || (transactionType === 'item' && itemName.trim() !== ''));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
          {!person && (
            <div className="space-y-2">
              <Label htmlFor="person">Person</Label>
              <Select 
                value={selectedPerson}
                onValueChange={setSelectedPerson}
                required
              >
                <SelectTrigger id="person">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {state.people.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select 
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              required
              disabled={!currentPerson || currentPerson.locations.length === 0}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder={
                  !currentPerson 
                    ? "Select a person first" 
                    : currentPerson.locations.length === 0
                    ? "Person has no locations"
                    : "Select location"
                } />
              </SelectTrigger>
              <SelectContent>
                {currentPerson?.locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup 
              defaultValue="money" 
              value={transactionType}
              onValueChange={(value) => setTransactionType(value as 'money' | 'item')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="money" id="money" />
                <Label htmlFor="money">Money</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="item" id="item" />
                <Label htmlFor="item">Item</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {transactionType === 'money' ? 'Amount' : 'Estimated Value'}
            </Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {transactionType === 'item' && (
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch 
              id="transaction-type"
              checked={isCredit}
              onCheckedChange={setIsCredit}
            />
            <Label htmlFor="transaction-type">
              {isCredit ? 'Credit (lent to person)' : 'Repayment (received from person)'}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-image">Add Image (Optional)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="transaction-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
            
            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-2 border rounded-md p-1">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                  onClick={() => setImageUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img 
                  src={imageUrl} 
                  alt="Transaction" 
                  className="max-h-40 rounded object-cover mx-auto"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <CardFooter className="flex justify-end px-0">
            <Button 
              type="submit" 
              disabled={submitting || !validateForm()}
            >
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Transaction
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
