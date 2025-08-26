import { NextRequest, NextResponse } from "next/server";

interface ChainBrandItem {
  id: string;
  name: string;
  type: "chain" | "brand";
  parentId?: string;
  description?: string;
}

interface ListResponse {
  success: boolean;
  data?: ChainBrandItem[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ListResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const parentId = searchParams.get("parentId");

    // any 타입을 구체적인 타입으로 변경
    const filterItems = (items: ChainBrandItem[], filterType?: string, filterParentId?: string): ChainBrandItem[] => {
      let filtered = items;
      
      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }
      
      if (filterParentId) {
        filtered = filtered.filter(item => item.parentId === filterParentId);
      }
      
      return filtered;
    };

    // 샘플 데이터 (실제로는 데이터베이스에서 가져옴)
    const sampleData: ChainBrandItem[] = [
      { id: "1", name: "Marriott", type: "chain", description: "마리오트 체인" },
      { id: "2", name: "Hilton", type: "chain", description: "힐튼 체인" },
      { id: "3", name: "Marriott Marquis", type: "brand", parentId: "1", description: "마리오트 마르키스" },
      { id: "4", name: "Hilton Garden Inn", type: "brand", parentId: "2", description: "힐튼 가든 인" },
    ];

    const filteredData = filterItems(sampleData, type || undefined, parentId || undefined);

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
