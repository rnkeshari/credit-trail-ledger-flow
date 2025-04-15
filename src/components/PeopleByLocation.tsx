
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Person, Location } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Search, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeopleByLocationProps {
  onViewPerson?: (person: Person) => void;
}

const PeopleByLocation: React.FC<PeopleByLocationProps> = ({ onViewPerson }) => {
  const { state } = useAppContext();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [peopleAtLocation, setPeopleAtLocation] = useState<Person[]>([]);
  
  // Filter people by location
  useEffect(() => {
    if (selectedLocationId) {
      const filteredPeople = state.people.filter(person => 
        person.locations.some(loc => loc.id === selectedLocationId)
      );
      setPeopleAtLocation(filteredPeople);
    } else {
      setPeopleAtLocation([]);
    }
  }, [selectedLocationId, state.people]);

  // Apply search term filter
  const filteredPeople = peopleAtLocation.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get location name by ID
  const getLocationName = (locationId: string): string => {
    const location = state.locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          People by Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Select 
            value={selectedLocationId}
            onValueChange={setSelectedLocationId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a location to filter people" />
            </SelectTrigger>
            <SelectContent>
              {state.locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedLocationId && (
            <>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  Location: {getLocationName(selectedLocationId)}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLocationId('')}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people at this location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {filteredPeople.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Found {filteredPeople.length} people at this location
                  </p>
                  {filteredPeople.map(person => (
                    <div key={person.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div>
                        <h3 className="font-medium">{person.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {person.transactions.filter(t => t.locationId === selectedLocationId).length} transactions
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewPerson && onViewPerson(person)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No people found at this location {searchTerm ? "matching your search term" : ""}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeopleByLocation;
