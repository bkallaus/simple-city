/**
 * POP CITY - MASTER ENGINE
 * Phase 1-7 Integrated
 */

// --- 1. CONFIGURATION ---
const CONFIG = {
    gridSize: 5,         // 5x5 Grid
    tileSize: 1.2,       // Spacing between buildings
    tickRate: 1500,      // Speed of the game (ms)
    cameraDist: 8        // Zoom level
};

// --- 2. SCENE SETUP (THREE.JS) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue

// Orthographic Camera for Isometric View
const aspect = window.innerWidth / window.innerHeight;
const d = CONFIG.cameraDist;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

// The "True Isometric" Angle: Look from corner
camera.position.set(20, 20, 20);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable Shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(10, 20, 0); // Sun angle
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

// --- 3. ASSETS & FACTORY (VISUALS) ---

// --- TEXTURE FACTORY ---
const TextureFactory = {
    createCanvas: function(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    createTexture: function(drawFn) {
        const canvas = this.createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        drawFn(ctx, 256, 256);
        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter; // Keep it crisp
        return tex;
    },

    // 1. Basic Grid (Windows)
    grid: function(bgColor, lineColor) {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 8; // Thicker lines for readability
            const step = 64;

            // Draw Grid
            for(let i=step; i<w; i+=step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(w, i);
                ctx.stroke();
            }

            // Border
            ctx.strokeRect(0,0,w,h);
        });
    },

    // 2. Residential (Door + Windows)
    residential: function(wallColor, windowColor) {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = wallColor;
            ctx.fillRect(0, 0, w, h);

            // Windows
            ctx.fillStyle = windowColor;
            const pad = 40;
            const winSize = 60;

            // Top Left
            ctx.fillRect(pad, pad, winSize, winSize);
            // Top Right
            ctx.fillRect(w - pad - winSize, pad, winSize, winSize);

            // Door (Bottom Center)
            ctx.fillStyle = "#3e2723"; // Dark Wood
            ctx.fillRect((w/2) - 30, h - 100, 60, 100);
        });
    },

    // 3. Commercial (Stripes/Glass)
    commercial: function(baseColor, glassColor) {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = glassColor;
            const numStripes = 3;
            const stripeHeight = h / (numStripes * 2.5);

            for(let i=1; i<=numStripes; i++) {
                ctx.fillRect(20, i * stripeHeight * 2, w - 40, stripeHeight);
            }
        });
    },

    // 4. Ground (Paved/Grass)
    ground: function() {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = "#88cc88"; // Grass Base
            ctx.fillRect(0, 0, w, h);

            // Noise / Texture
            ctx.fillStyle = "#7abf7a"; // Slightly darker
            for(let i=0; i<400; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const s = Math.random() * 6 + 2;
                ctx.fillRect(x, y, s, s);
            }

            // Border (Grid Line)
            ctx.strokeStyle = "#6fb56f";
            ctx.lineWidth = 16;
            ctx.strokeRect(0, 0, w, h);
        });
    }
};

// Color Palette
const PALETTE = [
    0xff6b6b, // T1: Red
    0x4ecdc4, // T2: Teal
    0xffd93d, // T3: Yellow
    0x1a535c, // T4: Dark Teal
    0xff9f43, // T5: Orange
    0x5f27cd, // T6: Purple
    0x54a0ff, // T7: Light Blue
    0x2e86de, // T8: Darker Blue
    0xee5253, // T9: Red-Orange
    0xfeca57  // T10: Gold
];

// Material Factory
function createPlasticMat(colorHex) {
    return new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.1,
        flatShading: true
    });
}

// Texture Cache
const TEXTURE_CACHE = {};

