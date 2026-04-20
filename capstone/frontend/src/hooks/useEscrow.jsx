import { useState } from 'react';
import { API_URL } from '../config/apiConfig';

export const useEscrow = () => {
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(false);

  const createEscrow = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/escrow/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setEscrow(result.transaction);
      return result;
    } catch (error) {
      console.error('Escrow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { escrow, loading, createEscrow };
};