// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, get, set, update, remove, DataSnapshot } from "firebase/database";

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

// TradeRecord 타입 선언(구조 분석 기반)
export interface TradeRecord {
  id?: string; // Firebase에서는 key로 사용됨. (옵셔널로 두세요)
  date: string;
  orderType: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profitLoss: number;
  notes: string;
  image?: string;   // 이미지 URL(옵션)
  tags?: string[];
}

// 1. 거래 추가
export async function addTrade(trade: Omit<TradeRecord, "id">): Promise<string> {
  const refList = ref(db, "trades");
  const newRef = await push(refList, trade);
  return newRef.key ?? "";
}

// 2. 전체 거래 불러오기(구독 방식)
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

// 3. 전체 거래 단발 불러오기(동기)
export async function getTrades(): Promise<TradeRecord[]> {
  const snapshot = await get(ref(db, "trades"));
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...(val as TradeRecord) }));
}

// 4. 단일 거래 불러오기
export async function getTradeById(id: string): Promise<TradeRecord | null> {
  const snapshot = await get(ref(db, `trades/${id}`));
  if (!snapshot.exists()) return null;
  return { id, ...(snapshot.val() as TradeRecord) };
}

// 5. 거래 수정
export async function updateTrade(id: string, trade: Partial<Omit<TradeRecord, "id">>) {
  await update(ref(db, `trades/${id}`), trade);
}

// 6. 거래 삭제
export async function deleteTrade(id: string) {
  await remove(ref(db, `trades/${id}`));
}
