import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { Users } from "@/config/schema";

export const getUserByEmail = async (email: string) => {
    try {
        const result = await db
            .select()
            .from(Users)
            .where(
                eq(Users.userEmail, email)
            );

        return result[0];
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return []
    }
};

export const addUser = async (user: any) => {
    try {
        const result = await db
            .insert(Users)
            .values({
                userEmail: user?.primaryEmailAddress?.emailAddress,
                userImage: user?.imageUrl,
                userName: user?.fullName,
            })
            .returning({
                userEmail: Users.userEmail,
                userName: Users.userName,
                userImage: Users.userImage,
                credit: Users.credit,
            });
        return result[0]
    } catch (error) {
        return []
    }
}