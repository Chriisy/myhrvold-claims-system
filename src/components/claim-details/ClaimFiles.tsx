import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { ClaimFile } from "@/types/claim";

interface ClaimFilesProps {
  files: ClaimFile[];
}

export const ClaimFiles = ({ files }: ClaimFilesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vedlegg ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Last ned
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};