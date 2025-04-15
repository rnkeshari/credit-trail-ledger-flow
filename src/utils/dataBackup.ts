
/**
 * Utility functions for backing up and restoring application data
 */

/**
 * Export the current application data as a JSON file for download
 */
export const exportData = () => {
  const data = localStorage.getItem('creditTrailState');
  
  if (!data) {
    console.error('No data found in localStorage to export');
    return false;
  }
  
  // Create a blob from the data
  const blob = new Blob([data], { type: 'application/json' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up the download with current date in filename
  const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  link.download = `credit-trail-backup-${date}.json`;
  link.href = url;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};

/**
 * Import data from a JSON file and restore it to localStorage
 * @param file - The JSON file containing backup data
 * @returns Promise that resolves with success status
 */
export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        
        if (typeof result !== 'string') {
          throw new Error('Invalid file format');
        }
        
        // Validate that it's proper JSON format
        const parsedData = JSON.parse(result);
        
        // Basic validation to ensure it has the expected data structure
        if (!parsedData.people || !parsedData.locations || !parsedData.transactions) {
          throw new Error('Invalid backup file: Missing required data structure');
        }
        
        // Store the data in localStorage
        localStorage.setItem('creditTrailState', result);
        
        // Return success
        resolve(true);
      } catch (error) {
        console.error('Error importing data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
