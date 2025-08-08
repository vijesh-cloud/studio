
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
import { Recycle, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.311-11.303-7.914l-6.573,4.817C9.832,39.579,16.48,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.62,44,31.13,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);

  const router = useRouter();
  const { loginUser, setUser, loginDeliveryPartner } = useDataStore();
  const { toast } = useToast();

  const handleUserLogin = () => {
    if (!email || !password) {
        toast({ title: "Please enter email and password.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
        const success = loginUser(email);
        if (success) {
            router.push('/');
        } else {
            toast({ title: "Account not found.", description: "Please check your email or register for a new account.", variant: "destructive" });
        }
        setIsLoading(false);
    }, 1000);
  };

  const handlePartnerLogin = () => {
      if (!partnerUsername || !partnerPassword) {
        toast({ title: "Please enter username and password.", variant: "destructive" });
        return;
      }
      setIsPartnerLoading(true);
      setTimeout(() => {
        const success = loginDeliveryPartner(partnerUsername, partnerPassword);
        if (success) {
            router.push('/delivery-partner-dashboard');
            toast({ title: "Welcome back!", className: "bg-primary text-primary-foreground" });
        } else {
            toast({ title: "Invalid Credentials", variant: "destructive" });
        }
        setIsPartnerLoading(false);
      }, 1000);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.displayName && user.email) {
        setUser(user.displayName, user.email);
        router.push('/');
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${user.displayName}!`,
          className: "bg-primary text-primary-foreground",
        });
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google Sign-In Error:", error);
        toast({
          title: "Login Failed",
          description: "An error occurred during Google sign-in. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Please enter your email address to reset password.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for a link to reset your password.",
        className: "bg-primary text-primary-foreground"
      });
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-6">
          <Recycle className="h-12 w-12 text-primary" />
        </div>
        <Card>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User Login</TabsTrigger>
                <TabsTrigger value="partner">Partner Login</TabsTrigger>
            </TabsList>

            {/* USER LOGIN TAB */}
            <TabsContent value="user">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                <CardDescription>
                  Sign in to continue your recycling journey!
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                  Login with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center">
                    <Button variant="link" className="px-0" onClick={handleForgotPassword}>
                        Forgot password?
                    </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleUserLogin} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="underline">
                    Register
                  </Link>
                </div>
              </CardFooter>
            </TabsContent>

            {/* PARTNER LOGIN TAB */}
            <TabsContent value="partner">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Partner Portal</CardTitle>
                    <CardDescription>
                    Sign in to manage your deliveries.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="partner-username">Username</Label>
                        <Input
                            id="partner-username"
                            type="text"
                            placeholder="e.g. rahul"
                            value={partnerUsername}
                            onChange={(e) => setPartnerUsername(e.target.value)}
                            required
                            disabled={isPartnerLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="partner-password">Password</Label>
                        <Input 
                            id="partner-password" 
                            type="password" 
                            value={partnerPassword}
                            onChange={(e) => setPartnerPassword(e.target.value)}
                            required
                            disabled={isPartnerLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" onClick={handlePartnerLogin} disabled={isPartnerLoading}>
                        {isPartnerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Partner Login
                    </Button>
                </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
