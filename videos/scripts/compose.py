"""Compose the Gumroad ad's soundtrack from scratch: 128 BPM, F major, 8 bars, 15.0 s.

    uv run --with numpy --with scipy python3 scripts/compose.py out/cues.json public/audio/gumroad/music.wav

Everything is synthesized here, so there is no license to clear: kick, clap,
hats, an offbeat bass, marimba-like plucks, a soft pad, and the liquid sound
effects. Each effect is placed so its transient lands on its cue from
cues.ts (exported by scripts/cues-json.ts).
"""

import json
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 48000
cues = json.load(open(sys.argv[1]))
out_path = sys.argv[2]
BEAT = 60 / cues["bpm"]
N = int(round(cues["duration"] * SR))
buses = {name: np.zeros((2, N)) for name in ("drums", "bass", "keys", "pad", "sfx")}
rng = np.random.default_rng(7)


def at(bar, beat=1, fraction=0.0):
    return ((bar - 1) * 4 + (beat - 1) + fraction) * BEAT


def span(seconds):
    return np.arange(int(seconds * SR)) / SR


def midi(note):
    return 440 * 2 ** ((note - 69) / 12)


def filt(signal, kind, freq, order=2):
    return sosfilt(butter(order, freq, btype=kind, fs=SR, output="sos"), signal)


def noise(seconds):
    return rng.standard_normal(int(seconds * SR))


def place(bus, signal, when, gain=1.0, pan=0.0):
    start = int(round(when * SR))
    if start < 0:
        signal, start = signal[-start:], 0
    if start >= N:
        return
    part = signal[: N - start]
    angle = (pan + 1) * np.pi / 4
    buses[bus][0, start : start + len(part)] += part * gain * np.cos(angle) * np.sqrt(2)
    buses[bus][1, start : start + len(part)] += part * gain * np.sin(angle) * np.sqrt(2)


def sweep(f0, f1, t, length):
    """Phase of an exponential pitch sweep from f0 to f1 over `length` seconds."""
    freq = f0 * (f1 / f0) ** np.minimum(t / length, 1)
    return 2 * np.pi * np.cumsum(freq) / SR


# Drums ---------------------------------------------------------------------

def kick():
    t = span(0.4)
    body = np.sin(sweep(170, 48, t, 0.09)) * np.exp(-t * 7.5)
    click = filt(noise(0.4), "highpass", 1500) * np.exp(-t * 400) * 0.3
    return np.tanh(1.6 * (body + click))


def clap():
    t = span(0.35)
    band = filt(noise(0.35), "bandpass", [900, 3200])
    env = sum((t >= d) * np.exp(-np.maximum(t - d, 0) * 150) for d in (0.0, 0.011))
    env += (t >= 0.022) * np.exp(-np.maximum(t - 0.022, 0) * 16)
    return band * env * 0.8


def hat(open_=False):
    length = 0.22 if open_ else 0.05
    t = span(length)
    return filt(noise(length), "highpass", 7000) * np.exp(-t * (13 if open_ else 70))


def crash():
    t = span(1.8)
    return filt(noise(1.8), "highpass", 4000) * np.exp(-t * 2.4) * 0.6


# Tonal ---------------------------------------------------------------------

def saw(freq, t):
    return 2 * ((freq * t) % 1.0) - 1


def bass(note, length):
    t = span(length)
    f = midi(note)
    tone = filt(0.55 * saw(f, t) + 0.8 * np.sin(2 * np.pi * f * t), "lowpass", 750)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 2.5) * np.clip((length - t) / 0.02, 0, 1)
    return tone * env


def pluck(note, length=0.6):
    """Marimba-ish, with a tiny pitch drop on the attack, like a bubble."""
    t = span(length)
    f = midi(note) * (1 + 0.03 * np.exp(-t * 60))
    phase = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(phase) + 0.25 * np.sin(2 * phase) * np.exp(-t * 12) + 0.1 * np.sin(4 * phase) * np.exp(-t * 25)
    return tone * np.minimum(1, t / 0.002) * np.exp(-t * 6.5)


def pad(notes, length):
    t = span(length)
    tone = sum(saw(midi(n + detune), t) for n in notes for detune in (-0.08, 0.08))
    env = np.minimum(1, t / 0.12) * np.clip((length - t) / 0.2, 0, 1)
    return filt(tone, "lowpass", 1400) * env / (2 * len(notes))


