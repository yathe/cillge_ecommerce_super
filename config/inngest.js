import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "cillage-next" });

export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, firstName, lastName, email_addresses, emailAddresses, image_url, imageUrl } = event.data;
      const userData = {
        _id: id,
        email:
          (email_addresses && email_addresses[0]?.email_address) ||
          (emailAddresses && emailAddresses[0]?.emailAddress) ||
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim(),
        imageUrl: imageUrl || image_url || "",
      };
      await connectDB();
      await User.create(userData);
      console.log("User created in MongoDB:", userData);
      return { success: true };
    } catch (e) {
      console.error("Failed to create user in MongoDB:", e);
      throw e;
    }
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, firstName, lastName, email_addresses, emailAddresses, image_url, imageUrl } = event.data;
      const userData = {
        _id: id,
        email:
          (email_addresses && email_addresses[0]?.email_address) ||
          (emailAddresses && emailAddresses[0]?.emailAddress) ||
          "",
        name: `${firstName || first_name || ""} ${lastName || last_name || ""}`.trim(),
        imageUrl: imageUrl || image_url || "",
      };
      await connectDB();
      await User.findByIdAndUpdate(id, userData, { upsert: true });
      console.log("User updated in MongoDB:", userData);
      return { success: true };
    } catch (e) {
      console.error("Failed to update user in MongoDB:", e);
      throw e;
    }
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-with-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await connectDB();
      await User.findByIdAndDelete(id);
      console.log("Deleted user in MongoDB:", id);
      return { success: true };
    } catch (e) {
      console.error("Failed to delete user in MongoDB:", e);
      throw e;
    }
  }
);