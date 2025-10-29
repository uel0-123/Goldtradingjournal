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
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>매매타입</TableHead>
              <TableHead>계약수</TableHead>
              <TableHead>마진</TableHead>
              <TableHead>리스크</TableHead>
              <TableHead>구간</TableHead>
              <TableHead>세션</TableHead>
              <TableHead>진입KTR</TableHead>
              <TableHead>손익</TableHead>
              <TableHead>전략</TableHead>
              <TableHead>체크리스트</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground">
                  데이터가 없습니다. 새로운 거래를 추가하세요.
                </TableCell>
              </TableRow>
            ) : (
              trades.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date ?? ""}</TableCell>
                  <TableCell>
                    <Badge variant={(t.type ?? "Buy") === "Buy" ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
                      {(t.type ?? "Buy") === "Buy" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {t.type ?? ""}
                    </Badge>
                  </TableCell>
                  <TableCell>{(t.quantity ?? 0).toFixed(2)}</TableCell>
                  <TableCell>${(t.margin ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{t.risk ?? 0}%</TableCell>
                  <TableCell>{t.sections ?? 0}</TableCell>
                  <TableCell>{t.session ?? ""}</TableCell>
                  <TableCell>{(t.entryKTR ?? 0).toFixed(2)}</TableCell>
                  <TableCell className={`font-semibold ${(t.profitLoss ?? 0) > 0 ? "text-green-600" : (t.profitLoss ?? 0) < 0 ? "text-red-600" : ""}`}>
                    ${(t.profitLoss ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{t.strategy ?? "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setViewingChecklistTrade(t)} className="h-8 w-8 p-0">
                      <ClipboardCheck className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(t)} className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingId(t.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>거래 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingChecklistTrade} onOpenChange={() => setViewingChecklistTrade(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>매매 체크리스트</DialogTitle>
          </DialogHeader>
          {viewingChecklistTrade && (
            <TradingRulesChecklist
              value={viewingChecklistTrade.checklist ?? []}
              onChange={() => {}}
              readOnly={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
