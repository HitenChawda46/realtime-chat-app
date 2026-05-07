import { create } from "zustand";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

import type { ApiError, User } from "../types";
import { axiosInstance } from "../lib/axios";

type ActiveTabType = "chats" | "contacts";

type ChatStore = {
  allContacts: [];
  chats: [];
  messages: [];
  activeTab: ActiveTabType;
  selectedUser: null | User;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;

  toggleSound: () => void;
  setActiveTab: (tab: ActiveTabType) => void;
  setSelectedUser: (selectedUser: User) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

  toggleSound: () => {
    const updatedSoundState = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", updatedSoundState.toString());
    set({ isSoundEnabled: updatedSoundState });
  },

  setActiveTab: (tab: ActiveTabType) => {
    set({ activeTab: tab });
  },

  setSelectedUser: (selectedUser: User) => {
    set({ selectedUser });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      toast.error(
        err.response?.data?.message ||
          "Couldn't load contacts, please try again later!",
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      toast.error(
        err.response?.data?.message ||
          "Couldn't load chats, please try again later!",
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },
}));
