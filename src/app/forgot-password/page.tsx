
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
import { Recycle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetCodeAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { registeredUsers } = useDataStore();

  const handleSendLink = async () => {
    if (!email) {
      toast({ title: 'Please enter your email.', variant: 'destructive' });
      return;
    }

    const userExists = registeredUsers.some(user => user.email === email);
    if (!userExists) {
        toast({
            title: 'User not found',
            description: 'This email is not registered with an account.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);

    try {
        const result = await sendPasswordResetCodeAction({ email });
        
        if (result.success) {
            toast({
                title: 'Verification Code Sent',
                description: 'Check your inbox for a code to reset your password.',
                className: 'bg-primary text-primary-foreground',
            });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } else {
            toast({
                title: 'Failed to Send Code',
                description: result.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
    } catch(error: any) {
        toast({
            title: 'Error',
            description: error.message || 'Failed to send password reset code.',
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
            <Link href="/login">
                <Button variant="ghost" size="icon" className="absolute top-4 left-4">
                    <ArrowLeft />
                </Button>
            </Link>
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center pt-2">
              Enter your email and we'll send you a verification code to get back into your account.
            </CardDescription>
          </CardHeader>
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
            <Button className="w-full" onClick={handleSendLink} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
            <Link href="/login" className="text-sm underline">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
