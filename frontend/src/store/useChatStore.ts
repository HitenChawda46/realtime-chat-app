import { create } from "zustand";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

import type { ApiError, Message, MessageData, User } from "../types";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

type ActiveTabType = "chats" | "contacts";

type ChatStore = {
  allContacts: User[];
  chats: User[];
  messages: Message[];
  activeTab: ActiveTabType;
  selectedUser: null | User;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;

  toggleSound: () => void;
  setActiveTab: (tab: ActiveTabType) => void;
  setSelectedUser: (selectedUser: User | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessageData) => Promise<void>;
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

  setSelectedUser: (selectedUser: User | null) => {
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

  getMessagesByUserId: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: MessageData) => {
    const { selectedUser, messages } = get();

    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser!._id,
      receiverId: selectedUser!._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser!._id}`,
        messageData,
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      const err = error as AxiosError<ApiError>;
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  },
}));
