# ChatGPT Please

A minimal Chrome extension (Manifest V3) that automatically appends "please" to the end of every prompt on ChatGPT.

## Features

- Automatically appends " please" to messages before sending
- Works on both chat.openai.com and chatgpt.com
- Smart detection to avoid duplicate "please" additions
- Comprehensive input field detection for various ChatGPT interfaces

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active on ChatGPT pages

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Content script that modifies prompts

## How it works

The extension uses a content script that:
- Detects various input field types (textarea, contenteditable divs)
- Intercepts input events and form submissions
- Appends " please" to text before sending
- Triggers appropriate events to notify ChatGPT of changes

## Development

The extension includes comprehensive debugging - check the browser console for `[ChatGPT Please]` messages to see what's happening.

## License

MIT License
