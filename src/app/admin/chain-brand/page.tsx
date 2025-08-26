"use client";

import ChainBrandManager from "./_components/ChainBrandManager";

interface ChainBrandData {
  id: string;
  name: string;
  type: "chain" | "brand";
  parentId?: string;
}

export default function ChainBrandPage() {
  // any 타입을 구체적인 타입으로 변경
  const handleDataUpdate = (data: ChainBrandData) => {
    console.log("데이터 업데이트:", data);
  };

  const handleDataDelete = (id: string) => {
    console.log("데이터 삭제:", id);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">체인 & 브랜드 관리</h1>
      <ChainBrandManager />
    </div>
  );
}
