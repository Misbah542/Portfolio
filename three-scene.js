/**
 * Three.js Scene for Android Developer Portfolio
 * Creates and manages the 3D background with Android robots
 * Author: Misbah ul Haque
 */

// Scene variables
let scene, camera, renderer;
let bots = [];
let particles;
let shapes = [];
let androidIcons = [];
let codeBlocks = [];
let pointLight1, pointLight2, pointLight3;

// Interaction variables
let isInteractive = false;
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationX = 0;
let rotationY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let zoom = 1;
let targetZoom = 1;

// Scroll-based animation variables
let scrollProgress = 0;
let scrollY = 0;

// Animation clock
const clock = new THREE.Clock();

// Android colors
const androidColors = {
    primary: 0x4CAF50,
    secondary: 0x8BC34A,
    accent: 0x66BB6A,
    dark: 0x388E3C,
    light: 0xC8E6C9
};

/**
 * Create Android-themed icons floating around
 */
function createAndroidIcons() {
    // Create various Android development icons
    const iconShapes = [
        // Kotlin logo shape
        () => {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(1, 0);
            shape.lineTo(0.5, 1);
            shape.lineTo(0, 0);
            return new THREE.ShapeGeometry(shape);
        },
        // Android Studio shape (simplified)
        () => new THREE.BoxGeometry(1, 1, 0.1),
        // Gradle shape (hexagon)
        () => new THREE.CylinderGeometry(0.8, 0.8, 0.2, 6),
        // XML bracket shape
        () => {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(0.3, 0.5);
            shape.lineTo(0, 1);
            shape.lineTo(0.1, 1);
            shape.lineTo(0.4, 0.5);
            shape.lineTo(0.1, 0);
            return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
        }
    ];

    for (let i = 0; i < 30; i++) {
        const geometryCreator = iconShapes[Math.floor(Math.random() * iconShapes.length)];
        const geometry = geometryCreator();
        
        const material = new THREE.MeshPhongMaterial({
            color: Object.values(androidColors)[Math.floor(Math.random() * 5)],
            emissive: androidColors.primary,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        const icon = new THREE.Mesh(geometry, material);
        icon.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
        icon.scale.setScalar(Math.random() * 3 + 1);
        icon.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        scene.add(icon);
        androidIcons.push({
            mesh: icon,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.5 + 0.2,
            orbitRadius: Math.random() * 50 + 30,
            orbitSpeed: (Math.random() - 0.5) * 0.02
        });
    }
}

/**
 * Create floating code blocks
 */
function createCodeBlocks() {
    const codeTexts = [
        'fun onCreate()',
        'class MainActivity',
        '@Composable',
        'ViewModel()',
        'suspend fun',
        'LiveData<>',
        'Repository',
        '.observe { }',
        'Modifier.fillMaxSize()',
        'LaunchedEffect'
    ];

    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.PlaneGeometry(
            Math.random() * 4 + 2,
            Math.random() * 1 + 0.5
        );
        
        const material = new THREE.MeshBasicMaterial({
            color: androidColors.primary,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const codeBlock = new THREE.Mesh(geometry, material);
        codeBlock.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        
        scene.add(codeBlock);
        codeBlocks.push({
            mesh: codeBlock,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            driftSpeed: {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1
            }
        });
    }
}

/**
 * Initialize the Three.js scene
 */
function initThreeScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 300);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 30;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'), 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add lights
    setupLighting();

    // Create all 3D elements
    createAndroidBots();
    createParticles();
    createShapes();
    createAndroidIcons();
    createCodeBlocks();

    // Set up event listeners
    setupThreeEventListeners();

    // Start animation
    animate();
}

/**
 * Set up scene lighting
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Multiple colored point lights
    pointLight1 = new THREE.PointLight(androidColors.primary, 1, 150);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(androidColors.secondary, 0.8, 150);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    pointLight3 = new THREE.PointLight(androidColors.accent, 0.6, 100);
    pointLight3.position.set(0, 30, 0);
    scene.add(pointLight3);
}

/**
 * Create Android bot mesh
 */
function createAndroidBot() {
    const group = new THREE.Group();
    
    const androidGreen = 0x4CAF50;
    const material = new THREE.MeshPhongMaterial({ 
        color: androidGreen,
        emissive: androidGreen,
        emissiveIntensity: 0.1,
        shininess: 100,
        transparent: true,
        opacity: 1
    });
    
    // Head (hemisphere)
    const headGeometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 1.5;
    group.add(head);
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 1);
    bodyGeometry.translate(0, -0.25, 0);
    const body = new THREE.Mesh(bodyGeometry, material);
    group.add(body);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    
    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-1.3, 0, 0);
    leftArm.rotation.z = Math.PI / 8;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(1.3, 0, 0);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    
    const leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(-0.5, -1.8, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(0.5, -1.8, 0);
    group.add(rightLeg);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 1.8, 0.8);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 1.8, 0.8);
    group.add(rightEye);
    
    // Antennae
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const leftAntenna = new THREE.Mesh(antennaGeometry, material);
    leftAntenna.position.set(-0.3, 2.2, 0);
    leftAntenna.rotation.z = -Math.PI / 6;
    group.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, material);
    rightAntenna.position.set(0.3, 2.2, 0);
    rightAntenna.rotation.z = Math.PI / 6;
    group.add(rightAntenna);
    
    // Antenna tips
    const tipGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const leftTip = new THREE.Mesh(tipGeometry, material);
    leftTip.position.set(-0.45, 2.45, 0);
    group.add(leftTip);
    
    const rightTip = new THREE.Mesh(tipGeometry, material);
    rightTip.position.set(0.45, 2.45, 0);
    group.add(rightTip);
    
    return group;
}

