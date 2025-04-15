
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Person, Location } from '@/types';
import { Check, Plus, X } from 'lucide-react';
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
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';

interface PersonFormProps {
  editPerson?: Person;
  onComplete?: () => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ editPerson, onComplete }) => {
  const { state, dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setSelectedLocations(editPerson.locations || []);
      setIsEditing(true);
    }
  }, [editPerson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newPerson: Person = {
      id: isEditing ? editPerson!.id : crypto.randomUUID(),
      name,
      locations: selectedLocations,
      transactions: isEditing ? editPerson!.transactions : []
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_PERSON', payload: newPerson });
    } else {
      dispatch({ type: 'ADD_PERSON', payload: newPerson });
    }

    setName('');
    setSelectedLocations([]);
    setIsEditing(false);
    
    if (onComplete) onComplete();
  };

  const handleAddLocation = () => {
    if (!selectedLocation) return;
    
    const locationToAdd = state.locations.find(loc => loc.id === selectedLocation);
    
    if (locationToAdd && !selectedLocations.some(loc => loc.id === locationToAdd.id)) {
      setSelectedLocations([...selectedLocations, locationToAdd]);
    }
    
    setSelectedLocation('');
  };

  const handleRemoveLocation = (locationId: string) => {
    setSelectedLocations(selectedLocations.filter(loc => loc.id !== locationId));
    
    if (isEditing) {
      dispatch({ 
        type: 'REMOVE_LOCATION_FROM_PERSON', 
        payload: { personId: editPerson!.id, locationId } 
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Person' : 'Add New Person'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person-name">Name</Label>
            <Input
              id="person-name"
              placeholder="Enter person name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Locations</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {state.locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddLocation}
                disabled={!selectedLocation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedLocations.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Locations</Label>
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map(location => (
                  <Badge key={location.id} variant="secondary" className="flex items-center gap-1">
                    {location.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => handleRemoveLocation(location.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <CardFooter className="flex justify-end px-0">
            <Button type="submit">
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Person
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Person
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonForm;
