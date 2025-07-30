import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { SupplierScorecard } from "@/services/supplierScorecardService";

interface SupplierRankingTableProps {
  scorecards: SupplierScorecard[];
  loading?: boolean;
}

type SortField = keyof SupplierScorecard;
type SortDirection = 'asc' | 'desc';

export function SupplierRankingTable({ scorecards, loading }: SupplierRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedScorecards = [...scorecards].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  );

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rang</TableHead>
              <TableHead>Leverandør</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Saker</TableHead>
              <TableHead>Responstid</TableHead>
              <TableHead>Refund rate</TableHead>
              <TableHead>Total kostnad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rang</TableHead>
            <TableHead>
              <SortButton field="supplier_name">Leverandør</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="score">Score</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="total_claims">Saker</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="avg_response_time_days">Responstid</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="refund_rate">Refund rate</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="total_cost">Total kostnad</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScorecards.map((scorecard, index) => (
            <TableRow key={scorecard.supplier_name}>
              <TableCell className="font-medium">
                <Badge variant="outline">#{index + 1}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                {scorecard.supplier_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={getScoreBadgeVariant(scorecard.score)}>
                    {scorecard.score}/100
                  </Badge>
                  <Progress value={scorecard.score} className="w-16 h-2" />
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{scorecard.total_claims}</div>
                  <div className="text-muted-foreground">
                    {scorecard.active_claims} aktive
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {scorecard.avg_response_time_days ? (
                  <span className={
                    scorecard.avg_response_time_days <= 3 ? "text-green-600" :
                    scorecard.avg_response_time_days <= 7 ? "text-yellow-600" : "text-red-600"
                  }>
                    {scorecard.avg_response_time_days}d
                  </span>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <span className={
                  scorecard.refund_rate >= 80 ? "text-green-600" :
                  scorecard.refund_rate >= 60 ? "text-yellow-600" : "text-red-600"
                }>
                  {scorecard.refund_rate}%
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{formatCurrency(scorecard.total_cost)}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatCurrency(scorecard.total_refunded)} refundert
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}