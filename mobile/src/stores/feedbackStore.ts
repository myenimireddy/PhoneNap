import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

const KEY = "phonenap-feedback-log-v1";

export type HandoffAnswer = "none" | "one" | "negotiate";
export type YesNo = "yes" | "no";

export type FeedbackEntry = {
  path: "new" | "recent";
  secondsToSleep: number | null;
  missionClass: string | null;
  missionId: string | null;
  placeId: string | null;
  ageBand: string | null;
  handoff: HandoffAnswer;
  missionBegun: YesNo;
  askedAgain: YesNo;
  savedAt: string;
  storage: "local-device-only";
};

export const FeedbackStore = {
  async list(): Promise<FeedbackEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  async append(entry: FeedbackEntry): Promise<void> {
    const list = await this.list();
    list.push(entry);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  },

  async exportText(): Promise<string> {
    return JSON.stringify(await this.list(), null, 2);
  },

  async count(): Promise<number> {
    return (await this.list()).length;
  },

  /** Copy full append-only log to clipboard. Returns entry count. */
  async copyAll(): Promise<number> {
    const list = await this.list();
    await Clipboard.setStringAsync(JSON.stringify(list, null, 2));
    return list.length;
  },

  /** Share sheet with full log text; falls back to clipboard. */
  async shareAll(): Promise<"shared" | "copied"> {
    const text = await this.exportText();
    try {
      const result = await Share.share({
        message: text,
        title: "PhoneNap feedback log",
      });
      if (result.action === Share.sharedAction) return "shared";
      if (result.action === Share.dismissedAction) {
        // Still leave a copy so export is never a dead end after dismiss on some platforms
        await Clipboard.setStringAsync(text);
        return "copied";
      }
    } catch {
      // fall through
    }
    await Clipboard.setStringAsync(text);
    return "copied";
  },
};
