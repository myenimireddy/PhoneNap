/**
 * PinStore — parent unlock PIN, on device only.
 * Sketch: plain 4-digit string in localStorage.
 * Native V1: Keychain / EncryptedSharedPreferences; never log the PIN.
 * No demo fallback — unlock fails until a PIN is created.
 */
(function (global) {
  const PIN_KEY = "phonenap-pin";

  const PinStore = {
    hasPin() {
      return Boolean(localStorage.getItem(PIN_KEY));
    },
    /** @returns {boolean} */
    setPin(digits) {
      if (!/^\d{4}$/.test(digits)) return false;
      localStorage.setItem(PIN_KEY, digits);
      return true;
    },
    /** @returns {boolean} */
    verify(digits) {
      const saved = localStorage.getItem(PIN_KEY);
      if (!saved) return false;
      return saved === digits;
    },
    clear() {
      localStorage.removeItem(PIN_KEY);
    },
  };

  global.PinStore = PinStore;
})(window);
