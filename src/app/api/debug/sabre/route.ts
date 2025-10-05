import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const SABRE_CLIENT_ID = process.env.SABRE_CLIENT_ID;
    const SABRE_CLIENT_SECRET = process.env.SABRE_CLIENT_SECRET;
    const SABRE_BASE_URL = process.env.SABRE_BASE_URL || 'https://api.platform.sabre.com';

    // 환경 변수 검증
    if (!SABRE_CLIENT_ID || !SABRE_CLIENT_SECRET) {
      return NextResponse.json({
        error: 'Sabre credentials missing',
        hasClientId: !!SABRE_CLIENT_ID,
        hasClientSecret: !!SABRE_CLIENT_SECRET,
      }, { status: 400 });
    }

    // 토큰 발급 테스트
    const tokenUrl = `${SABRE_BASE_URL}/v2/auth/token`;
    const authHeader = Buffer.from(`${SABRE_CLIENT_ID}:${SABRE_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json({
        error: 'Token request failed',
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: tokenData,
        url: tokenUrl,
      }, { status: tokenResponse.status });
    }

    // 토큰이 성공적으로 발급된 경우, API 엔드포인트 테스트
    const accessToken = tokenData.access_token;
    
    // 실제 API 엔드포인트들 테스트
    const endpoints = [
      {
        name: 'Hotel Info API',
        url: `${SABRE_BASE_URL}/v1/hotels/shop`,
        method: 'POST',
        body: {
          GetHotelDetailsRQ: {
            HotelRefs: {
              HotelRef: [{ HotelCode: "25209" }]
            }
          }
        }
      },
      {
        name: 'Hotel Search API', 
        url: `${SABRE_BASE_URL}/v1/hotels/search`,
        method: 'POST',
        body: {
          HotelSearchRQ: {
            Criteria: {
              HotelRefs: {
                HotelRef: [{ HotelCode: "25209" }]
              }
            }
          }
        }
      }
    ];

    const endpointResults = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endpoint.body),
        });

        endpointResults.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });
      } catch (error) {
        endpointResults.push({
          name: endpoint.name,
          url: endpoint.url,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      credentials: {
        clientId: SABRE_CLIENT_ID?.substring(0, 10) + '...',
        hasClientSecret: !!SABRE_CLIENT_SECRET,
      },
      token: {
        success: true,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
      },
      endpoints: endpointResults,
      recommendations: endpointResults.map(result => {
        if (result.status === 404) {
          return `${result.name}: 엔드포인트 URL이 잘못되었거나 API가 변경되었습니다.`;
        }
        if (result.status === 401) {
          return `${result.name}: 인증이 실패했습니다. 토큰을 확인하세요.`;
        }
        if (result.status === 403) {
          return `${result.name}: 권한이 없습니다. API 접근 권한을 확인하세요.`;
        }
        if (result.ok) {
          return `${result.name}: 정상 작동합니다.`;
        }
        return `${result.name}: 상태 코드 ${result.status} - ${result.statusText}`;
      })
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Sabre API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
