# 🧹 Text Cleaner

A fast, minimal web app to clean and transform messy text — built with React + Vite.

![Text Cleaner](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite) ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

### Core Cleaning
- **Trim lines** — strip leading/trailing whitespace from each line
- **Remove extra spaces** — collapse multiple spaces into one
- **Remove empty lines** — delete all blank lines
- **Limit blank lines** — max one blank line between paragraphs
- **Remove line breaks** — join all lines into a single paragraph

### Case Transform
| Option | Example |
|--------|---------|
| lowercase | `hello world` |
| UPPERCASE | `HELLO WORLD` |
| Title Case | `Hello World` |
| Sentence case | `Hello world` |
| camelCase | `helloWorld` |
| snake_case | `hello_world` |
| kebab-case | `hello-world` |

### Advanced Cleaning
- Strip HTML tags
- Remove URLs and email addresses
- Remove punctuation, numbers, or all special characters
- Normalize curly quotes and smart dashes to straight equivalents
- Remove duplicate lines

### Find & Replace
- Case-sensitive toggle
- Full regex support
- Shows match count after replacing

### Limit Warning
- Set a character or word limit
- Live progress bar with colour-coded states (green → amber → red)
- Input text turns red when over limit

### Output
- **Copy** cleaned text to clipboard with one click
- **Download** as `cleaned-text.txt`
- **Diff summary** showing how many characters/words were removed
- Live stats: characters, words, lines, and sentences for both input and output

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Khushant15/text-cleaner.git
cd text-cleaner
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## 🗂 Project Structure

```
text-cleaner/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx       # All logic and UI
    └── styles.css    # Design tokens + component styles
```

---

## 🛠 Tech Stack

- **React 19** — UI
- **Vite 5** — build tool and dev server
- **Plain CSS** — no UI library, custom design tokens
- **Inter** — font via Google Fonts

---

## 📄 License

MIT © [Khushant15](https://github.com/Khushant15)
