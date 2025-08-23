# Hashima: Next-Generation Color-Bubble Monsters

A revolutionary upgrade to the Hashima fighting game featuring advanced 3D bubble monsters with complex designs, lobster hands, tails, wings, and unique eye types.

## 🚀 New Features

### Complex Monster Types
- **12 Unique Monster Types** - From classic bubbles to mythical phantoms
- **Advanced Body Designs** - Spheres, capsules, boxes, hexagons, crystals, and more
- **Rarity System** - Common, Uncommon, Rare, Epic, Legendary, and Mythic monsters

### Advanced Appendages
- **Lobster Hands** - Multiple claws, pincers, and appendages
- **Complex Tails** - Spiked, feathered, scaled, tentacle, crystal, and flame variants
- **Advanced Wings** - Bat, bird, dragon, butterfly, insect, angel, and demon styles

### Eye System
- **8 Eye Types** - Normal, cat, dragon, alien, robot, demon, bug, and ghost
- **Style Variations** - Round, slit, geometric, compound, menacing, and ethereal
- **Special Effects** - Glowing, mechanical, and ghostly appearances

### Enhanced Materials
- **Bubble Materials** - Advanced transparency, metalness, and roughness
- **Emissive Effects** - Glowing particles and energy fields
- **Dynamic Lighting** - Point lights and dramatic shadows

## 🎮 Monster Types

### Common
- **Classic Bubble** - Balanced traditional design

### Uncommon  
- **Agile Cat** - Swift with feathered tails
- **Ethereal Butterfly** - Delicate with butterfly wings

### Rare
- **Lobster Claw** - Aquatic with powerful claws
- **Mechanical Bot** - Industrial robot design
- **Chitinous Bug** - Insectoid with compound eyes

### Epic
- **Dragon Lord** - Majestic with dragon wings
- **Dark Demon** - Menacing with demonic features
- **Industrial Mech** - Advanced mechanical design

### Legendary
- **Alien Entity** - Otherworldly geometric being
- **Crystal Guardian** - Crystalline with insect wings

### Mythic
- **Phantom Ghost** - Ethereal spirit with angel wings

## 🛠️ Technical Implementation

### Monster Factory System
```javascript
import { createNextGenHashima } from './monster-factory.js';

// Create a monster with specific type and color
const monster = createNextGenHashima(0x00aa55, 'LOBSTER', 123);
```

### Advanced Body System
- **Geometric Shapes** - Sphere, capsule, box, cylinder, octahedron, torus, dodecahedron
- **Dynamic Scaling** - Breed-specific proportions and animations
- **Detail Systems** - Hexagonal patterns, crystal facets, mechanical bolts

### Animation System
- **Breed-Specific Speeds** - Agile, majestic, ethereal, and mechanical variations
- **Complex Movements** - Wing flapping, tail wagging, particle orbiting
- **Eye Animations** - Blinking, pupil movement, and special effects

## 🎯 Game Integration

### Character Selection
- Updated HTML with all 12 monster types
- Enhanced preview system with 3D models
- Rarity indicators and descriptions

### Fighting Mechanics
- Monster-specific attack animations
- Style-based movement patterns
- Enhanced visual effects during combat

### Performance Optimizations
- Efficient geometry management
- Optimized material systems
- Smart animation culling

## 📁 File Structure

```
Hashima-Smash/
├── js/
│   ├── app.js                 # Main game logic (updated)
│   ├── monster-factory.js     # New monster creation system
│   ├── three-scene.js         # Enhanced 3D scene (updated)
│   ├── classes.js             # Legacy sprite system
│   └── utils.js               # Utility functions
├── index.html                 # Main game (updated)
├── monster-showcase.html      # Monster showcase page
├── README.md                  # This documentation
└── style/
    └── style_1.css           # Game styling
```

## 🚀 Getting Started

### 1. Run the Main Game
```bash
# Open index.html in a modern web browser
# Navigate to character select to see all monster types
# Choose your favorite monster and start battling!
```

