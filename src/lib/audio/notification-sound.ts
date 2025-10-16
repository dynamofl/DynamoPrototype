/**
 * Notification Sound Utility
 *
 * Provides a simple notification sound using Web Audio API.
 * Gracefully handles browser autoplay policies and audio permissions.
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context lazily
 */
function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  } catch (error) {
    console.warn('Failed to create AudioContext:', error);
    return null;
  }
}

/**
 * Play a pleasant notification sound
 * Uses Web Audio API to generate a two-tone notification sound
 */
export async function playNotificationSound(): Promise<void> {
  try {
    const context = getAudioContext();
    if (!context) {
      console.warn('AudioContext not available');
      return;
    }

    // Resume context if it's suspended (common on mobile browsers)
    if (context.state === 'suspended') {
      await context.resume();
    }

    const now = context.currentTime;

    // Create oscillator for the first tone (higher frequency)
    const oscillator1 = context.createOscillator();
    const gainNode1 = context.createGain();

    oscillator1.connect(gainNode1);
    gainNode1.connect(context.destination);

    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(800, now); // Higher pitch

    // Envelope for first tone
    gainNode1.gain.setValueAtTime(0, now);
    gainNode1.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator1.start(now);
    oscillator1.stop(now + 0.15);

    // Create oscillator for the second tone (lower frequency)
    const oscillator2 = context.createOscillator();
    const gainNode2 = context.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(context.destination);

    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(600, now + 0.1); // Lower pitch

    // Envelope for second tone
    gainNode2.gain.setValueAtTime(0, now + 0.1);
    gainNode2.gain.linearRampToValueAtTime(0.3, now + 0.11);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator2.start(now + 0.1);
    oscillator2.stop(now + 0.3);

  } catch (error) {
    // Silently fail - notification sound is a nice-to-have feature
    console.warn('Failed to play notification sound:', error);
  }
}

/**
 * Check if audio playback is likely to be allowed
 * Note: This is a best-effort check, actual playback may still fail
 */
export function canPlayAudio(): boolean {
  try {
    const context = getAudioContext();
    return context !== null && context.state !== 'suspended';
  } catch {
    return false;
  }
}
