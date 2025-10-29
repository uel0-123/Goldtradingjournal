import { useState, useEffect } from "react";
import { TradingJournalForm } from "./components/TradingJournalForm";
import { TradingJournalTable } from "./components/TradingJournalTable";
import { ChecklistItems } from "./components/TradingRulesChecklist";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card } from "./components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";
import { addTrade as addTradeDB, getTrades, updateTrade as updateTradeDB, deleteTrade as deleteTradeDB, subscribeTrades } from "./src/lib/firebase";

export interface TradeRecord {
  id: string;
  date: string;
  type: "매수" | "매도";
  quantity: number;
  margin: number;
  risk: number;
  sections: number;
  session: string;
  entryKTR: number;
  profitLoss: number;
  strategy: string;
  memo: string;
  checklist: ChecklistItems;
}

// Sanitize trades to ensure all required fields exist with proper fallback values
function sanitizeTrades(trades: any[]): TradeRecord[] {
  return trades.map((trade) => ({
    id: trade.id ?? "",
    date: trade.date ?? "",
    type: trade.type === "매도" ? "매도" : "매수",
    quantity: typeof trade.quantity === "number" ? trade.quantity : 0,
    margin: typeof trade.margin === "number" ? trade.margin : 0,
    risk: typeof trade.risk === "number" ? trade.risk : 0,
    sections: typeof trade.sections === "number" ? trade.sections : 0,
    session: trade.session ?? "",
    entryKTR: typeof trade.entryKTR === "number" ? trade.entryKTR : 0,
    profitLoss: typeof trade.profitLoss === "number" ? trade.profitLoss : 0,
    strategy: trade.strategy ?? "",
    memo: trade.memo ?? "",
    checklist: Array.isArray(trade.checklist) ? trade.checklist : []
  }));
}

export default function App() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [editingTrade, setEditingTrade] = useState<TradeRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time sync of trades with sanitization
  useEffect(() => {
    const unsubscribe = subscribeTrades((updatedTrades) => {
      const sanitizedTrades = sanitizeTrades(updatedTrades);
      setTrades(sanitizedTrades);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTrade = async (newTrade: Omit<TradeRecord, "id">) => {
    try {
      await addTradeDB(newTrade);
      toast.success("거래가 추가되었습니다.");
    } catch (error) {
      console.error("Error adding trade:", error);
      toast.error("거래 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteTradeDB(id);
      toast.success("거래가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("거래 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleRequestEdit = (trade: TradeRecord) => {
    setEditingTrade(trade);
    setIsDialogOpen(true);
  };

  const handleUpdateTrade = async (updatedTrade: Omit<TradeRecord, "id">) => {
    if (!editingTrade) return;

    try {
      await updateTradeDB(editingTrade.id, updatedTrade);
      toast.success("거래가 수정되었습니다.");
      setIsDialogOpen(false);
      setEditingTrade(null);
      setDialogError(null);
    } catch (error) {
      console.error("Error updating trade:", error);
      setDialogError("거래 수정 중 오류가 발생했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
    setEditingTrade(null);
    setDialogError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">금 매매 일지</h1>
        </div>

        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="journal">매매 일지</TabsTrigger>
            <TabsTrigger value="add">거래 추가</TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-4">
            <Card className="p-6">
              <TradingJournalTable
                trades={trades}
                onDelete={handleDeleteTrade}
                onRequestEdit={handleRequestEdit}
                loading={loading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card className="p-6">
              <TradingJournalForm onSubmit={handleAddTrade} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래 수정</DialogTitle>
          </DialogHeader>
          {editingTrade && (
            <TradingJournalForm
              initialData={editingTrade}
              onSubmit={handleUpdateTrade}
              onCancel={handleCancelEdit}
              error={dialogError}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
