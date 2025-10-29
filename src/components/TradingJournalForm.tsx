import { useState } from "react";
import { TradeRecord } from "../App";
import { TradingRulesChecklist, ChecklistItems, initialChecklistState } from "./TradingRulesChecklist";
import { toast } from "sonner";

interface TradingJournalFormProps {
  onSubmit: (trade: Omit<TradeRecord, "id">) => void | Promise<void>;
  initialData?: Omit<TradeRecord, "id">;
  onCancel?: () => void;
}

export function TradingJournalForm({ onSubmit, initialData, onCancel }: TradingJournalFormProps) {
  const [formData, setFormData] = useState<Omit<TradeRecord, "id">>({
    ...( initialData || {
      date: new Date().toISOString().split("T")[0],
      type: "매수",
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
      sections: 0,
      fee: 0,
      strategy: "",
      memo: "",
      checklist: initialChecklistState,
    }),
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof Omit<TradeRecord, "id">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("[TradingJournalForm] handleSubmit called with formData:", formData);
    try {
      await onSubmit(formData);
      toast.success(initialData ? "거래가 수정되었습니다" : "거래가 기록되었습니다");
    } catch (error) {
      console.error("[TradingJournalForm] Submit error:", error);
      toast.error(initialData ? "수정 실패" : "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div className="space-y-1">
        <label htmlFor="date" className="text-sm font-medium">
          날짜
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Type */}
      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium">
          거래 유형
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value as "매수" | "매도")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="매수">매수</option>
          <option value="매도">매도</option>
        </select>
      </div>

      {/* Entry Price */}
      <div className="space-y-1">
        <label htmlFor="entryPrice" className="text-sm font-medium">
          진입가 ($)
        </label>
        <input
          type="number"
          id="entryPrice"
          placeholder="0.00"
          step="0.01"
          value={formData.entryPrice === 0 ? "" : formData.entryPrice}
          onChange={(e) => handleChange("entryPrice", e.target.value === "" ? 0 : parseFloat(e.target.value))}
          onFocus={handleFocus}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Exit Price */}
      <div className="space-y-1">
        <label htmlFor="exitPrice" className="text-sm font-medium">
          청산가 ($)
        </label>
        <input
          type="number"
          id="exitPrice"
          placeholder="0.00"
          step="0.01"
          value={formData.exitPrice === 0 ? "" : formData.exitPrice}
          onChange={(e) => handleChange("exitPrice", e.target.value === "" ? 0 : parseFloat(e.target.value))}
          onFocus={handleFocus}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Quantity */}
      <div className="space-y-1">
        <label htmlFor="quantity" className="text-sm font-medium">
          수량 (g)
        </label>
        <input
          type="number"
          id="quantity"
          placeholder="0"
          step="1"
          value={formData.quantity === 0 ? "" : formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value === "" ? 0 : parseInt(e.target.value))}
          onFocus={handleFocus}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Sections (구간 수) - with step 0.5 and parseFloat */}
      <div className="space-y-1">
        <label htmlFor="sections" className="text-sm font-medium">
          구간 수 (N)
        </label>
        <input
          type="number"
          id="sections"
          placeholder="0"
          step="0.5"
          value={formData.sections === 0 ? "" : formData.sections}
          onChange={(e) => handleChange("sections", e.target.value === "" ? 0 : parseFloat(e.target.value))}
          onFocus={handleFocus}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Fee */}
      <div className="space-y-1">
        <label htmlFor="fee" className="text-sm font-medium">
          수수료 ($)
        </label>
        <input
          type="number"
          id="fee"
          placeholder="0.00"
          step="0.01"
          value={formData.fee === 0 ? "" : formData.fee}
          onChange={(e) => handleChange("fee", e.target.value === "" ? 0 : parseFloat(e.target.value))}
          onFocus={handleFocus}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Strategy */}
      <div className="space-y-1">
        <label htmlFor="strategy" className="text-sm font-medium">
          전략
        </label>
        <input
          type="text"
          id="strategy"
          placeholder="사용한 거래 전략을 입력하세요"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Memo */}
      <div className="space-y-1">
        <label htmlFor="memo" className="text-sm font-medium">
          메모
        </label>
        <textarea
          id="memo"
          rows={4}
          placeholder="트레이드 메모를 입력하세요"
          value={formData.memo}
          onChange={(e) => handleChange("memo", e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Trading Rules Checklist */}
      <TradingRulesChecklist
        checklist={formData.checklist || initialChecklistState}
        onChange={(v: ChecklistItems) => {
          console.log("[TradingJournalForm] Checklist onChange:", v);
          handleChange("checklist", v);
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-md border px-4 py-2">
            취소
          </button>
        )}
        <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-white">
          {submitting ? "저장 중..." : initialData ? "수정 저장" : "저장"}
        </button>
      </div>
    </form>
  );
}
