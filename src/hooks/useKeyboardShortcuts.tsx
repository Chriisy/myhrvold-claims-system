import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

// Global shortcuts hook
export const useGlobalShortcuts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrl: true,
      action: () => navigate('/claims/new'),
      description: 'Ny reklamasjon (Ctrl+N)'
    },
    {
      key: 'h',
      ctrl: true,
      action: () => navigate('/'),
      description: 'Hjem (Ctrl+H)'
    },
    {
      key: 'l',
      ctrl: true,
      action: () => navigate('/claims'),
      description: 'Liste over reklamasjoner (Ctrl+L)'
    },
    {
      key: 'a',
      ctrl: true,
      action: () => navigate('/analytics'),
      description: 'Analyse (Ctrl+A)'
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        toast({
          title: "Hurtigtaster",
          description: "Ctrl+N: Ny reklamasjon, Ctrl+H: Hjem, Ctrl+L: Liste, Ctrl+A: Analyse",
        });
      },
      description: 'Vis hurtigtaster (Ctrl+/)'
    }
  ];

  useKeyboardShortcuts({ shortcuts });
};