
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '@/hooks/use-data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Star, Phone, MapPin, Package, Bike, KeyRound, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const STATUS_STAGES = ['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];

export default function DeliveryPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { user, submissions, updateDeliveryStatus } = useDataStore();
    const { toast } = useToast();
    const [otpInput, setOtpInput] = useState('');

    const order = useMemo(() => submissions.find(s => s.orderId === orderId), [submissions, orderId]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    // Simulate status updates
    useEffect(() => {
        if (order?.deliveryStatus === 'Confirmed') {
            const timer = setTimeout(() => updateDeliveryStatus(order.orderId!, 'Packed'), 5000);
            return () => clearTimeout(timer);
        }
        if (order?.deliveryStatus === 'Packed') {
            const timer = setTimeout(() => updateDeliveryStatus(order.orderId!, 'Out for Delivery'), 8000);
            return () => clearTimeout(timer);
        }
    }, [order, updateDeliveryStatus]);

    if (!user) {
        return null; // or a loading spinner
    }

    if (!order) {
        return <div className="p-4 text-center">Loading order details...</div>;
    }
    
    const { deliveryPartner, deliveryStatus, itemType, photo, deliveryAddress, otp } = order;
    const currentStatusIndex = STATUS_STAGES.indexOf(deliveryStatus || 'Confirmed');
    const progress = ((currentStatusIndex + 1) / STATUS_STAGES.length) * 100;

    const handleVerifyOtp = () => {
        if (otpInput === otp) {
            updateDeliveryStatus(order.orderId!, 'Delivered');
            toast({
                title: "Delivery Complete!",
                description: "You've earned 10 points for giving this item a new home!",
                className: 'bg-primary text-primary-foreground'
            });
        } else {
            toast({ title: "Invalid OTP", variant: "destructive" });
        }
    };

    const handleCancel = () => {
        if (order.orderId) {
            updateDeliveryStatus(order.orderId, 'Cancelled');
            toast({ title: "Order Cancelled"});
            router.push('/history');
        }
    }

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/market')}>
                            <ArrowLeft />
                        </Button>
                        <div>
                            <CardTitle>Delivery Details</CardTitle>
                            <CardDescription>Order ID: {order.orderId}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 p-4 border rounded-lg">
                        <Image src={photo} alt={itemType} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
                        <div>
                            <p className="font-bold capitalize">{itemType}</p>
                            <p className="text-sm text-muted-foreground">Thank you for recycling!</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2 text-xs font-medium text-muted-foreground">
                            {STATUS_STAGES.map((stage, index) => (
                                <span key={stage} className={cn(index <= currentStatusIndex && "text-primary")}>
                                    {stage}
                                </span>
                            ))}
                        </div>
                        <Progress value={progress} />
                        <p className="text-center mt-2 font-semibold text-lg">{deliveryStatus}</p>
                        <p className="text-center text-sm text-muted-foreground">Estimated Arrival: 15-20 mins</p>
                    </div>

                    <Separator />
                    
                    {deliveryPartner && (
                        <Card>
                            <CardHeader className="p-4">
                               <div className="flex items-center gap-4">
                                     <Image src={deliveryPartner.photo} alt={deliveryPartner.name} width={56} height={56} className="rounded-full object-cover w-14 h-14" />
                                     <div className="flex-grow">
                                        <p className="font-bold">{deliveryPartner.name}</p>
                                        <p className="text-sm text-muted-foreground">Your Delivery Partner</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                            <span>{deliveryPartner.rating}</span>
                                        </div>
                                     </div>
                                      <Button variant="outline" size="icon"><Phone className="w-5 h-5"/></Button>
                               </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex items-center justify-between bg-accent/30 rounded-b-lg">
                                <span>{deliveryPartner.vehicle}</span>
                                <Button variant="link" size="sm" className="px-0 h-auto"><MessageSquare className="w-4 h-4 mr-1"/> Message</Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex items-center text-sm">
                        <MapPin className="w-5 h-5 mr-3 text-primary"/>
                        <span>Delivering to: {deliveryAddress}</span>
                    </div>

                    {deliveryStatus === 'Out for Delivery' && (
                         <Alert>
                            <KeyRound className="h-4 w-4" />
                            <AlertTitle>Verify Your Delivery</AlertTitle>
                            <AlertDescription>
                                Please provide the OTP to your delivery partner to complete the delivery.
                                <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        maxLength={4}
                                    />
                                    <Button onClick={handleVerifyOtp}>Verify</Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {deliveryStatus === 'Delivered' && (
                        <Alert variant="default" className="bg-primary/10 border-primary">
                            <Package className="h-4 w-4 text-primary" />
                            <AlertTitle>Item Delivered!</AlertTitle>
                            <AlertDescription>
                                How was your experience?
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Button key={star} variant="ghost" size="icon">
                                            <Star className="w-6 h-6 text-yellow-400 hover:fill-yellow-400"/>
                                        </Button>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                </CardContent>
                <CardFooter>
                     {currentStatusIndex < 1 && ( // Can cancel if not yet packed
                        <Button variant="destructive" className="w-full" onClick={handleCancel}>Cancel Order</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
