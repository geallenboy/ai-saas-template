import { create } from "zustand";

interface userState {
  loading: boolean;
  data: any;
  error: string | null;
}

const userStore = create<userState>((set) => ({
  loading: false,
  data: null,
  error: null,
}));

export default userStore;
