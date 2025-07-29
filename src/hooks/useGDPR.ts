import { useState, useEffect } from 'react';
import { gdprService, ConsentRecord } from '@/services/gdprService';
import { useToast } from '@/hooks/use-toast';

export const useGDPR = () => {
  const [consent, setConsent] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    try {
      setLoading(true);
      const data = await gdprService.getUserConsent();
      setConsent(data);
    } catch (error) {
      console.error('Error loading consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, consentGiven: boolean) => {
    try {
      setLoading(true);
      await gdprService.recordConsent(consentType, consentGiven);
      await loadConsent();
      
      toast({
        title: "Samtykke oppdatert",
        description: `${consentGiven ? 'Ga' : 'Trakk tilbake'} samtykke for ${getConsentLabel(consentType)}`,
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere samtykke",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const data = await gdprService.exportUserData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data eksportert",
        description: "Dine data har blitt lastet ned som JSON-fil",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke eksportere data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestDeletion = async () => {
    try {
      setLoading(true);
      await gdprService.requestDataDeletion();
      
      toast({
        title: "Sletting anmodet",
        description: "Dine personopplysninger har blitt anonymisert",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasConsent = (consentType: string) => {
    const record = consent.find(c => c.consent_type === consentType);
    return record?.consent_given || false;
  };

  const getConsentLabel = (consentType: string) => {
    switch (consentType) {
      case 'cookies': return 'Cookies';
      case 'data_processing': return 'Databehandling';
      case 'marketing': return 'Markedsføring';
      default: return consentType;
    }
  };

  return {
    consent,
    loading,
    updateConsent,
    exportData,
    requestDeletion,
    hasConsent,
    getConsentLabel,
    refresh: loadConsent
  };
};