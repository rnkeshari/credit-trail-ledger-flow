
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Location } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocationForm from './LocationForm';

const LocationsList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editLocation, setEditLocation] = useState<Location | undefined>(undefined);

  const filteredLocations = state.locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // Check if the location is used in any person
    const isUsed = state.people.some(person => 
      person.locations.some(loc => loc.id === id)
    );

    if (isUsed) {
      if (window.confirm('This location is being used by one or more people. Deleting it will remove it from all people. Are you sure?')) {
        dispatch({ type: 'DELETE_LOCATION', payload: id });
      }
    } else {
      if (window.confirm('Are you sure you want to delete this location?')) {
        dispatch({ type: 'DELETE_LOCATION', payload: id });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {filteredLocations.length > 0 ? (
          <div className="space-y-3">
            {filteredLocations.map(location => (
              <div key={location.id} className="flex items-center justify-between border p-3 rounded-md">
                <h3 className="font-medium">{location.name}</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditLocation(location)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {state.locations.length === 0 
              ? "No locations added yet. Add a location to get started." 
              : "No locations found matching your search."}
          </div>
        )}

        {/* Edit Location Dialog */}
        <Dialog 
          open={!!editLocation} 
          onOpenChange={(open) => {
            if (!open) setEditLocation(undefined);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>
            {editLocation && (
              <LocationForm 
                editLocation={editLocation} 
                onComplete={() => setEditLocation(undefined)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LocationsList;
