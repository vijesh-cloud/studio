
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
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { registeredUsers } = useDataStore();

  const handleSendLink = async () => {
    if (!email) {
      toast({ title: 'Please enter your email.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    // Simulate checking if the user is registered
    const userExists = registeredUsers.some(user => user.email === email);

    if (userExists) {
        // In a real app, Firebase would send an email with a unique oobCode.
        // Here, we simulate this by redirecting with a static code.
        toast({
            title: "Redirecting to Reset Page",
            description: "Since email sending is disabled, we're taking you directly to the next step.",
            className: 'bg-primary text-primary-foreground',
        });
        // This dummy code is what Firebase would typically generate.
        const dummyOobCode = 'dummy-reset-code-for-simulation';
        router.push(`/reset-password?oobCode=${dummyOobCode}&email=${encodeURIComponent(email)}`);
    } else {
        toast({
            title: 'User Not Found',
            description: 'This email is not registered with EcoVerse.',
            variant: 'destructive',
        });
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
              Enter your email and we'll simulate sending a password reset link.
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
              Proceed to Reset
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
