"use client";

import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Search,
  Book,
  History,
  Bookmark,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  ArrowLeft,
  LogIn,
  Crown,
  AlertTriangle,
  CheckCircle,
  Shield,
  BarChart3,
  Calendar,
  Clock,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserSearchInfo, incrementSearchCount, getUserSearchHistory, searchFatwa } from "@/actions/search";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchResult {
  title: string;
  url: string;
}

interface FatwaSearchResult {
  title: string;
  url: string;
  score: number;
}

interface FatwaResponse {
  results: FatwaSearchResult[];
  query: string;
  processing_time: number;
}

interface UserSearchInfo {
  searchCount: number;
  tier: string;
  isLimitReached: boolean;
  remainingSearches: number;
}

export function HomePage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showUserStatsModal, setShowUserStatsModal] = useState(false);
  const [userSearchInfo, setUserSearchInfo] = useState<UserSearchInfo>({
    searchCount: 0,
    tier: "free",
    isLimitReached: false,
    remainingSearches: 3
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  // Fetch user search info on load and when session changes
  useEffect(() => {
    const fetchSearchInfo = async () => {
      if (status === "authenticated") {
        const info = await getUserSearchInfo();
        setUserSearchInfo(info);
        
        // Check if user is admin
        if (session?.user?.email === "farhanhlmy@gmail.com") {
          setIsAdmin(true);
        }
      }
    };

    fetchSearchInfo();
  }, [status, session]);

  // New function to fetch user's search history
  const fetchUserSearchHistory = async () => {
    if (!session?.user?.id) return;
    
    try {
      const result = await getUserSearchHistory();
      
      if (result.success) {
        setSearchHistory(result.history);
        setShowUserStatsModal(true);
      } else {
        console.error("Failed to fetch search history:", result.message);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }

    // Check if user has reached their search limit
    if (userSearchInfo.isLimitReached) {
      setShowSubscriptionModal(true);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use the server action directly instead of API endpoint
      const { success, data } = await searchFatwa(query);
      
      if (success && data && data.results) {
        // Extract results from the nested structure
        const fatwas = data.results as FatwaSearchResult[];
        
        setSearchResults(fatwas.map((item: FatwaSearchResult) => ({
          title: item.title || 'Fatwa',
          url: item.url || '#'
        })));
        
        // Search count is already incremented in searchFatwa function
        // Get updated search info
        const info = await getUserSearchInfo();
        setUserSearchInfo(info);
        
        // Show subscription modal if limit is reached
        if (info.isLimitReached) {
          setTimeout(() => {
            setShowSubscriptionModal(true);
          }, 1000);
        }
      } else {
        console.error("Failed to search or no results found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setQuery("");
    setSearchResults([]);
  };

  const handleInputFocus = () => {
    if (status !== "authenticated") {
      setShowAuthModal(true);
    }
  };

  const handleSubscribe = () => {
    // Update to contact via WhatsApp
    window.open("https://wa.me/60143381756?text=Saya%20ingin%20meningkatkan%20pelan%20Cari%20Fatwa%20saya", "_blank");
    setShowSubscriptionModal(false);
  };

  const handleEmailSubscribe = () => {
    window.open("mailto:farhanhlmy@gmail.com?subject=Naik%20Taraf%20Pelan%20Cari%20Fatwa&body=Saya%20ingin%20meningkatkan%20pelan%20Cari%20Fatwa%20saya", "_blank");
    setShowSubscriptionModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {isSearching ? (
              <Button
                onClick={handleBackToHome}
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                aria-label="Kembali ke halaman utama"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Kembali</span>
              </Button>
            ) : (
              <a href="/" className="flex items-center space-x-2 group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <Book className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Cari Fatwa
                </span>
              </a>
            )}
            <div className="hidden sm:flex space-x-2">
              <Button variant="ghost" className="flex items-center space-x-2" onClick={() => window.location.href = "/sejarah"}>
                <History className="h-5 w-5" />
                <span>Sejarah</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2" onClick={() => window.location.href = "/subscribe"}>
                <Crown className="h-5 w-5" />
                <span>Harga</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5" />
                <span>Disimpan</span>
              </Button>
              {session ? (
                <>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2"
                      onClick={() => window.location.href = "/admin"}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  )}
                  {userSearchInfo.tier !== "free" && (
                    <Badge 
                      variant="outline" 
                      className="bg-yellow-50 border-yellow-200 text-yellow-700 flex items-center gap-1 cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={fetchUserSearchHistory}
                    >
                      <Crown className="h-3 w-3" />
                      {userSearchInfo.tier === "premium" ? "Premium" : "Tanpa Had"}
                    </Badge>
                  )}
                  <Button variant="outline" onClick={() => signOut()}>
                    Log Keluar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowAuthModal(true)}>
                  Log Masuk
                </Button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden flex space-x-2">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => window.location.href = "/sejarah"}>
                      <History className="mr-2 h-4 w-4" />
                      <span>Sejarah</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = "/subscribe"}>
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Harga</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Disimpan</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="icon" onClick={() => setShowAuthModal(true)}>
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Masuk Diperlukan</DialogTitle>
            <DialogDescription>
              Sila log masuk untuk meneruskan pencarian fatwa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7181818,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.9157113 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
              </svg>
              <span>Log masuk dengan Google</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAuthModal(false)}
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Tingkatkan Pengalaman Anda
            </DialogTitle>
            <DialogDescription>
              Anda telah mencapai had carian percuma. Naik taraf untuk terus mencari tanpa had.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Had Pelan Percuma Dicapai</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Anda telah menggunakan {userSearchInfo.searchCount} daripada 3 carian yang tersedia pada pelan percuma.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="font-medium">Pelan Percuma</h3>
                <Badge>Semasa</Badge>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <span>3 carian sebulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <span>Hasil asas</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex justify-between">
                <h3 className="font-medium flex items-center gap-1">
                  <Crown className="h-4 w-4 text-emerald-600" />
                  Pelan Premium
                </h3>
                <Badge variant="outline" className="bg-emerald-100 border-emerald-200 text-emerald-700">Disyorkan</Badge>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Carian tanpa had</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Pilihan penapisan lanjutan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Simpan hasil kegemaran</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Sejarah carian penuh</span>
                </li>
              </ul>
              
              <div className="pt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  Untuk naik taraf, sila hubungi kami melalui salah satu cara berikut:
                </p>
                <div className="flex gap-3">
                  <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleSubscribe}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.04 4a7.94 7.94 0 0 0-6.91 4.11A7.7 7.7 0 0 0 4 12.76a7.86 7.86 0 0 0 1.23 4.19L4 20.5l3.64-1.35a8.13 8.13 0 0 0 4.4 1.27h.04a7.94 7.94 0 0 0 7.91-7.96 7.86 7.86 0 0 0-2.39-6.14zM12.04 19.24h-.03a6.73 6.73 0 0 1-3.86-1.18l-.28-.16-2.04.76.77-2.04-.17-.29a6.7 6.7 0 0 1-1.15-3.76c0-3.65 2.99-6.63 6.7-6.63a6.63 6.63 0 0 1 6.64 6.67c0 3.66-3.01 6.63-6.68 6.63zm3.68-4.93c-.2-.1-1.18-.58-1.37-.65-.18-.07-.32-.1-.45.1-.13.2-.5.65-.62.78-.11.14-.22.15-.42.05-.2-.1-.84-.31-1.6-.99-.59-.52-.99-1.17-1.1-1.37-.12-.2 0-.3.09-.4.08-.08.2-.22.3-.33.1-.1.13-.18.2-.3.07-.13.03-.24-.02-.33-.05-.1-.45-1.09-.62-1.5-.16-.38-.33-.33-.45-.34-.11 0-.25-.02-.38-.02-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67 0 .98.72 1.94.82 2.07.1.13 1.4 2.13 3.39 2.99.47.2.84.33 1.13.42.48.15.91.13 1.25.08.38-.06 1.18-.48 1.34-.95.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23z" fill="currentColor"/>
                    </svg>
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={handleEmailSubscribe}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" fill="currentColor"/>
                    </svg>
                    E-mel
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  WhatsApp: 0143381756 | E-mel: farhanhlmy@gmail.com
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Stats Modal */}
      <Dialog open={showUserStatsModal} onOpenChange={setShowUserStatsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Statistik Penggunaan Anda
            </DialogTitle>
            <DialogDescription>
              Ringkasan carian dan penggunaan akaun {userSearchInfo.tier === "premium" ? "Premium" : "Tanpa Had"} anda
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Sejarah</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Usage stats */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-600" />
                  Pelan {userSearchInfo.tier === "premium" ? "Premium" : "Tanpa Had"}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-sm text-gray-500">Jumlah Carian</div>
                    <div className="text-2xl font-bold text-emerald-700">{userSearchInfo.searchCount}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="text-lg font-semibold text-emerald-700">
                      {userSearchInfo.tier === "premium" 
                        ? `${userSearchInfo.remainingSearches} berbaki` 
                        : "Tanpa had"}
                    </div>
                  </div>
                </div>
                
                {userSearchInfo.tier === "premium" && (
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Penggunaan</span>
                      <span className="text-xs text-emerald-700">
                        {userSearchInfo.searchCount}/20
                      </span>
                    </div>
                    <Progress 
                      value={(userSearchInfo.searchCount / 20) * 100} 
                      className="h-2"
                      color="bg-emerald-600"
                    />
                  </div>
                )}
              </div>
              
              {/* Usage visualization */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  Carta Penggunaan
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="h-32 flex items-end justify-between gap-1">
                    {/* Create sample chart bars for visualization */}
                    {Array.from({ length: 7 }).map((_, i) => {
                      const height = Math.floor(Math.random() * 70) + 10;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div 
                            className="w-full bg-emerald-100 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs text-gray-500">
                            {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-center text-xs text-gray-500">
                    Penggunaan 7 hari terakhir
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-gray-600" />
                Carian Terkini
              </h3>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                {searchHistory.length > 0 ? (
                  searchHistory.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-gray-50">
                      <div className="font-medium text-sm">{item.query}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-2" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Tiada sejarah carian ditemui
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowUserStatsModal(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {!isSearching ? (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Cari Fatwa dari Laman Web Mufti
              <br />
              Dengan Mudah
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Cari maklumat dari https://muftiwp.gov.my/ms/artikel/irsyad-hukum
              dengan lebih mudah!
            </p>

            {session && userSearchInfo.tier === "free" && (
              <div className="max-w-md mx-auto mb-8 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Penggunaan carian</span>
                  <Badge variant="outline" className="text-xs">
                    {userSearchInfo.searchCount}/3 carian percuma
                  </Badge>
                </div>
                <Progress value={(userSearchInfo.searchCount / 3) * 100} className="h-2" />
                {userSearchInfo.isLimitReached ? (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-red-600">
                      Anda telah mencapai had percuma.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-7 px-2 flex items-center gap-1"
                      onClick={() => setShowSubscriptionModal(true)}
                    >
                      <Crown className="h-3 w-3" />
                      Naik Taraf
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    {userSearchInfo.remainingSearches} carian berbaki bulan ini.
                  </p>
                )}
              </div>
            )}

            {session && userSearchInfo.tier === "premium" && (
              <div className="max-w-md mx-auto mb-8 bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Pelan Premium</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    {userSearchInfo.searchCount}/20 carian digunakan
                  </Badge>
                </div>
                <Progress 
                  value={(userSearchInfo.searchCount / 20) * 100} 
                  className="h-2 bg-emerald-100" 
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-emerald-600">
                    {userSearchInfo.remainingSearches} carian berbaki bulan ini.
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-7 px-2 flex items-center gap-1 text-emerald-700"
                    onClick={fetchUserSearchHistory}
                  >
                    <BarChart3 className="h-3 w-3" />
                    Lihat Statistik
                  </Button>
                </div>
              </div>
            )}

            {session && userSearchInfo.tier === "unlimited" && (
              <div className="max-w-md mx-auto mb-8 bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Pelan Tanpa Had</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    {userSearchInfo.searchCount} carian dibuat
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-amber-600">
                    Anda boleh membuat carian tanpa had.
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-7 px-2 flex items-center gap-1 text-amber-700"
                    onClick={fetchUserSearchHistory}
                  >
                    <BarChart3 className="h-3 w-3" />
                    Lihat Statistik
                  </Button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto relative"
            >
              <div className="relative group">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder="Tuliskan soalan anda..."
                  className="w-full px-6 py-7 text-lg border-2 border-emerald-100 rounded-2xl focus:outline-none focus:border-emerald-500 pr-14 shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
                  aria-label="Pertanyaan carian"
                />
                <Button
                  type="submit"
                  disabled={!query.trim() || (!!session && userSearchInfo.isLimitReached)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cari"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Tekan Enter untuk mencari
              </p>
            </form>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm sticky top-24 z-10 border border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border-none focus:outline-none text-lg bg-transparent"
                placeholder="Perhalusi carian anda..."
                aria-label="Perhalusi carian"
              />
              <Button
                onClick={handleSearch}
                className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                aria-label="Cari"
                disabled={!!session && userSearchInfo.isLimitReached}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 px-1">
                  Hasil Teratas
                </h2>
                {searchResults.map((result, index) => (
                  <Card key={index} className="overflow-hidden group hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Sumber {index + 1}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-3 line-clamp-2 leading-relaxed group-hover:text-emerald-600 transition-colors">
                          {result.title}
                        </h3>
                        <div className="text-sm text-gray-500">
                          <span className="truncate">
                            {new URL(result.url).hostname}
                          </span>
                        </div>
                      </a>
                    </CardContent>
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </Card>
            )}

            <Card className="bg-emerald-50/80 border-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <Book className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Mencari sumber yang dipercayai...
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Kami sedang mencari koleksi fatwa yang disahkan untuk mencari jawapan yang paling relevan untuk anda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>© 2025 Cari Fatwa. Hak Cipta Terpelihara.</p>
            {isAdmin && (
              <div className="mt-2">
                <a 
                  href="/admin" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Panel Admin
                </a>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
