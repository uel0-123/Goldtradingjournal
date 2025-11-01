// ... 생략
const [viewingTrade, setViewingTrade] = useState(null);

<TableRow
  key={t.id}
  onClick={() => setViewingTrade(t)}
  style={{ cursor: 'pointer' }}
>
  {/* 수정 버튼 */}
  <Button onClick={(e) => { e.stopPropagation(); onRequestEdit(t); }}>
    <Pencil />
  </Button>
  {/* 체크리스트 버튼: 값이 있을 때만 렌더링 */}
  {t.checklist && t.checklist.length > 0 && (
    <Button onClick={(e) => { e.stopPropagation(); setViewingChecklistTrade(t); }}>
      <ClipboardCheck />
    </Button>
  )}
</TableRow>
{/* 상세 Dialog */}
<Dialog open={!!viewingTrade} onOpenChange={() => setViewingTrade(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>매매 내역 상세</DialogTitle>
    </DialogHeader>
    {viewingTrade && (
      <TradingJournalForm initialData={viewingTrade} readOnly />
    )}
  </DialogContent>
</Dialog>
