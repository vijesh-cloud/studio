
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function OrderConfirmationPage() {
    const { itemId } = useParams();
    const router = useRouter();
    const { user, submissions, confirmOrder } = useDataStore();
    const { toast } = useToast();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');

    const item = submissions.find(s => s.id === itemId);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
        if (!item) {
            // Redirect if item not found, maybe show a toast
            toast({ title: 'Item not found', variant: 'destructive'});
            router.push('/market');
        } else {
             const userLastSubmission = submissions.find(s => s.userId === user?.id);
             setDeliveryAddress(userLastSubmission?.location.address || '');
        }
    }, [user, item, router, toast, submissions]);

    const handleConfirmOrder = () => {
        if (!item) return;
        if (!deliveryAddress.trim()) {
            toast({ title: 'Please enter a delivery address.', variant: 'destructive' });
            return;
        }

        setIsConfirming(true);
        const orderId = confirmOrder(item.id, deliveryAddress);
        if (orderId) {
            toast({
                title: 'Order Confirmed!',
                description: 'Your delivery is on its way.',
                className: 'bg-primary text-primary-foreground'
            });
            router.push(`/delivery/${orderId}`);
        } else {
            toast({ title: 'Failed to confirm order', variant: 'destructive'});
            setIsConfirming(false);
        }
    };

    if (!item || !user) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft />
                        </Button>
                        <CardTitle>Confirm Your Order</CardTitle>
                    </div>
                    <CardDescription>Please review the details below before confirming.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card>
                        <CardContent className="flex gap-4 p-4">
                            <Image src={item.photo} alt={item.itemType} width={80} height={80} className="rounded-md object-cover w-20 h-20" />
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg capitalize">{item.itemType}</h3>
                                <p className="text-sm text-muted-foreground">From: {item.location.city}</p>
                                <p className="font-semibold text-primary">Free</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Delivery Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-3 text-primary flex-shrink-0"/>
                                <div className="w-full space-y-2">
                                    <Label htmlFor="address">Your Full Address</Label>
                                    <Input 
                                        id="address"
                                        placeholder="e.g. 123 Eco Lane, Green City"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                    />
                                     <p className="text-xs text-muted-foreground">This will be shared with your delivery partner.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <div className="w-full flex justify-between items-center p-4 bg-accent/30 rounded-lg">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold">Free</span>
                    </div>
                     <Button className="w-full" size="lg" onClick={handleConfirmOrder} disabled={isConfirming || !deliveryAddress}>
                        {isConfirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm Order
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
