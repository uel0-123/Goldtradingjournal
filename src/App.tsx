import { useState, useEffect } from "react";
import { TradingJournalForm } from "./components/TradingJournalForm";
import { TradingJournalTable } from "./components/TradingJournalTable";
import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { TrendingUp } from "lucide-react";
import { ChecklistItems } from "./components/TradingRulesChecklist";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { addTrade as addTradeDB, getTrades, updateTrade as updateTradeDB, deleteTrade as deleteTradeDB, subscribeTrades } from "./src/lib/firebase";
import { toast } from "sonner";

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

  console.log("[App] Current state:", {
    tradesCount: trades.length,
    editingTrade: editingTrade?.id || null,
    isDialogOpen,
    loading
  });

  // Initialize trades with real-time subscription
  useEffect(() => {
    console.log("[App] Setting up real-time subscription");
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeTrades((updatedTrades) => {
      console.log("[App] Received real-time update:", updatedTrades.length, "trades");
      setTrades(updatedTrades);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("[App] Cleaning up subscription");
      unsubscribe();
    };
  }, []);

  // Add new trade to Firebase
  const addTrade = async (trade: Omit<TradeRecord, "id">) => {
    try {
      console.log("[App] Adding new trade to Firebase:", trade);
      setLoading(true);
      
      await addTradeDB(trade);
      
      console.log("[App] Trade added successfully to Firebase");
      toast.success("거래가 성공적으로 저장되었습니다");
    } catch (error) {
      console.error("[App] Error adding trade:", error);
      toast.error("거래 저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // Delete trade from Firebase
  const deleteTrade = async (id: string) => {
    try {
      console.log("[App] Deleting trade from Firebase:", id);
      setLoading(true);
      
      await deleteTradeDB(id);
      
      console.log("[App] Trade deleted successfully from Firebase");
      toast.success("거래가 성공적으로 삭제되었습니다");
    } catch (error) {
      console.error("[App] Error deleting trade:", error);
      toast.error("거래 삭제 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // Update trade in Firebase
  const editTrade = async (updatedTrade: TradeRecord) => {
    try {
      console.log("[App] Updating trade in Firebase:", updatedTrade.id);
      setLoading(true);
      
      await updateTradeDB(updatedTrade.id, updatedTrade);
      
      console.log("[App] Trade updated successfully in Firebase");
      setEditingTrade(null);
      setIsDialogOpen(false);
      setDialogError(null);
      toast.success("거래가 성공적으로 수정되었습니다");
    } catch (error) {
      console.error("[App] Error updating trade:", error);
      toast.error("거래 수정 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEdit = (trade: TradeRecord) => {
    try {
      console.log("[App] Opening edit dialog for trade:", trade.id);
      setEditingTrade(trade);
      setIsDialogOpen(true);
      setDialogError(null);
    } catch (error) {
      console.error("[App] Error opening edit dialog:", error);
      setDialogError("거래 수정 화면을 여는 중 오류가 발생했습니다");
    }
  };

  const handleEditSubmit = async (updatedData: Omit<TradeRecord, "id">) => {
    try {
      console.log("[App] Edit submit requested");
      
      if (!editingTrade) {
        console.error("[App] No trade is being edited");
        setDialogError("수정할 거래를 찾을 수 없습니다");
        return;
      }

      const updatedTrade: TradeRecord = {
        ...updatedData,
        id: editingTrade.id,
      };

      console.log("[App] Submitting updated trade:", updatedTrade);
      await editTrade(updatedTrade);
    } catch (error) {
      console.error("[App] Error in handleEditSubmit:", error);
      setDialogError("거래 수정 중 오류가 발생했습니다");
    }
  };

  const handleEditCancel = () => {
    console.log("[App] Edit cancelled");
    setEditingTrade(null);
    setIsDialogOpen(false);
    setDialogError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Toaster position="top-center" />
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white/90 backdrop-blur shadow-xl">
          <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">금 거래 일지</h1>
                <p className="text-purple-100 text-sm mt-1">
                  체계적인 거래 관리로 성공적인 투자를
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <p className="text-blue-600 text-sm">데이터를 불러오는 중...</p>
            </div>
          )}

          <Tabs defaultValue="journal" className="p-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/80 backdrop-blur">
              <TabsTrigger value="journal">거래 기록</TabsTrigger>
              <TabsTrigger value="new">새 거래 입력</TabsTrigger>
            </TabsList>

            <TabsContent value="journal" className="mt-6">
              <TradingJournalTable
                trades={trades}
                onDelete={deleteTrade}
                onRequestEdit={handleRequestEdit}
              />
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <TradingJournalForm onSubmit={addTrade} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          console.log("[App] Dialog state changed:", open);
          if (!open) {
            handleEditCancel();
          }
          setIsDialogOpen(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>거래 수정</DialogTitle>
            </DialogHeader>
            {dialogError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{dialogError}</p>
                <button
                  onClick={handleEditCancel}
                  className="mt-2 text-sm text-red-700 underline"
                >
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
    </div>
  );
}
