# SpeakIt Pro

A sleek, privacy-first text-to-speech app that runs entirely in your browser. No cloud, no API keys, no limits just your local operating system's native speech synthesis engine.

---

## What It Does

SpeakIt Pro turns any document, article, or block of text into spoken audio. Paste your text, hit **Initialize Audio**, and the app reads it back to you in natural-sounding chunks. You can scrub through parts, adjust the voice, volume, and playback speed all locally.

## Why "Pro"?

Most web TTS tools either send your text to a remote server (privacy risk) or hit Chrome's infamous **15-second utterance cap**, cutting off long sentences mid-word. SpeakIt Pro solves both:

- **100% local** uses `window.speechSynthesis`, your own OS voices. Nothing leaves the browser.
- **Smart chunking** automatically splits text into ~180-character sentence-aware pieces so nothing gets cut off, and seamlessly plays the next part when one finishes.

## Features

- 🎙️ **Voice profiles** pick from every voice your system provides (male, female, regional accents, languages).
- 🎚️ **Volume control** 0–100% with a live slider.
- ⏩ **Playback speed** 0.5x (slower) to 2.0x (double speed).
- ⏮️ **Previous / Next part** jump between text chunks.
- 🎯 **Seek bar** scrub through the document by dragging the progress slider.
- 📊 **Live counters** real-time word and character counts as you type.
- 🔔 **Status indicator** a green dot shows the local engine is ready.

## How to Use

1. Paste or type your text into the **Document Content** box.
2. Click **Initialize Audio**.
3. Pick a voice, set your volume and speed.
4. Hit **Play** (the big cyan button). Use **Pause/Resume**, **Previous**, **Next**, or drag the seek bar to navigate.

## Tech Stack

- **HTML5 / CSS3** Tailwind CSS for layout, custom dark theme.
- **Vanilla JavaScript** no frameworks, no build step.
- **Web Speech API** (`SpeechSynthesis`) the only dependency, built into every modern browser.

## Privacy Note

SpeakIt Pro is designed to be fully offline. It makes no network requests (except loading Tailwind from a CDN for styling) and never sends your text anywhere. Ideal for sensitive documents, confidential notes, or anyone who just values privacy.

## Requirements

- A modern browser (Chrome, Edge, Firefox, Safari) with speech synthesis support.
- At least one system voice installed (usually English is included by default).

## License

MIT - free to use, modify, and distribute.
