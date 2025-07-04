import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ClaimTimelineEvent } from "@/types/claim";

interface ClaimTimelineProps {
  timeline: ClaimTimelineEvent[];
}

export const ClaimTimeline = ({ timeline }: ClaimTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tidslinje
        </CardTitle>
        <CardDescription>Historikk for denne reklamasjonen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                {index < timeline.length - 1 && (
                  <div className="w-px h-8 bg-border mt-2"></div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{event.action}</p>
                <p className="text-xs text-muted-foreground">{event.user}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};