/**
 * Create multiple Android bots
 */
function createAndroidBots() {
    const botCount = 25; // Increased for more visual impact
    
    for (let i = 0; i < botCount; i++) {
        const bot = createAndroidBot();
        const angle = (i / botCount) * Math.PI * 2;
        const radius = 30 + Math.random() * 40;
        const height = (Math.random() - 0.5) * 30;
        
        bot.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Varied sizes for depth
        const scale = 0.2 + Math.random() * 0.4;
        bot.scale.set(scale, scale, scale);
        bot.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(bot);
        
        bots.push({
            mesh: bot,
            initialY: height,
            floatSpeed: 0.2 + Math.random() * 0.4,
            rotationSpeed: 0.05 + Math.random() * 0.15,
            orbitRadius: radius,
            orbitSpeed: 0.02 + Math.random() * 0.08,
            orbitAngle: angle,
            verticalFloat: Math.random() * 3 + 1
        });
    }
}

/**
 * Create particle system
 */
function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500; // Increased particle count
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Spread particles in a larger area
        positions[i3] = (Math.random() - 0.5) * 150;
        positions[i3 + 1] = (Math.random() - 0.5) * 150;
        positions[i3 + 2] = (Math.random() - 0.5) * 150;
        
        // Android green color variations
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            colors[i3] = 0.3;
            colors[i3 + 1] = 0.7;
            colors[i3 + 2] = 0.3;
        } else if (colorChoice < 0.66) {
            colors[i3] = 0.5;
            colors[i3 + 1] = 0.8;
            colors[i3 + 2] = 0.3;
        } else {
            colors[i3] = 0.4;
            colors[i3 + 1] = 0.75;
            colors[i3 + 2] = 0.4;
        }
        
        // Varied sizes
        sizes[i] = Math.random() * 3 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

/**
 * Create floating geometric shapes
 */
function createShapes() {
    const shapeGeometries = [
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.DodecahedronGeometry(1, 0)
    ];

    for (let i = 0; i < 25; i++) {
        const geometry = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x4CAF50 : 0x8BC34A,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            emissive: Math.random() > 0.5 ? 0x4CAF50 : 0x8BC34A,
            emissiveIntensity: 0.1
        });
        
        const shape = new THREE.Mesh(geometry, material);
        shape.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        shape.scale.setScalar(Math.random() * 2 + 0.5);
        
        scene.add(shape);
        shapes.push({
            mesh: shape,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.5 + 0.2
        });
    }
}

/**
 * Set up Three.js event listeners
 */
function setupThreeEventListeners() {
    // Listen for custom events from main.js
    window.addEventListener('sceneInteractionEnabled', () => {
        isInteractive = true;
    });

    window.addEventListener('sceneInteractionDisabled', () => {
        isInteractive = false;
        isDragging = false;
    });

    // Listen for scroll progress
    window.addEventListener('scrollProgress', (e) => {
        scrollProgress = e.detail.progress;
        scrollY = e.detail.scrollY;
    });

    // Mouse events
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Wheel event for zoom
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Window resize
    window.addEventListener('resize', handleThreeResize);
}

