
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Truck, Package, CheckCircle, History, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function DeliveryPartnerDashboard() {
  const { deliveryPartner, submissions, logout, updateDeliveryStatus } = useDataStore();
  const router = useRouter();

  useEffect(() => {
    if (!deliveryPartner) {
      router.push('/login');
    }
  }, [deliveryPartner, router]);

  const myAssignedOrders = useMemo(() => {
    return submissions.filter(s => s.deliveryPartner?.id === deliveryPartner?.id && s.deliveryStatus !== 'Delivered' && s.deliveryStatus !== 'Cancelled');
  }, [submissions, deliveryPartner]);

  const allActiveOrders = useMemo(() => {
    return submissions.filter(s => s.deliveryStatus !== 'Delivered' && s.deliveryStatus !== 'Cancelled' && s.deliveryStatus !== 'Submitted');
  }, [submissions]);

  const myCompletedOrders = useMemo(() => {
    return submissions.filter(s => s.deliveryPartner?.id === deliveryPartner?.id && s.deliveryStatus === 'Delivered');
  }, [submissions, deliveryPartner]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const OrderCard = ({ order, isMyOrder }: { order: any, isMyOrder: boolean }) => (
     <Card key={order.orderId}>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">Order #{order.orderId?.slice(-6)}</CardTitle>
                    <CardDescription>Due: 25-30 mins</CardDescription>
                </div>
                <Badge variant={order.deliveryStatus === 'Out for Delivery' ? 'default' : 'secondary'}>{order.deliveryStatus}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-4 p-3 border rounded-lg">
                <Image src={order.photo} alt={order.itemType} width={60} height={60} className="rounded-md object-cover"/>
                <div>
                    <p className="font-bold capitalize">{order.itemType}</p>
                    <p className="text-sm text-muted-foreground">Deliver to: {order.deliveryAddress}</p>
                </div>
            </div>
            <div className="text-sm space-y-2">
                <p><strong>Customer:</strong> {order.claimedByUserId ? `User ID ${order.claimedByUserId.slice(-4)}` : 'N/A'}</p>
                 {isMyOrder && <p><strong>OTP:</strong> <span className="font-mono bg-accent px-2 py-1 rounded-md">{order.otp}</span> (Verify with customer)</p>}
            </div>
        </CardContent>
        {isMyOrder && (
            <CardFooter className="flex gap-2">
                {order.deliveryStatus === 'Confirmed' && <Button className="w-full" onClick={() => updateDeliveryStatus(order.orderId!, 'Packed')}>Mark as Packed</Button>}
                {order.deliveryStatus === 'Packed' && <Button className="w-full" onClick={() => updateDeliveryStatus(order.orderId!, 'Out for Delivery')}>Start Delivery</Button>}
                {order.deliveryStatus === 'Out for Delivery' && <Button className="w-full" onClick={() => updateDeliveryStatus(order.orderId!, 'Delivered')}>Mark Delivered</Button>}
            </CardFooter>
        )}
    </Card>
  )

  if (!deliveryPartner) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={deliveryPartner.photo} alt={deliveryPartner.name} />
                <AvatarFallback>{deliveryPartner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Welcome, {deliveryPartner.name}!</CardTitle>
                <CardDescription>Here are your assigned deliveries.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="my-deliveries">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-deliveries"><Truck className="mr-2 h-4 w-4"/>My Active Deliveries ({myAssignedOrders.length})</TabsTrigger>
            <TabsTrigger value="all-active"><Globe className="mr-2 h-4 w-4"/>All Active Orders ({allActiveOrders.length})</TabsTrigger>
            <TabsTrigger value="completed"><History className="mr-2 h-4 w-4"/>My Completed ({myCompletedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="my-deliveries" className="mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-2">
                {myAssignedOrders.length > 0 ? myAssignedOrders.map(order => (
                   <OrderCard key={order.orderId} order={order} isMyOrder={true} />
                )) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <Package className="mx-auto h-12 w-12"/>
                        <p className="mt-2 font-semibold">No active deliveries for you</p>
                        <p className="text-sm">New orders will appear here.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
        </TabsContent>
         <TabsContent value="all-active" className="mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-2">
                {allActiveOrders.length > 0 ? allActiveOrders.map(order => (
                    <OrderCard key={order.orderId} order={order} isMyOrder={order.deliveryPartner?.id === deliveryPartner.id} />
                )) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <Package className="mx-auto h-12 w-12"/>
                        <p className="mt-2 font-semibold">No active deliveries in the system</p>
                    </div>
                )}
              </div>
            </ScrollArea>
        </TabsContent>
         <TabsContent value="completed" className="mt-4">
             <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-2">
                {myCompletedOrders.length > 0 ? myCompletedOrders.map(order => (
                    <Card key={order.orderId} className="bg-accent/30">
                        <CardContent className="p-4 flex items-center gap-4">
                           <CheckCircle className="h-8 w-8 text-primary"/>
                            <div className="flex-grow">
                                <p className="font-semibold">Order #{order.orderId?.slice(-6)}</p>
                                <p className="text-sm text-muted-foreground">Delivered on {new Date(order.timestamp).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-bold capitalize">{order.itemType}</p>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <History className="mx-auto h-12 w-12"/>
                        <p className="mt-2 font-semibold">No completed deliveries</p>
                    </div>
                )}
              </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
