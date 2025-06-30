# Android Developer Portfolio - 3D Interactive Website

A modern, interactive portfolio website for Android developers featuring a 3D animated background with Android robots, smooth scrolling, and PDF resume generation.

## 🚀 Features

- **3D Interactive Background**: Three.js powered scene with animated Android robots
- **Smooth Navigation**: Section-based scrolling with active state highlighting
- **PDF Resume Download**: Generate and download resume as PDF with one click
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive 3D Control**: Toggle 3D scene interaction mode for exploring the background
- **Modern UI/UX**: Glassmorphism effects, smooth animations, and Android-themed design

## 📁 Project Structure

```
android-portfolio/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── main.js            # Navigation, scrolling, and PDF generation
├── three-scene.js     # 3D background scene management
└── README.md          # Project documentation
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with animations and glassmorphism
- **JavaScript (ES6+)**: Interactive functionality
- **Three.js**: 3D graphics and animations
- **jsPDF**: PDF generation for resume download
- **html2canvas**: HTML to image conversion for PDF

## 📦 External Dependencies

All dependencies are loaded via CDN:

```html
<!-- Three.js for 3D graphics -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- jsPDF for PDF generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- html2canvas for PDF content capture -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Android logo from DevIcons -->
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg">
```

## 🎮 Interactive Features

### 3D Scene Control
- Click the **3D Mode button** (bottom-right corner) to enable scene interaction
- When active:
  - **Click and drag** to rotate the scene
  - **Scroll** to zoom in/out
  - **Touch gestures** supported on mobile devices

### Navigation
- Click navigation items to smooth scroll to sections
- Active section is automatically highlighted during scroll

### Resume Download
- Click the **Resume button** in the navigation bar
- Generates a formatted PDF of the resume section
- Includes contact information and professional details

## 🎨 Customization Guide

### Updating Personal Information

1. **Edit index.html** to update:
   - Name and title
   - Contact information
   - Experience details
   - Project descriptions
   - Skills

2. **Modify colors** in styles.css:
   ```css
   /* Primary Android green */
   --primary-color: #4CAF50;
   
   /* Secondary green */
   --secondary-color: #8BC34A;
   ```

3. **Adjust 3D scene** in three-scene.js:
   - Number of Android bots
   - Animation speeds
   - Particle count
   - Shape types

### Adding New Sections

1. Add HTML section in index.html:
   ```html
   <section id="new-section" class="section">
       <div class="content" data-section="new-section">
           <!-- Content here -->
       </div>
   </section>
   ```

2. Add navigation item:
   ```html
   <li data-section="new-section">New Section</li>
   ```

## 🚀 Deployment

1. **Local Development**:
   - Open `index.html` directly in a modern web browser
   - Or use a local server (e.g., Live Server extension in VS Code)

2. **Web Hosting**:
   - Upload all files to your web hosting service
   - Ensure all file paths are correct
   - No build process required

3. **GitHub Pages**:
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Access via `https://[username].github.io/[repository-name]`

## 📱 Browser Compatibility

- Chrome (recommended) - Full support
- Firefox - Full support
- Safari - Full support
- Edge - Full support
- Mobile browsers - Full support with touch gestures

## ⚡ Performance Optimization

- 3D scene runs at 60 FPS with optimized rendering
- Lazy loading for content sections
- Efficient animation loops
- GPU-accelerated CSS transforms
- Debounced scroll events

## 🐛 Troubleshooting

### 3D Scene Not Loading
- Check browser console for errors
- Ensure Three.js CDN is accessible
- Verify WebGL support in browser

### PDF Generation Issues
- Check console for errors
- Ensure jsPDF and html2canvas are loaded
- Try different browsers if issues persist

### Performance Issues
- Reduce number of 3D objects in three-scene.js
- Lower particle count
- Disable some animations on older devices

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Misbah ul Haque**
- Email: misbahul8@gmail.com
- LinkedIn: [linkedin.com/in/Misbah542](https://linkedin.com/in/Misbah542)
- GitHub: [github.com/Misbah542](https://github.com/Misbah542)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌟 Acknowledgments

- Three.js community for excellent documentation
- Android for the iconic robot design
- Open source contributors for the libraries used