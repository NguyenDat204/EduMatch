import { useState, useEffect } from 'react';
import type { Career } from '../types';
import { getCareers, getCareerById } from '../services/dataService';

/**
 * Hook to fetch all careers.
 * When backend is integrated, the service swap requires zero changes here.
 */
export const useCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await getCareers();
        setCareers(response.data);
      } catch (err) {
        setError('Failed to load careers.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { careers, isLoading, error };
};

/**
 * Hook to fetch a single career by ID.
 */
export const useCareer = (id: string) => {
  const [career, setCareer] = useState<Career | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await getCareerById(id);
        setCareer(response.data);
      } catch (err) {
        setError('Failed to load career.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  return { career, isLoading, error };
};
