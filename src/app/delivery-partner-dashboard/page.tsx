
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Truck, Package, CheckCircle, History, Globe, TrendingUp, CalendarDays, ClipboardCheck, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, Bar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { isToday, isThisMonth, eachDayOfInterval, format } from 'date-fns';

export default function DeliveryPartnerDashboard() {
  const { deliveryPartner, submissions, logout, updateDeliveryStatus } = useDataStore();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!deliveryPartner) {
      router.push('/login');
    }
  }, [deliveryPartner, router]);

  const myOrders = useMemo(() => {
    return submissions.filter(s => s.deliveryPartner?.id === deliveryPartner?.id);
  }, [submissions, deliveryPartner]);

  const myActiveOrders = useMemo(() => {
    return myOrders.filter(s => s.deliveryStatus !== 'Delivered' && s.deliveryStatus !== 'Cancelled');
  }, [myOrders]);
  
  const myCompletedOrders = useMemo(() => {
    return myOrders.filter(s => s.deliveryStatus === 'Delivered');
  }, [myOrders]);
  
  const allActiveOrders = useMemo(() => {
    return submissions.filter(s => s.deliveryStatus !== 'Delivered' && s.deliveryStatus !== 'Cancelled' && s.deliveryStatus !== 'Submitted');
  }, [submissions]);

  const stats = useMemo(() => {
    const pickupsToday = myCompletedOrders.filter(order => isToday(new Date(order.timestamp))).length;
    const ordersThisMonth = myOrders.filter(order => isThisMonth(new Date(order.timestamp))).length;
    const activeNow = myActiveOrders.length;
    
    return { pickupsToday, ordersThisMonth, activeNow };
  }, [myCompletedOrders, myOrders, myActiveOrders]);

  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
        start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        end: new Date()
    });

    return last7Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const pickups = myCompletedOrders.filter(order => format(new Date(order.timestamp), 'yyyy-MM-dd') === dayStr).length;
        return {
            date: format(day, 'MMM d'),
            pickups: pickups
        }
    });
  }, [myCompletedOrders]);

  const chartConfig = {
    pickups: {
      label: "Pickups",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const OrderCard = ({ order, isMyOrder }: { order: any, isMyOrder: boolean }) => (
     <Card key={order.orderId}>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-base">Order #{order.orderId?.slice(-6)}</CardTitle>
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
                 {isMyOrder && <p><strong>OTP:</strong> <span className="font-mono bg-accent px-2 py-1 rounded-md">{order.otp}</span></p>}
            </div>
        </CardContent>
        {isMyOrder && (
            <CardFooter className="flex gap-2">
                {order.deliveryStatus === 'Confirmed' && <Button className="w-full" onClick={() => updateDeliveryStatus(order.orderId!, 'Packed')}>Mark as Packed</Button>}
                {order.deliveryStatus === 'Packed' && <Button className="w-full" onClick={() => updateDeliveryStatus(order.orderId!, 'Out for Delivery')}>Start Delivery</Button>}
                {order.deliveryStatus === 'Out for Delivery' && <Button className="w-full" disabled>Waiting for OTP</Button>}
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
        <CardHeader className="flex flex-row items-center justify-between">
           <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={deliveryPartner.photo} alt={deliveryPartner.name} />
                <AvatarFallback>{deliveryPartner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Welcome, {deliveryPartner.name}!</CardTitle>
                <CardDescription>Partner ID: {deliveryPartner.id}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center space-x-2">
                    <Switch id="availability-mode" checked={isOnline} onCheckedChange={setIsOnline} />
                    <Label htmlFor="availability-mode">{isOnline ? 'Online' : 'Offline'}</Label>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <StatCard icon={ClipboardCheck} title="Pickups Today" value={stats.pickupsToday} />
          <StatCard icon={CalendarDays} title="Orders This Month" value={stats.ordersThisMonth} />
          <StatCard icon={Briefcase} title="Active Now" value={stats.activeNow} />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
          <CardDescription>Your completed pickups over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="w-full h-[200px]">
                <BarChart data={chartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <RechartsTooltip 
                        cursor={{fill: 'hsl(var(--accent) / 0.3)'}}
                        content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="pickups" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
           </ChartContainer>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="my-deliveries">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-deliveries"><Truck className="mr-2 h-4 w-4"/>My Active ({myActiveOrders.length})</TabsTrigger>
            <TabsTrigger value="all-active"><Globe className="mr-2 h-4 w-4"/>All Active ({allActiveOrders.length})</TabsTrigger>
            <TabsTrigger value="completed"><History className="mr-2 h-4 w-4"/>My Completed ({myCompletedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="my-deliveries" className="mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-2">
                {myActiveOrders.length > 0 ? myActiveOrders.map(order => (
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
