import { useState } from "react";
import { TradeRecord } from "../App";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { TradingRulesChecklist } from "./TradingRulesChecklist";
import { Pencil, Trash2, TrendingUp, TrendingDown, ClipboardCheck } from "lucide-react";

interface TradingJournalTableProps {
  trades: TradeRecord[];
  onDelete: (id: string) => void;
  onRequestEdit: (trade: TradeRecord) => void;
  loading?: boolean;
}

export function TradingJournalTable({ trades, onDelete, onRequestEdit, loading }: TradingJournalTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingChecklistTrade, setViewingChecklistTrade] = useState<TradeRecord | null>(null);

  const handleDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const handleEditClick = (trade: TradeRecord) => {
    onRequestEdit(trade);
  };

  return (
    <div className="relative">
      {loading ? (
        <div className="p-6 text-sm text-muted-foreground">목록을 불러오는 중...</div>
      ) : trades.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">등록된 거래가 없습니다</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">일자</TableHead>
                <TableHead className="w-[80px]">유형</TableHead>
                <TableHead className="text-right">수량(랏수)</TableHead>
                <TableHead className="text-right">손익</TableHead>
                <TableHead className="text-right">수수료</TableHead>
                <TableHead>전략</TableHead>
                <TableHead className="w-[160px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((t, index) => {
                const pnlPositive = (t.profitLoss ?? 0) >= 0;
                return (
                  <TableRow key={t.id ?? `trade-${index}`} className="hover:bg-muted/40">
                    <TableCell>{t.date ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "매수" ? "default" : "secondary"}>{t.type ?? "-"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${pnlPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.profitLoss?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">{t.fee?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {pnlPositive ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className="truncate max-w-[200px]" title={t.strategy ?? "-"}>{t.strategy ?? "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setViewingChecklistTrade(t)}
                          title="체크리스트 보기"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(t)}
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeletingId(t.id)}
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Delete confirm */}
      <AlertDialog open={!!deletingId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 거래를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>삭제 후 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Checklist viewer */}
      <Dialog open={!!viewingChecklistTrade} onOpenChange={(open) => !open && setViewingChecklistTrade(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>체크리스트</DialogTitle>
          </DialogHeader>
          {viewingChecklistTrade && (
            <div className="py-2">
              <TradingRulesChecklist readonly value={viewingChecklistTrade.checklist} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
