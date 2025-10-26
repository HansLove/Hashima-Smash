# 🎮 Hashima Smash - Quick Start Guide

## The Problem
When you open `index.html` directly in a browser, it doesn't work because:
1. The game uses ES6 modules which require a local server
2. Browser security prevents loading local files directly
3. CORS (Cross-Origin Resource Sharing) blocks the Three.js library

## ✅ Solution: Run a Local Server

### Option 1: Using Node.js (Recommended)

```bash
# Start the server
npm start
```

Then open your browser and go to: **http://localhost:3000**

### Option 2: Using Python

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

### Option 3: Using PHP

```bash
php -S localhost:8000
```

Then open: **http://localhost:8000**

### Option 4: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🎯 What's New

### Integrated Monster Showcase
- Added a **"Monster Showcase"** button to the main menu
- Click it to open a beautiful showcase page with all 12 monster types
- View stats, descriptions, and rarity information for each monster

### How to Use
1. Run the server using one of the options above
2. Go to the main menu
3. Click **"Monster Showcase"** to view all monsters
4. Click **"Play"** to start the game
5. Choose your monsters and fight!

## 📋 Available Monsters

- **Classic Bubble** (Common) - Balanced traditional design
- **Lobster Claw** (Rare) - Aquatic with powerful claws
- **Dragon Lord** (Epic) - Majestic with dragon wings
- **Agile Cat** (Uncommon) - Swift with feathered tails
- **Alien Entity** (Legendary) - Otherworldly geometric being
- **Mechanical Bot** (Rare) - Industrial robot design
- **Dark Demon** (Epic) - Menacing with demonic features
- **Ethereal Butterfly** (Uncommon) - Delicate butterfly design
- **Crystal Guardian** (Legendary) - Crystalline with insect wings
- **Phantom Ghost** (Mythic) - Ethereal spirit with angel wings
- **Industrial Mech** (Epic) - Advanced mechanical design
- **Chitinous Bug** (Rare) - Insectoid with compound eyes

## 🎮 Game Controls

### Player 1 (WASD)
- **Movement**: A/D
- **Jump**: W
- **Attacks**: Space (Neutral), Shift (Side), Ctrl (Up), Alt (Down)
- **Defense**: Q (Shield), E (Roll), S (Fast Fall)

### Player 2 (Arrow Keys)
- **Movement**: ←/→
- **Jump**: ↑
- **Attacks**: Enter (Neutral), R (Side), T (Up), Y (Down)
- **Defense**: F (Shield), G (Roll), ↓ (Fast Fall)

## 🛠️ Troubleshooting

### Buttons don't work?
- Make sure you're running a local server (not opening the file directly)
- Check the browser console for errors (F12)

### Game looks weird or 3D models don't load?
- Ensure you have a modern browser (Chrome, Firefox, Safari, Edge)
- Check that WebGL is enabled in your browser
- Try clearing your browser cache

### Server won't start?
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check that port 3000 is not already in use

## 📁 Project Structure

```
Hashima-Smash/
├── index.html              # Main game
├── monster-showcase.html   # Monster showcase page (now integrated!)
├── server.js               # Local server (NEW)
├── package.json           # Project config (NEW)
├── js/
│   ├── app.js             # Main game logic
│   ├── monster-factory.js # Monster creation
│   └── ...
└── style/
    └── style_1.css        # Game styling
```

## 🚀 Next Steps

1. Start the server: `npm start`
2. Open your browser: `http://localhost:3000`
3. Click "Monster Showcase" to explore all monsters
4. Click "Play" to start the game
5. Enjoy the fight!

---

**Happy Gaming! 🎮✨**