// The Procedural Building Generator
function createBuildingMesh(tier) {
    // Clamp tier to 1-10
    const t = Math.min(Math.max(tier, 1), 10);

    // Generate or Fetch Texture
    if (!TEXTURE_CACHE[t]) {
        const colorHex = PALETTE[t - 1];
        const colorStr = '#' + colorHex.toString(16).padStart(6, '0');

        if (t <= 3) {
            TEXTURE_CACHE[t] = TextureFactory.residential(colorStr, '#feffdf'); // Light Yellow Windows
        } else if (t <= 6) {
            TEXTURE_CACHE[t] = TextureFactory.commercial(colorStr, '#e0f7fa'); // Cyan Glass
        } else {
            TEXTURE_CACHE[t] = TextureFactory.grid(colorStr, '#ffffff'); // High tech white lines
        }
    }

    const mat = new THREE.MeshStandardMaterial({
        map: TEXTURE_CACHE[t],
        roughness: 0.3,
        metalness: 0.1
    });

    // Roof Material (Darker shade of base color)
    const roofColor = new THREE.Color(PALETTE[t-1]).multiplyScalar(0.6);
    const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.6,
        flatShading: true
    });

    // Materials Arrays
    // Box: Right, Left, Top, Bottom, Front, Back
    const boxMaterials = [mat, mat, roofMat, mat, mat, mat];
    // Cylinder: Side, Top, Bottom
    const cylMaterials = [mat, roofMat, roofMat];

    let mesh;

    // Procedural Shapes based on Tier
    if (t === 1) {
        // Small House
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), boxMaterials);
        mesh.position.y = 0.25;
    }
    else if (t === 2) {
        // Tall House / Apartment
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), boxMaterials);
        mesh.position.y = 0.4;
    }
    else if (t === 3) {
        // Complex House
        mesh = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), boxMaterials);
        base.position.y = 0.3;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.4, 4), createPlasticMat(0x444444));
        roof.position.y = 0.8;
        roof.rotation.y = Math.PI/4;
        mesh.add(base, roof);
    }
    else if (t >= 4 && t <= 6) {
        // Tower Block
        mesh = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1 + (t*0.2), 0.6), boxMaterials);
        base.position.y = (1 + (t*0.2)) / 2;
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), createPlasticMat(0xffffff));
        top.position.y = 1 + (t*0.2) + 0.1;
        mesh.add(base, top);
    }
    else {
        // Skyscraper / Rocket
        mesh = new THREE.Group();
        // Use Cylinder but increase segments for smoother texture look
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1 + (t*0.3), 16), cylMaterials);
        body.position.y = (1 + (t*0.3)) / 2;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 16), createPlasticMat(0xffffff));
        ring.position.y = (t*0.2);
        ring.rotation.x = Math.PI / 2;
        mesh.add(body, ring);
    }

    // Enable Shadows for all parts
    mesh.traverse((c) => {
        if(c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
    });

    return mesh;
}

// --- 4. GAME LOGIC (THE BRAIN) ---

