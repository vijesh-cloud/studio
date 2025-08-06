
'use client';

import { useState, useRef, useEffect, ChangeEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, MapPin, Upload, Loader2, CheckCircle, XCircle, Wand2, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { LocationService } from '@/lib/location';
import type { Location } from '@/lib/types';
import { classifyItemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/hooks/use-data-store';
import { useRouter } from 'next/navigation';
import { POINTS_MAP } from '@/lib/constants';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);
  
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

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageData(dataUrl);
        setImagePreview(dataUrl);
        setClassification(null);
    }
  }, []);

  const handleRetake = () => {
    setImageData(null);
    setImagePreview(null);
    setClassification(null);
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
    <div className="flex flex-col h-screen bg-gray-900 text-white">
       <div className="flex-grow flex flex-col items-center justify-center space-y-4 relative p-4">
        <canvas ref={canvasRef} className="hidden" />
        {imagePreview ? (
          <div className="w-full max-w-sm aspect-square relative rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" />
          </div>
        ) : (
          <div className="w-full max-w-sm aspect-square flex flex-col items-center justify-center bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          </div>
        )}

        { !hasCameraPermission && !imagePreview && (
          <Alert variant="destructive" className="max-w-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access to use this feature. You can still upload a photo manually.
            </AlertDescription>
          </Alert>
        )}
      </div>


      <Card className="bg-background/90 text-foreground backdrop-blur-sm fixed bottom-0 left-0 right-0 rounded-t-2xl">
        <CardHeader>
          <CardTitle>Submit for Recycling</CardTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center text-sm mt-2">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {locationLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <span>{location?.address || 'Location not found'}</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {!imagePreview ? (
                <>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Capture
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline" onClick={handleRetake} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Retake
                    </Button>
                    {!classification && (
                        <Button className="w-full" onClick={handleClassify} disabled={classifying}>
                        {classifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Classify
                        </Button>
                    )}
                </>
            )}
            <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

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
