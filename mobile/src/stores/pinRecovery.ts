import * as LocalAuthentication from "expo-local-authentication";

/**
 * Device-owner recovery for a forgotten PIN.
 * Not shown on the child sleep UI — parent Settings / unlock forgot path only.
 */
export async function authenticateDeviceOwner(
  reason = "Authenticate to reset your PhoneNap PIN"
): Promise<{ ok: boolean; error?: string }> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return {
      ok: false,
      error: "This device does not support Face ID, Touch ID, or device lock recovery.",
    };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return {
      ok: false,
      error: "Set up Face ID, Touch ID, or a device passcode in system Settings first.",
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return { ok: false, error: "Authentication failed or was cancelled." };
  }

  return { ok: true };
}
