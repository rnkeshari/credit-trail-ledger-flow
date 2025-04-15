
import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Dashboard from '@/components/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  FolderClock, 
  MapPin,
  PlusCircle,
  Save,
  Map
} from 'lucide-react';
import PeopleList from '@/components/PeopleList';
import TransactionsList from '@/components/TransactionsList';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PersonForm from '@/components/PersonForm';
import TransactionForm from '@/components/TransactionForm';
import LocationForm from '@/components/LocationForm';
import LocationsList from '@/components/LocationsList';
import DataBackupControl from '@/components/DataBackupControl';
import PeopleByLocation from '@/components/PeopleByLocation';

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [dataBackupOpen, setDataBackupOpen] = useState(false);

  return (
    <AppProvider>
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Credit Trail Ledger</h1>
          <p className="text-muted-foreground">
            Manage and track credit transactions across multiple locations
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar for navigation on larger screens */}
          <div className="lg:w-64 space-y-4">
            <Tabs
              defaultValue="dashboard"
              value={selectedTab}
              onValueChange={(value) => {
                setSelectedTab(value);
                setSelectedPerson(null);
              }}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 lg:grid-cols-1 h-auto lg:h-auto">
                <TabsTrigger value="dashboard" className="flex justify-start">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="people" className="flex justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">People</span>
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Locations</span>
                </TabsTrigger>
                <TabsTrigger value="people-by-location" className="flex justify-start">
                  <Map className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">By Location</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex justify-start">
                  <FolderClock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Transactions</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Dialog open={personFormOpen} onOpenChange={setPersonFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Person
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Person</DialogTitle>
                  </DialogHeader>
                  <PersonForm onComplete={() => setPersonFormOpen(false)} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={locationFormOpen} onOpenChange={setLocationFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Location</DialogTitle>
                  </DialogHeader>
                  <LocationForm onComplete={() => setLocationFormOpen(false)} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={transactionFormOpen} onOpenChange={setTransactionFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                  </DialogHeader>
                  <TransactionForm 
                    person={selectedPerson || undefined} 
                    onComplete={() => setTransactionFormOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={dataBackupOpen} onOpenChange={setDataBackupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Save className="h-4 w-4 mr-2" />
                    Backup & Restore
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Data Backup & Restore</DialogTitle>
                  </DialogHeader>
                  <DataBackupControl />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {selectedPerson ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
                  <Button variant="ghost" onClick={() => setSelectedPerson(null)}>
                    Back to All People
                  </Button>
                </div>
                <TransactionsList person={selectedPerson} />
              </div>
            ) : (
              <div>
                {selectedTab === 'dashboard' && <Dashboard />}
                {selectedTab === 'people' && (
                  <PeopleList onViewPerson={(person) => setSelectedPerson(person)} />
                )}
                {selectedTab === 'locations' && <LocationsList />}
                {selectedTab === 'people-by-location' && (
                  <PeopleByLocation onViewPerson={(person) => setSelectedPerson(person)} />
                )}
                {selectedTab === 'transactions' && <TransactionsList />}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default Index;
