import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server"; // Import function to get authentication data from Clerk
import { NextResponse } from "next/server"; // Import Next.js helper to create API responses

export async function POST(request) { // Define an async POST handler function
  try {
    const { userId } = getAuth(request) // Get the authenticated user's ID from the request
    const { address, items } = await request.json(); // Parse JSON body to get address and items

    // Check if address is missing OR items array is empty
    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid data'}); // Return error response
    }

    // calculate amount using items
    const amount = await items.reduce(async (acc, item) => {
      // Find the product details in the database by product ID
      const product = await Product.findById(item.product);
      // Add (offer price * quantity) to accumulated total
      return await acc + product.offerPrice * item.quantity;
    }, 0) // Start accumulator at 0

   await inngest.send({
    name: 'order/created', // Events are sent to inngest first then processed by the function
    data: {
      userId,
      address,
      items,
      amount: amount + Math.floor(amount * 0.02), // Add 2% tax to the total amount
      date: Date.now() 
      // it send date as current timestamp for the order because it is required in the order model
    }
   })
  //   clear user cart 
  const user = await User.findById(userId);
  user.cartItems = {} // empty the cart items after order is created
  await user.save() // save the updated user data to database 
   return NextResponse.json({ success: true, message: 'Order Placed'})
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: error.message})
    // Handle any errors that occur in the try block
  }
}
