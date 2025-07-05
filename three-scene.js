/**
 * Enhanced Three.js Scene with Vector Graphics
 * Infinite scrolling vector patterns in spherical arrangement
 */

// Scene variables
let scene, camera, renderer;
let vectorGroups = [];
let particles;
let sphereGroup;
let scrollGroup;

// Interaction variables
let isInteractive = false;
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// Scroll variables
let scrollY = 0;
let lastScrollY = 0;
let scrollVelocity = 0;

// Animation clock
const clock = new THREE.Clock();

// Colors
const colors = {
    primary: 0x00ff00,
    secondary: 0x00cc00,
    accent: 0x00ff88,
    particles: 0x00ff44,
    vectors: [0x00ff00, 0x00ff88, 0x00cc00, 0x00ffaa, 0x00ff44]
};

/**
 * Create vector pattern generators
 */
const vectorPatterns = {
    // Circuit Board Pattern
    circuit: () => {
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ 
            color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
            transparent: true,
            opacity: 0.6
        });
        
        // Create circuit paths
        for (let i = 0; i < 5; i++) {
            const points = [];
            let x = (Math.random() - 0.5) * 4;
            let y = (Math.random() - 0.5) * 4;
            
            for (let j = 0; j < 4; j++) {
                points.push(new THREE.Vector3(x, y, 0));
                if (Math.random() > 0.5) {
                    x += (Math.random() - 0.5) * 2;
                } else {
                    y += (Math.random() - 0.5) * 2;
                }
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            group.add(line);
            
            // Add nodes at connection points
            points.forEach(point => {
                const nodeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const nodeMaterial = new THREE.MeshBasicMaterial({ 
                    color: material.color,
                    emissive: material.color,
                    emissiveIntensity: 0.5
                });
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.copy(point);
                group.add(node);
            });
        }
        
        return group;
    },
    
    // Hexagon Grid
    hexGrid: () => {
        const group = new THREE.Group();
        const hexRadius = 0.5;
        
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                const hexShape = new THREE.Shape();
                for (let k = 0; k < 6; k++) {
                    const angle = (k / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * hexRadius;
                    const y = Math.sin(angle) * hexRadius;
                    if (k === 0) hexShape.moveTo(x, y);
                    else hexShape.lineTo(x, y);
                }
                hexShape.closePath();
                
                const geometry = new THREE.ShapeGeometry(hexShape);
                const material = new THREE.MeshBasicMaterial({
                    color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
                    transparent: true,
                    opacity: 0.3,
                    wireframe: true
                });
                
                const hex = new THREE.Mesh(geometry, material);
                hex.position.set(i * 1.5, j * 1.3, 0);
                group.add(hex);
            }
        }
        
        return group;
    },
    
    // DNA Helix
    dnaHelix: () => {
        const group = new THREE.Group();
        const helixMaterial = new THREE.LineBasicMaterial({ 
            color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
            transparent: true,
            opacity: 0.7
        });
        
        // Create two helixes
        for (let h = 0; h < 2; h++) {
            const points = [];
            for (let i = 0; i <= 50; i++) {
                const t = i / 10;
                const x = Math.sin(t + h * Math.PI) * 1.5;
                const y = t - 2.5;
                const z = Math.cos(t + h * Math.PI) * 1.5;
                points.push(new THREE.Vector3(x, y, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const helix = new THREE.Line(geometry, helixMaterial);
            group.add(helix);
        }
        
        // Add connecting bars
        for (let i = 0; i < 10; i++) {
            const t = i / 2;
            const points = [
                new THREE.Vector3(Math.sin(t) * 1.5, t - 2.5, Math.cos(t) * 1.5),
                new THREE.Vector3(Math.sin(t + Math.PI) * 1.5, t - 2.5, Math.cos(t + Math.PI) * 1.5)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const bar = new THREE.Line(geometry, helixMaterial);
            group.add(bar);
        }
        
        return group;
    },
    
    // Sacred Geometry
    sacredGeometry: () => {
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ 
            color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
            transparent: true,
            opacity: 0.5
        });
        
        // Flower of Life pattern
        const circles = 7;
        const radius = 0.8;
        
        for (let i = 0; i < circles; i++) {
            const angle = (i / circles) * Math.PI * 2;
            const x = i === 0 ? 0 : Math.cos(angle) * radius;
            const y = i === 0 ? 0 : Math.sin(angle) * radius;
            
            const curve = new THREE.EllipseCurve(x, y, radius, radius, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const circle = new THREE.Line(geometry, material);
            group.add(circle);
        }
        
        return group;
    },
    
    // Network Nodes
    networkNodes: () => {
        const group = new THREE.Group();
        const nodes = [];
        const nodeCount = 8;
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
            const nodeGeometry = new THREE.OctahedronGeometry(0.15, 0);
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
                wireframe: true
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            );
            nodes.push(node);
            group.add(node);
        }
        
        // Connect nodes
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: colors.primary,
            transparent: true,
            opacity: 0.3
        });
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() > 0.6) {
                    const points = [nodes[i].position, nodes[j].position];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    group.add(line);
                }
            }
        }
        
        return group;
    },
    
    // Wave Pattern
    wavePattern: () => {
        const group = new THREE.Group();
        const waves = 3;
        
        for (let w = 0; w < waves; w++) {
            const points = [];
            for (let i = 0; i <= 50; i++) {
                const x = (i / 50) * 8 - 4;
                const y = Math.sin(x * 2 + w) * 0.5;
                const z = w * 0.5 - 0.5;
                points.push(new THREE.Vector3(x, y, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
                transparent: true,
                opacity: 0.6
            });
            const wave = new THREE.Line(geometry, material);
            group.add(wave);
        }
        
        return group;
    },
    
    // Fractal Tree
    fractalTree: () => {
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({
            color: colors.vectors[Math.floor(Math.random() * colors.vectors.length)],
            transparent: true,
            opacity: 0.6
        });
        
        function createBranch(start, angle, length, depth) {
            if (depth === 0) return;
            
            const end = new THREE.Vector3(
                start.x + Math.cos(angle) * length,
                start.y + Math.sin(angle) * length,
                0
            );
            
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const branch = new THREE.Line(geometry, material);
            group.add(branch);
            
            // Create sub-branches
            createBranch(end, angle - 0.5, length * 0.7, depth - 1);
            createBranch(end, angle + 0.5, length * 0.7, depth - 1);
        }
        
        createBranch(new THREE.Vector3(0, -2, 0), Math.PI / 2, 1, 5);
        return group;
    }
};

