"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users, searchHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface SearchResult {
  title: string;
  url: string;
}

// Function to get user search count
export async function getUserSearchInfo() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      searchCount: 0,
      tier: "free",
      isLimitReached: false,
      remainingSearches: 3
    };
  }
  
  const userId = session.user.id;
  const userInfo = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      searchCount: true,
      tier: true
    }
  });
  
  const searchCount = userInfo?.searchCount || 0;
  const tier = userInfo?.tier || "free";
  
  let searchLimit = 3; // Default for free users
  if (tier === "premium") {
    searchLimit = 20; // Set back to 20 for premium users
  } else if (tier === "unlimited") {
    searchLimit = Infinity;
  }
  
  return {
    searchCount,
    tier,
    isLimitReached: (tier === "free" && searchCount >= 3) || (tier === "premium" && searchCount >= 20),
    remainingSearches: tier === "unlimited" ? Infinity : Math.max(0, searchLimit - searchCount)
  };
}

// Function to increment user search count
export async function incrementSearchCount(query: string, results: SearchResult[]) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Anda perlu log masuk untuk mencari",
      isLimitReached: true
    };
  }
  
  const userId = session.user.id;
  const userInfo = await getUserSearchInfo();
  
  // Check if user has reached their limit
  if (userInfo.isLimitReached) {
    return {
      success: false,
      message: "Had carian dicapai. Sila naik taraf untuk terus mencari.",
      isLimitReached: true
    };
  }
  
  // Log the search in history
  await db.insert(searchHistory).values({
    userId,
    query,
    results: results as any,
  });
  
  // Update the user's search count
  await db.update(users)
    .set({
      searchCount: userInfo.searchCount + 1,
      lastSearchDate: new Date(),
    })
    .where(eq(users.id, userId));
  
  revalidatePath("/");
  
  return {
    success: true,
    message: "Jumlah carian dikemaskini",
    isLimitReached: (userInfo.tier === "free" && userInfo.searchCount + 1 >= 3) || 
                    (userInfo.tier === "premium" && userInfo.searchCount + 1 >= 20),
    remainingSearches: Math.max(0, userInfo.remainingSearches - 1)
  };
}

// Function to reset user search count (for testing or admin purposes)
export async function resetSearchCount() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Anda perlu log masuk"
    };
  }
  
  const userId = session.user.id;
  
  await db.update(users)
    .set({
      searchCount: 0,
    })
    .where(eq(users.id, userId));
  
  revalidatePath("/");
  
  return {
    success: true,
    message: "Jumlah carian telah diset semula"
  };
}

// Function to update user tier
export async function updateUserTier(tier: "free" | "premium" | "unlimited") {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Anda perlu log masuk"
    };
  }
  
  const userId = session.user.id;
  
  await db.update(users)
    .set({
      tier,
    })
    .where(eq(users.id, userId));
  
  revalidatePath("/");
  
  return {
    success: true,
    message: `Pelan pengguna berjaya dikemaskini ke ${tier}`
  };
}

// Get the user's search history (for premium users)
export async function getUserSearchHistory() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Not authenticated",
      history: []
    };
  }
  
  try {
    // First get the user to verify their tier
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    
    if (!user) {
      return {
        success: false,
        message: "User not found",
        history: []
      };
    }
    
    // Only premium and unlimited users can view history
    if (user.tier === "free") {
      return {
        success: false,
        message: "Premium feature",
        history: []
      };
    }
    
    // Fetch the search history
    const history = await db.select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, session.user.id))
      .orderBy(desc(searchHistory.timestamp))
      .limit(10); // Only show the 10 most recent searches
    
    return {
      success: true,
      history
    };
  } catch (error) {
    console.error("Error fetching search history:", error);
    return {
      success: false,
      message: "Error fetching search history",
      history: []
    };
  }
}

// Function to search for fatwas using the external API
export async function searchFatwa(query: string) {
  try {
    // Get the API key and URL from environment variables
    const apiKey = process.env.FATWA_API_KEY;
    const apiUrl = process.env.FATWA_API_URL || 'http://localhost:8000/search';
    
    if (!apiKey) {
      throw new Error('FATWA_API_KEY is not defined in environment variables');
    }

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // If user is authenticated, log this search and increment count
    // Check if data has a results property that is an array
    if (data && data.results && Array.isArray(data.results)) {
      await incrementSearchCount(query, data.results.map((item: any) => ({
        title: item.title || 'Fatwa',
        url: item.url || '#'
      })));
    } else {
      // Fallback to handle the case where data might be an array directly
      const results = Array.isArray(data) ? data : [];
      await incrementSearchCount(query, results.map((item: any) => ({
        title: item.title || 'Fatwa',
        url: item.url || '#'
      })));
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error searching fatwa:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: []
    };
  }
} 