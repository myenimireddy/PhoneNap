import * as LocalAuthentication from "expo-local-authentication";

/**
 * Device-owner recovery for a forgotten PIN.
 * Not shown on the child sleep UI — parent Settings / unlock forgot path only.
 *
 * Uses enrolled security level (passcode / biometrics), not hasHardwareAsync +
 * isEnrolledAsync alone — those only reflect biometrics and reject PIN-only devices.
 */
export async function authenticateDeviceOwner(
  reason = "Authenticate to reset your PhoneNap PIN"
): Promise<{ ok: boolean; error?: string }> {
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  if (level < LocalAuthentication.SecurityLevel.SECRET) {
    return {
      ok: false,
      error:
        "Set a device passcode (and Face ID / Touch ID if you use them) in system Settings first.",
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
