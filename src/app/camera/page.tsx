'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, MapPin, Upload, Loader2, CheckCircle, XCircle, Wand2, Sparkles } from 'lucide-react';
import { LocationService } from '@/lib/location';
import type { Location } from '@/lib/types';
import { classifyItemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/hooks/use-data-store';
import { useRouter } from 'next/navigation';
import { POINTS_MAP } from '@/lib/constants';
import Image from 'next/image';

type ClassificationResult = {
  itemType: string;
  recyclingSuggestion: string;
  confidence: number;
  funnyAIRoast?: string;
};

export default function CameraPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { addSubmission, user } = useDataStore();

  useEffect(() => {
    if (!user) {
        router.push('/');
        toast({ title: 'Please set up your profile first.', variant: 'destructive'});
    }
  }, [user, router, toast]);

  useEffect(() => {
    async function fetchLocation() {
      setLocationLoading(true);
      try {
        const { lat, lng } = await LocationService.getCurrentPosition();
        const { address, city } = LocationService.getAddress(lat, lng);
        const mapsURL = LocationService.generateGoogleMapsURL(lat, lng);
        setLocation({ lat, lng, address, city, mapsURL });
      } catch (error) {
        toast({
          title: 'Error getting location',
          description: 'Please ensure location services are enabled.',
          variant: 'destructive',
        });
      } finally {
        setLocationLoading(false);
      }
    }
    fetchLocation();
  }, [toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(base64String);
        setClassification(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (!imageData) {
      toast({ title: 'Please select an image first.', variant: 'destructive' });
      return;
    }
    setClassifying(true);
    setClassification(null);
    try {
      const result = await classifyItemAction({ photoDataUri: imageData });
      setClassification(result);
    } catch (error) {
      toast({ title: 'Classification failed', description: 'Could not connect to the AI service.', variant: 'destructive' });
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = () => {
    if (!location || !imageData || !classification) {
        toast({ title: 'Submission failed', description: 'Missing required information.', variant: 'destructive'});
        return;
    }
    setSubmitting(true);
    addSubmission({
        photo: imageData,
        itemType: classification.itemType.toLowerCase(),
        points: POINTS_MAP[classification.itemType.toLowerCase()] || 1,
        recyclingSuggestion: classification.recyclingSuggestion,
        funnyAIRoast: classification.funnyAIRoast,
    }, location);

    toast({
        title: 'Submission Successful!',
        description: `You've earned ${POINTS_MAP[classification.itemType.toLowerCase()] || 1} points!`,
        className: 'bg-primary text-primary-foreground'
    });
    
    setTimeout(() => {
        router.push('/history');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        {imagePreview ? (
          <div className="w-full max-w-sm aspect-square relative rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" />
          </div>
        ) : (
          <div className="w-full max-w-sm aspect-square flex flex-col items-center justify-center bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
            <Camera className="w-16 h-16 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">Capture or upload a photo</p>
          </div>
        )}

        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <Card className="bg-background/90 text-foreground backdrop-blur-sm fixed bottom-0 left-0 right-0 rounded-t-2xl">
        <CardHeader>
          <CardTitle>Submit for Recycling</CardTitle>
          <CardDescription>
            <div className="flex items-center text-sm mt-2">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {locationLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <span>{location?.address || 'Location not found'}</span>}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {classification && (
            <Card className="bg-accent/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-lg capitalize text-primary">{classification.itemType}</p>
                    <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-full">{(classification.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-sm"><Sparkles className="w-4 h-4 inline-block mr-1 text-yellow-400"/> {classification.recyclingSuggestion}</p>
                {classification.funnyAIRoast && <p className="text-sm italic text-muted-foreground">"{classification.funnyAIRoast}"</p>}
                <p className="text-right font-bold text-lg text-primary">+ {POINTS_MAP[classification.itemType.toLowerCase()] || 1} Points!</p>
              </CardContent>
            </Card>
          )}

          {!classification && imageData && (
            <Button className="w-full" onClick={handleClassify} disabled={classifying}>
              {classifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Classify Item
            </Button>
          )}

          {classification && (
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Confirm & Submit
            </Button>
          )}
          
          <Button variant="ghost" className="w-full" onClick={() => router.back()}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
