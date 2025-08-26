"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HotelData {
  sabreId: string;
  name: string;
  description: string;
  location: string;
  amenities: string[];
}

interface FormData {
  name: string;
  description: string;
  location: string;
  amenities: string;
}

export default function HotelEditForm({ params }: { params: { sabre: string } }) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    amenities: "",
  });

  // any 타입을 구체적인 타입으로 변경
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hotelData: HotelData = {
      sabreId: params.sabre,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      amenities: formData.amenities.split(",").map(item => item.trim()),
    };
    console.log("호텔 데이터 저장:", hotelData);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">호텔 정보 편집 - {params.sabre}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>호텔 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="호텔 이름"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <Input
              placeholder="호텔 설명"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            <Input
              placeholder="위치"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
            <Input
              placeholder="편의시설 (쉼표로 구분)"
              value={formData.amenities}
              onChange={(e) => handleInputChange("amenities", e.target.value)}
            />
            <Button type="submit">저장</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
