import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useUserStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const { user } = useAuth();
  const userKey = user ? `${user.id}-${key}` : key;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(userKey);
      if (item === null) return initialValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${userKey}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Tentar salvar no localStorage
      const jsonString = JSON.stringify(valueToStore);
      window.localStorage.setItem(userKey, jsonString);
    } catch (error) {
      console.error(`Error setting localStorage key "${userKey}":`, error);
      
      // Se excedeu a quota, limpar dados antigos e tentar novamente
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Limpar dados antigos desnecessários
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
              key.includes('old-') || 
              key.includes('temp-') ||
              key.includes('cache-') ||
              (key.includes('chat-history') && !key.includes(user?.id || ''))
            )) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Tentar salvar novamente
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          const retryJsonString = JSON.stringify(valueToStore);
          window.localStorage.setItem(userKey, retryJsonString);
          console.log('Successfully saved after clearing old data');
        } catch (retryError) {
          console.error('Failed to save even after cleaning localStorage:', retryError);
          alert('Armazenamento local cheio. Alguns dados podem não ser salvos. Considere limpar dados antigos.');
        }
      }
    }
  };

  // Atualizar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      const newUserKey = `${user.id}-${key}`;
      try {
        const item = window.localStorage.getItem(newUserKey);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        } else {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${newUserKey}":`, error);
        setStoredValue(initialValue);
      }
    }
  }, [user?.id, key]);

  return [storedValue, setValue];
}