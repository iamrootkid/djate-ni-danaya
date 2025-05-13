
import { AuthError, AuthApiError } from '@supabase/supabase-js';

export const getLoginErrorMessage = (error: AuthError): string => {
  if (error instanceof AuthApiError) {
    switch (error.status) {
      case 400:
        if (error.message === "Invalid login credentials") {
          return 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
        }
        return 'Email ou mot de passe invalide. Veuillez vérifier vos identifiants.';
      case 422:
        return 'Format d\'email invalide. Veuillez entrer une adresse email valide.';
      case 429:
        return 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
      default:
        return error.message;
    }
  }
  return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
};

// Add the missing getErrorMessage function that's imported in use-login.ts
export const getErrorMessage = (error: any): string => {
  if (error instanceof AuthError) {
    return getLoginErrorMessage(error);
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
};
