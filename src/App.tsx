import { useState } from "react";
import { TradingJournalForm } from "./components/TradingJournalForm";
import { TradingJournalTable } from "./components/TradingJournalTable";
import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { TrendingUp } from "lucide-react";
import { ChecklistItems } from "./components/TradingRulesChecklist";

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

  const addTrade = (trade: Omit<TradeRecord, "id">) => {
    const newTrade = {
      ...trade,
      id: Date.now().toString(),
    };
    setTrades([newTrade, ...trades]);
  };

  const deleteTrade = (id: string) => {
    setTrades(trades.filter((trade) => trade.id !== id));
  };

  const editTrade = (id: string, updatedTrade: Omit<TradeRecord, "id">) => {
    setTrades(
      trades.map((trade) =>
        trade.id === id ? { ...updatedTrade, id } : trade
      )
    );
  };

  const totalProfitLoss = trades.reduce(
    (sum, trade) => sum + trade.profitLoss,
    0
  );
  const totalFees = trades.reduce((sum, trade) => sum + trade.fee, 0);
  const netProfit = totalProfitLoss - totalFees;
  const winRate =
    trades.length > 0
      ? (trades.filter((t) => t.profitLoss > 0).length / trades.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 md:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-amber-900">골드 선물거래 매매일지</h1>
          </div>
          <p className="text-amber-700">체계적인 거래 기록으로 성공적인 투자를 만들어가세요</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur border-amber-200">
            <div className="space-y-1">
              <p className="text-amber-600">총 거래 횟수</p>
              <p className="text-amber-900">{trades.length}회</p>
            </div>
          </Card>
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
              onEdit={editTrade}
            />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <TradingJournalForm onSubmit={addTrade} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
