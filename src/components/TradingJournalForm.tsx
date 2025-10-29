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
  const [formData, setFormData] = useState<Omit<TradeRecord, "id">>({
    ...( initialData || {
      date: new Date().toISOString().split("T")[0],
      type: "매수",
      quantity: 0,
      profitLoss: 0,
      fee: 0,
      strategy: "",
      memo: "",
      checklist: initialChecklistState,
    }),
    // Add new fields with defaults
    targetPrice: initialData?.targetPrice ?? 0,
    stopLoss: initialData?.stopLoss ?? 0,
    sections: initialData?.sections ?? 0,
    entryStart: initialData?.entryStart ?? 0,
    entryEnd: initialData?.entryEnd ?? 0,
    tpStart: initialData?.tpStart ?? 0,
    tpEnd: initialData?.tpEnd ?? 0,
    slStart: initialData?.slStart ?? 0,
    slEnd: initialData?.slEnd ?? 0,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = <K extends keyof Omit<TradeRecord, "id">>(
    field: K,
    value: Omit<TradeRecord, "id">[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select text on focus
    e.target.select();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(formData);
      toast.success(initialData ? "수정 완료" : "저장 완료");
      if (!initialData) {
        // Reset form if not editing
        setFormData({
          date: new Date().toISOString().split("T")[0],
          type: "매수",
          quantity: 0,
          profitLoss: 0,
          fee: 0,
          strategy: "",
          memo: "",
          checklist: initialChecklistState,
          targetPrice: 0,
          stopLoss: 0,
          sections: 0,
          entryStart: 0,
          entryEnd: 0,
          tpStart: 0,
          tpEnd: 0,
          slStart: 0,
          slEnd: 0,
        });
      }
    } catch (error) {
      console.error("[TradingJournalForm] Submit error:", error);
      toast.error("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-1">
        <Label htmlFor="date">날짜</Label>
        <Input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label htmlFor="type">거래 유형</Label>
        <Select value={formData.type} onValueChange={(v: "매수" | "매도") => handleChange("type", v)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="매수">매수</SelectItem>
            <SelectItem value="매도">매도</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div className="space-y-1">
        <Label htmlFor="quantity">수량</Label>
        <Input
          type="number"
          id="quantity"
          placeholder="0"
          step="1"
          value={formData.quantity === 0 ? "" : formData.quantity}
          onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
          onFocus={handleFocus}
        />
      </div>

      {/* Entry Range (Start ~ End) */}
      <div className="space-y-1">
        <Label>진입 범위 (Entry Start ~ Entry End)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Start"
            step="0.01"
            value={formData.entryStart === 0 ? "" : formData.entryStart}
            onChange={(e) => handleChange("entryStart", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="number"
            placeholder="End"
            step="0.01"
            value={formData.entryEnd === 0 ? "" : formData.entryEnd}
            onChange={(e) => handleChange("entryEnd", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
        </div>
      </div>

      {/* Target Price Range (Start ~ End) */}
      <div className="space-y-1">
        <Label>목표가 범위 (TP Start ~ TP End)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Start"
            step="0.01"
            value={formData.tpStart === 0 ? "" : formData.tpStart}
            onChange={(e) => handleChange("tpStart", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="number"
            placeholder="End"
            step="0.01"
            value={formData.tpEnd === 0 ? "" : formData.tpEnd}
            onChange={(e) => handleChange("tpEnd", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
        </div>
      </div>

      {/* Stop Loss Range (Start ~ End) */}
      <div className="space-y-1">
        <Label>손절가 범위 (SL Start ~ SL End)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Start"
            step="0.01"
            value={formData.slStart === 0 ? "" : formData.slStart}
            onChange={(e) => handleChange("slStart", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="number"
            placeholder="End"
            step="0.01"
            value={formData.slEnd === 0 ? "" : formData.slEnd}
            onChange={(e) => handleChange("slEnd", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
        </div>
      </div>

      {/* Sections (N) */}
      <div className="space-y-1">
        <Label htmlFor="sections">구간 수 (0.5 단위)</Label>
        <Input
          type="number"
          id="sections"
          placeholder="0"
          step="0.5"
          value={formData.sections === 0 ? "" : formData.sections}
          onChange={(e) => handleChange("sections", parseFloat(e.target.value) || 0)}
          onFocus={handleFocus}
        />
      </div>

      {/* Strategy */}
      <div className="space-y-1">
        <Label htmlFor="strategy">전략</Label>
        <Input
          type="text"
          id="strategy"
          placeholder="전략 이름"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
        />
      </div>

      {/* Fee */}
      <div className="space-y-1">
        <Label htmlFor="fee">수수료 ($)</Label>
        <Input
          type="number"
          id="fee"
          placeholder="0.00"
          step="0.01"
          value={formData.fee === 0 ? "" : formData.fee}
          onChange={(e) => handleChange("fee", toNumber(e.target.value))}
          onFocus={handleFocus}
        />
      </div>

      {/* Manual Profit/Loss Input */}
      <div className="space-y-1">
        <Label htmlFor="profitLoss">손익 ($)</Label>
        <Input
          type="number"
          id="profitLoss"
          placeholder="0.00"
          step="0.01"
          value={formData.profitLoss === 0 ? "" : formData.profitLoss}
          onChange={(e) => handleChange("profitLoss", toNumber(e.target.value))}
          onFocus={handleFocus}
        />
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

      {/* Trading Rules Checklist */}
      <Card className="p-4 md:p-5">
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
