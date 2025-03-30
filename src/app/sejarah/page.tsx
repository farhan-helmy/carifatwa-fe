"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserSearchHistory } from "@/actions/search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Search, AlertTriangle, Crown, History, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ms as msLocale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  results: Array<{
    title: string;
    url: string;
  }>;
  timestamp: string;
}

export default function SejarahPage() {
  const { data: session, status } = useSession();
  const [historyData, setHistoryData] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (status === "loading") return;
      
      if (!session) {
        setError("Anda perlu log masuk untuk melihat sejarah carian.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserSearchHistory();
        if (response.success && response.history) {
          setHistoryData(response.history as unknown as SearchHistoryItem[]);
        } else {
          setError(response.message || "Tidak dapat memuat sejarah carian.");
        }
      } catch (err) {
        setError("Ralat semasa memuat sejarah carian.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [session, status]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </Link>
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Sejarah Carian</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-24">
        <div className="space-y-6">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} isPremiumFeature={error.includes("Premium")} />
          ) : (
            <HistoryContent historyData={historyData} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 shadow-lg">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-emerald-600">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Cari</span>
          </Link>
          <Link href="/sejarah" className="flex flex-col items-center text-emerald-600">
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">Sejarah</span>
          </Link>
          <Link href="/subscribe" className="flex flex-col items-center text-gray-500 hover:text-emerald-600">
            <Crown className="h-6 w-6" />
            <span className="text-xs mt-1">Harga</span>
          </Link>
          <Button
            variant="link"
            className="flex flex-col items-center text-gray-500 hover:text-emerald-600 p-0 h-auto"
            onClick={() => window.location.href = "/"}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profil</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ error, isPremiumFeature }: { error: string, isPremiumFeature: boolean }) {
  return (
    <Alert variant={isPremiumFeature ? "default" : "destructive"} className={isPremiumFeature ? "bg-yellow-50 border-yellow-100 text-yellow-800" : ""}>
      <AlertTriangle className={`h-5 w-5 ${isPremiumFeature ? "text-yellow-600" : ""}`} />
      <AlertTitle>{isPremiumFeature ? "Ciri Premium" : "Ralat"}</AlertTitle>
      <AlertDescription>
        {error}
        {isPremiumFeature && (
          <div className="mt-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-100 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <h3 className="font-medium">Naik taraf ke Premium</h3>
              </div>
              <p className="text-sm mb-3">
                Tingkatkan akaun anda untuk mengakses sejarah carian penuh dan ciri-ciri premium lain.
              </p>
              <Link href="/subscribe">
                <Button size="sm" className="w-full">Naik Taraf Sekarang</Button>
              </Link>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function HistoryContent({ historyData }: { historyData: SearchHistoryItem[] }) {
  if (historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Sejarah Carian
          </CardTitle>
          <CardDescription>Senarai carian terkini anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Anda belum membuat sebarang carian.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          Sejarah Carian
        </CardTitle>
        <CardDescription>Senarai 10 carian terkini anda</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile view for small screens */}
        <div className="md:hidden space-y-4">
          {historyData.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-2">
              <Link href={`/?q=${encodeURIComponent(item.query)}`} className="text-emerald-600 hover:underline font-medium block">
                {item.query}
              </Link>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                  {item.results?.length || 0} hasil
                </Badge>
                <span className="text-gray-500 text-sm">
                  {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: msLocale }) : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop view for medium screens and above */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kata Kunci Carian</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead className="text-right">Masa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link href={`/?q=${encodeURIComponent(item.query)}`} className="text-emerald-600 hover:underline">
                      {item.query}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      {item.results?.length || 0} hasil
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-500 text-sm">
                    {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: msLocale }) : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 