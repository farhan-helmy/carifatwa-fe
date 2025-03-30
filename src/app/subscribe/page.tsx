"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Check, ArrowLeft } from "lucide-react";

export default function SubscribePage() {
  const router = useRouter();

  const handleWhatsAppContact = () => {
    window.open(
      "https://wa.me/60143381756?text=Saya%20ingin%20meningkatkan%20pelan%20Cari%20Fatwa%20saya",
      "_blank"
    );
  };

  const handleEmailContact = () => {
    window.open(
      "mailto:farhanhlmy@gmail.com?subject=Naik%20Taraf%20Pelan%20Cari%20Fatwa&body=Saya%20ingin%20meningkatkan%20pelan%20Cari%20Fatwa%20saya",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Laman Utama
        </Button>

        <h1 className="text-3xl font-bold text-center mb-6">
          Tingkatkan Pengalaman Cari Fatwa Anda
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Untuk naik taraf pelan anda dan mendapatkan carian tanpa had, sila
          hubungi kami.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-transparent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Crown className="h-5 w-5 text-emerald-600" />
                  Pelan Premium
                </CardTitle>
              </div>
              <CardDescription>Sesuai untuk pengguna biasa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">RM29.90</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>20 carian sebulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Pilihan penapisan lanjutan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Simpan hasil kegemaran</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-transparent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Pelan Tanpa Had
                </CardTitle>
              </div>
              <CardDescription>Untuk pengguna aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">RM99.90</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Carian tanpa had</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Pilihan penapisan lanjutan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Simpan hasil kegemaran</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Sokongan keutamaan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Muat turun hasil carian</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-white p-8 rounded-xl shadow-sm">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-6">
              Hubungi Kami Untuk Naik Taraf
            </h2>

            <p className="text-gray-600 mb-8">
              Untuk menaik taraf pelan anda, sila hubungi kami melalui WhatsApp
              atau e-mel. Kami akan membantu anda mendapatkan akses premium ke
              Cari Fatwa.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-emerald-600"
                    >
                      <path
                        d="M17.6 6.32A7.85 7.85 0 0 0 12.04 4a7.94 7.94 0 0 0-6.91 4.11A7.7 7.7 0 0 0 4 12.76a7.86 7.86 0 0 0 1.23 4.19L4 20.5l3.64-1.35a8.13 8.13 0 0 0 4.4 1.27h.04a7.94 7.94 0 0 0 7.91-7.96 7.86 7.86 0 0 0-2.39-6.14zM12.04 19.24h-.03a6.73 6.73 0 0 1-3.86-1.18l-.28-.16-2.04.76.77-2.04-.17-.29a6.7 6.7 0 0 1-1.15-3.76c0-3.65 2.99-6.63 6.7-6.63a6.63 6.63 0 0 1 6.64 6.67c0 3.66-3.01 6.63-6.68 6.63zm3.68-4.93c-.2-.1-1.18-.58-1.37-.65-.18-.07-.32-.1-.45.1-.13.2-.5.65-.62.78-.11.14-.22.15-.42.05-.2-.1-.84-.31-1.6-.99-.59-.52-.99-1.17-1.1-1.37-.12-.2 0-.3.09-.4.08-.08.2-.22.3-.33.1-.1.13-.18.2-.3.07-.13.03-.24-.02-.33-.05-.1-.45-1.09-.62-1.5-.16-.38-.33-.33-.45-.34-.11 0-.25-.02-.38-.02-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67 0 .98.72 1.94.82 2.07.1.13 1.4 2.13 3.39 2.99.47.2.84.33 1.13.42.48.15.91.13 1.25.08.38-.06 1.18-.48 1.34-.95.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23z"
                        fill="currentColor"
                      />
                    </svg>
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <p className="font-medium text-lg">0143381756</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleWhatsAppContact}>
                    Hubungi melalui WhatsApp
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-emerald-600"
                    >
                      <path
                        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z"
                        fill="currentColor"
                      />
                    </svg>
                    E-mel
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <p className="font-medium text-lg">farhanhlmy@gmail.com</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleEmailContact}
                  >
                    Hantar E-mel
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <p className="text-sm text-gray-500">
              Selepas menghubungi kami, kami akan memberikan arahan lanjut
              tentang cara menaik taraf akaun anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
