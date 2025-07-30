import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2, UserCheck, CheckCircle } from 'lucide-react';
import { useBulkOperations } from '@/hooks/useBulkOperations';

interface BulkActionsProps {
  selectedCount: number;
  onRefresh: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onRefresh }) => {
  const {
    isLoading,
    executeStatusChange,
    executeBulkDelete,
    clearSelection
  } = useBulkOperations();

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleStatusChange = async (status: 'new' | 'pending_approval' | 'under_processing' | 'sent_supplier' | 'awaiting_response' | 'resolved' | 'rejected') => {
    const success = await executeStatusChange(status);
    if (success) {
      onRefresh();
    }
  };

  const handleDelete = async () => {
    const success = await executeBulkDelete();
    if (success) {
      onRefresh();
      setShowDeleteDialog(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-muted/50 border-b">
        <span className="text-sm font-medium">
          {selectedCount} reklamasjon(er) valgt
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Handlinger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusChange('pending_approval')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sett til venter godkjenning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('under_processing')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Sett til under behandling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('sent_supplier')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sett til sendt leverandør
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sett til løst
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slett valgte
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearSelection}
          disabled={isLoading}
        >
          Avbryt
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette {selectedCount} reklamasjon(er). 
              Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Slett reklamasjoner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};