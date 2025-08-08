
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { useDataStore } from '@/hooks/use-data-store';
import { Globe } from 'lucide-react';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'];

interface LanguagePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguagePreferenceModal({ isOpen, onClose }: LanguagePreferenceModalProps) {
  const { user, updateUser } = useDataStore();

  const handleLanguageSelect = (language: string) => {
    if (user) {
      updateUser({ languagePreference: language });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Choose Your Language</DialogTitle>
          <DialogDescription className="text-center">
            Select your preferred language for the EcoVerse app.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang}
              variant="outline"
              size="lg"
              onClick={() => handleLanguageSelect(lang)}
            >
              {lang}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
