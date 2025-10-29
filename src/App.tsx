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
    setDialogError(null);
    setIsDialogOpen(true);
  };

  const handleEditCancel = () => {
    setIsDialogOpen(false);
    setEditingTrade(null);
    setDialogError(null);
  };

  const handleEditSubmit = async (data: Omit<TradeRecord, "id">) => {
    try {
      if (!editingTrade) return;
      await updateTradeDB(editingTrade.id, data);
      toast.success("거래가 수정되었습니다");
      handleEditCancel();
    } catch (e: any) {
      setDialogError(e?.message ?? "수정 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-right" />

      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Gold Trading Journal</h1>
            <p className="text-sm text-muted-foreground">거래 기록 · 전략 점검 · 성과 추적</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="journal">거래 내역</TabsTrigger>
            <TabsTrigger value="new">새 거래</TabsTrigger>
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
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleEditCancel();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>거래 수정</DialogTitle>
          </DialogHeader>

          {dialogError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{dialogError}</p>
              <button onClick={handleEditCancel} className="mt-2 text-sm text-red-700 underline">
                닫기
              </button>
            </div>
          ) : editingTrade ? (
            <TradingJournalForm
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              initialData={editingTrade}
            />
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">수정할 거래를 불러오는 중...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