class CityGrid {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(null));
        this.meshGrid = Array(size).fill().map(() => Array(size).fill(null)); // Stores 3D objects
        this.score = 0;
    }

    // Check if coordinate is valid
    isValid(x, z) {
        return x >= 0 && x < this.size && z >= 0 && z < this.size;
    }

    // Add building to data
    place(x, z, tier) {
        if (!this.isValid(x, z) || this.grid[x][z] !== null) return null;

        // Data
        this.grid[x][z] = { tier: tier, id: Date.now() + Math.random() };
        this.score += Math.pow(tier, 2) * 10; // Exponential score
        this.updateUI();

        return this.grid[x][z];
    }

    // Remove building from data and scene
    remove(x, z) {
        if (!this.isValid(x, z)) return;
        this.grid[x][z] = null;

        if (this.meshGrid[x][z]) {
            const mesh = this.meshGrid[x][z];
            // Shrink animation before deleting
            gsap.to(mesh.scale, {
                x: 0, y: 0, z: 0,
                duration: 0.3,
                onComplete: () => scene.remove(mesh)
            });
            this.meshGrid[x][z] = null;
        }
    }

    // Find all empty tiles
    getEmpties() {
        let empties = [];
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                if (!this.grid[x][z]) empties.push({ x, z });
            }
        }
        return empties;
    }

    // Flood Fill to find connected buildings of same tier
    findMergeCluster() {
        let visited = new Set();
        let bestCluster = [];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                if (!this.grid[x][z]) continue;

                let key = `${x},${z}`;
                if (visited.has(key)) continue;

                let cluster = this.floodFill(x, z, this.grid[x][z].tier, visited);

                // We need at least 3 to merge
                if (cluster.length >= 3) {
                    // Prioritize higher tier merges
                    if (bestCluster.length === 0 || cluster[0].tier > bestCluster[0].tier) {
                        bestCluster = cluster;
                    }
                }
            }
        }
        return bestCluster.length > 0 ? bestCluster : null;
    }

    floodFill(x, z, tier, visited) {
        let cluster = [];
        let stack = [{x, z}];

        while(stack.length > 0) {
            let p = stack.pop();
            let key = `${p.x},${p.z}`;

            if (!this.isValid(p.x, p.z)) continue;
            if (visited.has(key)) continue;

            let cell = this.grid[p.x][p.z];
            if (cell && cell.tier === tier) {
                visited.add(key);
                cluster.push(cell); // Push the data object
                // Add coordinates to data object for reference
                cell.x = p.x;
                cell.z = p.z;

                // Check Neighbors
                stack.push({x: p.x + 1, z: p.z});
                stack.push({x: p.x - 1, z: p.z});
                stack.push({x: p.x, z: p.z + 1});
                stack.push({x: p.x, z: p.z - 1});
            }
        }
        return cluster;
    }

    updateUI() {
        document.getElementById('pop-count').innerText = this.score;
    }
}

// --- 5. EXECUTION & LOOP ---

// Init Game State
const city = new CityGrid(CONFIG.gridSize);

// New Game State Logic
const gameState = {
    nextTier: 1,
    isGameOver: false,
    isBusy: false
};

function generateNextTier() {
    // Weighted random: 70% Tier 1, 30% Tier 2
    return Math.random() < 0.7 ? 1 : 2;
}

// Initial Generation
gameState.nextTier = generateNextTier();
updateNextTierUI();

// Helper: Convert Grid Index to World Position
function gridToWorld(x, z) {
    const offset = (CONFIG.gridSize * CONFIG.tileSize) / 2 - (CONFIG.tileSize / 2);
    return {
        x: (x * CONFIG.tileSize) - offset,
        z: (z * CONFIG.tileSize) - offset
    };
}

// Create the Ground Platform
const platformGeo = new THREE.BoxGeometry(
    CONFIG.gridSize * CONFIG.tileSize,
    0.2,
    CONFIG.gridSize * CONFIG.tileSize
);

// Ground Texture
const groundTex = TextureFactory.ground();
groundTex.wrapS = THREE.RepeatWrapping;
groundTex.wrapT = THREE.RepeatWrapping;
groundTex.repeat.set(CONFIG.gridSize, CONFIG.gridSize);

const platformMat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.8
});

const platform = new THREE.Mesh(platformGeo, platformMat);
platform.position.y = -0.1;
platform.receiveShadow = true;
scene.add(platform);

// Helper: Spawn Visual
function spawnVisual(x, z, tier) {
    // Clean up existing if any (safety check)
    if (city.meshGrid[x][z]) scene.remove(city.meshGrid[x][z]);

    const mesh = createBuildingMesh(tier);
    const pos = gridToWorld(x, z);
    mesh.position.set(pos.x, mesh.position.y, pos.z);

    // Start invisible
    mesh.scale.set(0, 0, 0);
    scene.add(mesh);
    city.meshGrid[x][z] = mesh;

    // POP Animation
    gsap.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
    });
}

// THE HEARTBEAT
// function gameTick() {
//     // 1. Check for Merges
//     const cluster = city.findMergeCluster();

//     if (cluster) {
//         // Merge Logic
//         const survivor = cluster[0]; // Logic: First one stays
//         const newTier = survivor.tier + 1;

//         // Remove all from data & visual
//         cluster.forEach(b => city.remove(b.x, b.z));

//         // Delay spawn of upgrade to let shrink animation play
//         setTimeout(() => {
//             city.place(survivor.x, survivor.z, newTier);
//             spawnVisual(survivor.x, survivor.z, newTier);
//         }, 300);

