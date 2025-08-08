
'use client';

import { useState } from 'react';
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
import { Recycle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { sendPasswordResetCodeAction } from '@/app/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendPasswordResetCodeAction({ email });

      if (result.success) {
        toast({
          title: 'Reset Link Sent',
          description: 'Please check your inbox (and spam folder) for a link to reset your password.',
          className: 'bg-primary text-primary-foreground',
          duration: 9000,
        });
        setEmailSent(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      toast({
        title: 'Error Sending Email',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-6">
          <Recycle className="h-12 w-12 text-primary" />
        </div>
        <Card>
          <CardHeader>
            <Link href="/login" className="absolute top-4 left-4">
              <Button variant="ghost" size="icon">
                  <ArrowLeft />
              </Button>
            </Link>
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            {emailSent ? (
              <CardDescription className="text-center pt-2 text-primary">
                A password reset link has been sent to your email address. Please check your inbox.
              </CardDescription>
            ) : (
              <CardDescription className="text-center pt-2">
                Enter your email and we'll send you a link to reset your password.
              </CardDescription>
            )}
          </CardHeader>
          {!emailSent && (
            <>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </CardFooter>
            </>
          )}
          <CardFooter className="flex flex-col gap-4">
             <div className="text-center text-sm">
                Remember your password?{' '}
                <Link href="/login" className="underline">
                    Login
                </Link>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
