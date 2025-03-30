"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users, searchHistory } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper function to check if the current user is admin (farhanhlmy@gmail.com)
async function checkIsAdmin() {
  const session = await auth();
  return session?.user?.email === "farhanhlmy@gmail.com";
}

// Get all users for admin panel
export async function getAllUsers(sortBy: string = "name", order: "asc" | "desc" = "asc") {
  const isUserAdmin = await checkIsAdmin();
  
  if (!isUserAdmin) {
    return { 
      success: false,
      message: "Akses tidak dibenarkan. Anda tidak mempunyai kebenaran admin.",
      users: []
    };
  }
  
  try {
    let allUsers;
    
    // Apply sorting
    if (sortBy === "name") {
      allUsers = await db.select().from(users).orderBy(order === "asc" ? asc(users.name) : desc(users.name));
    } else if (sortBy === "email") {
      allUsers = await db.select().from(users).orderBy(order === "asc" ? asc(users.email) : desc(users.email));
    } else if (sortBy === "tier") {
      allUsers = await db.select().from(users).orderBy(order === "asc" ? asc(users.tier) : desc(users.tier));
    } else if (sortBy === "searchCount") {
      allUsers = await db.select().from(users).orderBy(order === "asc" ? asc(users.searchCount) : desc(users.searchCount));
    } else {
      // Default sorting
      allUsers = await db.select().from(users).orderBy(asc(users.name));
    }
    
    return {
      success: true,
      users: allUsers
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Failed to fetch users",
      users: []
    };
  }
}

// Update user tier as admin
export async function updateUserTierAsAdmin(userId: string, tier: "free" | "premium" | "unlimited") {
  const isUserAdmin = await checkIsAdmin();
  
  if (!isUserAdmin) {
    return { 
      success: false,
      message: "Akses tidak dibenarkan. Anda tidak mempunyai kebenaran admin."
    };
  }
  
  try {
    await db.update(users)
      .set({ tier })
      .where(eq(users.id, userId));
    
    revalidatePath("/admin");
    
    return {
      success: true,
      message: `User tier updated to ${tier} successfully`
    };
  } catch (error) {
    console.error("Error updating user tier:", error);
    return {
      success: false,
      message: "Failed to update user tier"
    };
  }
}

// Reset user search count as admin
export async function resetUserSearchCountAsAdmin(userId: string) {
  const isUserAdmin = await checkIsAdmin();
  
  if (!isUserAdmin) {
    return { 
      success: false,
      message: "Akses tidak dibenarkan. Anda tidak mempunyai kebenaran admin."
    };
  }
  
  try {
    await db.update(users)
      .set({ searchCount: 0 })
      .where(eq(users.id, userId));
    
    revalidatePath("/admin");
    
    return {
      success: true,
      message: "User search count reset successfully"
    };
  } catch (error) {
    console.error("Error resetting search count:", error);
    return {
      success: false,
      message: "Failed to reset search count"
    };
  }
}

// Get user search history
export async function getUserSearchHistory(userId: string) {
  const isUserAdmin = await checkIsAdmin();
  
  if (!isUserAdmin) {
    return { 
      success: false,
      message: "Akses tidak dibenarkan. Anda tidak mempunyai kebenaran admin.",
      history: []
    };
  }
  
  try {
    const history = await db.select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.timestamp));
    
    return {
      success: true,
      history
    };
  } catch (error) {
    console.error("Error fetching search history:", error);
    return {
      success: false,
      message: "Failed to fetch search history",
      history: []
    };
  }
} 