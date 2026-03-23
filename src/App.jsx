import { useState, useCallback, useRef, useMemo } from 'react'

const EXAMPLE_TEXT = `   Hello   World!

This   text   has   extra    spaces.


It also has    empty lines above.

   And some lines have leading/trailing spaces.

SOME TEXT IS IN ALL CAPS
some text is in all lowercase
some Text has Mixed Case   `

export default function App() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const textareaRef = useRef(null)

  // Limit settings
  const [limitEnabled, setLimitEnabled] = useState(false)
  const [limitType, setLimitType] = useState('characters') // 'characters' | 'words'
  const [limitValue, setLimitValue] = useState(500)

  // Find & Replace
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [replaceCount, setReplaceCount] = useState(null)

  const [options, setOptions] = useState({
    trimLines: true,
    removeExtraSpaces: true,
    removeEmptyLines: false,
    removeLineBreaks: false,
    caseTransform: 'none',
    // Advanced
    removePunctuation: false,
    removeNumbers: false,
    removeSpecialChars: false,
    removeUrls: false,
    removeEmails: false,
    removeHtmlTags: false,
    removeExtraNewlines: false,
    normalizeQuotes: false,
    removeDuplicateLines: false,
  })

  const updateOption = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const cleanText = useCallback((input) => {
    if (!input) return ''
    let result = input

    if (options.removeHtmlTags) {
      result = result.replace(/<[^>]*>/g, '')
    }
    if (options.removeUrls) {
      result = result.replace(/https?:\/\/[^\s]+/g, '')
      result = result.replace(/www\.[^\s]+/g, '')
    }
    if (options.removeEmails) {
      result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    }
    if (options.trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n')
    }
    if (options.removeExtraSpaces) {
      result = result.replace(/[ \t]+/g, ' ')
    }
    if (options.removePunctuation) {
      result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?!]/g, '')
    }
    if (options.removeNumbers) {
      result = result.replace(/\d+/g, '')
    }
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s\n]/g, '')
    }
    if (options.normalizeQuotes) {
      result = result
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
    }
    if (options.removeDuplicateLines) {
      const seen = new Set()
      result = result.split('\n').filter(line => {
        const key = line.trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      }).join('\n')
    }
    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n')
    }
    if (options.removeExtraNewlines) {
      result = result.replace(/\n{3,}/g, '\n\n')
    }
    if (options.removeLineBreaks) {
      result = result.replace(/\n+/g, ' ').trim()
    }

    switch (options.caseTransform) {
      case 'lower':
        result = result.toLowerCase()
        break
      case 'upper':
        result = result.toUpperCase()
        break
      case 'title':
        result = result.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'sentence':
        result = result.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        break
      case 'camel':
        result = result.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        break
      case 'snake':
        result = result.toLowerCase().replace(/\s+/g, '_')
        break
      case 'kebab':
        result = result.toLowerCase().replace(/\s+/g, '-')
        break
      default:
        break
    }

    return result
  }, [options])

  const cleanedText = useMemo(() => cleanText(text), [text, cleanText])

  const wordCount = useCallback((str) =>
    str.trim() ? str.trim().split(/\s+/).length : 0
  , [])

  const inputStats = useMemo(() => ({
    characters: text.length,
    words: wordCount(text),
    lines: text ? text.split('\n').length : 0,
    sentences: text.trim() ? text.split(/[.!?]+\s/).filter(Boolean).length : 0,
  }), [text, wordCount])

  const outputStats = useMemo(() => ({
    characters: cleanedText.length,
    words: wordCount(cleanedText),
    lines: cleanedText ? cleanedText.split('\n').length : 0,
    sentences: cleanedText.trim() ? cleanedText.split(/[.!?]+\s/).filter(Boolean).length : 0,
  }), [cleanedText, wordCount])

  // Limit warning logic
  const limitStatus = useMemo(() => {
    if (!limitEnabled) return null
    const current = limitType === 'characters' ? inputStats.characters : inputStats.words
    const pct = (current / limitValue) * 100
    if (pct >= 100) return { level: 'over', pct: Math.min(pct, 100), current }
    if (pct >= 85) return { level: 'warn', pct, current }
    return { level: 'ok', pct, current }
  }, [limitEnabled, limitType, limitValue, inputStats])

  const handleFindReplace = () => {
    if (!findText) return
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const pattern = useRegex ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
      const matches = (text.match(pattern) || []).length
      setText(prev => prev.replace(pattern, replaceText))
      setReplaceCount(matches)
      setTimeout(() => setReplaceCount(null), 2500)
    } catch (e) {
      setReplaceCount(-1)
      setTimeout(() => setReplaceCount(null), 2500)
    }
  }

  const handleCopy = async () => {
    if (!cleanedText) return
    try {
      await navigator.clipboard.writeText(cleanedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (!cleanedText) return
    const blob = new Blob([cleanedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleaned-text.txt'
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1500)
  }

  const clearAll = () => {
    setText('')
    if (textareaRef.current) textareaRef.current.focus()
  }

  const loadExample = () => setText(EXAMPLE_TEXT)

  return (
    <div className="app">
      <header className="header">
        <h1>Text Cleaner</h1>
        <p className="subtitle">Clean messy text instantly</p>
      </header>

      <main className="main">
        {/* ── Input Panel ── */}
        <div className="panel input-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>Input</span>
              <div className="stats">
                <span>{inputStats.characters} chars</span>
                <span>{inputStats.words} words</span>
                <span>{inputStats.lines} lines</span>
                <span>{inputStats.sentences} sent.</span>
              </div>
            </div>
            <div className="panel-actions">
              <button className="btn-ghost" onClick={loadExample}>Example</button>
              {text && <button className="btn-ghost" onClick={clearAll}>Clear</button>}
            </div>
          </div>

          {/* Limit bar */}
          {limitEnabled && limitStatus && (
            <div className={`limit-bar limit-${limitStatus.level}`}>
              <div className="limit-track">
                <div className="limit-fill" style={{ width: `${limitStatus.pct}%` }} />
              </div>
              <span className="limit-label">
                {limitStatus.current} / {limitValue} {limitType}
                {limitStatus.level === 'over' && ' — limit exceeded'}
              </span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your messy text here..."
            spellCheck={false}
            aria-label="Input text"
            className={limitStatus?.level === 'over' ? 'over-limit' : ''}
          />
        </div>

        {/* ── Options Panel ── */}
        <div className="options-panel">
          <h2 className="section-title">Cleaning Options</h2>

          <div className="options-grid">
            {[
              { key: 'trimLines', label: 'Trim lines', desc: 'Remove leading/trailing spaces per line' },
              { key: 'removeExtraSpaces', label: 'Remove extra spaces', desc: 'Collapse multiple spaces to one' },
              { key: 'removeEmptyLines', label: 'Remove empty lines', desc: 'Delete blank lines' },
              { key: 'removeExtraNewlines', label: 'Limit blank lines', desc: 'Max 1 blank line between paragraphs' },
              { key: 'removeLineBreaks', label: 'Remove line breaks', desc: 'Join all lines into one paragraph' },
            ].map(({ key, label, desc }) => (
              <label className="option-row" key={key}>
                <input type="checkbox" checked={options[key]} onChange={(e) => updateOption(key, e.target.checked)} />
                <div className="option-content">
                  <span className="option-label">{label}</span>
                  <span className="option-desc">{desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Case Transform */}
          <div className="case-section">
            <span className="setting-label">Case Transform</span>
            <div className="case-options">
              {[
                { value: 'none', label: 'None' },
                { value: 'lower', label: 'lowercase' },
                { value: 'upper', label: 'UPPERCASE' },
                { value: 'title', label: 'Title Case' },
                { value: 'sentence', label: 'Sentence case' },
                { value: 'camel', label: 'camelCase' },
                { value: 'snake', label: 'snake_case' },
                { value: 'kebab', label: 'kebab-case' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`case-btn ${options.caseTransform === opt.value ? 'active' : ''}`}
                  onClick={() => updateOption('caseTransform', opt.value)}
                  aria-pressed={options.caseTransform === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <div className="case-section">
            <span className="setting-label">Advanced</span>
            <div className="options-grid">
              {[
                { key: 'removeHtmlTags', label: 'Strip HTML tags', desc: 'Remove all <tag> markup' },
                { key: 'removeUrls', label: 'Remove URLs', desc: 'Strip http/www links' },
                { key: 'removeEmails', label: 'Remove emails', desc: 'Strip email addresses' },
                { key: 'removePunctuation', label: 'Remove punctuation', desc: 'Strip . , ! ? etc.' },
                { key: 'removeNumbers', label: 'Remove numbers', desc: 'Strip all digits' },
                { key: 'removeSpecialChars', label: 'Remove special chars', desc: 'Keep only letters, numbers, spaces' },
                { key: 'normalizeQuotes', label: 'Normalize quotes', desc: 'Curly → straight quotes & dashes' },
                { key: 'removeDuplicateLines', label: 'Remove duplicate lines', desc: 'Keep only unique lines' },
              ].map(({ key, label, desc }) => (
                <label className="option-row" key={key}>
                  <input type="checkbox" checked={options[key]} onChange={(e) => updateOption(key, e.target.checked)} />
                  <div className="option-content">
                    <span className="option-label">{label}</span>
                    <span className="option-desc">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Find & Replace */}
          <div className="case-section">
            <button
              className="collapsible-toggle"
              onClick={() => setShowFindReplace(v => !v)}
              aria-expanded={showFindReplace}
            >
              <span className="setting-label" style={{ margin: 0 }}>Find &amp; Replace</span>
              <span className="toggle-arrow">{showFindReplace ? '▲' : '▼'}</span>
            </button>

            {showFindReplace && (
              <div className="find-replace">
                <div className="fr-toggles">
                  <label className="fr-toggle">
                    <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} />
                    <span>Case sensitive</span>
                  </label>
                  <label className="fr-toggle">
                    <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} />
                    <span>Regex</span>
                  </label>
                </div>
                <input
                  className="fr-input"
                  placeholder="Find…"
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                />
                <input
                  className="fr-input"
                  placeholder="Replace with…"
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                />
                <div className="fr-actions">
                  <button className="btn-primary" onClick={handleFindReplace} disabled={!findText || !text}>
                    Replace all
                  </button>
                  {replaceCount !== null && (
                    <span className={`fr-feedback ${replaceCount === -1 ? 'error' : ''}`}>
                      {replaceCount === -1
                        ? 'Invalid regex'
                        : replaceCount === 0
                          ? 'No matches'
                          : `${replaceCount} replaced`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Character / Word Limit */}
          <div className="case-section">
            <div className="limit-header">
              <span className="setting-label" style={{ margin: 0 }}>Limit Warning</span>
              <label className="fr-toggle">
                <input type="checkbox" checked={limitEnabled} onChange={e => setLimitEnabled(e.target.checked)} />
                <span>Enable</span>
              </label>
            </div>
            {limitEnabled && (
              <div className="limit-controls">
                <div className="limit-type-btns">
                  {['characters', 'words'].map(t => (
                    <button
                      key={t}
                      className={`case-btn ${limitType === t ? 'active' : ''}`}
                      onClick={() => setLimitType(t)}
                    >{t}</button>
                  ))}
                </div>
                <input
                  type="number"
                  className="fr-input"
                  min="1"
                  value={limitValue}
                  onChange={e => setLimitValue(Number(e.target.value))}
                  placeholder="Limit"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Output Panel ── */}
        <div className="panel output-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>Output</span>
              <div className="stats">
                <span>{outputStats.characters} chars</span>
                <span>{outputStats.words} words</span>
                <span>{outputStats.lines} lines</span>
                <span>{outputStats.sentences} sent.</span>
              </div>
            </div>
            <div className="panel-actions">
              <button
                className={`btn-ghost ${downloaded ? 'downloaded' : ''}`}
                onClick={handleDownload}
                disabled={!cleanedText}
                title="Download as .txt"
              >
                {downloaded ? '✓ Saved' : '↓ Download'}
              </button>
              <button
                className={`btn-primary ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                disabled={!cleanedText}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Diff summary */}
          {text && cleanedText !== text && (
            <div className="diff-summary">
              <span className={outputStats.characters < inputStats.characters ? 'diff-reduced' : 'diff-added'}>
                {Math.abs(outputStats.characters - inputStats.characters)} chars {outputStats.characters < inputStats.characters ? 'removed' : 'added'}
              </span>
              {outputStats.words !== inputStats.words && (
                <span className="diff-reduced">
                  {Math.abs(outputStats.words - inputStats.words)} words {outputStats.words < inputStats.words ? 'removed' : 'added'}
                </span>
              )}
            </div>
          )}

          <textarea
            value={cleanedText}
            readOnly
            placeholder="Cleaned text will appear here..."
            aria-label="Output text"
          />
        </div>
      </main>

      <footer className="footer">
        <a href="https://github.com/Khushant15" target="_blank" rel="noopener noreferrer">
          Coded by @Khushant15
        </a>
      </footer>
    </div>
  )
}