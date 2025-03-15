"use server";

import { db } from "@/drizzle/db";
import { User, UserTable } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

// Create a new AI user
export async function createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const [newUser] = await db
        .insert(UserTable)
        .values(data)
        .returning()
        .onConflictDoUpdate({
            target: [UserTable.clerkUserId],
            set: data,
        });

    if (newUser == null) throw new Error("Failed to create user");
    return newUser;
}

// Get AI user by ID
export async function getUserById(id: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, id));

    return user || null;
}

// Get AI user by clerk ID
export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.clerkUserId, clerkUserId));

    return user || null;
}

// Get AI user by email
export async function getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.email, email));

    return user || null;
}

// Update AI user
export async function updateUser(
    id: string,
    data: Partial<Omit<typeof UserTable.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<User> {
    const [updatedUser] = await db
        .update(UserTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(UserTable.id, id))
        .returning();

    if (updatedUser == null) throw new Error("Failed to update user");
    return updatedUser;
}




// Hard delete a user (should be used with caution)
export async function hardDeleteUser(id: string): Promise<void> {
    await db
        .delete(UserTable)
        .where(eq(UserTable.id, id)).returning();
}

// List all  AI users
export async function listActiveUsers(): Promise<User[]> {
    return db
        .select()
        .from(UserTable);
}

// 获取用户当前积分
export async function getUserCredits(userId: string): Promise<number> {
    const [user] = await db
        .select({ credits: UserTable.credits })
        .from(UserTable)
        .where(eq(UserTable.id, userId));

    if (!user) throw new Error("User not found");
    return user.credits;
}

// 修改用户积分
export async function updateUserCredits(userId: string, creditsChange: number): Promise<number> {
    // 先获取当前积分
    const currentCredits = await getUserCredits(userId);

    // 计算新的积分值
    const newCredits = currentCredits + creditsChange;

    // 积分不能小于0
    const finalCredits = Math.max(0, newCredits);

    // 更新积分
    const [updatedUser] = await db
        .update(UserTable)
        .set({
            credits: finalCredits,
            updatedAt: new Date()
        })
        .where(eq(UserTable.id, userId))
        .returning({ credits: UserTable.credits });

    if (!updatedUser) throw new Error("Failed to update user credits");
    return updatedUser.credits;
}

// 消费积分（创建Logo时使用）
export async function consumeCredits(userId: string, amount: number = 1): Promise<boolean> {
    const currentCredits = await getUserCredits(userId);

    // 检查积分是否充足
    if (currentCredits < amount) {
        return false; // 积分不足
    }

    // 扣除积分
    await updateUserCredits(userId, -amount);
    return true; // 扣除成功
}