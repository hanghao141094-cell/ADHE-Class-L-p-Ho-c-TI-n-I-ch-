/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlayingAmbient = false;
  private ambientInterval: any = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playAmbient() {
    this.init();
    if (!this.ctx || this.isPlayingAmbient) return;
    this.isPlayingAmbient = true;

    // Start a gentle pentatonic melodic loop
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C
    
    const playNote = () => {
      if (!this.ctx || !this.isPlayingAmbient) return;
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 1); // very quiet
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 4);
    };

    // Play a note every 2.5 seconds
    playNote();
    this.ambientInterval = setInterval(playNote, 2500);
  }

  stopAmbient() {
    this.isPlayingAmbient = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  playStarChime() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Play a quick ascending arpeggio for rewards
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440.00, 554.37, 659.25, 880.00]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  playError() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.3);
  }
}

export const audioSynth = new AudioSynthesizer();
