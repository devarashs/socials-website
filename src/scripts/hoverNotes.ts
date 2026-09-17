/**
 * Retro "bleep" notes when a card is hovered or keyboard-focused.
 *
 * Synthesized with the Web Audio API — a square-wave oscillator, the sound of
 * 8-bit hardware — so there are no audio files to download.
 *
 * Markup contract:
 *   [data-hover-note]    an element that plays a note. Notes are assigned by
 *                        document order, so neighbours are neighbours in pitch.
 *   [data-sound-toggle]  a <button hidden> that mutes/unmutes. Revealed only
 *                        where audio is available. Contains [data-sound-label].
 *
 * Browser autoplay policy shapes the design: an AudioContext may only start
 * after a user gesture, and hovering is not one. So the context is created on
 * the visitor's first pointerdown/keydown anywhere on the page, and hovers
 * before that are silently ignored. Creating it earlier would just produce a
 * suspended context and a console warning.
 */

/**
 * C major pentatonic, C4 upward. A pentatonic scale has no dissonant pairs, so
 * sweeping the pointer across the cards in any order still sounds like a tune.
 *
 * Starts at C4 rather than the brighter C5 because every bleep also jumps an
 * octave: from C5 the last cards would chirp at around 3 kHz, where a square
 * wave turns from "retro" to piercing.
 */
const NOTE_FREQUENCIES_HZ = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

/** Square waves are harsh; this keeps the bleep well below speech volume. */
const PEAK_GAIN = 0.045;
const ATTACK_SECONDS = 0.005;
/** The pitch jumps an octave part-way through: the classic "coin" chirp. */
const OCTAVE_JUMP_AFTER_SECONDS = 0.055;
const NOTE_LENGTH_SECONDS = 0.16;
/** exponentialRamp cannot reach 0, so the tail fades to this instead. */
const SILENCE_GAIN = 0.0001;

const MUTED_STORAGE_KEY = 'hover-notes-muted';

/** Everything this module needs from the outside world, injectable for testing. */
export interface HoverNotesEnvironment {
  /** Subtree holding the cards and the toggle, usually `document`. */
  root: Document;
  /** Creates the audio context. `undefined` means the browser has no Web Audio. */
  createAudioContext: (() => AudioContext) | undefined;
  /** Where the mute preference persists. `undefined` when storage is blocked. */
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined;
}

/** Wires hover notes and the mute toggle. Does nothing without Web Audio. */
export function enableHoverNotes({ root, createAudioContext, storage }: HoverNotesEnvironment): void {
  if (!createAudioContext) return;

  let audioContext: AudioContext | undefined;
  let isMuted = readMutedPreference(storage);

  const unlockAudio = (): void => {
    audioContext ??= createAudioContext();
  };
  // Capture phase, so a card's own click handler or a new tab cannot preempt it.
  root.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
  root.addEventListener('keydown', unlockAudio, { capture: true, passive: true });

  const playNoteAt = (noteIndex: number): void => {
    if (isMuted || !audioContext) return;
    // A context created during a gesture can still be suspended by the browser
    // (tab was backgrounded, for instance). resume() is a no-op when running.
    void audioContext.resume();
    playBleep(audioContext, NOTE_FREQUENCIES_HZ[noteIndex % NOTE_FREQUENCIES_HZ.length]!);
  };

  root.querySelectorAll<HTMLElement>('[data-hover-note]').forEach((card, noteIndex) => {
    card.addEventListener('pointerenter', (event) => {
      // Touch has no hover: there, pointerenter fires on tap, as the visitor is
      // already leaving. A bleep at that moment is just noise.
      if (event.pointerType === 'touch') return;
      playNoteAt(noteIndex);
    });

    card.addEventListener('focusin', (event) => {
      // Moving between two controls inside one card is not a new arrival.
      if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
      // Only keyboard focus. Mouse focus already bleeped on pointerenter.
      if (event.target instanceof Element && event.target.matches(':focus-visible')) {
        playNoteAt(noteIndex);
      }
    });
  });

  const toggle = root.querySelector<HTMLButtonElement>('button[data-sound-toggle]');
  const toggleLabel = toggle?.querySelector<HTMLElement>('[data-sound-label]');
  if (!toggle || !toggleLabel) return;

  const renderToggle = (): void => {
    toggle.setAttribute('aria-pressed', String(!isMuted));
    toggleLabel.textContent = isMuted ? 'Off' : 'On';
  };

  toggle.addEventListener('click', () => {
    isMuted = !isMuted;
    writeMutedPreference(storage, isMuted);
    renderToggle();
    // Confirms the change by ear; this click was itself the unlocking gesture.
    if (!isMuted) playNoteAt(0);
  });

  renderToggle();
  toggle.hidden = false;
}

/** One square-wave bleep: fast attack, octave jump, exponential fade. */
function playBleep(audioContext: AudioContext, frequencyHz: number): void {
  const startTime = audioContext.currentTime;
  const endTime = startTime + NOTE_LENGTH_SECONDS;

  const oscillator = audioContext.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequencyHz, startTime);
  oscillator.frequency.setValueAtTime(frequencyHz * 2, startTime + OCTAVE_JUMP_AFTER_SECONDS);

  // Starting from silence and ramping both ways avoids the click a
  // hard-gated oscillator makes.
  const envelope = audioContext.createGain();
  envelope.gain.setValueAtTime(SILENCE_GAIN, startTime);
  envelope.gain.linearRampToValueAtTime(PEAK_GAIN, startTime + ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(SILENCE_GAIN, endTime);

  oscillator.connect(envelope).connect(audioContext.destination);
  oscillator.start(startTime);
  // Stopped nodes are garbage-collected; nothing accumulates per hover.
  oscillator.stop(endTime);
}

function readMutedPreference(storage: HoverNotesEnvironment['storage']): boolean {
  try {
    return storage?.getItem(MUTED_STORAGE_KEY) === 'true';
  } catch {
    // Storage can throw when cookies are blocked. Sound simply defaults to on.
    return false;
  }
}

function writeMutedPreference(storage: HoverNotesEnvironment['storage'], isMuted: boolean): void {
  try {
    storage?.setItem(MUTED_STORAGE_KEY, String(isMuted));
  } catch {
    // Same case as above: the toggle still works for this visit, it just
    // will not be remembered.
  }
}
