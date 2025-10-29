import { useState } from "react";
import { TradingJournalForm } from "./components/TradingJournalForm";
import { TradingJournalTable } from "./components/TradingJournalTable";
import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { TrendingUp } from "lucide-react";
import { ChecklistItems } from "./components/TradingRulesChecklist";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";

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

  console.log("[App] Current state:", { 
    tradesCount: trades.length, 
    editingTrade: editingTrade?.id || null,
    isDialogOpen 
  });

  const addTrade = (trade: Omit<TradeRecord, "id">) => {
    console.log("[App] Adding new trade:", trade);
    const newTrade = {
      ...trade,
      id: Date.now().toString(),
    };
    setTrades([newTrade, ...trades]);
    console.log("[App] Trade added successfully");
  };

  const deleteTrade = (id: string) => {
    console.log("[App] Deleting trade:", id);
    setTrades(trades.filter((trade) => trade.id !== id));
    console.log("[App] Trade deleted successfully");
  };

  const editTrade = (updatedTrade: TradeRecord) => {
    console.log("[App] Updating trade:", updatedTrade.id);
    setTrades(
      trades.map((trade) =>
        trade.id === updatedTrade.id ? updatedTrade : trade
      )
    );
    console.log("[App] Trade updated successfully");
  };

  // Handle edit request from Table
  const handleRequestEdit = (trade: TradeRecord) => {
    console.log("[App] Edit requested for trade:", trade.id);
    setEditingTrade(trade);
    setIsDialogOpen(true);
    setDialogError(null);
  };

  // Handle form submission in Dialog
  const handleEditSubmit = (trade: Omit<TradeRecord, "id">) => {
    try {
      console.log("[App] Edit submit called");
      if (!editingTrade) {
        console.error("[App] No editing trade found");
        setDialogError("수정할 거래를 찾을 수 없습니다.");
        return;
      }

      const updatedTrade = {
        ...trade,
        id: editingTrade.id,
      };
      
      editTrade(updatedTrade);
      
      // Clear editing state and close dialog
      setEditingTrade(null);
      setIsDialogOpen(false);
      setDialogError(null);
      console.log("[App] Edit completed, dialog closed");
    } catch (error) {
      console.error("[App] Error during edit submit:", error);
      setDialogError("거래 수정 중 오류가 발생했습니다.");
    }
  };

  // Handle dialog cancel
  const handleEditCancel = () => {
    console.log("[App] Edit cancelled");
    setEditingTrade(null);
    setIsDialogOpen(false);
    setDialogError(null);
  };

  const totalProfitLoss = trades.reduce(
    (sum, trade) => sum + trade.profitLoss,
    0
  );
  const netProfit = trades.reduce(
    (sum, trade) => sum + trade.profitLoss - trade.fee,
    0
  );
  const winningTrades = trades.filter((trade) => trade.profitLoss > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-10 h-10 text-amber-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              골드 트레이딩 저널
            </h1>
          </div>
          <p className="text-amber-700">
            체계적인 거래 기록으로 더 나은 트레이더가 되세요
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white/80 backdrop-blur border-amber-200">
            <div className="space-y-1">
              <p className="text-amber-600">총 손익</p>
              <p
                className={
                  totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {totalProfitLoss >= 0 ? "+" : ""}
                ${totalProfitLoss.toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur border-amber-200">
            <div className="space-y-1">
              <p className="text-amber-600">순수익 (수수료 제외)</p>
              <p className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                {netProfit >= 0 ? "+" : ""}
                ${netProfit.toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur border-amber-200">
            <div className="space-y-1">
              <p className="text-amber-600">승률</p>
              <p className="text-amber-900">{winRate.toFixed(1)}%</p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="journal" className="w-full">
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
