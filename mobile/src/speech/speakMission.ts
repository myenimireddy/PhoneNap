import * as Speech from "expo-speech";

const SETTLE_MS = 3000;
const SPEECH_FALLBACK_MS = 10000;

let speechRunId = 0;

export function invalidateSpeechRuns() {
  speechRunId += 1;
  Speech.stop();
}

/**
 * Speaks mission text; calls onSpeechComplete once when finished (or fallback).
 * Stale cancel/onend callbacks are ignored via speechRunId.
 */
export function speakMission(
  text: string,
  onSpeechComplete: () => void
): void {
  invalidateSpeechRuns();
  const runId = speechRunId;
  let finished = false;

  const complete = () => {
    if (runId !== speechRunId || finished) return;
    finished = true;
    onSpeechComplete();
  };

  const fallback = setTimeout(complete, SPEECH_FALLBACK_MS);

  Speech.speak(text, {
    rate: 0.92,
    onDone: () => {
      clearTimeout(fallback);
      complete();
    },
    onStopped: () => {
      clearTimeout(fallback);
      // Invalidated runs should not settle; new speakMission already bumped id
      if (runId === speechRunId) {
        // Stopped without a new run completing — treat as done for settle
        complete();
      }
    },
    onError: () => {
      clearTimeout(fallback);
      complete();
    },
  });
}

export function scheduleSettle(
  onSettle: () => void
): ReturnType<typeof setTimeout> {
  return setTimeout(onSettle, SETTLE_MS);
}
