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
  const [formData, setFormData] = useState<Omit<TradeRecord, "id">>({\n    ...(initialData || {
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
    margin: initialData?.margin || 0,
    risk: initialData?.risk || 0,
    sections: initialData?.sections || 0,
    session: initialData?.session || "아시아장",
    entryKTR: initialData?.entryKTR || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof Omit<TradeRecord, "id">, value: any) => {
    console.log("[TradingJournalForm] handleChange:", field, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user corrects it
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.date) e.date = "거래일을 입력하세요";
    if (!formData.strategy) e.strategy = "전략명을 입력하세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate()) {
      toast.error("필수 항목을 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      console.log("[TradingJournalForm] Submitting formData:", formData);
      await onSubmit(formData);
      toast.success(initialData ? "거래 내역이 수정되었습니다." : "거래 내역이 저장되었습니다.");
    } catch (err: any) {
      console.error("[TradingJournalForm] Submit error:", err);
      toast.error(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to handle focus clearing zero values
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0" || e.target.value === "0.00") {
      e.target.value = "";
    }
  };

  return (
    <form className="space-y-5 p-4 md:p-6" onSubmit={handleSubmit}>
      {/* Date & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">거래일</Label>
          <Input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="type">거래 유형</Label>
          <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="매수">매수</SelectItem>
              <SelectItem value="매도">매도</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Strategy */}
      <div className="space-y-1">
        <Label htmlFor="strategy">전략명</Label>
        <Input
          type="text"
          id="strategy"
          placeholder="전략명을 입력하세요"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
        />
        {errors.strategy && <p className="text-xs text-red-500">{errors.strategy}</p>}
      </div>

      {/* Core Fields: Quantity, Margin, Risk, Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label htmlFor="quantity">수량 (랏수)</Label>
          <Input
            type="number"
            id="quantity"
            placeholder="0.01"
            step="0.01"
            value={formData.quantity === 0 ? "" : formData.quantity}
            onChange={(e) => handleChange("quantity", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="margin">증거금</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
            <Input
              type="number"
              id="margin"
              placeholder="0.00"
              step="0.01"
              value={formData.margin === 0 ? "" : formData.margin}
              onChange={(e) => handleChange("margin", toNumber(e.target.value))}
              onFocus={handleFocus}
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="risk">리스크</Label>
          <div className="relative">
            <Input
              type="number"
              id="risk"
              placeholder="0"
              step="1"
              value={formData.risk === 0 ? "" : formData.risk}
              onChange={(e) => handleChange("risk", parseInt(e.target.value) || 0)}
              onFocus={handleFocus}
              className="pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">%</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sections">구간 수</Label>
          <Input
            type="number"
            id="sections"
            placeholder="0"
            step="1"
            value={formData.sections === 0 ? "" : formData.sections}
            onChange={(e) => handleChange("sections", parseInt(e.target.value) || 0)}
            onFocus={handleFocus}
          />
        </div>
      </div>

      {/* Session & Entry KTR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="session">장 선택</Label>
          <Select value={formData.session || "아시아장"} onValueChange={(v) => handleChange("session", v)}>
            <SelectTrigger id="session">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="아시아장">아시아장</SelectItem>
              <SelectItem value="유로장">유로장</SelectItem>
              <SelectItem value="미장">미장</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="entryKTR">진입 KTR</Label>
          <Input
            type="number"
            id="entryKTR"
            placeholder="0.00"
            step="0.01"
            value={formData.entryKTR === 0 ? "" : formData.entryKTR}
            onChange={(e) => handleChange("entryKTR", toNumber(e.target.value))}
            onFocus={handleFocus}
          />
        </div>
      </div>

      {/* Manual Profit/Loss Input */}
      <div className="space-y-1">
        <Label htmlFor="profitLoss">손익</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
          <Input
            type="number"
            id="profitLoss"
            placeholder="0.00"
            step="0.01"
            value={formData.profitLoss === 0 ? "" : formData.profitLoss}
            onChange={(e) => handleChange("profitLoss", toNumber(e.target.value))}
            onFocus={handleFocus}
            className="pl-7"
          />
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
