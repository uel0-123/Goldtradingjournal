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

export default function App() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [editingTrade, setEditingTrade] = useState<TradeRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time sync of trades
  useEffect(() => {
    const unsubscribe = subscribeTrades((updatedTrades) => {
      setTrades(updatedTrades);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // CRUD handlers wired to DB, unchanged behavior
  const addTrade = async (data: Omit<TradeRecord, "id">) => {
    const id = await addTradeDB(data);
    toast.success("거래가 추가되었습니다");
    return id;
  };

  const updateTrade = async (id: string, data: Omit<TradeRecord, "id">) => {
    await updateTradeDB(id, data);
    toast.success("거래가 수정되었습니다");
  };

  const deleteTrade = async (id: string) => {
    await deleteTradeDB(id);
    toast.success("거래가 삭제되었습니다");
  };

  const handleRequestEdit = (trade: TradeRecord) => {
    setEditingTrade(trade);
    setIsDialogOpen(true);
    setDialogError(null);
  };

  const handleSaveEdit = async (data: Omit<TradeRecord, "id">) => {
    if (!editingTrade) return;
    try {
      setDialogError(null);
      await updateTrade(editingTrade.id, data);
      setIsDialogOpen(false);
      setEditingTrade(null);
    } catch (err) {
      console.error("Error saving edit:", err);
      setDialogError("거래 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTrade(null);
    setDialogError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">금 거래 저널</h1>
        </div>
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="journal">거래 기록</TabsTrigger>
            <TabsTrigger value="new">새 거래 등록</TabsTrigger>
          </TabsList>
          <TabsContent value="journal" className="mt-6">
            <Card className="p-0 overflow-hidden">
              <TradingJournalTable
                trades={trades}
                onDelete={deleteTrade}
                onRequestEdit={handleRequestEdit}
                loading={loading}
              />
            </Card>
          </TabsContent>
          <TabsContent value="new" className="mt-6">
            <Card className="p-4 md:p-6">
              <TradingJournalForm onSubmit={addTrade} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래 수정</DialogTitle>
          </DialogHeader>
          {dialogError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{dialogError}</div>
          )}
          {editingTrade && (
            <TradingJournalForm
              initialData={{
                date: editingTrade.date,
                type: editingTrade.type,
                quantity: editingTrade.quantity,
                margin: editingTrade.margin,
                risk: editingTrade.risk,
                sections: editingTrade.sections,
                session: editingTrade.session,
                entryKTR: editingTrade.entryKTR,
                profitLoss: editingTrade.profitLoss,
                strategy: editingTrade.strategy,
                memo: editingTrade.memo,
                checklist: editingTrade.checklist,
              }}
              onSubmit={handleSaveEdit}
              onCancel={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
