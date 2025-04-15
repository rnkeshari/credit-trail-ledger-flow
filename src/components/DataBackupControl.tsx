
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportData, importData } from '@/utils/dataBackup';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

const DataBackupControl: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { state } = useAppContext();
  
  const handleExport = () => {
    const success = exportData();
    
    if (success) {
      toast({
        title: "Backup Created",
        description: "Your data has been exported successfully",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "No data found to export",
        variant: "destructive",
      });
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      try {
        setIsImporting(true);
        await importData(file);
        toast({
          title: "Import Successful",
          description: "Your data has been restored. Refreshing page...",
        });
        
        // Give time for toast to be seen, then refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Invalid backup file",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  // Calculate total data size
  const calculateDataSize = () => {
    const data = localStorage.getItem('creditTrailState');
    if (!data) return '0 KB';
    
    const bytes = new Blob([data]).size;
    
    if (bytes < 1024) return `${bytes} bytes`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Data Management</h3>
        <div className="text-sm text-muted-foreground">
          <p>Current data size: {calculateDataSize()}</p>
          <p>People: {state.people.length}</p>
          <p>Transactions: {state.transactions.length}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={handleExport} 
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleImportClick} 
          className="w-full sm:w-auto"
          disabled={isImporting}
        >
          {isImporting ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Import Data
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Note: Importing data will replace all your current data.</p>
      </div>
    </div>
  );
};

export default DataBackupControl;
