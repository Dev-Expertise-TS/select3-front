import { NextRequest, NextResponse } from "next/server";

interface SchemaResponse {
  success: boolean;
  data?: {
    chains: ChainSchema[];
    brands: BrandSchema[];
  };
  error?: string;
}

interface ChainSchema {
  id: string;
  name: string;
  description: string;
  fields: SchemaField[];
}

interface BrandSchema {
  id: string;
  name: string;
  chainId: string;
  description: string;
  fields: SchemaField[];
}

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export async function GET(): Promise<NextResponse<SchemaResponse>> {
  try {
    // 스키마 정의 (실제로는 데이터베이스에서 가져옴)
    const chainFields: SchemaField[] = [
      { name: "name", type: "string", required: true, description: "체인 이름" },
      { name: "description", type: "string", required: false, description: "체인 설명" },
    ];

    const brandFields: SchemaField[] = [
      { name: "name", type: "string", required: true, description: "브랜드 이름" },
      { name: "chainId", type: "string", required: true, description: "소속 체인 ID" },
      { name: "description", type: "string", required: false, description: "브랜드 설명" },
    ];

    const chainsSchema: ChainSchema[] = [
      {
        id: "chain_schema",
        name: "체인 스키마",
        description: "호텔 체인 정보 스키마",
        fields: chainFields,
      },
    ];

    const brandsSchema: BrandSchema[] = [
      {
        id: "brand_schema",
        name: "브랜드 스키마",
        description: "호텔 브랜드 정보 스키마",
        fields: brandFields,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        chains: chainsSchema,
        brands: brandsSchema,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
