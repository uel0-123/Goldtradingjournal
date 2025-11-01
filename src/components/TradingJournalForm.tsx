import { useState, useEffect } from "react"; // BUG FIX 1: useEffect 추가
import { TradeRecord } from "../App";
import { TradingRulesChecklist, ChecklistItems, initialChecklistState } from "./TradingRulesChecklist";
import { toast } from "sonner";

interface TradingJournalFormProps {
  onSubmit: (trade: Omit<TradeRecord, "id">) => void | Promise<void>;
  initialData?: Omit<TradeRecord, "id">;
  onCancel?: () => void;
}

export function TradingJournalForm({ onSubmit, initialData, onCancel }: TradingJournalFormProps) {
  const [formData, setFormData] = useState<Omit<TradeRecord, "id">>  ({
    ...( initialData || {
      date: new Date().toISOString().split("T")[0],
      type: "매수",
      quantity: '',
      sections: '',
      margin: '',
      risk: '',
      session: "아시아장",
      entryKTR: '',
      profitLoss: '',
      strategy: "",
      memo: "",
      checklist: initialChecklistState,
    }),
  });
  const [submitting, setSubmitting] = useState(false);

  // BUG FIX 1: 수정 버튼 클릭 시 폼 초기화를 위한 useEffect 추가
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // 기존 기능 유지: 빈 문자열 필드 처리
        quantity: initialData.quantity ?? '',
        sections: initialData.sections ?? '',
        margin: initialData.margin ?? '',
        risk: initialData.risk ?? '',
        entryKTR: initialData.entryKTR ?? '',
        profitLoss: initialData.profitLoss ?? '',
        checklist: initialData.checklist ?? initialChecklistState,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Omit<TradeRecord, "id">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberFocus = (field: keyof Omit<TradeRecord, "id">) => {
    if (formData[field] === 0 || formData[field] === '0') {
      handleChange(field, '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        quantity: formData.quantity === '' ? 0 : Number(formData.quantity),
        sections: formData.sections === '' ? 0 : parseFloat(formData.sections as string),
        margin: formData.margin === '' ? 0 : Number(formData.margin),
        risk: formData.risk === '' ? 0 : Number(formData.risk),
        entryKTR: formData.entryKTR === '' ? 0 : Number(formData.entryKTR),
        profitLoss: formData.profitLoss === '' ? 0 : Number(formData.profitLoss),
      };

      await onSubmit(submissionData);
      toast.success("거래가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Failed to submit trade:", error);
      toast.error("거래 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          날짜
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          매매 유형
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="매수">매수</option>
          <option value="매도">매도</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          수량
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
          onFocus={() => handleNumberFocus("quantity")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          구간
        </label>
        <input
          type="number"
          value={formData.sections}
          onChange={(e) => handleChange("sections", e.target.value)}
          onFocus={() => handleNumberFocus("sections")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          증거금 (원)
        </label>
        <input
          type="number"
          value={formData.margin}
          onChange={(e) => handleChange("margin", e.target.value)}
          onFocus={() => handleNumberFocus("margin")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          리스크 (%)
        </label>
        <input
          type="number"
          value={formData.risk}
          onChange={(e) => handleChange("risk", e.target.value)}
          onFocus={() => handleNumberFocus("risk")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          세션
        </label>
        <select
          value={formData.session}
          onChange={(e) => handleChange("session", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="아시아장">아시아장</option>
          <option value="유럽장">유럽장</option>
          <option value="미국장">미국장</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          진입 KTR
        </label>
        <input
          type="number"
          value={formData.entryKTR}
          onChange={(e) => handleChange("entryKTR", e.target.value)}
          onFocus={() => handleNumberFocus("entryKTR")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          손익 (원)
        </label>
        <input
          type="number"
          value={formData.profitLoss}
          onChange={(e) => handleChange("profitLoss", e.target.value)}
          onFocus={() => handleNumberFocus("profitLoss")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          전략
        </label>
                  <input
          type="text"
          value={formData.strategy}
          onChange={(e) => handleChange("strategy", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모
        </label>
        <textarea
          value={formData.memo}
          onChange={(e) => handleChange("memo", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <TradingRulesChecklist
        checklist={formData.checklist}
        onChange={(checklist) => handleChange("checklist", checklist)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '저장 중...' : '거래 추가'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