//     } else {
//         // 2. Spawn Logic
//         const empties = city.getEmpties();
//         if (empties.length === 0) {
//             // Game Over / Reset
//             console.log("Grid Full! Resetting...");
//             // Optional: city = new CityGrid(5); // Reset logic
//             return;
//         }

//         const spot = empties[Math.floor(Math.random() * empties.length)];
//         city.place(spot.x, spot.z, 1); // Always spawn Tier 1
//         spawnVisual(spot.x, spot.z, 1);
//     }
// }

// Start Timer
// setInterval(gameTick, CONFIG.tickRate);

// --- 6. INTERACTION ---

// Raycaster & Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Cursor Visual
const cursorGeo = new THREE.BoxGeometry(CONFIG.tileSize, 0.2, CONFIG.tileSize);
const cursorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.5, transparent: true });
const cursor = new THREE.Mesh(cursorGeo, cursorMat);
scene.add(cursor);
cursor.visible = false; // Initially hidden

// Event Listeners
window.addEventListener('mousemove', (event) => {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(platform);

    if (intersects.length > 0) {
        const point = intersects[0].point;

        // Convert to Grid Coords
        const offset = (CONFIG.gridSize * CONFIG.tileSize) / 2 - (CONFIG.tileSize / 2);
        const gx = Math.round((point.x + offset) / CONFIG.tileSize);
        const gz = Math.round((point.z + offset) / CONFIG.tileSize);

        // Snap Cursor
        if (city.isValid(gx, gz)) {
            const worldPos = gridToWorld(gx, gz);
            cursor.position.set(worldPos.x, 0.1, worldPos.z);
            cursor.visible = true;
        } else {
            cursor.visible = false;
        }
    } else {
        cursor.visible = false;
    }
});

// Click Listener
window.addEventListener('mousedown', (event) => {
    if (gameState.isGameOver || gameState.isBusy) return;

    // Reuse mouse coordinates from mousemove if available, or update them
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(platform);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const offset = (CONFIG.gridSize * CONFIG.tileSize) / 2 - (CONFIG.tileSize / 2);
        const gx = Math.round((point.x + offset) / CONFIG.tileSize);
        const gz = Math.round((point.z + offset) / CONFIG.tileSize);

        if (city.isValid(gx, gz) && city.grid[gx][gz] === null) {
            // Place Building
            city.place(gx, gz, gameState.nextTier);
            spawnVisual(gx, gz, gameState.nextTier);

            // Check Merges
            resolveMerges(gx, gz);

            // Next Turn
            gameState.nextTier = generateNextTier();
            updateNextTierUI();

            console.log("Next Tier:", gameState.nextTier);
        }
    }
});

function resolveMerges(x, z) {
    if (!city.isValid(x, z) || city.grid[x][z] === null) {
        gameState.isBusy = false;
        return;
    }

    const currentTier = city.grid[x][z].tier;
    const cluster = city.floodFill(x, z, currentTier, new Set());

    if (cluster.length >= 3) {
        console.log("Merge!", cluster.length, "items of Tier", currentTier);
        gameState.isBusy = true;

        // Remove all from data & visual
        cluster.forEach(b => city.remove(b.x, b.z));

        // Delay spawn of upgrade to let shrink animation play
        setTimeout(() => {
            const newTier = currentTier + 1;
            city.place(x, z, newTier);
            spawnVisual(x, z, newTier);

            // Recursive check
            resolveMerges(x, z);
        }, 400);
    } else {
        gameState.isBusy = false;
    }
}

function updateNextTierUI() {
    const nextTierEl = document.getElementById('next-tier');
    if (nextTierEl) {
        nextTierEl.innerText = gameState.nextTier;

        // Update color based on tier palette
        const t = Math.min(Math.max(gameState.nextTier, 1), 10);
        const colorHex = PALETTE[t - 1];
        nextTierEl.style.color = '#' + colorHex.toString(16).padStart(6, '0');
    }
}

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});