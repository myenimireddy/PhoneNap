import * as SecureStore from "expo-secure-store";

const PIN_KEY = "phonenap-pin";

/**
 * Parent unlock PIN in SecureStore.
 * No demo fallback — verify fails until a PIN is created.
 */
export const PinStore = {
  async hasPin(): Promise<boolean> {
    const saved = await SecureStore.getItemAsync(PIN_KEY);
    return Boolean(saved);
  },

  async setPin(digits: string): Promise<boolean> {
    if (!/^\d{4}$/.test(digits)) return false;
    await SecureStore.setItemAsync(PIN_KEY, digits);
    return true;
  },

  async verify(digits: string): Promise<boolean> {
    const saved = await SecureStore.getItemAsync(PIN_KEY);
    if (!saved) return false;
    return saved === digits;
  },
};
