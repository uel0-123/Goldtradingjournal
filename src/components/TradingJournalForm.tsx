import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TradeRecord } from "../App";
import { Plus, Calculator } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { TradingRulesChecklist, ChecklistItems, initialChecklistState } from "./TradingRulesChecklist";

interface TradingJournalFormProps {
  onSubmit: (trade: Omit<TradeRecord, "id">) => void;
  initialData?: Omit<TradeRecord, "id">;
  onCancel?: () => void;
}

export function TradingJournalForm({ onSubmit, initialData, onCancel }: TradingJournalFormProps) {
  const [formData, setFormData] = useState<Omit<TradeRecord, "id">>(
    initialData || {
      date: new Date().toISOString().split("T")[0],
      type: "매수",
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
      profitLoss: 0,
      fee: 0,
      strategy: "",
      memo: "",
      checklist: initialChecklistState,
    }
  );

  const calculateProfitLoss = () => {
    const { type, entryPrice, exitPrice, quantity } = formData;
    let profit = 0;
    
    if (type === "매수") {
      // 매수 후 매도: (청산가 - 진입가) × 수량
      profit = (exitPrice - entryPrice) * quantity;
    } else {
      // 매도 후 매수: (진입가 - 청산가) × 수량
      profit = (entryPrice - exitPrice) * quantity;
    }
    
    setFormData({ ...formData, profitLoss: profit });
    toast.success(`손익이 계산되었습니다: ${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error("거래 날짜를 입력해주세요");
      return;
    }
    
    onSubmit(formData);
    toast.success("거래가 기록되었습니다");
    
    // Reset form
    if (!initialData) {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "매수",
        entryPrice: 0,
        exitPrice: 0,
        quantity: 0,
        profitLoss: 0,
        fee: 0,
        strategy: "",
        memo: "",
        checklist: initialChecklistState,
      });
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur border-amber-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 거래 날짜 */}
          <div className="space-y-2">
            <Label htmlFor="date">거래 날짜</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* 거래 유형 */}
          <div className="space-y-2">
            <Label htmlFor="type">거래 유형</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "매수" | "매도") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="매수">매수 (Long)</SelectItem>
                <SelectItem value="매도">매도 (Short)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 진입 가격 */}
          <div className="space-y-2">
            <Label htmlFor="entryPrice">진입 가격 ($)</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              value={formData.entryPrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, entryPrice: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          {/* 청산 가격 */}
          <div className="space-y-2">
            <Label htmlFor="exitPrice">청산 가격 ($)</Label>
            <Input
              id="exitPrice"
              type="number"
              step="0.01"
              value={formData.exitPrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, exitPrice: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          {/* 수량 */}
          <div className="space-y-2">
            <Label htmlFor="quantity">수량 (계약)</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          {/* 수수료 */}
          <div className="space-y-2">
            <Label htmlFor="fee">수수료 ($)</Label>
            <Input
              id="fee"
              type="number"
              step="0.01"
              value={formData.fee || ""}
              onChange={(e) =>
                setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>
        </div>

        {/* 손익 계산 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profitLoss">손익 ($)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculateProfitLoss}
              className="gap-2"
            >
              <Calculator className="w-4 h-4" />
              자동 계산
            </Button>
          </div>
          <Input
            id="profitLoss"
            type="number"
            step="0.01"
            value={formData.profitLoss || ""}
            onChange={(e) =>
              setFormData({ ...formData, profitLoss: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className={
              formData.profitLoss > 0
                ? "border-green-500"
                : formData.profitLoss < 0
                ? "border-red-500"
                : ""
            }
          />
        </div>

        {/* 전략 */}
        <div className="space-y-2">
          <Label htmlFor="strategy">거래 전략</Label>
          <Input
            id="strategy"
            type="text"
            value={formData.strategy}
            onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            placeholder="예: 골든 크로스, 지지선 돌파 등"
          />
        </div>

        {/* 메모 */}
        <div className="space-y-2">
          <Label htmlFor="memo">메모</Label>
          <Textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="거래 상황, 심리 상태, 시장 분석 등을 기록하세요"
            rows={4}
          />
        </div>

        {/* Trading Rules Checklist */}
        <div className="space-y-2">
          <Label>트레이딩 규칙 체크리스트</Label>
          <TradingRulesChecklist
            checklist={formData.checklist}
            onChange={(checklist) => setFormData({ ...formData, checklist })}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            {initialData ? "수정하기" : "거래 기록 추가"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
