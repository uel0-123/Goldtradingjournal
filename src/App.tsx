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
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profitLoss: number;
  fee: number;
  strategy: string;
  memo: string;
  checklist: ChecklistItems;
  // New fields
  margin?: number;
  risk?: number;
  sections?: number;
  session?: string;
  entryKTR?: number;
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

  const deleteTrade = async (id: string) => {
    await deleteTradeDB(id);
    toast.success("거래가 삭제되었습니다");
  };

  const handleRequestEdit = (trade: TradeRecord) => {
    setEditingTrade(trade);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async (updatedTrade: Omit<TradeRecord, "id">) => {
    if (!editingTrade) return;
    try {
      console.log("[App] Updating trade:", editingTrade.id, updatedTrade);
      await updateTradeDB(editingTrade.id, updatedTrade);
      toast.success("거래가 수정되었습니다");
      setIsDialogOpen(false);
      setEditingTrade(null);
    } catch (err: any) {
      console.error("[App] Update trade error:", err);
      setDialogError(err.message || "수정 중 오류가 발생했습니다");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTrade(null);
    setDialogError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster richColors position="top-center" />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Gold Trading Journal</h1>
        </div>
        <Tabs defaultValue="journal" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="journal">거래 내역</TabsTrigger>
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
                entryPrice: editingTrade.entryPrice,
                exitPrice: editingTrade.exitPrice,
                quantity: editingTrade.quantity,
                profitLoss: editingTrade.profitLoss,
                fee: editingTrade.fee,
                strategy: editingTrade.strategy,
                memo: editingTrade.memo,
                checklist: editingTrade.checklist,
                margin: editingTrade.margin,
                risk: editingTrade.risk,
                sections: editingTrade.sections,
                session: editingTrade.session,
                entryKTR: editingTrade.entryKTR,
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
