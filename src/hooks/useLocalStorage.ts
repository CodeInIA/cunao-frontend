import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key);
      // Parsear el JSON almacenado o si no existe devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error también devolver initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Devolver una versión wrapped de la función setter de useState que persiste el nuevo valor en localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Guardar estado
      setStoredValue(valueToStore);
      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Una implementación más avanzada manejaría el caso de error
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

