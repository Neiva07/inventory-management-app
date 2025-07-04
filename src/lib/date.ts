/**
 * Date utility functions for the inventory management app
 */

/**
 * Get today's date at 00:00:00 (start of day) as timestamp
 * Useful for date-only comparisons
 */
export const getTodayStartTimestamp = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/**
 * Get a date at 00:00:00 (start of day) as timestamp
 */
export const getDateStartTimestamp = (date: Date): number => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.getTime();
};

/**
 * Get a date at 23:59:59 (end of day) as timestamp
 */
export const getDateEndTimestamp = (date: Date): number => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
};

/**
 * Format a timestamp to Brazilian date format (dd/mm/yyyy)
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is overdue (before today)
 */
export const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}; 