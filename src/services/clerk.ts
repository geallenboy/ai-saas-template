
'use server';

import { getUserByClerkId } from "@/feature/users/db/users"
import { auth } from "@clerk/nextjs/server"

export async function getCurrentUser() {
  const resUsers = await auth()
  const { userId, redirectToSignIn } = resUsers
  console.log("resUsers:", resUsers)
  if (userId !== null) {
    const user = await getUserByClerkId(userId)
    console.log(user, "==>")
    return {
      ...user
    }
  } else {
    return redirectToSignIn()
  }


}
