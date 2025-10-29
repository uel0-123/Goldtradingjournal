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
    if (formData.entryPrice <= 0) e.entryPrice = "진입가는 0보다 커야 합니다";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key: keyof Omit<TradeRecord, "id">, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("입력 내용을 확인하세요");
      return;
    }

    setSubmitting(true);
    try {
      const profitLoss = calculateProfitLoss();
      // ERROR CHECK: checklist가 null/undefined인 경우 초기값으로 대체
      const safeChecklist = formData.checklist || initialChecklistState;
      console.log("[TradingJournalForm] Submitting with checklist:", safeChecklist);
      
      await onSubmit({ ...formData, profitLoss, checklist: safeChecklist });
      toast.success(initialData ? "매매일지 수정 완료" : "매매일지 저장 완료");
    } catch (error) {
      // ERROR LOG: 제출 실패 시 에러 로그
      console.error("[TradingJournalForm] Submit failed:", error);
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">거래일</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="type">거래 유형</Label>
          <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="매수">매수 (Long)</SelectItem>
              <SelectItem value="매도">매도 (Short)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Strategy */}
      <div className="space-y-1">
        <Label htmlFor="strategy">전략명</Label>
        <Input
          id="strategy"
          placeholder="예: 이평선 골든크로스"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
        />
        {errors.strategy && <p className="text-xs text-destructive">{errors.strategy}</p>}
      </div>

      {/* Prices & Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="entryPrice">진입가</Label>
          <Input
            id="entryPrice"
            inputMode="decimal"
            value={formData.entryPrice}
            onChange={(e) => handleChange("entryPrice", toNumber(e.target.value))}
          />
          {errors.entryPrice && <p className="text-xs text-destructive">{errors.entryPrice}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="exitPrice">청산가</Label>
          <Input
            id="exitPrice"
            inputMode="decimal"
            value={formData.exitPrice}
            onChange={(e) => handleChange("exitPrice", toNumber(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="quantity">수량</Label>
          <Input
            id="quantity"
            inputMode="decimal"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", toNumber(e.target.value))}
          />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>
      </div>

      {/* Fee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Profit/Loss Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="space-y-1">
          <Label>예상 손익</Label>
          <div className="h-10 px-3 rounded-md border bg-muted/30 flex items-center text-sm">
            {calculateProfitLoss().toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">현재 값 기준 예상 손익입니다</p>
        </div>
      </div>

      {/* Memo */}
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

      {/* Trading Rules Checklist - NULL/UNDEFINED FALLBACK 적용 */}
      <Card className="p-4 md:p-5">
        {/* ERROR CHECK: checklist prop에 null/undefined 방지를 위한 fallback 적용 */}
        <TradingRulesChecklist
          checklist={formData.checklist || initialChecklistState}
          onChange={(v: ChecklistItems) => {
            console.log("[TradingJournalForm] Checklist onChange:", v);
            handleChange("checklist", v);
          }}
        />
      </Card>

      {/* Actions */}
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