/**
 * Mouse event handlers
 */
function handleMouseDown(e) {
    if (!isInteractive) return;
    
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
    document.getElementById('canvas').classList.add('grabbing');
}

function handleMouseMove(e) {
    if (!isInteractive || !isDragging) return;
    
    const deltaX = e.clientX - previousMouseX;
    const deltaY = e.clientY - previousMouseY;
    
    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;
    targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));
    
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
}

function handleMouseUp() {
    isDragging = false;
    document.getElementById('canvas').classList.remove('grabbing');
}

/**
 * Touch event handlers
 */
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    if (!isInteractive) return;
    
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!isInteractive) return;
    
    e.preventDefault();
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;
    
    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;
    targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd() {
    // Touch end handling if needed
}

/**
 * Wheel event handler for zoom
 */
function handleWheel(e) {
    if (!isInteractive) return;
    
    e.preventDefault();
    targetZoom *= 1 + (e.deltaY * -0.001);
    targetZoom = Math.max(0.1, targetZoom); // Allow infinite zoom out and in
}

/**
 * Handle window resize
 */
function handleThreeResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Scroll-based scene changes
    const scrollEffect = 1 + scrollProgress * 2; // Speed multiplier based on scroll
    const colorShift = scrollProgress; // Color shift based on scroll
    
    // Update fog based on scroll
    scene.fog.near = 50 - scrollProgress * 30;
    scene.fog.far = 300 - scrollProgress * 100;
    
    // Smooth rotation transitions
    rotationX += (targetRotationX - rotationX) * 0.05;
    rotationY += (targetRotationY - rotationY) * 0.05;
    
    if (isInteractive) {
        // Apply rotations when interactive
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
    } else {
        // Auto-rotation when not interactive (affected by scroll)
        scene.rotation.y = elapsedTime * 0.05 * scrollEffect;
        scene.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1 * scrollEffect;
        targetRotationY = scene.rotation.y;
        targetRotationX = scene.rotation.x;
    }
    
    // Smooth zoom transitions
    zoom += (targetZoom - zoom) * 0.05;
    camera.position.z = (30 / zoom) + scrollProgress * 20;
    
    // Animate Android bots with scroll effects
    bots.forEach((bot, index) => {
        // Floating motion with varied amplitude (affected by scroll)
        bot.mesh.position.y = bot.initialY + Math.sin(elapsedTime * bot.floatSpeed * scrollEffect + index) * bot.verticalFloat * (1 + scrollProgress);
        
        // Self rotation (faster with scroll)
        bot.mesh.rotation.y += bot.rotationSpeed * 0.01 * scrollEffect;
        
        // Orbital motion (faster with scroll)
        bot.orbitAngle += bot.orbitSpeed * 0.01 * scrollEffect;
        bot.mesh.position.x = Math.cos(bot.orbitAngle) * bot.orbitRadius * (1 + scrollProgress * 0.5);
        bot.mesh.position.z = Math.sin(bot.orbitAngle) * bot.orbitRadius * (1 + scrollProgress * 0.5);
        
        // Tilt based on movement
        bot.mesh.rotation.z = Math.sin(elapsedTime * 0.5 + index) * 0.1 * scrollEffect;
        bot.mesh.rotation.x = Math.cos(elapsedTime * 0.3 + index) * 0.05 * scrollEffect;
        
        // Change bot opacity based on scroll
        bot.mesh.traverse((child) => {
            if (child.isMesh) {
                child.material.opacity = 1 - scrollProgress * 0.3;
            }
        });
    });
    
    // Animate geometric shapes with scroll effects
    shapes.forEach((shape, index) => {
        shape.mesh.rotation.x += shape.rotationSpeed.x * scrollEffect;
        shape.mesh.rotation.y += shape.rotationSpeed.y * scrollEffect;
        shape.mesh.rotation.z += shape.rotationSpeed.z * scrollEffect;
        
        // Floating motion
        shape.mesh.position.y += Math.sin(elapsedTime * shape.floatSpeed * scrollEffect + index) * 0.03;
        
        // Change opacity based on scroll
        shape.mesh.material.opacity = 0.3 + scrollProgress * 0.3;
    });
    
    // Animate particles with more complex movement (affected by scroll)
    if (particles) {
        particles.rotation.y = elapsedTime * 0.02 * scrollEffect;
        particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.2 * scrollEffect;
        
        // Make particles pulse and spread out with scroll
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(elapsedTime + i) * 0.02 * scrollEffect;
            // Spread particles out as user scrolls
            const originalX = (i / 3 - 250) * 0.6;
            const originalZ = ((i + 2) / 3 - 250) * 0.6;
            positions[i] = originalX * (1 + scrollProgress * 2);
            positions[i + 2] = originalZ * (1 + scrollProgress * 2);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Change particle opacity
        particles.material.opacity = 0.7 - scrollProgress * 0.4;
    }
    
    // Animate Android icons with scroll effects
    androidIcons.forEach((icon, index) => {
        icon.mesh.rotation.x += icon.rotationSpeed.x * scrollEffect;
        icon.mesh.rotation.y += icon.rotationSpeed.y * scrollEffect;
        icon.mesh.rotation.z += icon.rotationSpeed.z * scrollEffect;
        
        // Orbital motion (expand with scroll)
        const angle = elapsedTime * icon.orbitSpeed * scrollEffect + index;
        icon.mesh.position.x = Math.cos(angle) * icon.orbitRadius * (1 + scrollProgress);
        icon.mesh.position.z = Math.sin(angle) * icon.orbitRadius * (1 + scrollProgress);
        icon.mesh.position.y += Math.sin(elapsedTime * icon.floatSpeed) * 0.05 * scrollEffect;
    });
    
    // Animate code blocks with scroll effects
    codeBlocks.forEach((block, index) => {
        block.mesh.rotation.y += block.rotationSpeed * scrollEffect;
        block.mesh.position.x += block.driftSpeed.x * scrollEffect;
        block.mesh.position.y += block.driftSpeed.y * scrollEffect;
        block.mesh.position.z += block.driftSpeed.z * scrollEffect;
        
        // Wrap around when too far
        ['x', 'y', 'z'].forEach(axis => {
            if (Math.abs(block.mesh.position[axis]) > 100) {
                block.mesh.position[axis] *= -0.9;
            }
        });
        
        // Pulsing opacity (faster with scroll)
        block.mesh.material.opacity = 0.2 + Math.sin(elapsedTime * 2 * scrollEffect + index) * 0.1;
    });
    
    // Animate lights with more variation (affected by scroll)
    const lightRadius = 30 + scrollProgress * 20;
    pointLight1.position.x = Math.sin(elapsedTime * 0.5 * scrollEffect) * lightRadius;
    pointLight1.position.z = Math.cos(elapsedTime * 0.5 * scrollEffect) * lightRadius;
    pointLight1.position.y = Math.sin(elapsedTime * 0.3 * scrollEffect) * 15;
    pointLight1.intensity = (1 + Math.sin(elapsedTime * 2 * scrollEffect) * 0.2) * (1 - scrollProgress * 0.3);
    
    pointLight2.position.x = Math.cos(elapsedTime * 0.3 * scrollEffect) * lightRadius;
    pointLight2.position.z = Math.sin(elapsedTime * 0.3 * scrollEffect) * lightRadius;
    pointLight2.position.y = Math.cos(elapsedTime * 0.5 * scrollEffect) * 15;
    pointLight2.intensity = (0.8 + Math.cos(elapsedTime * 1.5 * scrollEffect) * 0.2) * (1 - scrollProgress * 0.3);
    
    pointLight3.position.x = Math.sin(elapsedTime * 0.7 * scrollEffect) * (20 + scrollProgress * 10);
    pointLight3.position.y = 30 + Math.sin(elapsedTime * scrollEffect) * 10;
    pointLight3.position.z = Math.cos(elapsedTime * 0.7 * scrollEffect) * (20 + scrollProgress * 10);
    
    // Change light colors based on scroll
    const greenIntensity = 1 - scrollProgress * 0.5;
    const blueIntensity = scrollProgress * 0.5;
    pointLight1.color.setRGB(greenIntensity * 0.3, greenIntensity * 0.7, 0.3 + blueIntensity);
    pointLight2.color.setRGB(greenIntensity * 0.5, greenIntensity * 0.8, 0.3 + blueIntensity);
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize Three.js scene when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeScene);
} else {
    initThreeScene();
}