/**
 * Initialize the Three.js scene
 */
function initThreeScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 50, 200);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canvas"),
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create main groups
    sphereGroup = new THREE.Group();
    scrollGroup = new THREE.Group();
    scene.add(scrollGroup);
    scrollGroup.add(sphereGroup);

    // Add lights
    setupLighting();

    // Create all 3D elements
    createVectorSphere();
    createParticles();
    createInfiniteVectors();

    // Set up event listeners
    setupEventListeners();

    // Start animation
    animate();
}

/**
 * Set up scene lighting
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Point lights
    const light1 = new THREE.PointLight(colors.primary, 1, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(colors.accent, 0.8, 100);
    light2.position.set(-20, -20, 20);
    scene.add(light2);
}

/**
 * Create spherical arrangement of vector patterns
 */
function createVectorSphere() {
    const patternTypes = Object.keys(vectorPatterns);
    const radius = 35;
    const count = 60;
    
    for (let i = 0; i < count; i++) {
        // Use fibonacci sphere distribution
        const theta = Math.PI * (3 - Math.sqrt(5));
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const x = Math.cos(theta * i) * radiusAtY;
        const z = Math.sin(theta * i) * radiusAtY;
        
        // Create random vector pattern
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        const pattern = vectorPatterns[patternType]();
        
        // Position and orient pattern
        pattern.position.set(x * radius, y * radius, z * radius);
        pattern.lookAt(0, 0, 0);
        
        // Random rotation for variety
        pattern.rotation.z = Math.random() * Math.PI * 2;
        
        // Scale variation
        const scale = 0.5 + Math.random() * 0.5;
        pattern.scale.set(scale, scale, scale);
        
        sphereGroup.add(pattern);
        
        vectorGroups.push({
            mesh: pattern,
            type: patternType,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            pulseSpeed: Math.random() * 0.5 + 0.5,
            initialScale: scale
        });
    }
}

