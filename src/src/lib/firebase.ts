// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, get, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB0ZcbRrw4ffc-PBPAavd9iUJNHlN9r01k",
  authDomain: "gold-trading-journal-7a566.firebaseapp.com",
  databaseURL: "https://gold-trading-journal-7a566-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gold-trading-journal-7a566",
  storageBucket: "gold-trading-journal-7a566.firebasestorage.app",
  messagingSenderId: "891342587607",
  appId: "1:891342587607:web:45448bead8e9281123d292",
  measurementId: "G-XB657BKKE2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Checklist 구조 (TradingRulesChecklist.tsx 참고)
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

export interface TradeRecord {
  id?: string;
  date: string;
  type: "매수" | "매도";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profitLoss: number;
  fee: number;
  strategy: string;
  memo: string;
  checklist: ChecklistItems; // 체크리스트 결과 포함!
}

// 거래 추가 (체크리스트 포함)
export async function addTrade(trade: Omit<TradeRecord, "id">): Promise<string> {
  const refList = ref(db, "trades");
  const newRef = await push(refList, trade);
  return newRef.key ?? "";
}

// 전체 거래 실시간 구독
export function subscribeTrades(callback: (trades: TradeRecord[]) => void) {
  const tradesRef = ref(db, "trades");
  onValue(tradesRef, (snapshot) => {
    const data = snapshot.val();
    const trades: TradeRecord[] = data
      ? Object.entries(data).map(([id, val]) => ({ id, ...(val as TradeRecord) }))
      : [];
    callback(trades);
  });
}

// 단발 전체 가져오기
export async function getTrades(): Promise<TradeRecord[]> {
  const snapshot = await get(ref(db, "trades"));
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...(val as TradeRecord) }));
}

// 단일 거래 가져오기
export async function getTradeById(id: string): Promise<TradeRecord | null> {
  const snapshot = await get(ref(db, `trades/${id}`));
  if (!snapshot.exists()) return null;
  return { id, ...(snapshot.val() as TradeRecord) };
}

// 거래 수정 (체크리스트 포함)
export async function updateTrade(id: string, trade: Partial<Omit<TradeRecord, "id">>) {
  await update(ref(db, `trades/${id}`), trade);
}

// 체크리스트만 선택적으로 수정
export async function updateTradeChecklist(id: string, checklist: ChecklistItems) {
  await update(ref(db, `trades/${id}`), { checklist });
}

// 거래 삭제
export async function deleteTrade(id: string) {
  await remove(ref(db, `trades/${id}`));
}
