# City Unknown 문제 수정

## 문제 상황
히어로 캐로셀에서 sabre_id 59309인 호텔의 도시 값이 "unknown"으로 표시됨

## 원인 분석
1. `select_hotels` 테이블에 `city`, `city_ko`, `city_en` 필드가 존재
2. 일부 호텔 데이터에서 `city` 필드가 비어있거나 null일 수 있음
3. 기존 코드는 `hotel.city || 'Unknown'` 만 체크하여 city_ko, city_en을 고려하지 않음

## 수정 내용

### 파일 1: `src/features/hero/hero-data.ts`
- **위치**: 120-150번 줄
- **변경사항**:
  ```typescript
  // Before
  city: hotel.city || 'Unknown',
  
  // After
  let cityName = hotel.city
  if (!cityName || cityName === 'Unknown') {
    cityName = hotel.city_ko || hotel.city_en || 'Unknown'
  }
  city: cityName,
  ```
- **추가 개선**: 도시별 fallback 이미지에 한글 도시명도 추가

### 파일 2: `src/hooks/use-hero-images.ts`
- **위치**: 159-199번 줄
- **변경사항**: 서버 컴포넌트와 동일한 로직 적용

## 수정 로직 (최종)
```
1. hotel.city_ko 우선 사용 (한글 도시명)
2. city_ko가 없으면 hotel.city_en 사용 (영문 도시명)
3. city_en도 없으면 hotel.city 사용 (기본 city 필드)
4. 모두 없으면 'Unknown' 반환
```

## 예상 효과
- sabre_id 59309 호텔 այլ 도시명 정상 표시
- city 필드가 비어있는 다른 호텔들도 정상 표시
- 한글/영문 도시명 모두 fallback 이미지 매칭 가능

## 테스트 필요 사항
1. sabre_id 59309 호텔이 히어로 캐로셀에 정상 도시명 표시되는지 확인
2. 다른 히어로 호텔들의 도시명도 정상 표시되는지 확인
3. 실제 DB에서 city, city_ko, city_en 필드 값 확인 필요
