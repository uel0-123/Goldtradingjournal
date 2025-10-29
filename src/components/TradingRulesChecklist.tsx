import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

export interface ChecklistItems {
  timeRules: {
    mindset1: boolean;
    mindset2: boolean;
    positionSize: boolean;
    checkInterval: boolean;
    sleepAt12: boolean;
  };
  tradingRules: {
    checkPrevMarket: boolean;
    checkKeyLevels: boolean;
    asiaSession: boolean;
    minPosition: boolean;
    candleClose: boolean;
    noDoubleEntry: boolean;
    emaDistance: boolean;
    avoidFirstZone: boolean;
    profitTrailing: boolean;
  };
}

export const initialChecklistState: ChecklistItems = {
  timeRules: {
    mindset1: false,
    mindset2: false,
    positionSize: false,
    checkInterval: false,
    sleepAt12: false,
  },
  tradingRules: {
    checkPrevMarket: false,
    checkKeyLevels: false,
    asiaSession: false,
    minPosition: false,
    candleClose: false,
    noDoubleEntry: false,
    emaDistance: false,
    avoidFirstZone: false,
    profitTrailing: false,
  },
};

interface TradingRulesChecklistProps {
  checklist: ChecklistItems;
  onChange: (checklist: ChecklistItems) => void;
  readonly?: boolean;
}

export function TradingRulesChecklist({ checklist, onChange, readonly = false }: TradingRulesChecklistProps) {
  const handleTimeRuleChange = (key: keyof ChecklistItems["timeRules"], checked: boolean) => {
    onChange({
      ...checklist,
      timeRules: {
        ...checklist.timeRules,
        [key]: checked,
      },
    });
  };

  const handleTradingRuleChange = (key: keyof ChecklistItems["tradingRules"], checked: boolean) => {
    onChange({
      ...checklist,
      tradingRules: {
        ...checklist.tradingRules,
        [key]: checked,
      },
    });
  };

  const timeRulesCompleted = Object.values(checklist.timeRules).filter(Boolean).length;
  const timeRulesTotal = Object.keys(checklist.timeRules).length;
  const tradingRulesCompleted = Object.values(checklist.tradingRules).filter(Boolean).length;
  const tradingRulesTotal = Object.keys(checklist.tradingRules).length;

  return (
    <div className="space-y-4">
      {/* Time Rules */}
      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-amber-900">⏰ 시간 제한</h3>
            <span className="text-amber-600">
              {timeRulesCompleted}/{timeRulesTotal}
            </span>
          </div>
          <Separator className="bg-amber-200" />
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="mindset1"
                checked={checklist.timeRules.mindset1}
                onCheckedChange={(checked) => handleTimeRuleChange("mindset1", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="mindset1" className="text-amber-800 cursor-pointer leading-tight">
                데이트레이딩 마인드 1: 5/10분봉 골크/데크 후 첫 원비 & 장기이평 맞닿는 자리 얼러트 시 KTR 구간매매
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="mindset2"
                checked={checklist.timeRules.mindset2}
                onCheckedChange={(checked) => handleTimeRuleChange("mindset2", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="mindset2" className="text-amber-800 cursor-pointer leading-tight">
                데이트레이딩 마인드 2: 1/2시간봉 기준 기본더블비(수축원비), 변곡더블비, 돌파더블비 와 지/추가 겹치는 자리에서 시가봉 KTR로 구간매매
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="positionSize"
                checked={checklist.timeRules.positionSize}
                onCheckedChange={(checked) => handleTimeRuleChange("positionSize", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="positionSize" className="text-amber-800 cursor-pointer leading-tight">
                데이트레이딩 마인드 모두 비중은 $1,000 이전까지 0.01랏으로 고정
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="checkInterval"
                checked={checklist.timeRules.checkInterval}
                onCheckedChange={(checked) => handleTimeRuleChange("checkInterval", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="checkInterval" className="text-amber-800 cursor-pointer leading-tight">
                1-2시간 간격으로만 체크
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="sleepAt12"
                checked={checklist.timeRules.sleepAt12}
                onCheckedChange={(checked) => handleTimeRuleChange("sleepAt12", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="sleepAt12" className="text-amber-800 cursor-pointer leading-tight">
                12시에는 무조건 취침
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Trading Rules */}
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-blue-900">📋 거래 방식</h3>
            <span className="text-blue-600">
              {tradingRulesCompleted}/{tradingRulesTotal}
            </span>
          </div>
          <Separator className="bg-blue-200" />
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="checkPrevMarket"
                checked={checklist.tradingRules.checkPrevMarket}
                onCheckedChange={(checked) => handleTradingRuleChange("checkPrevMarket", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="checkPrevMarket" className="text-blue-800 cursor-pointer leading-tight">
                1. 전일 미장 방향성 체크 (아시아장은 전일 미장의 방향성과 일치하는 방향으로 거래)
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="checkKeyLevels"
                checked={checklist.tradingRules.checkKeyLevels}
                onCheckedChange={(checked) => handleTradingRuleChange("checkKeyLevels", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="checkKeyLevels" className="text-blue-800 cursor-pointer leading-tight">
                2. 주요 매물대 체크 (돌파 매물대, 전일 미장 되돌림 봉, 시가 세션박스, 지표봉, 미장 고/저 선, 전일 미장 50% 되돌림 구간)
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="asiaSession"
                checked={checklist.tradingRules.asiaSession}
                onCheckedChange={(checked) => handleTradingRuleChange("asiaSession", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="asiaSession" className="text-blue-800 cursor-pointer leading-tight">
                3. 아시아장: 1,2번 원칙에 의한 손절가/목표가/추세대로만 진입
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="minPosition"
                checked={checklist.tradingRules.minPosition}
                onCheckedChange={(checked) => handleTradingRuleChange("minPosition", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="minPosition" className="text-blue-800 cursor-pointer leading-tight">
                4. 최소 비중 (1%~10%)
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="candleClose"
                checked={checklist.tradingRules.candleClose}
                onCheckedChange={(checked) => handleTradingRuleChange("candleClose", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="candleClose" className="text-blue-800 cursor-pointer leading-tight">
                5. 봉마감 기준 판단
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="noDoubleEntry"
                checked={checklist.tradingRules.noDoubleEntry}
                onCheckedChange={(checked) => handleTradingRuleChange("noDoubleEntry", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="noDoubleEntry" className="text-blue-800 cursor-pointer leading-tight">
                6. 이중 진입 금지
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="emaDistance"
                checked={checklist.tradingRules.emaDistance}
                onCheckedChange={(checked) => handleTradingRuleChange("emaDistance", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="emaDistance" className="text-blue-800 cursor-pointer leading-tight">
                7. 장기 이평과 단기 이평 사이의 이격이 일정 간격 이상 벌어져 있을 경우에 진입 (간격이 좁다면 패스)
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="avoidFirstZone"
                checked={checklist.tradingRules.avoidFirstZone}
                onCheckedChange={(checked) => handleTradingRuleChange("avoidFirstZone", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="avoidFirstZone" className="text-blue-800 cursor-pointer leading-tight">
                8. 더블바텀, 더블 탑 시 1구간 회피
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="profitTrailing"
                checked={checklist.tradingRules.profitTrailing}
                onCheckedChange={(checked) => handleTradingRuleChange("profitTrailing", checked as boolean)}
                disabled={readonly}
              />
              <Label htmlFor="profitTrailing" className="text-blue-800 cursor-pointer leading-tight">
                9. 시간봉 기준으로 33%, 50%, 75% 이익트레일링
              </Label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
