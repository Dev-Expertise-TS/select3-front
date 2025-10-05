import { NextResponse } from 'next/server';

export async function GET() {
  // 404 오류 API들은 일시 비활성화
  const sabreEndpoints = [
    // 일시 비활성화된 API들 (404 오류)
    /*
    {
      name: 'Hotel Avail',
      url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-avail',
      method: 'POST',
      body: { HotelCode: '188152', CodeContext: 'GLOBAL' }
    },
    {
      name: 'Hotel Info',
      url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-info',
      method: 'POST',
      body: { HotelCode: '188152', CodeContext: 'GLOBAL' }
    },
    {
      name: 'Hotel Search',
      url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-search',
      method: 'POST',
      body: { HotelCode: '188152' }
    }
    */
  ];

  const results = [];

  for (const endpoint of sabreEndpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint.body),
        // 타임아웃 설정 (10초)
        signal: AbortSignal.timeout(10000)
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        success: response.ok,
        headers: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
        }
      });

      // 응답 본문도 읽어서 확인 (작은 경우만)
      if (response.ok && response.headers.get('content-length') && 
          parseInt(response.headers.get('content-length') || '0') < 10000) {
        try {
          const text = await response.text();
          results[results.length - 1].responseBody = text.substring(0, 500);
        } catch (e) {
          results[results.length - 1].responseBodyError = 'Failed to read response body';
        }
      }
    } catch (error) {
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      });
    }
  }

  const overallStatus = results.every(r => r.success) ? 'healthy' : 
                      results.some(r => r.success) ? 'partial' : 'unhealthy';

  return NextResponse.json({
    success: true,
    data: {
      overallStatus,
      timestamp: new Date().toISOString(),
      endpoints: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }
  });
}
