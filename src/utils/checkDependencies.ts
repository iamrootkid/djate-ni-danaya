
// Check if required dependencies are installed
// This is a utility file to check that all dependencies are available
// We won't directly modify package.json as it's read-only

import { toast } from "sonner";

export async function checkRequiredDependencies() {
  const missingDependencies: string[] = [];
  
  // Check for required dependencies
  try {
    require('@supabase/supabase-js');
  } catch (e) {
    missingDependencies.push('@supabase/supabase-js');
  }
  
  try {
    require('date-fns');
  } catch (e) {
    missingDependencies.push('date-fns');
  }
  
  try {
    require('@tanstack/react-query');
  } catch (e) {
    missingDependencies.push('@tanstack/react-query');
  }
  
  try {
    require('sonner');
  } catch (e) {
    missingDependencies.push('sonner');
  }
  
  // If there are missing dependencies, show a toast notification
  if (missingDependencies.length > 0) {
    console.error('Missing dependencies:', missingDependencies.join(', '));
    toast.error(
      `Missing dependencies detected: ${missingDependencies.join(', ')}. Please install them using npm or yarn.`
    );
    
    console.info('You can install them with:', `npm install ${missingDependencies.join(' ')}`);
  }
  
  return missingDependencies.length === 0;
}

// Run the check
checkRequiredDependencies().then(allInstalled => {
  if (allInstalled) {
    console.log('All required dependencies are installed.');
  }
});
