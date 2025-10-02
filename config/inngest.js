import { Inngest } from "inngest"; 
import connectDB from "./db"; 
import User from "@/models/User"; 
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "cillage-next" });

/**
 * 1. Create User
 */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
     
      // Debug: log the entire payload
      console.log("Clerk user.created event payload:", event.data);

      // Extract user info from event
      const {
        id: clerkId,
        first_name,
        last_name,
        firstName,
        lastName,
        email_addresses,
        emailAddresses,
        image_url,
        imageUrl,
      } = event.data;

      

      const userData = {
        _id: clerkId, // Must match Clerk userId
        email:
          (email_addresses?.[0]?.email_address) ||
          (emailAddresses?.[0]?.emailAddress) ||
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim() || "Unknown",
        imageUrl: imageUrl || image_url || "",
      };
       await connectDB();

      // Upsert user in MongoDB
      const user = await User.findByIdAndUpdate(clerkId, userData, {
        upsert: true, // create if not exists
        new: true,    // return the updated/new document
        setDefaultsOnInsert: true,
      });

      console.log("✅ User synced/created in MongoDB:", user);
      return { success: true, user };
    } catch (e) {
      console.error("❌ Failed to sync user in MongoDB:", e);
      throw e;
    }
  }
);


/**
 * 2. Update User
 */
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDB();

      const {
        id,
        first_name,
        last_name,
        firstName,
        lastName,
        email_addresses,
        emailAddresses,
        image_url,
        imageUrl,
      } = event.data;

      const userData = {
        _id: id,
        email:
          (email_addresses && email_addresses[0]?.email_address) ||
          (emailAddresses && emailAddresses[0]?.emailAddress) ||
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim(),
        imageUrl: imageUrl || image_url || "",
      };

      const updatedUser = await User.findByIdAndUpdate(id, userData, {
        upsert: true,
        new: true,
      });

      console.log("✅ User updated in MongoDB:", updatedUser);
      return { success: true };
    } catch (e) {
      console.error("❌ Failed to update user in MongoDB:", e);
      throw e;
    }
  }
);

/**
 * 3. Delete User
 */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id } = event.data;
      const deleted = await User.findByIdAndDelete(id);

      if (!deleted) {
        console.warn(`⚠️ Tried to delete user ${id}, but not found in DB`);
      } else {
        console.log("✅ Deleted user in MongoDB:", deleted._id);
      }

      return { success: true };
    } catch (e) {
      console.error("❌ Failed to delete user in MongoDB:", e);
      throw e;
    }
  }
);

/**
 * 4. Create Orders
 */
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  { event: "order/created" },
  async ({ events }) => {
    try {
      await connectDB();

      const orders = events.map((event) => ({
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      }));

      await Order.insertMany(orders);
      console.log(`✅ Inserted ${orders.length} orders into DB`);

      return { success: true, processed: orders.length };
    } catch (e) {
      console.error("❌ Failed to insert orders:", e);
      throw e;
    }
  }
);
