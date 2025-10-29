import { useState } from "react";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { TradingJournalForm } from "./TradingJournalForm";
import { TradeRecord } from "../App";
import { Pencil, Trash2, TrendingDown, TrendingUp, ClipboardCheck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";
import { TradingRulesChecklist } from "./TradingRulesChecklist";

interface TradingJournalTableProps {
  trades: TradeRecord[];
  onDelete: (id: string) => void;
  onEdit: (id: string, trade: Omit<TradeRecord, "id">) => void;
}

export function TradingJournalTable({ trades, onDelete, onEdit }: TradingJournalTableProps) {
  const [editingTrade, setEditingTrade] = useState<TradeRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingChecklistTrade, setViewingChecklistTrade] = useState<TradeRecord | null>(null);

  const handleEdit = (trade: Omit<TradeRecord, "id">) => {
    if (editingTrade) {
      onEdit(editingTrade.id, trade);
      setEditingTrade(null);
      toast.success("거래가 수정되었습니다");
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
      toast.success("거래가 삭제되었습니다");
    }
  };

  if (trades.length === 0) {
    return (
      <Card className="p-12 bg-white/80 backdrop-blur border-amber-200">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-amber-900">아직 거래 기록이 없습니다</h3>
          <p className="text-amber-600">새 거래 입력 탭에서 첫 거래를 기록해보세요</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/80 backdrop-blur border-amber-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-50/50">
                <TableHead>날짜</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">진입가</TableHead>
                <TableHead className="text-right">청산가</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead className="text-right">손익</TableHead>
                <TableHead className="text-right">수수료</TableHead>
                <TableHead className="text-right">순손익</TableHead>
                <TableHead>전략</TableHead>
                <TableHead>메모</TableHead>
                <TableHead className="text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => {
                const netPL = trade.profitLoss - trade.fee;
                return (
                  <TableRow key={trade.id} className="hover:bg-amber-50/30">
                    <TableCell>{trade.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={trade.type === "매수" ? "default" : "secondary"}
                        className={
                          trade.type === "매수"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-purple-500 hover:bg-purple-600"
                        }
                      >
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${trade.entryPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${trade.exitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{trade.quantity}</TableCell>
                    <TableCell className="text-right">
                      <span className={trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                        {trade.profitLoss >= 0 ? "+" : ""}
                        ${trade.profitLoss.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      ${trade.fee.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {netPL >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={netPL >= 0 ? "text-green-600" : "text-red-600"}>
                          {netPL >= 0 ? "+" : ""}
                          ${netPL.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-700">{trade.strategy || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-amber-600" title={trade.memo}>
                        {trade.memo || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTrade(trade)}
                          className="hover:bg-amber-100"
                        >
                          <Pencil className="w-4 h-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(trade.id)}
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래 수정</DialogTitle>
            <DialogDescription>
              거래 정보를 수정하고 저장하세요.
            </DialogDescription>
          </DialogHeader>
          {editingTrade && (
            <TradingJournalForm
              initialData={{
                date: editingTrade.date,
                type: editingTrade.type,
                entryPrice: editingTrade.entryPrice,
                exitPrice: editingTrade.exitPrice,
                quantity: editingTrade.quantity,
                profitLoss: editingTrade.profitLoss,
                fee: editingTrade.fee,
                strategy: editingTrade.strategy,
                memo: editingTrade.memo,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingTrade(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
