
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Recycle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { confirmPasswordResetAction } from '@/app/actions';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    } else {
        toast({ title: 'Missing email parameter.', variant: 'destructive'});
        router.push('/forgot-password');
    }
  }, [searchParams, router, toast]);

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      toast({ title: 'Please fill all fields.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
        toast({ title: 'Password must be at least 6 characters.', variant: 'destructive'});
        return;
    }
    setIsLoading(true);

    try {
        const result = await confirmPasswordResetAction({
            email,
            code,
            newPassword
        });

        if (result.success) {
            toast({
                title: 'Password Reset Successful',
                description: 'You can now log in with your new password.',
                className: 'bg-primary text-primary-foreground',
            });
            router.push('/login');
        } else {
            toast({
                title: 'Reset Failed',
                description: result.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
    } catch(e: any) {
        toast({
            title: 'Error',
            description: e.message || 'Failed to reset password.',
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
            <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center pt-2">
              Enter the verification code sent to {email} and your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={6}
                />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(p => !p)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                 <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(p => !p)}
                    >
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
            <Link href="/login" className="text-sm underline">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
