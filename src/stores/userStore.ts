

import { create } from "zustand";

export const useUserStore = create((set) => ({
    users: null,
    setUser: async (user: any) => {
        set({ users: user })
    }
}));

