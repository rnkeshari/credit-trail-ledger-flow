
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Location } from '@/types';
import { Check, Plus } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

interface LocationFormProps {
  editLocation?: Location;
  onComplete?: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ editLocation, onComplete }) => {
  const { dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editLocation) {
      setName(editLocation.name);
      setIsEditing(true);
    }
  }, [editLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newLocation: Location = {
      id: isEditing ? editLocation!.id : crypto.randomUUID(),
      name
    };

    if (isEditing) {
      // For simplicity, we'll just add a new location since we don't have an update action
      dispatch({ type: 'ADD_LOCATION', payload: newLocation });
    } else {
      dispatch({ type: 'ADD_LOCATION', payload: newLocation });
    }

    setName('');
    setIsEditing(false);
    
    if (onComplete) onComplete();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Location' : 'Add New Location'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              id="location-name"
              placeholder="Enter location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <CardFooter className="flex justify-end px-0">
            <Button type="submit">
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Location
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default LocationForm;
