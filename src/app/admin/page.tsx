"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronUp, UserCog, RefreshCw, Search, Shield, ClipboardList, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllUsers, updateUserTierAsAdmin, resetUserSearchCountAsAdmin, getUserSearchHistory } from "@/actions/admin";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  tier: string;
  searchCount: number;
  lastSearchDate: Date | null;
}

interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: Date;
  results: any;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Check if user is admin using direct email check
  useEffect(() => {
    const checkAdmin = async () => {
      if (status === "loading") return;
      
      if (status === "unauthenticated") {
        router.push("/restricted");
        return;
      }
      
      // Simple check if the user's email is farhanhlmy@gmail.com
      if (session?.user?.email === "farhanhlmy@gmail.com") {
        setAuthorized(true);
        fetchUsers();
      } else {
        console.log("User not authorized:", session?.user?.email);
        setAuthorized(false);
        router.push("/restricted");
      }
      
      setLoading(false);
    };
    
    checkAdmin();
  }, [status, session, router]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers(sortBy, sortOrder);
    
    if (result.success) {
      setUsers(result.users);
      setFilteredUsers(result.users);
    } else {
      showNotification(result.message || "Failed to fetch users", "error");
    }
    
    setLoading(false);
  };

  // Handle sorting
  const handleSort = async (column: string) => {
    let newOrder: "asc" | "desc" = "asc";
    
    if (sortBy === column) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    
    setSortBy(column);
    setSortOrder(newOrder);
    
    const result = await getAllUsers(column, newOrder);
    
    if (result.success) {
      setUsers(result.users);
      filterUsers(searchTerm, result.users);
    }
  };

  // Handle search
  const filterUsers = (term: string, userList = users) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredUsers(userList);
      return;
    }
    
    const filtered = userList.filter(user => 
      (user.name && user.name.toLowerCase().includes(term.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredUsers(filtered);
  };

  // View user search history
  const viewUserHistory = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    
    const result = await getUserSearchHistory(user.id);
    
    if (result.success) {
      setUserHistory(result.history);
    } else {
      showNotification(result.message || "Failed to fetch user history", "error");
      setUserHistory([]);
    }
    
    setLoading(false);
    setShowHistoryDialog(true);
  };

  // Update user tier
  const updateUserTier = async (userId: string, tier: "free" | "premium" | "unlimited") => {
    setLoading(true);
    
    const result = await updateUserTierAsAdmin(userId, tier);
    
    if (result.success) {
      showNotification(result.message || "User tier updated successfully", "success");
      setShowTierDialog(false);
      fetchUsers();
    } else {
      showNotification(result.message || "Failed to update user tier", "error");
    }
    
    setLoading(false);
  };

  // Reset user search count
  const resetUserSearchCount = async (userId: string) => {
    setLoading(true);
    
    const result = await resetUserSearchCountAsAdmin(userId);
    
    if (result.success) {
      showNotification(result.message || "Search count reset successfully", "success");
      fetchUsers();
    } else {
      showNotification(result.message || "Failed to reset search count", "error");
    }
    
    setLoading(false);
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success"
      });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuatkan...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-semibold">Panel Admin Cari Fatwa</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user?.email && (
                <span className="text-sm text-gray-600">{session.user.email}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.show && (
          <Alert className={`mb-6 ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <AlertTitle>{notification.type === "success" ? "Berjaya" : "Ralat"}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCog className="h-5 w-5 text-emerald-600" />
              <span>Pengurusan Pengguna</span>
            </CardTitle>
            <CardDescription>
              Lihat dan urus semua pengguna Cari Fatwa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari pengguna..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => filterUsers(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Muat Semula</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nama</span>
                        {sortBy === "name" && (
                          sortOrder === "asc" ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("email")}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-1">
                        <span>E-mel</span>
                        {sortBy === "email" && (
                          sortOrder === "asc" ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("tier")}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Pelan</span>
                        {sortBy === "tier" && (
                          sortOrder === "asc" ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("searchCount")}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Jumlah Carian</span>
                        {sortBy === "searchCount" && (
                          sortOrder === "asc" ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Tiada pengguna ditemui" : "Tiada pengguna"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "N/A"}
                        </TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={
                            user.tier === "premium" 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                              : user.tier === "unlimited" 
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                          }>
                            {user.tier === "premium" 
                              ? "Premium" 
                              : user.tier === "unlimited" 
                                ? "Tanpa Had" 
                                : "Percuma"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.searchCount}
                          {user.lastSearchDate && (
                            <span className="text-xs text-gray-500 block">
                              Terakhir: {new Date(user.lastSearchDate).toLocaleDateString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowTierDialog(true);
                              }}
                            >
                              Tukar Pelan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewUserHistory(user)}
                            >
                              Sejarah
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetUserSearchCount(user.id)}
                            >
                              Reset
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            Jumlah: {filteredUsers.length} pengguna
          </CardFooter>
        </Card>
      </div>

      {/* User History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Sejarah Carian: {selectedUser?.name || selectedUser?.email || "Pengguna"}
            </DialogTitle>
            <DialogDescription>
              Lihat semua carian yang telah dilakukan oleh pengguna ini
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {userHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tiada sejarah carian untuk pengguna ini
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Tarikh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.query}</TableCell>
                      <TableCell>
                        {new Date(item.timestamp).toLocaleDateString()}
                        <span className="text-xs text-gray-500 block">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Tier Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              Tukar Pelan: {selectedUser?.name || selectedUser?.email || "Pengguna"}
            </DialogTitle>
            <DialogDescription>
              Pilih pelan baharu untuk pengguna ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Pelan Semasa:</div>
              <Badge className={
                selectedUser?.tier === "premium" 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                  : selectedUser?.tier === "unlimited" 
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
              }>
                {selectedUser?.tier === "premium" 
                  ? "Premium" 
                  : selectedUser?.tier === "unlimited" 
                    ? "Tanpa Had" 
                    : "Percuma"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Pelan Baharu:</div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card 
                  className={`border-2 cursor-pointer transition-colors ${selectedUser?.tier === "free" ? "border-gray-300 bg-gray-50" : "border-transparent hover:border-gray-200"}`}
                  onClick={() => selectedUser && updateUserTier(selectedUser.id, "free")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium">Percuma</div>
                    <div className="text-xs text-gray-500 mt-1">3 carian</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`border-2 cursor-pointer transition-colors ${selectedUser?.tier === "premium" ? "border-emerald-300 bg-emerald-50" : "border-transparent hover:border-emerald-200"}`}
                  onClick={() => selectedUser && updateUserTier(selectedUser.id, "premium")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium text-emerald-700">Premium</div>
                    <div className="text-xs text-gray-500 mt-1">20 carian</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`border-2 cursor-pointer transition-colors ${selectedUser?.tier === "unlimited" ? "border-amber-300 bg-amber-50" : "border-transparent hover:border-amber-200"}`}
                  onClick={() => selectedUser && updateUserTier(selectedUser.id, "unlimited")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium text-amber-700">Tanpa Had</div>
                    <div className="text-xs text-gray-500 mt-1">Tanpa had</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 