
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Person, Location, Transaction, Dashboard } from '@/types';

// Initial state
interface AppState {
  people: Person[];
  locations: Location[];
  transactions: Transaction[];
  dashboard: Dashboard;
}

const initialState: AppState = {
  people: [],
  locations: [],
  transactions: [],
  dashboard: {
    totalCredits: 0,
    totalRepayments: 0,
    outstandingAmount: 0,
    totalPeople: 0,
  }
};

// Load data from localStorage if available
const loadInitialState = (): AppState => {
  const savedState = localStorage.getItem('creditTrailState');
  return savedState ? JSON.parse(savedState) : initialState;
};

// Action types
type ActionType =
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'DELETE_LOCATION'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_LOCATION_TO_PERSON'; payload: { personId: string, locationId: string } }
  | { type: 'REMOVE_LOCATION_FROM_PERSON'; payload: { personId: string, locationId: string } };

// Reducer
const appReducer = (state: AppState, action: ActionType): AppState => {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_PERSON':
      newState = {
        ...state,
        people: [...state.people, action.payload],
        dashboard: {
          ...state.dashboard,
          totalPeople: state.dashboard.totalPeople + 1
        }
      };
      break;
    
    case 'UPDATE_PERSON':
      newState = {
        ...state,
        people: state.people.map(person => 
          person.id === action.payload.id ? action.payload : person
        )
      };
      break;
    
    case 'DELETE_PERSON':
      newState = {
        ...state,
        people: state.people.filter(person => person.id !== action.payload),
        transactions: state.transactions.filter(transaction => transaction.personId !== action.payload),
        dashboard: {
          ...state.dashboard,
          totalPeople: state.dashboard.totalPeople - 1
        }
      };
      break;
    
    case 'ADD_LOCATION':
      newState = {
        ...state,
        locations: [...state.locations, action.payload]
      };
      break;
    
    case 'DELETE_LOCATION':
      newState = {
        ...state,
        locations: state.locations.filter(location => location.id !== action.payload),
        transactions: state.transactions.filter(transaction => transaction.locationId !== action.payload),
        people: state.people.map(person => ({
          ...person,
          locations: person.locations.filter(loc => loc.id !== action.payload)
        }))
      };
      break;
    
    case 'ADD_TRANSACTION':
      const newTransaction = action.payload;
      const amountChange = newTransaction.isCredit ? newTransaction.amount : -newTransaction.amount;
      
      newState = {
        ...state,
        transactions: [...state.transactions, newTransaction],
        dashboard: {
          ...state.dashboard,
          totalCredits: newTransaction.isCredit 
            ? state.dashboard.totalCredits + newTransaction.amount 
            : state.dashboard.totalCredits,
          totalRepayments: !newTransaction.isCredit 
            ? state.dashboard.totalRepayments + newTransaction.amount 
            : state.dashboard.totalRepayments,
          outstandingAmount: state.dashboard.outstandingAmount + amountChange
        }
      };
      break;
    
    case 'UPDATE_TRANSACTION':
      const updatedTransaction = action.payload;
      const oldTransaction = state.transactions.find(t => t.id === updatedTransaction.id);
      
      if (!oldTransaction) {
        return state;
      }
      
      // Calculate dashboard adjustments
      let creditAdjustment = 0;
      let repaymentAdjustment = 0;
      let outstandingAdjustment = 0;
      
      if (oldTransaction.isCredit && updatedTransaction.isCredit) {
        // Both credit: adjust by difference
        outstandingAdjustment = updatedTransaction.amount - oldTransaction.amount;
        creditAdjustment = outstandingAdjustment;
      } else if (!oldTransaction.isCredit && !updatedTransaction.isCredit) {
        // Both repayment: adjust by difference
        outstandingAdjustment = oldTransaction.amount - updatedTransaction.amount;
        repaymentAdjustment = updatedTransaction.amount - oldTransaction.amount;
      } else if (oldTransaction.isCredit && !updatedTransaction.isCredit) {
        // Changed from credit to repayment
        outstandingAdjustment = -(oldTransaction.amount + updatedTransaction.amount);
        creditAdjustment = -oldTransaction.amount;
        repaymentAdjustment = updatedTransaction.amount;
      } else {
        // Changed from repayment to credit
        outstandingAdjustment = updatedTransaction.amount + oldTransaction.amount;
        repaymentAdjustment = -oldTransaction.amount;
        creditAdjustment = updatedTransaction.amount;
      }
      
      newState = {
        ...state,
        transactions: state.transactions.map(transaction => 
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        ),
        dashboard: {
          ...state.dashboard,
          totalCredits: state.dashboard.totalCredits + creditAdjustment,
          totalRepayments: state.dashboard.totalRepayments + repaymentAdjustment,
          outstandingAmount: state.dashboard.outstandingAmount + outstandingAdjustment
        }
      };
      break;
    
    case 'DELETE_TRANSACTION':
      const deletedTransaction = state.transactions.find(t => t.id === action.payload);
      
      if (!deletedTransaction) {
        return state;
      }
      
      const deletedAmount = deletedTransaction.isCredit ? deletedTransaction.amount : -deletedTransaction.amount;
      
      newState = {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
        dashboard: {
          ...state.dashboard,
          totalCredits: deletedTransaction.isCredit 
            ? state.dashboard.totalCredits - deletedTransaction.amount 
            : state.dashboard.totalCredits,
          totalRepayments: !deletedTransaction.isCredit 
            ? state.dashboard.totalRepayments - deletedTransaction.amount 
            : state.dashboard.totalRepayments,
          outstandingAmount: state.dashboard.outstandingAmount - deletedAmount
        }
      };
      break;
    
    case 'ADD_LOCATION_TO_PERSON':
      newState = {
        ...state,
        people: state.people.map(person => {
          if (person.id === action.payload.personId) {
            // Check if location already exists for the person
            const locationExists = person.locations.some(loc => loc.id === action.payload.locationId);
            
            if (!locationExists) {
              const locationToAdd = state.locations.find(loc => loc.id === action.payload.locationId);
              return {
                ...person,
                locations: locationToAdd ? [...person.locations, locationToAdd] : person.locations
              };
            }
          }
          return person;
        })
      };
      break;
    
    case 'REMOVE_LOCATION_FROM_PERSON':
      newState = {
        ...state,
        people: state.people.map(person => {
          if (person.id === action.payload.personId) {
            return {
              ...person,
              locations: person.locations.filter(loc => loc.id !== action.payload.locationId)
            };
          }
          return person;
        })
      };
      break;
    
    default:
      return state;
  }

  // Save to localStorage after each state change
  localStorage.setItem('creditTrailState', JSON.stringify(newState));
  return newState;
};

// Create context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, loadInitialState);

  // Update localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('creditTrailState', JSON.stringify(state));
  }, [state]);

  // Calculate dashboard metrics whenever transactions change
  useEffect(() => {
    const calculateDashboard = () => {
      let totalCredits = 0;
      let totalRepayments = 0;
      
      state.transactions.forEach(transaction => {
        if (transaction.isCredit) {
          totalCredits += transaction.amount;
        } else {
          totalRepayments += transaction.amount;
        }
      });
      
      const outstandingAmount = totalCredits - totalRepayments;
      
      dispatch({
        type: 'UPDATE_DASHBOARD',
        payload: {
          totalCredits,
          totalRepayments,
          outstandingAmount,
          totalPeople: state.people.length
        }
      } as any); // Type assertion to avoid adding this to ActionType for simplicity
    };
    
    calculateDashboard();
  }, [state.transactions]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
