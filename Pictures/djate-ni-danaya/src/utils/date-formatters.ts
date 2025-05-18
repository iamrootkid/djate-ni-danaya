
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'Date invalide';
    }
    
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'Date invalide';
    }
    
    return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Date invalide';
  }
}

export function formatShortDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'N/A';
    }
    
    return format(date, 'dd/MM', { locale: fr });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'N/A';
  }
}
