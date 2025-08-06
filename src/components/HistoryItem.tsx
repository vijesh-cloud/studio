'use client';

import type { Submission } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Truck, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useDataStore } from "@/hooks/use-data-store";

interface HistoryItemProps {
  submission: Submission;
}

export function HistoryItem({ submission }: HistoryItemProps) {
  const { updateSubmissionStatus } = useDataStore();
  
  useEffect(() => {
    let pickupTimeout: NodeJS.Timeout;
    let recycleTimeout: NodeJS.Timeout;

    if (submission.status === 'Submitted') {
      pickupTimeout = setTimeout(() => {
        updateSubmissionStatus(submission.id, 'Picked Up');
      }, 5000); // 5 seconds to "Picked Up"
    }
    
    if (submission.status === 'Picked Up') {
        recycleTimeout = setTimeout(() => {
            updateSubmissionStatus(submission.id, 'Recycled');
        }, 10000); // 10 more seconds to "Recycled"
    }

    return () => {
      clearTimeout(pickupTimeout);
      clearTimeout(recycleTimeout);
    };
  }, [submission.id, submission.status, updateSubmissionStatus]);


  const getStatusInfo = () => {
    switch(submission.status) {
      case 'Submitted':
        return { icon: Clock, color: 'bg-yellow-500', text: 'Submitted' };
      case 'Picked Up':
        return { icon: Truck, color: 'bg-blue-500', text: 'Picked Up' };
      case 'Recycled':
        return { icon: Check, color: 'bg-primary', text: 'Recycled' };
      default:
        return { icon: Clock, color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex">
        <div className="relative w-1/3">
          <Image src={submission.photo} alt={submission.itemType} layout="fill" objectFit="cover" />
        </div>
        <div className="w-2/3">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold capitalize">{submission.itemType}</h3>
                <p className="text-xs text-muted-foreground">{new Date(submission.timestamp).toLocaleString()}</p>
              </div>
              <Badge variant="secondary">+{submission.points} pts</Badge>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
                <div className={cn("w-2 h-2 rounded-full mr-2", statusInfo.color)}></div>
                {statusInfo.text}
            </div>
             <Link href={submission.location.mapsURL} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-500 hover:underline">
              <MapPin className="w-3 h-3 mr-1" />
              {submission.location.address}
            </Link>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
