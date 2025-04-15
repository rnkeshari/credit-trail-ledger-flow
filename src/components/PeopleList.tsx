
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Person } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PersonForm from './PersonForm';
import PersonLocationManager from './PersonLocationManager';

const PeopleList: React.FC<{ onViewPerson?: (person: Person) => void }> = ({ onViewPerson }) => {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editPerson, setEditPerson] = useState<Person | undefined>(undefined);
  const [manageLocations, setManageLocations] = useState<Person | undefined>(undefined);

  const filteredPeople = state.people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this person? All associated transactions will be deleted as well.')) {
      dispatch({ type: 'DELETE_PERSON', payload: id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>People</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {filteredPeople.length > 0 ? (
          <div className="space-y-3">
            {filteredPeople.map(person => (
              <div key={person.id} className="flex items-center justify-between border p-3 rounded-md">
                <div>
                  <h3 className="font-medium">{person.name}</h3>
                  {person.locations.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {person.locations.map(location => (
                        <Badge key={location.id} variant="outline" className="text-xs">
                          {location.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setManageLocations(person)}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditPerson(person)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewPerson && onViewPerson(person)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {state.people.length === 0 
              ? "No people added yet. Add a person to get started." 
              : "No people found matching your search."}
          </div>
        )}

        {/* Edit Person Dialog */}
        <Dialog 
          open={!!editPerson} 
          onOpenChange={(open) => {
            if (!open) setEditPerson(undefined);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Person</DialogTitle>
            </DialogHeader>
            {editPerson && (
              <PersonForm 
                editPerson={editPerson} 
                onComplete={() => setEditPerson(undefined)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Manage Locations Dialog */}
        <Dialog 
          open={!!manageLocations} 
          onOpenChange={(open) => {
            if (!open) setManageLocations(undefined);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Locations</DialogTitle>
            </DialogHeader>
            {manageLocations && (
              <PersonLocationManager person={manageLocations} />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PeopleList;
