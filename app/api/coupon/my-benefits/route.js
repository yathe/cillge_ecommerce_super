import connectDB from "@/config/db"
import Coupon from "@/models/GebnerateCoupon"
import User from "@/models/User"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    // 🔐 Get the authenticated user's ID from Clerk
    const { userId } = getAuth(request)
    
    // 📊 Debug: Log the user ID to help with troubleshooting
    console.log('🔄 Fetching benefits for user:', userId);
    
    // 🔗 Connect to MongoDB database
    await connectDB()
    
    // 🎫 STEP 1: Find all coupons owned by this user
    // This gets all coupon documents where this user is the owner
    const coupons = await Coupon.find({ ownerUserId: userId });
    console.log('📋 Found coupons:', coupons.length);
    
    // 💰 Initialize variables to track total benefits and referred users
    let totalBenefits = 0;
    let referredUsers = [];
    
    // 👥 STEP 2: Collect ALL user IDs from ALL referred users across ALL coupons
    // This creates a flat list of all user IDs that have used any of this user's coupons
    const allUserIds = [];
    coupons.forEach(coupon => {
      coupon.referredUsers.forEach(user => {
        allUserIds.push(user.userId);
      });
    });
    
    console.log('👥 Total referred users found:', allUserIds.length);
    
    // 🔍 STEP 3: Fetch basic user details (name, email) for all referred users
    // This is more efficient than querying each user individually
    const users = await User.find({ _id: { $in: allUserIds } });
    
    // 🗺️ Create a map for quick user lookups by ID
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), {
        name: user.name,
        email: user.email
      });
    });
    
    console.log('✅ User details fetched for:', users.length, 'users');
    
    // 📦 STEP 4: Fetch ALL orders for ALL referred users in one efficient query
    // This gets complete order history with product details populated
    const allOrders = await Order.find({ 
      userId: { $in: allUserIds } 
    })
    .populate({
      path: 'items.product', // Populate the product details in each order item
      model: Product // Reference the Product model
    })
    .sort({ date: -1 }); // Sort by most recent orders first
    
    console.log('📦 Total orders found for referred users:', allOrders.length);
    
    // 🗂️ STEP 5: Organize orders by user ID for easy lookup
    // This creates a structure like: { userId1: [order1, order2], userId2: [order3] }
    const ordersByUser = {};
    allOrders.forEach(order => {
      const userIdStr = order.userId.toString();
      if (!ordersByUser[userIdStr]) {
        ordersByUser[userIdStr] = [];
      }
      ordersByUser[userIdStr].push(order);
    });
    
    // 🎯 STEP 6: Process each coupon and build the final response
    coupons.forEach(coupon => {
      console.log(`🎫 Processing coupon: ${coupon.code} with ${coupon.referredUsers.length} referred users`);
      
      coupon.referredUsers.forEach(referredUser => {
        // 🔍 Get basic user information from our map
        const userDetails = userMap.get(referredUser.userId.toString());
        
        // 📊 Get orders for this specific referred user
        const userOrders = ordersByUser[referredUser.userId.toString()] || [];
        
        // 🛍️ STEP 7: Extract unique products purchased by this user
        const purchasedProducts = [];
        const productMap = new Map(); // Used to track unique products
        
        userOrders.forEach(order => {
          order.items.forEach(item => {
            // Check if product exists and we haven't added it already
            if (item.product && !productMap.has(item.product._id.toString())) {
              // Mark this product as processed
              productMap.set(item.product._id.toString(), true);
              
              // Add product details to our list
              purchasedProducts.push({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.offerPrice,
                image: item.product.image?.[0], // Use first image if available
                category: item.product.category
              });
            }
          });
        });
        
        console.log(`📊 User ${referredUser.userId} purchased ${purchasedProducts.length} unique products`);
        
        // 💰 Add to total benefits
        totalBenefits += referredUser.totalBenefit;
        
        // 🏷️ Build the complete referred user object with all details
        referredUsers.push({
          // Basic user identification
          userId: referredUser.userId,
          userName: userDetails?.name || "Unknown User",
          email: userDetails?.email || "No email available",
          
          // Financial metrics
          totalSpent: referredUser.totalSpent,
          totalBenefit: referredUser.totalBenefit,
          purchaseCount: referredUser.purchaseCount,
          
          // Timeline information
          firstPurchaseDate: referredUser.firstPurchaseDate,
          lastPurchaseDate: referredUser.lastPurchaseDate,
          
          // Product information
          products: purchasedProducts.slice(0, 10), // Limit to 10 most recent products
          totalProducts: purchasedProducts.length, // Total unique products purchased
          
          // Additional metadata
          couponCode: coupon.code, // Which coupon they used
          averageOrderValue: referredUser.purchaseCount > 0 
            ? referredUser.totalSpent / referredUser.purchaseCount 
            : 0
        });
      });
    });
    
    // 📈 Calculate some overall statistics
    const totalReferredUsers = referredUsers.length;
    const totalPurchases = referredUsers.reduce((sum, user) => sum + user.purchaseCount, 0);
    const totalSpent = referredUsers.reduce((sum, user) => sum + user.totalSpent, 0);
    
    console.log('📊 Final statistics:', {
      totalReferredUsers,
      totalPurchases,
      totalSpent,
      totalBenefits
    });
    
    // ✅ STEP 8: Return the complete benefits data
    return NextResponse.json({ 
      success: true,
      // Core financial data
      totalBenefits,
      referredUsers,
      totalCoupons: coupons.length,
      
      // Additional statistics
      statistics: {
        totalReferredUsers,
        totalPurchases,
        totalSpent,
        averageBenefitPerUser: totalReferredUsers > 0 ? totalBenefits / totalReferredUsers : 0,
        averageSpentPerUser: totalReferredUsers > 0 ? totalSpent / totalReferredUsers : 0
      },
      
      // Timestamp for cache control
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    // ❌ Error handling with detailed logging
    console.error('💥 Benefits API error:', {
      message: error.message,
      stack: error.stack,
      userId: userId // This will be available from the try block
    });
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch benefits data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}