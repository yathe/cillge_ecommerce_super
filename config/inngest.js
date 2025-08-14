import { Inngest } from "inngest"; // Import Inngest for event-driven functions
import connectDB from "./db"; // Import database connection utility
import User from "@/models/User"; // Import Mongoose User model
import Order from "@/models/Order";

// Initialize Inngest client with an application ID
export const inngest = new Inngest({ id: "cillage-next" });

// Function to sync user creation from Clerk to MongoDB
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' }, // Unique ID for this Inngest function
  { event: 'clerk/user.created' }, // Triggered when a user is created in Clerk
  async ({ event }) => {
    try {
      // Destructure possible variations of user data fields from event payload
      const { id, first_name, last_name, firstName, lastName, email_addresses, emailAddresses, image_url, imageUrl } = event.data;

      // Prepare the user data object for MongoDB
      const userData = {
        _id: id, // Set MongoDB document ID to match Clerk's user ID
        email:
          (email_addresses && email_addresses[0]?.email_address) || // Support snake_case
          (emailAddresses && emailAddresses[0]?.emailAddress) ||    // Support camelCase
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim(), // Combine first and last name
        imageUrl: imageUrl || image_url || "", // Handle both camelCase and snake_case keys
      };

      // Connect to MongoDB
      await connectDB();

      // Create a new user in the database
      await User.create(userData);

      console.log("User created in MongoDB:", userData);
      return { success: true };
    } catch (e) {
      console.error("Failed to create user in MongoDB:", e);
      throw e; // Rethrow error to be handled by Inngest
    }
  }
);

// Function to sync user updates from Clerk to MongoDB
export const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' }, // Unique ID for the function
  { event: 'clerk/user.updated' }, // Triggered when a user is updated in Clerk
  async ({ event }) => {
    try {
      // Extract updated user data
      const { id, first_name, last_name, firstName, lastName, email_addresses, emailAddresses, image_url, imageUrl } = event.data;

      // Build the updated user object
      const userData = {
        _id: id,
        email:
          (email_addresses && email_addresses[0]?.email_address) ||
          (emailAddresses && emailAddresses[0]?.emailAddress) ||
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim(),
        imageUrl: imageUrl || image_url || "",
      };

      // Connect to MongoDB
      await connectDB();

      // Find and update the user; create if not exists (upsert)
      await User.findByIdAndUpdate(id, userData, { upsert: true });

      console.log("User updated in MongoDB:", userData);
      return { success: true };
    } catch (e) {
      console.error("Failed to update user in MongoDB:", e);
      throw e;
    }
  }
);

// Function to sync user deletion from Clerk to MongoDB
export const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-with-clerk' }, // Unique ID for function
  { event: 'clerk/user.deleted' }, // Triggered when a user is deleted in Clerk
  async ({ event }) => {
    try {
      const { id } = event.data; // Get user ID from event payload

      // Connect to MongoDB
      await connectDB();

      // Delete user by ID
      await User.findByIdAndDelete(id);

      console.log("Deleted user in MongoDB:", id);
      return { success: true };
    } catch (e) {
      console.error("Failed to delete user in MongoDB:", e);
      throw e;
    }
  }
);

// Inngest function to create user's orders in database
export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order', // Unique ID for this function
    batchEvents: {
      maxSize: 5, // Maximum batch size before triggering
      timeout: '5s' // Max wait time before processing batch
    }
  },
  { event: 'order/created' }, // Trigger when an order is created
  async ({ events }) => {
    // Map through all batched order events to extract order details
    const orders = events.map((event) => {
      return {
        userId: event.data.userId, // ID of the user who placed the order
        items: event.data.items, // Array of ordered items
        amount: event.data.amount, // Total amount of the order ( Typo: should be event.data.amount)
        address: event.data.address, // Shipping address
        date: event.data.date // Order date
      }
    })
    await connectDB()
    await Order.insertMany(orders) // Insert all orders into the database
    return { success: true, processed: orders.length }// return success response with count of processed orders
  }
)
