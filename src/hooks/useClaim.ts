import { useState, useEffect } from 'react';
import { Claim } from '@/types/claim';

// Mock data - will be replaced with real API calls later
const mockClaim: Claim = {
  id: "RK-2024-001",
  status: "Under behandling",
  customer: {
    name: "Rema 1000 Stavanger",
    contactPerson: "Ola Nordmann",
    email: "ola.nordmann@rema1000.no",
    phone: "+47 123 45 678",
    address: "Storgata 1, 4001 Stavanger"
  },
  product: {
    name: "Kjøleskap Model X200",
    serialNumber: "SN123456789",
    purchaseDate: "2023-06-15",
    warranty: "2 år",
    supplier: "Electrolux"
  },
  issue: {
    type: "Mekanisk feil",
    description: "Kjøleskapet produserer unormal støy og temperaturen er ustabil. Kunden rapporterer at kompressoren lager høye lyder spesielt om natten.",
    urgency: "Høy"
  },
  technician: "Lars Hansen",
  createdDate: "2024-01-15",
  lastUpdated: "2024-01-16",
  files: [
    { name: "kjoleskap_foto1.jpg", size: "2.3 MB", type: "image" },
    { name: "garantibevis.pdf", size: "450 KB", type: "document" },
    { name: "kjoleskap_foto2.jpg", size: "1.8 MB", type: "image" }
  ],
  timeline: [
    { date: "2024-01-15 10:30", action: "Reklamasjon opprettet", user: "Lars Hansen", status: "Ny" },
    { date: "2024-01-15 14:15", action: "Reklamasjon godkjent for behandling", user: "Christopher (Admin)", status: "Under behandling" },
    { date: "2024-01-16 09:00", action: "Tekniker kontaktet leverandør", user: "Lars Hansen", status: "Under behandling" }
  ]
};

export const useClaim = (claimId: string | undefined) => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, return mock data regardless of ID
        // TODO: Replace with real Supabase query
        setClaim(mockClaim);
      } catch (err) {
        setError('Failed to fetch claim');
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaim();
    } else {
      setLoading(false);
      setError('No claim ID provided');
    }
  }, [claimId]);

  return { claim, loading, error };
};