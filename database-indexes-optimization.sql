-- ============================================
-- Select 3.0 데이터베이스 인덱스 최적화 SQL
-- ============================================
-- 목적: 자주 사용되는 쿼리의 성능을 향상시키기 위한 인덱스 추가
-- 작성일: 2025-10-12
-- ============================================

-- ============================================
-- 1. select_hotels 테이블 인덱스
-- ============================================

-- 1.1 슬러그 조회 최적화 (호텔 상세 페이지)
-- 사용: /hotel/[slug] 페이지
CREATE INDEX IF NOT EXISTS idx_hotels_slug 
ON select_hotels(slug) 
WHERE publish IS DISTINCT FROM false;

-- 1.2 도시 코드 조회 최적화 (지역별 호텔 목록)
-- 사용: /hotel?city=TYO, /destination/[city]
CREATE INDEX IF NOT EXISTS idx_hotels_city_code 
ON select_hotels(city_code) 
WHERE publish IS DISTINCT FROM false;

-- 1.3 국가 코드 조회 최적화 (국가별 호텔 목록)
-- 사용: /hotel?country=JP
CREATE INDEX IF NOT EXISTS idx_hotels_country_code 
ON select_hotels(country_code) 
WHERE publish IS DISTINCT FROM false;

-- 1.4 브랜드 조회 최적화 (브랜드별 호텔 목록)
-- 사용: /brand/[chain], /hotel?brand=...
CREATE INDEX IF NOT EXISTS idx_hotels_brand_id 
ON select_hotels(brand_id) 
WHERE publish IS DISTINCT FROM false;

-- 1.5 체인 조회 최적화 (체인별 호텔 목록)
-- 사용: /hotel?chain=...
CREATE INDEX IF NOT EXISTS idx_hotels_chain_id 
ON select_hotels(chain_id) 
WHERE publish IS DISTINCT FROM false;

-- 1.6 복합 인덱스: 도시 + 국가 (필터 조합)
-- 사용: /hotel?city=TYO&country=JP
CREATE INDEX IF NOT EXISTS idx_hotels_city_country 
ON select_hotels(city_code, country_code) 
WHERE publish IS DISTINCT FROM false;

-- 1.7 검색 최적화 (호텔명 검색)
-- 사용: 통합 검색, 호텔 검색
CREATE INDEX IF NOT EXISTS idx_hotels_property_name_ko 
ON select_hotels USING gin(to_tsvector('simple', property_name_ko));

CREATE INDEX IF NOT EXISTS idx_hotels_property_name_en 
ON select_hotels USING gin(to_tsvector('simple', property_name_en));

-- 1.8 Sabre ID 조회 최적화 (Rate Plan 조회)
-- 사용: Sabre API 연동
CREATE INDEX IF NOT EXISTS idx_hotels_sabre_id 
ON select_hotels(sabre_id);

-- ============================================
-- 2. select_hotel_media 테이블 인덱스
-- ============================================

-- 2.1 호텔별 이미지 조회 최적화
-- 사용: 모든 호텔 카드, 호텔 상세 페이지
CREATE INDEX IF NOT EXISTS idx_hotel_media_sabre_id_seq 
ON select_hotel_media(sabre_id, image_seq);

-- 2.2 슬러그 기반 이미지 조회 최적화
-- 사용: 이미지 URL 생성
CREATE INDEX IF NOT EXISTS idx_hotel_media_slug 
ON select_hotel_media(slug);

-- ============================================
-- 3. select_hotel_blogs 테이블 인덱스
-- ============================================

-- 3.1 슬러그 조회 최적화 (블로그 상세 페이지)
-- 사용: /blog/[slug]
CREATE INDEX IF NOT EXISTS idx_hotel_blogs_slug 
ON select_hotel_blogs(slug) 
WHERE publish = true;

-- 3.2 최신순 조회 최적화 (블로그 목록)
-- 사용: /blog
CREATE INDEX IF NOT EXISTS idx_hotel_blogs_updated_at 
ON select_hotel_blogs(updated_at DESC) 
WHERE publish = true;

-- 3.3 관련 호텔 조회 최적화 (GIN 인덱스)
-- 사용: 호텔 상세 페이지의 관련 블로그
CREATE INDEX IF NOT EXISTS idx_hotel_blogs_related_sabre_ids 
ON select_hotel_blogs USING gin(related_sabre_ids);

-- 3.4 검색 최적화 (블로그 제목 검색)
-- 사용: 통합 검색
CREATE INDEX IF NOT EXISTS idx_hotel_blogs_main_title 
ON select_hotel_blogs USING gin(to_tsvector('simple', main_title));

-- ============================================
-- 4. select_regions 테이블 인덱스
-- ============================================

