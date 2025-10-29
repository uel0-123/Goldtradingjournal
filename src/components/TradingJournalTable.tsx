import { useState } from "react";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { TradeRecord } from "../App";
import { Pencil, Trash2, TrendingDown, TrendingUp, ClipboardCheck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { TradingRulesChecklist } from "./TradingRulesChecklist";

interface TradingJournalTableProps {
  trades: TradeRecord[];
  onDelete: (id: string) => void;
  onRequestEdit: (trade: TradeRecord) => void;
}

export function TradingJournalTable({ trades, onDelete, onRequestEdit }: TradingJournalTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingChecklistTrade, setViewingChecklistTrade] = useState<TradeRecord | null>(null);

  console.log("[TradingJournalTable] Rendered with", trades.length, "trades");

  const handleDelete = () => {
    console.log("[TradingJournalTable] Deleting trade:", deletingId);
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
      toast.success("거래가 삭제되었습니다");
    }
  };

  const handleEditClick = (trade: TradeRecord) => {
    console.log("[TradingJournalTable] Edit button clicked for trade:", trade.id);
    onRequestEdit(trade);
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
              <TableRow className="hover:bg-amber-50/50">
                <TableHead className="text-amber-900">날짜</TableHead>
                <TableHead className="text-amber-900">유형</TableHead>
                <TableHead className="text-amber-900">진입가</TableHead>
                <TableHead className="text-amber-900">청산가</TableHead>
                <TableHead className="text-amber-900">수량</TableHead>
                <TableHead className="text-amber-900">손익</TableHead>
                <TableHead className="text-amber-900">수수료</TableHead>
                <TableHead className="text-amber-900">전략</TableHead>
                <TableHead className="text-amber-900 text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} className="hover:bg-amber-50/30 transition-colors">
                  <TableCell className="text-amber-900">{trade.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        trade.type === "매수"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {trade.type === "매수" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-amber-900">${trade.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-900">${trade.exitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-900">{trade.quantity}</TableCell>
                  <TableCell
                    className={
                      trade.profitLoss >= 0
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {trade.profitLoss >= 0 ? "+" : ""}${trade.profitLoss.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-amber-900">${trade.fee.toLocaleString()}</TableCell>
                  <TableCell className="text-amber-900">
                    <div className="max-w-[150px] truncate" title={trade.strategy}>
                      {trade.strategy}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => setViewingChecklistTrade(trade)}
                        title="체크리스트 보기"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(trade)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          console.log("[TradingJournalTable] Delete button clicked for trade:", trade.id);
                          setDeletingId(trade.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Checklist Dialog */}
      <Dialog open={!!viewingChecklistTrade} onOpenChange={() => setViewingChecklistTrade(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>거래 체크리스트</DialogTitle>
          </DialogHeader>
          {viewingChecklistTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-amber-600">날짜:</span>{" "}
                  <span className="text-amber-900">{viewingChecklistTrade.date}</span>
                </div>
                <div>
                  <span className="text-amber-600">유형:</span>{" "}
                  <span className="text-amber-900">{viewingChecklistTrade.type}</span>
                </div>
                <div>
                  <span className="text-amber-600">손익:</span>{" "}
                  <span
                    className={
                      viewingChecklistTrade.profitLoss >= 0
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {viewingChecklistTrade.profitLoss >= 0 ? "+" : ""}
                    ${viewingChecklistTrade.profitLoss.toLocaleString()}
                  </span>
                </div>
              </div>
              <TradingRulesChecklist
                values={viewingChecklistTrade.checklist}
                readOnly={true}
              />
            </div>
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