/**
 * Create particle system
 */
function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create particles in sphere volume
        const radius = Math.random() * 50 + 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Green color variations
        colors[i3] = 0;
        colors[i3 + 1] = 0.5 + Math.random() * 0.5;
        colors[i3 + 2] = Math.random() * 0.3;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    sphereGroup.add(particles);
}

/**
 * Create infinite scrolling vector layers
 */
function createInfiniteVectors() {
    // Create multiple layers at different depths
    for (let layer = 0; layer < 3; layer++) {
        const layerGroup = new THREE.Group();
        const z = -20 - layer * 30;
        
        for (let i = 0; i < 20; i++) {
            const patternTypes = Object.keys(vectorPatterns);
            const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
            const pattern = vectorPatterns[patternType]();
            
            pattern.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                z
            );
            
            pattern.scale.setScalar(2 + Math.random() * 2);
            pattern.rotation.z = Math.random() * Math.PI * 2;
            
            // Make background vectors more transparent
            pattern.traverse((child) => {
                if (child.material) {
                    child.material.opacity *= 0.3;
                }
            });
            
            layerGroup.add(pattern);
        }
        
        scrollGroup.add(layerGroup);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Custom events from main.js
    window.addEventListener("sceneInteractionEnabled", () => {
        isInteractive = true;
        document.getElementById('canvas').classList.add('interactive');
    });

    window.addEventListener("sceneInteractionDisabled", () => {
        isInteractive = false;
        isDragging = false;
        document.getElementById('canvas').classList.remove('interactive', 'grabbing');
    });

    // Mouse events
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Touch events
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    // Scroll event
    window.addEventListener("scroll", handleScroll);

    // Resize
    window.addEventListener("resize", handleResize);
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
    // Touch end handling
}

/**
 * Handle scroll for parallax effect
 */
function handleScroll() {
    scrollY = window.scrollY;
    scrollVelocity = scrollY - lastScrollY;
    lastScrollY = scrollY;
}

/**
 * Handle window resize
 */
function handleResize() {
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

    // Smooth rotation transitions
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    // Apply rotations based on interaction mode
    if (isInteractive) {
        sphereGroup.rotation.x = currentRotationX;
        sphereGroup.rotation.y = currentRotationY;
    } else {
        // Auto-rotation when not interactive
        sphereGroup.rotation.y = elapsedTime * 0.1;
        sphereGroup.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;
    }

    // Scroll-based animations
    const scrollProgress = scrollY / window.innerHeight;
    
    // Parallax effect on scroll
    scrollGroup.position.y = scrollY * 0.1;
    scrollGroup.rotation.z = scrollVelocity * 0.001;
    
    // Scale sphere based on scroll
    const scale = 1 + scrollProgress * 0.3;
    sphereGroup.scale.set(scale, scale, scale);

    // Animate vector patterns
    vectorGroups.forEach((group, index) => {
        // Rotate patterns
        group.mesh.rotation.z += group.rotationSpeed;
        
        // Pulse effect
        const pulse = Math.sin(elapsedTime * group.pulseSpeed + index) * 0.1 + 1;
        group.mesh.scale.setScalar(group.initialScale * pulse);
        
        // Change opacity based on scroll
        group.mesh.traverse((child) => {
            if (child.material) {
                child.material.opacity = 0.6 - scrollProgress * 0.3;
            }
        });
    });

    // Animate particles
    if (particles) {
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.03;
        
        // Move particles based on scroll
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(elapsedTime + i) * 0.02;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Render scene
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThreeScene);
} else {
    initThreeScene();
}