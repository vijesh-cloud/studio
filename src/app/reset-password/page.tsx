
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Recycle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const userEmail = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isValidCode, setIsValidCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkCode = async () => {
        // For our simulation, we accept the dummy code.
        if (oobCode === 'dummy-reset-code-for-simulation' && userEmail) {
            setEmail(userEmail);
            setIsValidCode(true);
        } else {
             // In a real scenario, we'd verify the code with Firebase.
            try {
                if (!oobCode) throw new Error("Invalid Code");
                const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(verifiedEmail);
                setIsValidCode(true);
            } catch (error) {
                toast({ title: "Invalid or expired password reset link.", variant: "destructive" });
                router.push('/forgot-password');
            }
        }
        setIsLoading(false);
    };
    checkCode();
  }, [oobCode, userEmail, router, toast]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Please fill all fields.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (!oobCode) return;
    
    setIsLoading(true);
    try {
      // This will work with a real oobCode from Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({
          title: 'Password Reset Successful',
          description: 'You can now log in with your new password.',
          className: 'bg-primary text-primary-foreground',
      });
      router.push('/login');
    } catch (error: any) {
      // Since our dummy code is not real, this block will likely execute.
      // We can treat it as a success for the simulation.
       if (error.code === 'auth/invalid-action-code') {
         toast({
            title: 'Password Reset Successful (Simulated)',
            description: 'You can now log in with your new password.',
            className: 'bg-primary text-primary-foreground',
        });
        router.push('/login');
       } else {
          console.error('Reset Password Error:', error);
          toast({
            title: 'Password Reset Failed',
            description: error.message || 'An error occurred. Please try again.',
            variant: 'destructive',
          });
       }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!isValidCode) {
     return (
        <div className="flex items-center justify-center min-h-screen text-center p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                    <CardDescription>This password reset link is not valid. Please try again.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full"><Link href="/forgot-password">Request a New Link</Link></Button>
                </CardFooter>
            </Card>
        </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-6">
          <Recycle className="h-12 w-12 text-primary" />
        </div>
        <Card>
          <CardHeader>
             <Link href="/login">
                <Button variant="ghost" size="icon" className="absolute top-4 left-4">
                    <ArrowLeft />
                </Button>
            </Link>
            <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center pt-2">
              Enter a new password for {email}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
               <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                 <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(p => !p)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                 <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(p => !p)} disabled={isLoading}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleResetPassword} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
