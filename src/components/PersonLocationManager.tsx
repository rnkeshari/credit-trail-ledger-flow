
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Person, Location } from '@/types';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PersonLocationManagerProps {
  person: Person;
}

const PersonLocationManager: React.FC<PersonLocationManagerProps> = ({ person }) => {
  const { state, dispatch } = useAppContext();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  // Filter out locations that the person already has
  const availableLocations = state.locations.filter(
    location => !person.locations.some(loc => loc.id === location.id)
  );

  const handleAddLocation = () => {
    if (!selectedLocation) return;
    
    const locationToAdd = state.locations.find(loc => loc.id === selectedLocation);
    
    if (locationToAdd) {
      dispatch({ 
        type: 'ADD_LOCATION_TO_PERSON', 
        payload: { personId: person.id, locationId: locationToAdd.id } 
      });
    }
    
    setSelectedLocation('');
  };

  const handleRemoveLocation = (locationId: string) => {
    dispatch({ 
      type: 'REMOVE_LOCATION_FROM_PERSON', 
      payload: { personId: person.id, locationId } 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Locations for {person.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select 
            value={selectedLocation}
            onValueChange={setSelectedLocation}
            disabled={availableLocations.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={
                availableLocations.length === 0 
                  ? "No more locations available" 
                  : "Select location to add"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableLocations.map(location => (
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

        <div>
          <h4 className="text-sm font-medium mb-2">Current Locations</h4>
          {person.locations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {person.locations.map(location => (
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
          ) : (
            <p className="text-sm text-muted-foreground">No locations assigned yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonLocationManager;