### 2. Explore the Monster Showcase
```bash
# Open monster-showcase.html to see all monster types
# Learn about features, rarity, and stats
# Plan your monster collection strategy
```

### 3. Customize Monsters
```javascript
// In monster-factory.js, modify monster types
const monsterTypes = {
  CUSTOM: {
    body: 'CRYSTAL',
    eyes: 'ALIEN', 
    hands: 'LOBSTER',
    tail: 'FLAME',
    wings: 'DRAGON',
    style: 'custom'
  }
};
```

## 🎨 Customization Options

### Body Types
- **NORMAL** - Classic sphere
- **ROUND** - Plump sphere
- **OVAL** - Streamlined capsule
- **SQUARE** - Angular box
- **HEXAGONAL** - Geometric cylinder
- **CRYSTAL** - Faceted octahedron
- **ORGANIC** - Flowing torus
- **MECHANICAL** - Industrial dodecahedron

### Eye Styles
- **round** - Standard spherical
- **slit** - Cat-like vertical
- **reptile** - Dragon-style
- **glowing** - Alien energy
- **geometric** - Robot mechanical
- **menacing** - Demon slitted
- **compound** - Bug multi-faceted
- **ethereal** - Ghost transparent

### Tail Variants
- **smooth** - Basic segments
- **flowing** - Long and graceful
- **dangerous** - Spiked and threatening
- **elegant** - Feathered beauty
- **armored** - Scaled protection
- **squishy** - Tentacle flexibility
- **geometric** - Crystal precision
- **flickering** - Flame energy

## 🔧 Development

### Adding New Monster Types
1. Define in `monsterTypes` object
2. Specify body, eyes, hands, tail, wings, and style
3. Add to HTML selection dropdowns
4. Test in game environment

### Performance Considerations
- Use appropriate geometry complexity
- Optimize material properties
- Implement efficient animation loops
- Monitor frame rates during development

### Browser Compatibility
- Modern browsers with WebGL support
- Three.js 0.160.0+ required
- ES6 modules support needed

## 🎯 Future Enhancements

### Planned Features
- **Monster Evolution** - Level up and transform
- **Custom Color Palettes** - User-defined monster colors
- **Animation Sequences** - Complex attack combos
- **Sound Effects** - Monster-specific audio
- **Particle Systems** - Advanced visual effects

### Community Contributions
- **Custom Monster Designs** - User-created types
- **Animation Packs** - Community animations
- **Material Libraries** - Shared textures and effects
- **Modding Support** - Plugin system for extensions

## 📊 Performance Metrics

### Target Specifications
- **Frame Rate** - 60 FPS on modern devices
- **Memory Usage** - < 100MB for full monster collection
- **Load Time** - < 3 seconds for initial game
- **Polygon Count** - 1000-5000 per monster (optimized)

### Optimization Techniques
- **Geometry Instancing** - Shared meshes where possible
- **Level of Detail** - Adaptive complexity based on distance
- **Texture Atlasing** - Combined material maps
- **Animation Blending** - Smooth transitions between states

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install a local web server
3. Open files in modern browser
4. Use browser dev tools for debugging

### Code Style
- **ES6+** - Modern JavaScript features
- **Three.js** - 3D graphics library
- **Modular Design** - Separate concerns into files
- **Performance First** - Optimize for smooth gameplay

### Testing
- **Cross-browser** - Chrome, Firefox, Safari, Edge
- **Device Testing** - Desktop, tablet, mobile
- **Performance Profiling** - Monitor frame rates
- **User Experience** - Intuitive controls and feedback

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to the license terms.

## 🙏 Acknowledgments

- **Three.js Community** - 3D graphics library
- **Hashima Community** - Original game inspiration
- **Open Source Contributors** - Code and ideas
- **Gaming Community** - Feedback and testing

---

**Hashima: Next-Generation Monsters** - Where bubble creatures evolve into complex, beautiful, and powerful beings! 🎮✨
