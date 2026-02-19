# Punjabi Transliteration Model

A client-side English-to-Punjabi transliteration app powered by a deep learning model that runs entirely in the browser using TensorFlow.js. Type English text and get real-time Punjabi (Gurmukhi) script output — no server, no API calls, complete privacy.

## Demo

Type English words and press **Spacebar** to transliterate each word to Punjabi. Edit any word and press space again to update its translation. Click a suggestion to pick an alternative.

## Architecture

### Model

- **Type**: Encoder-Decoder LSTM (sequence-to-sequence)
- **Tokenization**: Character-level for both English (28 tokens) and Punjabi (61 tokens)
- **Encoder**: Embedding(28, 512) → Bidirectional LSTM(256) → LSTM(512) with state output
- **Decoder**: Embedding(61, 512) → LSTM(512) → LSTM(512) → Dense(64, ReLU) → Dense(61, Softmax)
- **Parameters**: ~7.95M (30.35 MB)
- **Max sequence length**: 50 characters
- **Inference**: Autoregressive decoding — generates one Punjabi character at a time

### Training

- **Dataset**: [Dakshina dataset](https://github.com/google-research-datasets/dakshina) — 514,724 training pairs, 8,880 validation, 11,237 test
- **Loss**: Sparse categorical cross-entropy
- **Optimizer**: Adam
- **Callbacks**: EarlyStopping (patience=5, restore best weights), ModelCheckpoint
- **Framework**: TensorFlow / Keras (Python), converted to TensorFlow.js for browser deployment

### Suggestions

The model generates **top-2 character predictions** at each decoding step and computes all possible word combinations from those alternatives, returning the top 5 as clickable suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | TensorFlow / Keras (training), TensorFlow.js (inference) |
| Frontend | React 18, TypeScript |
| UI Framework | AWS Cloudscape Design System |
| Inference | Client-side — runs on user's CPU via TensorFlow.js |

## Project Structure

```
PunjabiTransliteration/
├── javascript-model/
│   ├── javascript.ipynb          # Training & conversion notebook
│   └── TFJS/                     # Exported TensorFlow.js model
├── ReactApp/app/
│   ├── public/model/             # TF.js model files served to browser
│   └── src/
│       ├── App.tsx               # App shell (Cloudscape AppLayout, dark mode, Flashbar)
│       ├── Components/
│       │   ├── Loading.tsx       # Model loading screen
│       │   ├── EnToPaInput.tsx   # Main transliteration UI (split-view input/output)
│       │   └── AiFunctions/
│       │       ├── AI_Functions.ts    # Transliteration & suggestion logic
│       │       └── AI_Assets/
│       │           └── VocabTokens.ts # English & Punjabi token vocabularies
│       └── index.tsx
```

## Running Locally

```bash
cd PunjabiTransliteration/ReactApp/app
npm install
npm start
```

The app opens at `http://localhost:3000`. The TensorFlow.js model (~30 MB) loads from `public/model/` on first visit.

## How It Works

1. **Model loads** — TF.js model is fetched into browser memory (~30 MB)
2. **User types English** — text stays in the input panel
3. **Spacebar triggers transliteration** — the last completed word is fed character-by-character through the encoder
4. **Decoder generates Punjabi** — one character at a time via autoregressive decoding until "end" token
5. **Output updates** — Punjabi appears in the output panel, mapped word-by-word to the English input
6. **Suggestions** — top-2 predictions per character step produce alternative word combinations

## Performance Notes

- The model runs on your **CPU** via TensorFlow.js — transliteration speed depends on your device
- Results are **cached** — translating the same word twice is instant
- Typing is **never blocked** — you can keep typing while transliteration runs in the background
- **No data leaves your browser** — everything runs client-side

## Author

**Sarbjeet Singh** — [sarbzone.com](https://www.sarbzone.com)