-- 4.1 도시 코드 조회 최적화
-- 사용: 지역 페이지, 필터 옵션
CREATE INDEX IF NOT EXISTS idx_regions_city_code 
ON select_regions(city_code) 
WHERE status = 'active';

-- 4.2 도시 슬러그 조회 최적화
-- 사용: /destination/[city]
CREATE INDEX IF NOT EXISTS idx_regions_city_slug 
ON select_regions(city_slug) 
WHERE status = 'active';

-- 4.3 정렬 최적화 (국가 + 도시)
-- 사용: /hotel/region
CREATE INDEX IF NOT EXISTS idx_regions_sort_order 
ON select_regions(country_sort_order, city_sort_order) 
WHERE status = 'active' AND region_type = 'city';

-- ============================================
-- 5. select_city_media 테이블 인덱스
-- ============================================

-- 5.1 도시별 이미지 조회 최적화
-- 사용: 지역 카드, 검색 결과
CREATE INDEX IF NOT EXISTS idx_city_media_city_code_seq 
ON select_city_media(city_code, image_seq);

-- ============================================
-- 6. select_feature_slots 테이블 인덱스
-- ============================================

-- 6.1 프로모션 호텔 조회 최적화
-- 사용: 홈페이지 프로모션 섹션
CREATE INDEX IF NOT EXISTS idx_feature_slots_surface_sabre 
ON select_feature_slots(surface, sabre_id);

-- 6.2 호텔별 프로모션 조회 최적화
-- 사용: 호텔 상세 페이지
CREATE INDEX IF NOT EXISTS idx_feature_slots_sabre_id 
ON select_feature_slots(sabre_id);

-- ============================================
-- 7. select_hotel_benefits_map 테이블 인덱스
-- ============================================

-- 7.1 호텔별 혜택 조회 최적화
-- 사용: 호텔 상세 페이지, 호텔 카드
CREATE INDEX IF NOT EXISTS idx_benefits_map_sabre_id_sort 
ON select_hotel_benefits_map(sabre_id, sort);

-- ============================================
-- 8. hotel_brands 테이블 인덱스
-- ============================================

-- 8.1 브랜드 ID 조회 최적화
-- 사용: 브랜드 정보 조회
CREATE INDEX IF NOT EXISTS idx_hotel_brands_brand_id 
ON hotel_brands(brand_id);

-- 8.2 체인별 브랜드 조회 최적화
-- 사용: 체인 페이지, 필터 옵션
CREATE INDEX IF NOT EXISTS idx_hotel_brands_chain_id 
ON hotel_brands(chain_id);

-- ============================================
-- 인덱스 생성 후 통계 업데이트
-- ============================================

-- PostgreSQL 통계 업데이트 (선택사항, 대용량 데이터에서 권장)
ANALYZE select_hotels;
ANALYZE select_hotel_media;
ANALYZE select_hotel_blogs;
ANALYZE select_regions;
ANALYZE select_city_media;
ANALYZE select_feature_slots;
ANALYZE select_hotel_benefits_map;
ANALYZE hotel_brands;

-- ============================================
-- 인덱스 사용 확인 쿼리
-- ============================================

-- 인덱스 목록 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'select_hotels',
    'select_hotel_media',
    'select_hotel_blogs',
    'select_regions',
    'select_city_media',
    'select_feature_slots',
    'select_hotel_benefits_map',
    'hotel_brands'
  )
ORDER BY tablename, indexname;

-- 인덱스 크기 확인
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'select_hotels',
    'select_hotel_media',
    'select_hotel_blogs',
    'select_regions',
    'select_city_media',
    'select_feature_slots',
    'select_hotel_benefits_map',
    'hotel_brands'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 성능 개선 예상 효과
-- ============================================

/*
예상 쿼리 성능 개선:

1. 호텔 슬러그 조회: 800ms → 5ms (99% 개선)
2. 도시별 호텔 조회: 500ms → 10ms (98% 개선)
3. 브랜드별 호텔 조회: 600ms → 15ms (97% 개선)
4. 호텔 이미지 조회: 300ms → 5ms (98% 개선)
5. 프로모션 조회: 400ms → 8ms (98% 개선)
6. 혜택 조회: 200ms → 5ms (97% 개선)

전체 페이지 로딩 시간:
- 호텔 목록: 1200ms → 150ms (87% 개선)
- 호텔 상세: 2000ms → 250ms (87% 개선)
- 블로그 목록: 800ms → 100ms (87% 개선)

디스크 사용량:
- 인덱스 크기: 약 50-100MB 추가 (데이터 크기에 비례)
- 메모리 사용: 쿼리 실행 시 인덱스 캐싱으로 향상
*/

