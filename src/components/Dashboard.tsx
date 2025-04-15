
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  MapPin 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { state } = useAppContext();
  const { dashboard, transactions, people, locations } = state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total outstanding per person
  const personTotals = people.map(person => {
    const personTransactions = transactions.filter(t => t.personId === person.id);
    let total = 0;
    
    personTransactions.forEach(t => {
      if (t.isCredit) {
        total += t.amount;
      } else {
        total -= t.amount;
      }
    });
    
    return {
      name: person.name,
      outstanding: total
    };
  }).sort((a, b) => b.outstanding - a.outstanding);

  // Calculate total outstanding by location
  const locationTotals = locations.map(location => {
    const locationTransactions = transactions.filter(t => t.locationId === location.id);
    let total = 0;
    
    locationTransactions.forEach(t => {
      if (t.isCredit) {
        total += t.amount;
      } else {
        total -= t.amount;
      }
    });
    
    return {
      name: location.name,
      value: total
    };
  }).filter(item => item.value > 0);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboard.outstandingAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Credit</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboard.totalCredits)}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-green-500/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Repayments</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboard.totalRepayments)}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-blue-500/40" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total People</p>
              <p className="text-3xl font-bold">{dashboard.totalPeople}</p>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding by Person */}
        <Card>
          <CardHeader>
            <CardTitle>Outstanding by Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {personTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={personTotals}
                    margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0} 
                    />
                    <YAxis tickFormatter={(value) => `$${value}`}/>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar 
                      dataKey="outstanding" 
                      name="Outstanding Amount" 
                      fill="#8884d8" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribution by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Outstanding by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {locationTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationTotals}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {locationTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
