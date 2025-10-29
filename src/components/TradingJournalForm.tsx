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
      quantity: 0,
      sections: 0,
      margin: 0,
      risk: 0,
      session: "아시아장",
      entryKTR: 0,
      profitLoss: 0,
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
      toast.success("거래 기록이 저장되었습니다");
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error("거래 기록 저장에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">날짜</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">거래 방향</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="매수">매수</option>
            <option value="매도">매도</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">수량 (랏수)</label>
          <input
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">증거금 ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.margin}
            onChange={(e) => handleChange("margin", parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">리스크 (%)</label>
          <input
            type="number"
            step="1"
            value={formData.risk}
            onChange={(e) => handleChange("risk", parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">구간 수 (N)</label>
          <input
            type="number"
            step="1"
            value={formData.sections}
            onChange={(e) => handleChange("sections", parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">장 선택</label>
          <select
            value={formData.session}
            onChange={(e) => handleChange("session", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="아시아장">아시아장</option>
            <option value="유로장">유로장</option>
            <option value="미장">미장</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">진입 KTR</label>
          <input
            type="number"
            step="0.01"
            value={formData.entryKTR}
            onChange={(e) => handleChange("entryKTR", parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">손익 ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.profitLoss}
            onChange={(e) => handleChange("profitLoss", parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">전략</label>
        <input
          type="text"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="사용한 거래 전략을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">메모</label>
        <textarea
          value={formData.memo}
          onChange={(e) => handleChange("memo", e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="추가 메모사항을 입력하세요"
        />
      </div>

      <TradingRulesChecklist
        checklist={formData.checklist}
        onChange={(checklist) => handleChange("checklist", checklist)}
      />

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