# Liquid sound effects ------------------------------------------------------

def bloop(f0, f1, length):
    t = span(length)
    return np.sin(sweep(f0, f1, t, length)) * np.minimum(1, t / 0.003) * np.exp(-t * 28)


def pop():
    t = span(0.08)
    return np.sin(sweep(950, 380, t, 0.05)) * np.exp(-t * 55) + filt(noise(0.08), "highpass", 3000) * np.exp(-t * 400) * 0.2


def tick():
    t = span(0.05)
    return (np.sin(2 * np.pi * 2400 * t) + 0.4 * np.sin(2 * np.pi * 3600 * t)) * np.exp(-t * 110)


def click():
    t = span(0.04)
    return filt(noise(0.04), "highpass", 2500) * np.exp(-t * 300) + 0.5 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 200)


def chaching():
    """A register: a short metallic "cha", then a bright "ching" that rings."""
    t = span(1.2)
    cha = filt(noise(1.2), "bandpass", [3500, 9000]) * np.exp(-t * 45) * 0.5
    ring = np.zeros_like(t)
    delay = 0.07
    tail = np.maximum(t - delay, 0)
    for freq, amp in ((2093, 1.0), (2637, 0.7), (3136, 0.55), (4186, 0.35), (5274, 0.2)):
        ring += amp * (np.sin(2 * np.pi * freq * tail) + np.sin(2 * np.pi * freq * 1.003 * tail)) / 2
    ring *= (t >= delay) * np.exp(-tail * 4.2) * np.minimum(1, tail / 0.002)
    return cha + 0.45 * ring


def glug():
    """Four rising bloops on sixteenths: the cover filling up."""
    out = np.zeros(int(BEAT * 1.6 * SR))
    for i, f0 in enumerate((240, 300, 370, 460)):
        drop = bloop(f0, f0 * 2.4, 0.11) * (1 - 0.12 * i)
        start = int(i * BEAT / 4 * SR)
        out[start : start + len(drop)] += drop
    return out


def whoosh():
    """Noise through a lowpass that opens and closes: the pink flood."""
    length = 0.9
    t = span(length)
    env = np.minimum(1, t / 0.18) ** 2 * np.exp(-np.maximum(t - 0.18, 0) * 5)
    cutoff = 400 + 5200 * np.sin(np.pi * np.minimum(t / 0.6, 1)) ** 2
    source = noise(length)
    out = np.zeros_like(source)
    state = 0.0
    for i, c in enumerate(cutoff):
        a = 1 - np.exp(-2 * np.pi * c / SR)
        state += a * (source[i] - state)
        out[i] = state
    return out * env * 2.2


SFX = {
    "bloopLow": lambda: bloop(220, 720, 0.16),
    "bloopUp": lambda: bloop(420, 1300, 0.12),
    "pop": pop,
    "tick": tick,
    "click": click,
    "chaching": chaching,
    "glug": glug,
    "whoosh": whoosh,
}

# Arrangement -----------------------------------------------------------------

CHORDS = [(65, 69, 72), (64, 67, 72), (62, 65, 69), (62, 65, 70), (65, 69, 72), (64, 67, 72), (62, 65, 70), (65, 69, 72)]  # F C Dm Bb F C Bb F
ROOTS = [41, 48, 50, 46, 41, 48, 46, 41]
ARP = [0, 1, 2, 3, 2, 1, 2, 1]  # chord tones, 3 is the root an octave up
HOOK = {5: [84, 81, 77, 81, 84, 86, 84, 81], 6: [79, 76, 72, 76, 79, 81, 79, 76]}

