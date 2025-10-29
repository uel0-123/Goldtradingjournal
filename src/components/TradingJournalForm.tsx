import { useState } from "react";
import { TradeRecord } from "../App";
import { TradingRulesChecklist, ChecklistItems, initialChecklistState } from "./TradingRulesChecklist";
import { toast } from "sonner";

// UI: Tailwind + existing shadcn primitives to emulate Material-UI density/outlined style
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TradingJournalFormProps {
  // onSubmit must accept data without id (DB generates id)
  onSubmit: (trade: Omit<TradeRecord, "id">) => void | Promise<void>;
  // When editing
  initialData?: Omit<TradeRecord, "id">;
  onCancel?: () => void;
}

// Helper to validate numeric input
const toNumber = (v: string) => (v === "" || isNaN(Number(v)) ? 0 : Number(v));

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const calculateProfitLoss = () => {
    const { type, entryPrice, exitPrice, quantity } = formData;
    const diff = type === "매수" ? exitPrice - entryPrice : entryPrice - exitPrice;
    return Number((diff * quantity).toFixed(2));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.date) e.date = "거래일을 입력하세요";
    if (!formData.strategy) e.strategy = "전략명을 입력하세요";
    if (formData.quantity <= 0) e.quantity = "수량은 1 이상이어야 합니다";
    if (formData.entryPrice < 0) e.entryPrice = "진입가는 0 이상이어야 합니다";
    if (formData.exitPrice < 0) e.exitPrice = "청산가는 0 이상이어야 합니다";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key: keyof Omit<TradeRecord, "id">, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const profitLoss = calculateProfitLoss();
      await onSubmit({ ...formData, profitLoss });
      toast.success("저장되었습니다");
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
    } catch (err: any) {
      toast.error(err?.message ?? "저장 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">거래일</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>

        <div className="space-y-1">
          <Label>매수/매도</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => handleChange("type", v as "매수" | "매도")}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="매수">매수</SelectItem>
              <SelectItem value="매도">매도</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="strategy">전략</Label>
          <Input
            id="strategy"
            placeholder="예: 추세 돌파, 되돌림 진입 등"
            value={formData.strategy}
            onChange={(e) => handleChange("strategy", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">전략명을 기록하면 분석이 쉬워집니다</p>
          {errors.strategy && <p className="text-xs text-red-600 mt-1">{errors.strategy}</p>}
        </div>
      </div>

      <Card className="p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label htmlFor="entryPrice">진입가</Label>
            <Input
              id="entryPrice"
              inputMode="decimal"
              value={formData.entryPrice}
              onChange={(e) => handleChange("entryPrice", toNumber(e.target.value))}
            />
            {errors.entryPrice && <p className="text-xs text-red-600 mt-1">{errors.entryPrice}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="exitPrice">청산가</Label>
            <Input
              id="exitPrice"
              inputMode="decimal"
              value={formData.exitPrice}
              onChange={(e) => handleChange("exitPrice", toNumber(e.target.value))}
            />
            {errors.exitPrice && <p className="text-xs text-red-600 mt-1">{errors.exitPrice}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="quantity">수량</Label>
            <Input
              id="quantity"
              inputMode="numeric"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", toNumber(e.target.value))}
            />
            {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="fee">수수료</Label>
            <Input
              id="fee"
              inputMode="decimal"
              value={formData.fee}
              onChange={(e) => handleChange("fee", toNumber(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-1">
            <Label>예상 손익</Label>
            <div className="h-10 px-3 rounded-md border bg-muted/30 flex items-center text-sm">
              {calculateProfitLoss().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">현재 값 기준 예상 손익입니다</p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Textarea
          id="memo"
          rows={4}
          placeholder="트레이드 메모를 입력하세요"
          value={formData.memo}
          onChange={(e) => handleChange("memo", e.target.value)}
        />
      </div>

      <Card className="p-4 md:p-5">
        <TradingRulesChecklist
          value={formData.checklist}
          onChange={(v: ChecklistItems) => handleChange("checklist", v)}
        />
      </Card>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : initialData ? "수정 저장" : "저장"}
        </Button>
      </div>
    </form>
  );
}
