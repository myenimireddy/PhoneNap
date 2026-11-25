import * as Speech from "expo-speech";

const SETTLE_MS = 3000;
const SPEECH_FALLBACK_MS = 10000;

let speechRunId = 0;

export function invalidateSpeechRuns() {
  speechRunId += 1;
  void Speech.stop();
}

/**
 * Speaks mission text; calls onSpeechComplete once when finished (or fallback).
 * Stale cancel/onend callbacks are ignored via speechRunId.
 * Awaits Speech.stop() before speak so a pending stop cannot cancel the new utterance.
 */
export function speakMission(
  text: string,
  onSpeechComplete: () => void
): void {
  void startSpeech(text, onSpeechComplete);
}

async function startSpeech(
  text: string,
  onSpeechComplete: () => void
): Promise<void> {
  speechRunId += 1;
  const runId = speechRunId;
  let finished = false;

  try {
    await Speech.stop();
  } catch {
    // Ignore stop failures; still attempt speak.
  }

  // A newer speakMission call won the race while we awaited stop.
  if (runId !== speechRunId) return;

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
      // Invalidated runs should not settle; a newer speak already bumped id
      if (runId === speechRunId) {
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
