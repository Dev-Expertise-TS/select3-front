"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Chain {
  id: string;
  name: string;
  description: string;
}

interface Brand {
  id: string;
  name: string;
  chainId: string;
  description: string;
}

export default function ChainBrandManager() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newChain, setNewChain] = useState<Partial<Chain>>({
    name: "",
    description: "",
  });
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: "",
    chainId: "",
    description: "",
  });

  const handleAddChain = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChain.name) {
      const chain: Chain = {
        id: Date.now().toString(),
        name: newChain.name,
        description: newChain.description || "",
      };
      setChains([...chains, chain]);
      setNewChain({ name: "", description: "" });
    }
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBrand.name && newBrand.chainId) {
      const brand: Brand = {
        id: Date.now().toString(),
        name: newBrand.name,
        chainId: newBrand.chainId,
        description: newBrand.description || "",
      };
      setBrands([...brands, brand]);
      setNewBrand({ name: "", chainId: "", description: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 체인 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>체인 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddChain} className="space-y-4">
              <Input
                placeholder="체인 이름"
                value={newChain.name}
                onChange={(e) => setNewChain({ ...newChain, name: e.target.value })}
                required
              />
              <Input
                placeholder="체인 설명"
                value={newChain.description}
                onChange={(e) => setNewChain({ ...newChain, description: e.target.value })}
              />
              <Button type="submit">체인 추가</Button>
            </form>
            
            <div className="mt-4 space-y-2">
              {chains.map((chain) => (
                <div key={chain.id} className="p-3 border rounded">
                  <h4 className="font-semibold">{chain.name}</h4>
                  <p className="text-sm text-gray-600">{chain.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 브랜드 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>브랜드 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <Input
                placeholder="브랜드 이름"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                required
              />
              <select
                value={newBrand.chainId}
                onChange={(e) => setNewBrand({ ...newBrand, chainId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">체인 선택</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="브랜드 설명"
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              />
              <Button type="submit">브랜드 추가</Button>
            </form>
            
            <div className="mt-4 space-y-2">
              {brands.map((brand) => {
                const chain = chains.find((c) => c.id === brand.chainId);
                return (
                  <div key={brand.id} className="p-3 border rounded">
                    <h4 className="font-semibold">{brand.name}</h4>
                    <p className="text-sm text-gray-600">{brand.description}</p>
                    <p className="text-xs text-gray-500">체인: {chain?.name || "알 수 없음"}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
