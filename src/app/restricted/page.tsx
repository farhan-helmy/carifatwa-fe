"use client";

import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RestrictedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Terhad</h1>
        <p className="text-gray-600 mb-6">
          Maaf, anda tidak mempunyai akses ke halaman admin. Hanya pentadbir yang boleh mengakses kawasan ini.
        </p>
        <Button 
          onClick={() => router.push("/")}
          className="flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Laman Utama
        </Button>
      </div>
    </div>
  );
} 