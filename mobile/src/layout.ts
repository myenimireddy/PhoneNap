import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { spacing } from "./theme";

/** Design reference: iPhone 14-class frame. */
const BASE_W = 390;
const BASE_H = 844;

/**
 * Shared responsive metrics for PhoneNap screens.
 * Scales type/spacing with device size while keeping thumbs usable.
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const scale = clamp(shortest / BASE_W, 0.88, 1.22);
    const vScale = clamp(height / BASE_H, 0.82, 1.15);
    const pagePad = Math.max(spacing.md, Math.round(spacing.lg * scale));
    const contentMax = Math.min(width - pagePad * 2, 440);
    const isNarrow = width < 360;
    const isShort = height < 720;
    const isTall = height >= 900;
    const isWidePhone = width >= 420;

    const space = (n: number) => Math.round(n * scale);
    const font = (n: number) => Math.round(n * scale);
    const vert = (n: number) => Math.round(n * vScale);

    return {
      width,
      height,
      scale,
      vScale,
      pagePad,
      contentMax,
      isNarrow,
      isShort,
      isTall,
      isWidePhone,
      space,
      font,
      vert,
      /**
       * Small content inset only. App SafeAreaProvider/SafeAreaView clears
       * system bars — do not stack a large top gap on headers.
       */
      topPad: spacing.xs,
      bottomPad: vert(isShort ? spacing.md : spacing.lg),
    };
  }, [width, height]);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