kicks = []
for bar in range(1, 9):
    chord = CHORDS[bar - 1]
    beats = [1, 2, 3, 4] if bar <= 6 else ([1, 3] if bar == 7 else [1])
    for beat in beats:
        kicks.append(at(bar, beat))
        place("drums", kick(), at(bar, beat), 0.85 if bar == 1 else 1.0)
    if 2 <= bar <= 7:
        for beat in (2, 4):
            place("drums", clap(), at(bar, beat), 0.55 if bar == 7 else 0.8, 0.05)
    if bar <= 7:
        for beat in range(1, 5):
            loud = 0.18 if bar == 1 else 0.3
            place("drums", hat(open_=bar in (5, 6)), at(bar, beat, 0.5), loud, 0.25)
            if bar in (5, 6):
                for sixteenth in (0.25, 0.75):
                    place("drums", hat(), at(bar, beat, sixteenth), 0.12, -0.25)
    if bar in (5, 6, 8):
        place("drums", crash(), at(bar), 0.55, -0.1)

    if 2 <= bar <= 7:
        for beat in range(1, 5):
            place("bass", bass(ROOTS[bar - 1] + (12 if beat % 2 == 0 else 0), BEAT * 0.4), at(bar, beat, 0.5), 0.9)
        if bar in (5, 6):
            place("bass", bass(ROOTS[bar - 1], BEAT * 0.3), at(bar), 0.9)
    if bar == 8:
        place("bass", bass(ROOTS[7], BEAT * 3), at(8), 1.0)

    notes = [n + 12 for n in chord] + [chord[0] + 24]
    if bar < 8:
        for step, index in enumerate(ARP):
            place("keys", pluck(notes[index]), at(bar, 1, step / 2), 0.55 if bar > 1 else 0.45, -0.3 + 0.2 * (step % 2))
    else:
        for n in notes:
            place("keys", pluck(n, 1.6) * 0.6, at(8), 0.6)
    if bar in HOOK:
        for step, note in enumerate(HOOK[bar]):
            place("keys", pluck(note, 0.4), at(bar, 1, step / 2), 0.45, 0.3)

    place("pad", pad(chord, BEAT * 4 if bar < 8 else BEAT * 3.2), at(bar), 1.0)

# A noise riser into the flood.
riser_length = at(6) - at(5, 3)
t = span(riser_length)
place("drums", filt(noise(riser_length), "highpass", 3000) * (t / riser_length) ** 2 * 0.35, at(5, 3))

# Clap roll into the sale.
for i, fraction in enumerate((0, 0.25, 0.5, 0.75)):
    place("drums", clap(), at(4, 4, fraction), 0.35 + 0.15 * i)

peaks = {}
for effect in cues["sfx"]:
    sound = SFX[effect["name"]]()
    onset = int(np.argmax(np.abs(sound) > 0.5 * np.abs(sound).max())) / SR
    peaks[effect["name"]] = round(onset, 4)
    place("sfx", sound / np.abs(sound).max(), effect["at"] - onset, effect["gain"])

# Sidechain: bass, pad and keys duck under every kick.
time = np.arange(N) / SR
duck = np.ones(N)
for k in kicks:
    after = time >= k
    duck[after] = np.minimum(duck[after], 1 - 0.55 * np.exp(-(time[after] - k) * 10))

gains = {"drums": 0.8, "bass": 0.55, "keys": 0.35, "pad": 0.2, "sfx": 1.0}
master = sum(buses[name] * gains[name] * (duck if name in ("bass", "pad") else (1 - 0.4 * (1 - duck)) if name == "keys" else 1) for name in buses)
master = np.tanh(master * 1.1)


def loudness(stereo):
    """Integrated loudness in LUFS (ITU-R BS.1770: K-weighting, 400 ms blocks, both gates)."""
    k = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], stereo, axis=1)
    k = lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], k, axis=1)
    size, hop = int(0.4 * SR), int(0.1 * SR)
    power = np.array([(k[:, i : i + size] ** 2).mean(axis=1).sum() for i in range(0, k.shape[1] - size, hop)])
    blocks = power[-0.691 + 10 * np.log10(power) > -70]
    blocks = blocks[-0.691 + 10 * np.log10(blocks) > -0.691 + 10 * np.log10(blocks.mean()) - 10]
    return -0.691 + 10 * np.log10(blocks.mean())


# Social platforms play at about -14 LUFS: land there instead of being turned down.
master *= 10 ** ((-14 - loudness(master)) / 20)
assert np.abs(master).max() < 0.89, "true peak above -1 dBFS"
master[:, : int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
fade = int(0.35 * SR)
master[:, -fade:] *= np.linspace(1, 0, fade) ** 2

with wave.open(out_path, "wb") as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(SR)
    out.writeframes((master.T * 32767).astype("<i2").tobytes())
print(f"{out_path}: {N / SR:.3f} s, {loudness(master):.1f} LUFS, peak {20 * np.log10(np.abs(master).max()):.1f} dBFS, sfx onsets {peaks}")
