// Luxury Gold Audio Synthesizer Engine
// Powered by howler.js to supply pristine, gold-themed luxury chimes.
// Generates custom WAV buffers dynamically in memory to guarantee 100% crash-free offline compatibility
// with zero dependencies on remote asset servers, CORS issues, or broken links.

import { Howl } from 'howler';

// Helper to write ASCII strings to DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Dynamically synthesizes a delicate luxury chime with rich overtones as a WAV data blob URL
function generateLuxuryChimeWav(fundamentalFreq: number, duration: number, isMajorChord: boolean): string {
  const sampleRate = 16000; // 16kHz for clean, light high frequency resolution
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF container header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  
  // Format subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample
  
  // Data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true); // Subchunk2Size

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Luxury chime sound design: Pure fundamental wave layered with harmonious golden overtones
    let sample = 0;
    
    if (isMajorChord) {
      // Sparkling Golden Major Chord triad (e.g. Fundamental, 3rd, 5th, and a high shimmer)
      sample += Math.sin(2 * Math.PI * fundamentalFreq * t) * 0.50; // Fundamental
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 1.25) * t) * 0.25; // Major Third
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 1.5) * t) * 0.15; // Fifth
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 2.0) * t) * 0.10; // Octave shimmer
    } else {
      // Deep Golden Solitary Cathedral Bell (Deeper resonance and rich partial overtones)
      sample += Math.sin(2 * Math.PI * fundamentalFreq * t) * 0.60;
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 1.498) * t) * 0.20; // Perfect fifth bell ring
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 2.0) * t) * 0.12; 
      sample += Math.sin(2 * Math.PI * (fundamentalFreq * 3.01) * t) * 0.08; // High metallic strike note
    }

    // High crystalline envelope decay
    const decayMultiplier = isMajorChord
      ? Math.exp(-t * 2.8)  // Fast sparkling decay for user reservation sparkle
      : Math.exp(-t * 1.6); // Slower, deeper ringing decay for official admin confirmations

    sample = sample * decayMultiplier;

    // Direct amplification matching peak 16-bit safe range (avoiding clipping)
    const intSample = Math.min(1, Math.max(-1, sample)) * 26000;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Generate the beautiful, pristine luxury-themed sound chimes on engine load
const reserveChimeUrl = generateLuxuryChimeWav(1318.51, 1.2, true);  // Sparkling 1.2s E6 Major Triad
const confirmChimeUrl = generateLuxuryChimeWav(783.99, 2.2, false);  // Stronger, grander 2.2s G5 Cathedral Bell

// Initialize the Howler audio instances
const reserveHowl = new Howl({
  src: [reserveChimeUrl],
  format: ['wav'],
  volume: 0.65
});

const confirmHowl = new Howl({
  src: [confirmChimeUrl],
  format: ['wav'],
  volume: 0.85
});

class GoldAudioEngine {
  // Plays a beautiful dual-tone sparkling luxury gold chime
  // Perfect for successful reservations
  praiseSparkle() {
    try {
      // Play through howler.js sound system
      if (reserveHowl.state() === 'unloaded') {
        reserveHowl.load();
      }
      reserveHowl.stop();
      reserveHowl.play();
    } catch (e) {
      console.warn('Audio play failure:', e);
    }
  }

  // Plays a deeper, highly satisfying golden resonance bell chord
  // Perfect for admin confirming reservations/payments
  praiseGrandBell() {
    try {
      // Play through howler.js sound system
      if (confirmHowl.state() === 'unloaded') {
        confirmHowl.load();
      }
      confirmHowl.stop();
      confirmHowl.play();
    } catch (e) {
      console.warn('Audio play failure:', e);
    }
  }
}

export const luxuryAudio = new GoldAudioEngine();
