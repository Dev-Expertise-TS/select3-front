"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [newAd, setNewAd] = useState<Partial<Advertisement>>({
    title: "",
    description: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      
      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `advertisement_${timestamp}.${fileExt}`;
      const filePath = `advertisements/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('hotel-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('업로드 에러:', error);
        alert('이미지 업로드에 실패했습니다: ' + error.message);
        return;
      }

      // 업로드된 이미지의 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hotel-media')
        .getPublicUrl(filePath);

      // imageUrl 필드에 자동 설정
      setNewAd({ ...newAd, imageUrl: publicUrl });
      alert('이미지가 성공적으로 업로드되었습니다!');

    } catch (error) {
      console.error('업로드 중 에러:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAd.title && newAd.description) {
      const ad: Advertisement = {
        id: Date.now().toString(),
        title: newAd.title,
        description: newAd.description,
        imageUrl: newAd.imageUrl || "",
        startDate: newAd.startDate || "",
        endDate: newAd.endDate || "",
        isActive: newAd.isActive || false,
      };
      setAdvertisements([...advertisements, ad]);
      setNewAd({
        title: "",
        description: "",
        imageUrl: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">광고 관리</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>새 광고 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="광고 제목"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                required
              />
              <div className="space-y-2">
                <Input
                  placeholder="이미지 URL"
                  value={newAd.imageUrl}
                  onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                />
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? '업로드 중...' : '📁 로컬에서 업로드'}
                  </Button>
                  {newAd.imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewAd({ ...newAd, imageUrl: '' })}
                      className="px-3"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                {newAd.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={newAd.imageUrl}
                      alt="미리보기"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <Input
              placeholder="광고 설명"
              value={newAd.description}
              onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                value={newAd.startDate}
                onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
              />
              <Input
                type="date"
                value={newAd.endDate}
                onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
              />
            </div>
            <Button type="submit">광고 추가</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <Card key={ad.id}>
            <CardHeader>
              <CardTitle className="text-lg">{ad.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt={`${ad.title} 광고 이미지`}
                  className="w-full h-32 object-cover rounded mb-4"
                />
              )}
              <p className="text-gray-600 mb-2">{ad.description}</p>
              <div className="text-sm text-gray-500">
                <p>시작일: {ad.startDate}</p>
                <p>종료일: {ad.endDate}</p>
                <p>상태: {ad.isActive ? "활성" : "비활성"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
