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
                <TableHead className="text-right">수량 (랏수)</TableHead>
                <TableHead className="text-right">증거금 ($)</TableHead>
                <TableHead className="text-right">리스크 (%)</TableHead>
                <TableHead className="text-right">구간 수 (N)</TableHead>
                <TableHead>장 선택</TableHead>
                <TableHead className="text-right">진입 KTR</TableHead>
                <TableHead className="text-right">손익 ($)</TableHead>
                <TableHead>전략</TableHead>
                <TableHead className="w-[160px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((t, index) => {
                const isProfitable = t.profitLoss > 0;
                return (
                  <TableRow key={t.id || index}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "매수" ? "default" : "secondary"}>
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${t.margin.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{t.risk}%</TableCell>
                    <TableCell className="text-right">{t.sections}</TableCell>
                    <TableCell>{t.session}</TableCell>
                    <TableCell className="text-right">{t.entryKTR.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={isProfitable ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {isProfitable && "+"}${t.profitLoss.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{t.strategy || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
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
