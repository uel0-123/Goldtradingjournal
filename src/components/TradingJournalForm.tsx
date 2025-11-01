// ... 생략
import React, { useState, useEffect } from 'react';

export default function TradingJournalForm({ initialData, readOnly, ...props }) {
  const [formData, setFormData] = useState(initialData || defaultFormData);

  useEffect(() => {
    setFormData(initialData || defaultFormData);
  }, [initialData]);

  // 각 input, textarea 등
  <input disabled={readOnly} .../>
  // 나머지 input/textarea도 동일
}
