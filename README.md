# ChatGPT Pager
[Download link](https://chromewebstore.google.com/detail/jkpmmncamhbafgmklfdgfcmojpjffnbh?utm_source=item-share-cb)
![ChatGPT Pager Demo](https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20250820204225.png)

Transform your long ChatGPT conversations into organized, searchable pages. Never lose track of important Q&A pairs again! 🚀

## 🎯 What It Does

Turn endless scrolling into organized pages. ChatGPT Pager automatically groups your questions and answers, making it easy to:
- **Find specific conversations** with instant search
- **Navigate large chats** with numbered pagination  
- **Review answers** in a clean, distraction-free view
- **Jump between topics** without losing your place

## 📦 Installation

### Option 1: Chrome Web Store (Recommended)
*Coming soon - extension is pending review*

### Option 2: Manual Installation
1. **Download** this repository as a ZIP file
2. **Extract** the ZIP to a folder on your computer
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable Developer mode** (toggle in top-right corner)
5. **Click "Load unpacked"** and select the extracted folder
6. **Visit ChatGPT** - you'll see a small dock button in the bottom-right corner!

## 🚀 How to Use

### Getting Started
1. **Open any ChatGPT conversation** at [chat.openai.com](https://chat.openai.com) or [chatgpt.com](https://chatgpt.com)
2. **Look for the green dock button** in the bottom-right corner
3. **Click it** to open the ChatGPT Pager panel

### Main Features

#### 📄 **Browse Your Conversation**
- Conversations are automatically split into pages (10 Q&A pairs per page)
- Use pagination buttons at the bottom to navigate
- **Keyboard shortcut**: `←` and `→` arrow keys to change pages

#### 🔍 **Search Questions**
- Type in the search box to filter questions instantly
- Search works on question text, not answers
- Clear the search box to see all questions again

#### 📅 **Sort by Date**
- Click the **"Newest"/"Oldest"** button to toggle sort order
- Newest shows recent questions first
- Oldest shows the conversation from the beginning

#### 👁️ **View Full Q&A**
- Click any question to see the complete answer
- Full markdown formatting (bold, italic, code blocks)
- **Keyboard shortcut**: Press `ESC` to close and return to the list

#### 🎛️ **Customize the Panel**
- **Drag** the top bar to move the panel around your screen
- **Drag** the bottom-right corner to resize
- **Minimize** using the `—` button (reopens with dock button)
- **Close** using the `×` button

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous page |
| `→` | Next page |
| `ESC` | Close detail view |

## ✨ Smart Features

- **Remembers your preferences**: Search terms, sort order, panel size and position
- **Adapts to your theme**: Automatically switches between light and dark mode
- **Works offline**: No internet required, everything happens in your browser
- **Super fast**: Optimized performance, minimal resource usage

## 🔧 Troubleshooting

**Panel doesn't appear?**
- Make sure you're on `chat.openai.com` or `chatgpt.com`
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page

**Questions not showing up?**
- Make sure you have an active conversation with messages
- Try scrolling through your chat to load all messages
- Refresh the page if the conversation seems incomplete

**Panel position/size reset?**
- Your preferences are saved automatically
- If they reset, check if your browser is clearing localStorage

## 🎨 What Makes It Special

- **Zero dependencies**: Pure JavaScript, no external libraries
- **Privacy focused**: Everything happens locally in your browser
- **Lightweight**: Minimal footprint, won't slow down ChatGPT
- **Clean design**: Integrates seamlessly with ChatGPT's interface

## 🛠️ For Developers

This extension is built with vanilla JavaScript and uses:
- Content scripts for ChatGPT integration
- Shadow DOM for isolated styling
- LocalStorage for user preferences
- Mutation observers for real-time updates

## 📝 License

MIT License - feel free to modify and distribute!