"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              <Input
                placeholder="이미지 URL"
                value={newAd.imageUrl}
                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
              />
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
