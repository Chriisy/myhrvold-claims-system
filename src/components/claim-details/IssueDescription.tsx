import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimIssue } from "@/types/claim";

interface IssueDescriptionProps {
  issue: ClaimIssue;
}

export const IssueDescription = ({ issue }: IssueDescriptionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problembesk­rivelse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-sm">Type problem:</p>
          <p className="text-muted-foreground">{issue.type}</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-sm">Detaljert beskrivelse:</p>
          <p className="text-muted-foreground">{issue.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};