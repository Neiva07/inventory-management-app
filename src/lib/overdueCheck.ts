import { updateOverdueInstallments } from '../model/installmentPayment';
import { useAuth } from '../context/auth';
import { getTodayStartTimestamp } from './date';

/**
 * Check for overdue installments and update their status
 * This should be called when the app loads or periodically
 */
export const checkOverdueInstallments = async (userID: string) => {
  try {
    const today = new Date(getTodayStartTimestamp());
    console.log(`Checking overdue installments for ${today.toLocaleDateString('pt-BR')}`);
    
    const result = await updateOverdueInstallments(userID);
    
    if (result.updated > 0) {
      console.log(`✅ Updated ${result.updated} overdue installments`);
    } else {
      console.log(`✅ No overdue installments found`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error checking overdue installments:', error);
    throw error;
  }
};

/**
 * Hook to check overdue installments on app load
 * Only runs once per day to avoid unnecessary database queries
 */
export const useOverdueCheck = () => {
  const { user } = useAuth();
  
  const checkOverdue = async () => {
    if (user?.id) {
      try {
        // Check if we already ran today
        const lastCheckKey = `lastOverdueCheck_${user.id}`;
        const lastCheckDate = localStorage.getItem(lastCheckKey);
        const today = new Date().toDateString();
        
        if (lastCheckDate === today) {
          console.log('✅ Overdue check already ran today, skipping...');
          return;
        }
        
        await checkOverdueInstallments(user.id);
        
        // Mark as checked today
        localStorage.setItem(lastCheckKey, today);
      } catch (error) {
        console.error('Failed to check overdue installments:', error);
      }
    }
  };
  
  /**
   * Force check overdue installments (ignores daily limit)
   * Useful for manual refresh or when viewing installment lists
   */
  const forceCheckOverdue = async () => {
    if (user?.id) {
      try {
        console.log('🔄 Force checking overdue installments...');
        await checkOverdueInstallments(user.id);
      } catch (error) {
        console.error('Failed to force check overdue installments:', error);
      }
    }
  };
  
  return { checkOverdue, forceCheckOverdue };
}; 