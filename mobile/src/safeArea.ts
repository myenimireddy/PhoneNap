import { Platform, StatusBar } from "react-native";

/**
 * Top inset under the system status bar.
 * RN SafeAreaView does not pad Android status bars (esp. edge-to-edge),
 * so we add StatusBar.currentHeight there; iOS relies on SafeAreaView.
 */
export function statusBarTopInset(): number {
  if (Platform.OS !== "android") return 0;
  return StatusBar.currentHeight ?? 24;
}
