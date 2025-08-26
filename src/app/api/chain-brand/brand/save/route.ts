import { NextRequest, NextResponse } from "next/server";

interface BrandData {
  id?: string;
  name: string;
  chainId: string;
  description?: string;
}

interface SaveResponse {
  success: boolean;
  data?: BrandData;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SaveResponse>> {
  try {
    const body: BrandData = await request.json();
    
    // any 타입을 구체적인 타입으로 변경
    const validateBrandData = (data: BrandData): boolean => {
      return !!(data.name && data.chainId);
    };

    if (!validateBrandData(body)) {
      return NextResponse.json(
        { success: false, error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 여기서 실제 데이터베이스 저장 로직을 구현
    const savedBrand: BrandData = {
      id: body.id || Date.now().toString(),
      name: body.name,
      chainId: body.chainId,
      description: body.description || "",
    };

    return NextResponse.json({
      success: true,
      data: savedBrand,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
