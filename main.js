/**
 * POP CITY - MASTER ENGINE
 * Phase 1-7 Integrated
 */

// --- 1. CONFIGURATION ---
const CONFIG = {
    gridSize: 10,        // 10x10 Grid
    tileSize: 1.2,       // Spacing between buildings
    tickRate: 1500,      // Speed of the game (ms)
    cameraDist: 7       // Zoom level - Increased for larger grid
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
    createCanvas: function (width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    createTexture: function (drawFn) {
        const canvas = this.createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        drawFn(ctx, 256, 256);
        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter; // Keep it crisp
        return tex;
    },

    // 1. Cobblestone Grid (Industrial Base)
    grid: function (bgColor, lineColor) {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = "#555"; // Dark Stone
            ctx.fillRect(0, 0, w, h);

            // Stones
            ctx.fillStyle = "#666";
            const numStones = 150;
            for(let i=0; i<numStones; i++) {
                const sx = Math.random() * w;
                const sy = Math.random() * h;
                const sw = 10 + Math.random() * 20;
                const sh = 10 + Math.random() * 20;
                ctx.fillRect(sx, sy, sw, sh);
            }

            // Main Grid
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 4;
            // No strict grid lines for cobblestone, just border
            ctx.strokeRect(0, 0, w, h);
        });
    },

    // 2. Brick Residential (Victorian)
    residential: function (wallColor, windowColor) {
        return this.createTexture((ctx, w, h) => {
            // Brick Pattern
            ctx.fillStyle = wallColor;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = "rgba(0,0,0,0.15)";
            const brickH = 16;
            const brickW = 32;
            for(let y=0; y<h; y+=brickH) {
                const offset = (y/brickH) % 2 === 0 ? 0 : brickW/2;
                for(let x=-brickW; x<w; x+=brickW) {
                    ctx.fillRect(x + offset, y, brickW-2, brickH-2);
                }
            }

            // Windows (Tall Victorian Sash)
            const cols = 2;
            const rows = 2;
            const padX = 40;
            const padY = 40;
            const winW = (w - (padX * (cols + 1))) / cols;
            const winH = 80;

            ctx.fillStyle = "#222"; // Dark frame
            ctx.strokeStyle = "#443322"; // Dark Wood trim
            ctx.lineWidth = 4;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const wx = padX + c * (winW + padX);
                    const wy = padY + r * (winH + padY);

                    // Frame & Glass
                    ctx.fillRect(wx - 4, wy - 4, winW + 8, winH + 8);

                    // Warm Light
                    ctx.fillStyle = "#ffddaa"; // Warm candlelight
                    ctx.fillRect(wx, wy, winW, winH);

                    // Sash (Cross)
                    ctx.beginPath();
                    ctx.moveTo(wx + winW/2, wy);
                    ctx.lineTo(wx + winW/2, wy + winH);
                    ctx.moveTo(wx, wy + winH/2);
                    ctx.lineTo(wx + winW, wy + winH/2);
                    ctx.stroke();

                    // Reset fill for next iteration/bricks
                    ctx.fillStyle = "#222";
                }
            }

            // Door (Arched top ideally, but box is fine)
            const doorW = 50;
            const doorH = 80;
            const dx = (w - doorW) / 2;
            const dy = h - doorH;

            ctx.fillStyle = "#2a1a10"; // Dark Oak
            ctx.fillRect(dx, dy, doorW, doorH);

            // Panels
            ctx.fillStyle = "#3e2723";
            ctx.fillRect(dx+5, dy+5, doorW-10, doorH/2-10);
            ctx.fillRect(dx+5, dy+doorH/2+5, doorW-10, doorH/2-10);
        });
    },

    // 3. Wood Siding / Industrial Factory (Horizontal Lines)
    commercial: function (baseColor, glassColor) {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, w, h);

            // Horizontal Siding or Corrugated Metal
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            const slatH = 12;
            for(let y=0; y<h; y+=slatH) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke(); // Thin lines
            }

            // Factory Windows (Grid of small panes)
            const winW = w - 40;
            const winH = h / 3;
            const wx = 20;
            const wy = h / 3;

            ctx.fillStyle = "#1a1a1a"; // Iron Frame
            ctx.fillRect(wx-4, wy-4, winW+8, winH+8);

            ctx.fillStyle = "#add8e6"; // Blueish industrial glass (cool contrast to warm brick)
            ctx.fillRect(wx, wy, winW, winH);

            // Muntins (Grid)
            ctx.strokeStyle = "#1a1a1a";
            ctx.lineWidth = 3;
            const panesX = 4;
            const panesY = 3;

            for(let i=1; i<panesX; i++) {
                const x = wx + (winW/panesX)*i;
                ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x, wy+winH); ctx.stroke();
            }
            for(let i=1; i<panesY; i++) {
                const y = wy + (winH/panesY)*i;
                ctx.beginPath(); ctx.moveTo(wx, y); ctx.lineTo(wx+winW, y); ctx.stroke();
            }
        });
    },

    // 4. Ground (Paved/Grass)
    ground: function () {
        return this.createTexture((ctx, w, h) => {
            ctx.fillStyle = "#88cc88"; // Grass Base
            ctx.fillRect(0, 0, w, h);

            // Noise / Texture
            ctx.fillStyle = "#7abf7a"; // Slightly darker
            for (let i = 0; i < 400; i++) {
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
    },

    // 5. Road (Asphalt)
    road: function () {
        return this.createTexture((ctx, w, h) => {
            // Asphalt Base
            ctx.fillStyle = "#555555";
            ctx.fillRect(0, 0, w, h);

            // Noise
            ctx.fillStyle = "#666666";
            for (let i = 0; i < 500; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const s = Math.random() * 3 + 1;
                ctx.fillRect(x, y, s, s);
            }

            // Lane Markings (Dashed White Line)
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 8;
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w / 2, h);
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // Cross street hint (horizontal light line)
            ctx.strokeStyle = "#666666";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();

            // Border
            ctx.strokeStyle = "#444444";
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, w, h);
        });
    }
};

// Color Palette (Cozy Victorian Industrial)
const PALETTE = [
    0x8b4513, // T1: Saddle Brown (Wood Cottage)
    0xa0522d, // T2: Sienna (Brick Townhouse)
    0xcd853f, // T3: Peru (Warm Stone)
    0x556b2f, // T4: Dark Olive Green (Painted Siding)
    0x800000, // T5: Maroon (Deep Red Brick Factory)
    0x708090, // T6: Slate Gray (Stone Warehouse)
    0x2f4f4f, // T7: Dark Slate Gray (Ironworks)
    0xb8860b, // T8: Dark Goldenrod (Brass/Copper details)
    0x483d8b, // T9: Dark Slate Blue (Victorian Roof Slate)
    0xd2691e  // T10: Chocolate (Grand Hall Brick)
];

// Material Factory
function createPlasticMat(colorHex) {
    // Reuse via getMaterial
    return getMaterial('standard', {
        color: colorHex,
        roughness: 0.3,
        metalness: 0.1,
        flatShading: true
    });
}

// --- ASSET MANAGEMENT ---
const ASSETS = {
    textures: {},
    geometries: {},
    materials: {}
};

// Initialize common geometries
ASSETS.geometries.box = new THREE.BoxGeometry(1, 1, 1);
ASSETS.geometries.cylinder = new THREE.CylinderGeometry(1, 1, 1, 16); // Base, will be scaled
ASSETS.geometries.cone = new THREE.ConeGeometry(0.6, 0.4, 4);
ASSETS.geometries.torus = new THREE.TorusGeometry(0.3, 0.05, 16, 16);
ASSETS.geometries.plane = new THREE.PlaneGeometry(1, 1);

function getMaterial(type, params) {
    const key = `${type}_${JSON.stringify(params)}`;
    if (!ASSETS.materials[key]) {
        if (type === 'standard') {
            ASSETS.materials[key] = new THREE.MeshStandardMaterial(params);
        } else if (type === 'basic') {
            ASSETS.materials[key] = new THREE.MeshBasicMaterial(params);
        }
    }
    return ASSETS.materials[key];
}

// The Procedural Building Generator
function createBuildingMesh(tier) {
    // Clamp tier to 1-10
    const t = Math.min(Math.max(tier, 1), 10);

    // Generate or Fetch Texture
    if (!ASSETS.textures[t]) {
        const colorHex = PALETTE[t - 1];
        const colorStr = '#' + colorHex.toString(16).padStart(6, '0');

        if (t === -1) {
            ASSETS.textures[t] = TextureFactory.road();
        } else if (t <= 3) {
            ASSETS.textures[t] = TextureFactory.residential(colorStr, '#feffdf'); // Light Yellow Windows
        } else if (t <= 6) {
            ASSETS.textures[t] = TextureFactory.commercial(colorStr, '#e0f7fa'); // Cyan Glass
        } else {
            ASSETS.textures[t] = TextureFactory.grid(colorStr, '#ffffff'); // High tech white lines
        }
    }

    if (t === -1) {
        // Road Mesh (Flat plane slightly above ground)
        const roadMat = getMaterial('standard', {
            map: ASSETS.textures[t],
            roughness: 0.9,
            metalness: 0.0
        });

        // Reuse box geometry, scale it
        const mesh = new THREE.Mesh(ASSETS.geometries.box, roadMat);
        mesh.scale.set(1, 0.05, 1);
        mesh.position.y = 0.025;
        mesh.receiveShadow = true;
        return mesh;
    }

    const mat = getMaterial('standard', {
        map: ASSETS.textures[t],
        roughness: 0.3,
        metalness: 0.1
    });

    // Roof Material (Darker shade of base color)
    const roofColor = new THREE.Color(PALETTE[t - 1]).multiplyScalar(0.6);
    const roofMat = getMaterial('standard', {
        color: roofColor,
        roughness: 0.6,
        flatShading: true
    });

    // Materials Arrays
    // Box: Right, Left, Top, Bottom, Front, Back
    // Note: Mutating shared arrays is bad if we modify them later, but here they are just passed to Mesh
    const boxMaterials = [mat, mat, roofMat, mat, mat, mat];
    const cylMaterials = [mat, roofMat, roofMat];

    let mesh;

    // Procedural Shapes based on Tier (Victorian / Industrial)
    if (t === 1) {
        // Tier 1: Cozy Cottage (Steep Roof, Wood)
        mesh = new THREE.Group();
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.8, 0.5, 0.8);
        base.position.y = 0.25;
        mesh.add(base);

        const roof = new THREE.Mesh(ASSETS.geometries.cone, roofMat);
        roof.scale.set(1.0, 0.8, 1.0); // Slightly flatter cone than original but still steep
        roof.position.y = 0.7;
        roof.rotation.y = Math.PI / 4;
        mesh.add(roof);

        // Stone Chimney
        const chimMat = createPlasticMat(0x555555);
        const chimney = new THREE.Mesh(ASSETS.geometries.box, chimMat);
        chimney.scale.set(0.2, 0.5, 0.2);
        chimney.position.set(0.25, 0.5, 0.2);
        mesh.add(chimney);
    }
    else if (t === 2) {
        // Tier 2: Brick Townhouse (2 Story, Flat Roof with Cornice)
        mesh = new THREE.Group();
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.7, 0.9, 0.7);
        base.position.y = 0.45;
        mesh.add(base);

        // Fancy Cornice
        const cornice = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x3e2723));
        cornice.scale.set(0.8, 0.1, 0.8);
        cornice.position.y = 0.95;
        mesh.add(cornice);

        // Front Stoop
        const stoop = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x555555));
        stoop.scale.set(0.3, 0.2, 0.2);
        stoop.position.set(0, 0.1, 0.4);
        mesh.add(stoop);
    }
    else if (t === 3) {
        // Tier 3: Victorian Manor (Turret, Porch)
        mesh = new THREE.Group();

        // Main House
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.8, 0.8, 0.6); // Wide but shallow
        base.position.y = 0.4;
        mesh.add(base);

        // Turret Base
        const turretBase = new THREE.Mesh(ASSETS.geometries.cylinder, boxMaterials);
        turretBase.scale.set(0.25, 1.2, 0.25);
        turretBase.position.set(-0.35, 0.6, 0.25); // Corner
        mesh.add(turretBase);

        // Turret Roof
        const turretRoof = new THREE.Mesh(ASSETS.geometries.cone, roofMat);
        turretRoof.scale.set(0.35, 0.6, 0.35);
        turretRoof.position.set(-0.35, 1.3, 0.25);
        mesh.add(turretRoof);

        // Main Roof (Gabled)
        const mainRoof = new THREE.Mesh(ASSETS.geometries.cone, roofMat);
        mainRoof.scale.set(1.0, 0.5, 0.8);
        mainRoof.position.y = 0.9;
        mainRoof.rotation.y = Math.PI / 4;
        mesh.add(mainRoof);
    }
    else if (t === 4) {
        // Tier 4: Small Factory (Sawtooth Roof)
        mesh = new THREE.Group();
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(1.0, 0.6, 0.8);
        base.position.y = 0.3;
        mesh.add(base);

        // Sawtooth / Skylights
        const skyMat = createPlasticMat(0x88ccff);
        for(let i=0; i<3; i++) {
            const tooth = new THREE.Mesh(ASSETS.geometries.box, roofMat);
            tooth.scale.set(1.0, 0.2, 0.25);
            tooth.rotation.x = -Math.PI / 6; // Angled
            tooth.position.set(0, 0.7, -0.25 + (i * 0.25));
            mesh.add(tooth);
        }

        // Small Smokestack
        const stack = new THREE.Mesh(ASSETS.geometries.cylinder, createPlasticMat(0x333333));
        stack.scale.set(0.1, 0.8, 0.1);
        stack.position.set(0.4, 0.6, 0.3);
        mesh.add(stack);
    }
    else if (t === 5) {
        // Tier 5: Large Brick Factory (Water Tower)
        mesh = new THREE.Group();
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.9, 1.2, 0.9);
        base.position.y = 0.6;
        mesh.add(base);

        // Water Tower on Roof
        const tankLegs = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x444444));
        tankLegs.scale.set(0.3, 0.4, 0.3);
        tankLegs.position.set(0, 1.3, 0);
        mesh.add(tankLegs);

        const tank = new THREE.Mesh(ASSETS.geometries.cylinder, createPlasticMat(0x8b4513)); // Wood tank
        tank.scale.set(0.25, 0.3, 0.25);
        tank.position.set(0, 1.5, 0);
        mesh.add(tank);

        // Roof Vent
        const vent = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x666666));
        vent.scale.set(0.2, 0.2, 0.2);
        vent.position.set(0.3, 1.3, 0.3);
        mesh.add(vent);
    }
    else if (t === 6) {
        // Tier 6: Industrial Warehouse / Loft
        mesh = new THREE.Group();
        const h = 1.5;

        // Wide Base
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(1.1, h, 0.8);
        base.position.y = h/2;
        mesh.add(base);

        // Loading Dock Overhang
        const overhang = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x222222));
        overhang.scale.set(1.2, 0.05, 0.3);
        overhang.position.set(0, 0.4, 0.45); // Front
        mesh.add(overhang);

        // Roof Details (HVAC)
        const ac = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x999999));
        ac.scale.set(0.3, 0.2, 0.3);
        ac.position.set(-0.3, h+0.1, 0);
        mesh.add(ac);
    }
    else if (t === 7) {
        // Tier 7: Clock Tower (Stone)
        mesh = new THREE.Group();
        const h = 2.5;

        // Tower Shaft
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.5, h, 0.5);
        base.position.y = h/2;
        mesh.add(base);

        // Clock Face Cube
        const clockBox = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0xeeeeee)); // White face
        clockBox.scale.set(0.55, 0.55, 0.55);
        clockBox.position.y = h - 0.5;
        mesh.add(clockBox);

        // Spire
        const spire = new THREE.Mesh(ASSETS.geometries.cone, roofMat);
        spire.scale.set(0.6, 0.8, 0.6);
        spire.position.y = h + 0.1;
        spire.rotation.y = Math.PI/4;
        mesh.add(spire);
    }
    else if (t === 8) {
        // Tier 8: Grand Hotel (Mansard Roof)
        mesh = new THREE.Group();
        const h = 2.0;

        // Main Block
        const base = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        base.scale.set(0.9, h, 0.9);
        base.position.y = h/2;
        mesh.add(base);

        // Mansard Roof (Truncated Pyramid look via scaling)
        // We can mimic this with a box + smaller box or a specific geometry.
        // Let's use a dark box with slightly smaller top
        const roofBase = new THREE.Mesh(ASSETS.geometries.cone, roofMat); // Cone actually
        // 4 sided cone = pyramid
        roofBase.scale.set(1.0, 0.6, 1.0);
        roofBase.position.y = h + 0.3;
        roofBase.rotation.y = Math.PI/4;
        mesh.add(roofBase);

        // Dormer Windows (Tiny boxes sticking out of roof)
        const dormerMat = createPlasticMat(0xffffff);
        for(let i=0; i<4; i++) {
            const d = new THREE.Mesh(ASSETS.geometries.box, dormerMat);
            d.scale.set(0.15, 0.15, 0.15);
            // Position on 4 sides
            const angle = (i * Math.PI) / 2;
            d.position.set(Math.sin(angle)*0.3, h+0.2, Math.cos(angle)*0.3);
            mesh.add(d);
        }
    }
    else if (t === 9) {
        // Tier 9: Ironworks Spire
        mesh = new THREE.Group();
        const h = 3.0;

        // Lattice Structure (Simulated with thin cylinder)
        const strutMat = createPlasticMat(0x2f4f4f);

        // 4 Legs
        const legGeo = ASSETS.geometries.cylinder;
        const spread = 0.3;
        const positions = [[1,1], [1,-1], [-1,1], [-1,-1]];

        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, strutMat);
            leg.scale.set(0.05, h, 0.05);
            // Angle them inward? Complicated rotation. Keep straight for now.
            leg.position.set(pos[0]*spread/2, h/2, pos[1]*spread/2);
            mesh.add(leg);
        });

        // Cross braces (Rings)
        for(let i=1; i<5; i++) {
            const ring = new THREE.Mesh(ASSETS.geometries.torus, strutMat);
            ring.scale.set(1.0, 1.0, 1.0); // Torus is 0.3 radius, so 0.6 dia
            // We want diameter approx 0.3 (spread)
            // 0.6 * s = 0.3 -> s = 0.5
            ring.scale.set(0.6, 0.6, 1);
            ring.position.y = i * (h/5);
            ring.rotation.x = Math.PI/2;
            mesh.add(ring);
        }

        // Top Smoke
        const top = new THREE.Mesh(ASSETS.geometries.cone, strutMat);
        top.scale.set(0.5, 0.5, 0.5);
        top.position.y = h;
        mesh.add(top);
    }
    else {
        // Tier 10: Monument / Capitol (Dome)
        mesh = new THREE.Group();
        const h = 1.8;

        // Base Steps
        const steps = new THREE.Mesh(ASSETS.geometries.box, createPlasticMat(0x888888));
        steps.scale.set(1.1, 0.2, 1.1);
        steps.position.y = 0.1;
        mesh.add(steps);

        // Main Hall
        const hall = new THREE.Mesh(ASSETS.geometries.box, boxMaterials);
        hall.scale.set(0.9, h, 0.9);
        hall.position.y = h/2 + 0.1;
        mesh.add(hall);

        // Columns (Front)
        const colMat = createPlasticMat(0xdddddd); // Marble
        for(let i=-1; i<=1; i+=0.5) {
             const col = new THREE.Mesh(ASSETS.geometries.cylinder, colMat);
             col.scale.set(0.08, h, 0.08);
             col.position.set(i*0.35, h/2+0.1, 0.5); // Front face
             mesh.add(col);
        }

        // Dome (Sphere half?) We only have cone/cylinder/box/torus in ASSETS.
        // Let's make a sphere if not exists, or reuse/approximate.
        // Actually we can add sphere to ASSETS.
        if (!ASSETS.geometries.sphere) {
            ASSETS.geometries.sphere = new THREE.SphereGeometry(0.5, 16, 16);
        }

        const dome = new THREE.Mesh(ASSETS.geometries.sphere, createPlasticMat(0xb8860b)); // Gold/Copper Dome
        dome.scale.set(0.9, 0.9, 0.9);
        dome.position.y = h + 0.3;
        mesh.add(dome);
    }

    // Enable Shadows for all parts
    mesh.traverse((c) => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
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
        this.buildingCount = 0;
    }

    // Check if coordinate is valid
    isValid(x, z) {
        return x >= 0 && x < this.size && z >= 0 && z < this.size;
    }

    // Add building to data
    place(x, z, tier) {
        if (!this.isValid(x, z)) return null;

        // If it's a road, we can overwrite it. If it's a building, we can't.
        if (this.grid[x][z] !== null && this.grid[x][z].tier !== -1) return null;

        // Remove visualization if overwriting road
        if (this.meshGrid[x][z]) {
            scene.remove(this.meshGrid[x][z]);
            this.meshGrid[x][z] = null;
        }

        // Data
        this.grid[x][z] = { tier: tier, id: Date.now() + Math.random() };

        // Only score if it's a building (tier > 0)
        if (tier > 0) {
            this.score += Math.pow(tier, 2) * 10; // Exponential score
            this.buildingCount++;
        }

        return this.grid[x][z];
    }

    // Remove building from data and scene
    remove(x, z) {
        if (!this.isValid(x, z)) return;

        // Don't remove roads unless forced (tier -1)
        // Actually, remove serves game logic (merging), so we should remove roads 
        // if they are part of the merge? No, merges are tier-based. 
        // Roads are tier -1.

        if (this.grid[x][z] && this.grid[x][z].tier > 0) {
            this.buildingCount--;
        }

        this.grid[x][z] = null;

        if (this.meshGrid[x][z]) {
            const mesh = this.meshGrid[x][z];
            // Shrink animation before deleting
            gsap.to(mesh.scale, {
                x: 0, y: 0, z: 0,
                duration: 0.1,
                onComplete: () => scene.remove(mesh)
            });
            this.meshGrid[x][z] = null;
        }

        // After removing a building, we might need to update roads? 
        // Or maybe just leave them until something overwrites them?
        // Let's leave them for now, it's simpler.
    }

    updateRoads() {
        // Scan for empty spots that should be roads
        // Rule: Empty spot with at least 1 building neighbor becomes a road?
        // Or: Empty spot connected to existing road or building?

        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                // Only place roads on empty tiles
                if (this.grid[x][z] === null) {
                    let neighborCount = 0;

                    neighbors.forEach(([dx, dz]) => {
                        const nx = x + dx;
                        const nz = z + dz;
                        if (this.isValid(nx, nz) && this.grid[nx][nz] !== null) {
                            neighborCount++;
                        }
                    });

                    // If it has at least 2 neighbors (building or road), it becomes a road
                    // This prevents flood-filling the entire map
                    if (neighborCount >= 2) {
                        this.place(x, z, -1); // Tier -1 is Road
                        spawnVisual(x, z, -1);
                    }
                }
            }
        }
    }

    // Find all empty tiles
    getEmpties() {
        let empties = [];
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                // Empties or Roads are valid spawn points for buildings
                if (!this.grid[x][z] || this.grid[x][z].tier === -1) empties.push({ x, z });
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
        let stack = [{ x, z }];

        while (stack.length > 0) {
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
                stack.push({ x: p.x + 1, z: p.z });
                stack.push({ x: p.x - 1, z: p.z });
                stack.push({ x: p.x, z: p.z + 1 });
                stack.push({ x: p.x, z: p.z - 1 });
            }
        }
        return cluster;
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
        duration: 0.2,
        ease: "elastic.out(1, 0.5)"
    });
}

// THE HEARTBEAT
function gameTick() {
    if (gameState.isBusy || gameState.isGameOver) return;

    // 1. Check for Merges
    const cluster = city.findMergeCluster();
    if (cluster) {
        resolveMerges(cluster[0].x, cluster[0].z);
    } else {
        // 2. Spawn Logic
        const empties = city.getEmpties();
        if (empties.length === 0) {
            console.log("Grid Full! Game Over.");
            triggerGameOver();
            return;
        }

        // Clustering Logic: Filter for empties with neighbors
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const candidates = empties.filter(pos => {
            return neighbors.some(([dx, dz]) => {
                const nx = pos.x + dx;
                const nz = pos.z + dz;
                return city.isValid(nx, nz) && city.grid[nx][nz] !== null;
            });
        });

        // Pick from candidates if any, otherwise random (first building)
        const targets = candidates.length > 0 ? candidates : empties;
        const spot = targets[Math.floor(Math.random() * targets.length)];

        city.place(spot.x, spot.z, 1); // Always spawn Tier 1
        spawnVisual(spot.x, spot.z, 1);

        // Immediate merge check for the new placement
        resolveMerges(spot.x, spot.z);
    }
}

// Start Timer
setInterval(gameTick, CONFIG.tickRate);

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

        if (city.isValid(gx, gz) && (city.grid[gx][gz] === null || city.grid[gx][gz].tier === -1)) {
            // Place Building
            city.place(gx, gz, gameState.nextTier);
            spawnVisual(gx, gz, gameState.nextTier);

            // Check Merges
            resolveMerges(gx, gz);

            // Next Turn
            gameState.nextTier = generateNextTier();

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
    if (currentTier === -1) { // Don't merge roads
        gameState.isBusy = false;
        return;
    }
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
        }, 150);
    } else {
        gameState.isBusy = false;
    }
}

// --- 5.1 AVATAR SYSTEM ---

class Avatar {
    constructor(startGridX, startGridZ) {
        this.gx = startGridX;
        this.gz = startGridZ;

        // Visuals
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const mat = getMaterial('standard', { color: color });

        // Reuse or create avatar geometry
        if (!ASSETS.geometries.avatar) {
            ASSETS.geometries.avatar = new THREE.ConeGeometry(0.1, 0.3, 8);
        }

        this.mesh = new THREE.Mesh(ASSETS.geometries.avatar, mat);

        const startPos = gridToWorld(this.gx, this.gz);
        this.mesh.position.set(startPos.x, 0.15, startPos.z);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        // Movement State
        this.isMoving = false;
        this.target = null;
        this.speed = 0.5; // Units per second
    }

    update(dt) {
        if (this.isMoving && this.target) {
            const currentPos = this.mesh.position;
            const targetPos = this.target;

            const dist = currentPos.distanceTo(targetPos);

            if (dist < 0.05) {
                // Arrived
                this.mesh.position.copy(targetPos);
                this.isMoving = false;
                this.gx = this.targetGx;
                this.gz = this.targetGz;
                // Decide next move immediately or wait? 
                // Let's decide next frame implicitly by being not moving
            } else {
                // Move towards
                const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
                this.mesh.position.add(dir.multiplyScalar(this.speed * dt));
            }
        } else {
            // Pick a new target
            this.pickMove();
        }
    }

    pickMove() {
        // Look for valid neighbors (Roads or Buildings)
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const validMoves = [];

        neighbors.forEach(([dx, dz]) => {
            const nx = this.gx + dx;
            const nz = this.gz + dz;

            if (city.isValid(nx, nz)) {
                // Walkable if it's a Road (-1) or a Building (Tier >= 1)
                // Actually, let's say they can walk on everything except empty void?
                // Or maybe strictly Roads and Buildings?
                const cell = city.grid[nx][nz];
                if (cell !== null) {
                    validMoves.push({ x: nx, z: nz });
                }
            }
        });

        if (validMoves.length > 0) {
            // Pick random
            const limit = 10; // Tries to pick a move that isn't previous one logic could go here
            const next = validMoves[Math.floor(Math.random() * validMoves.length)];

            this.targetGx = next.x;
            this.targetGz = next.z;
            const worldPos = gridToWorld(next.x, next.z);
            this.target = new THREE.Vector3(worldPos.x, 0.15, worldPos.z);
            this.isMoving = true;

            // Face direction
            this.mesh.lookAt(this.target);
            // Rotate X to stand up (Cone geometry is weird, points up Y)
            // Actually lookAt points Z axis. Cone points up Y. 
            // We need to rotate geometry or mesh to align. 
            // Simple approach: Just bob up and down
        }
    }

    dispose() {
        scene.remove(this.mesh);
        // Do NOT dispose geometry or material as they are shared now!
    }
}

class AvatarManager {
    constructor() {
        this.avatars = [];
        this.maxAvatars = 20;
        this.spawnTimer = 0;
    }

    update(dt) {
        // Update all avatars
        this.avatars.forEach(a => a.update(dt));

        // Spawn new ones occasionally
        this.spawnTimer += dt;
        if (this.spawnTimer > 2.0 && this.avatars.length < this.maxAvatars) {
            this.spawnTimer = 0;
            this.trySpawn();
        }
    }

    trySpawn() {
        // Find a random building to spawn from
        const buildings = [];
        for (let x = 0; x < city.size; x++) {
            for (let z = 0; z < city.size; z++) {
                if (city.grid[x][z] && city.grid[x][z].tier > 0) {
                    buildings.push({ x, z });
                }
            }
        }

        if (buildings.length > 0) {
            const spot = buildings[Math.floor(Math.random() * buildings.length)];
            this.avatars.push(new Avatar(spot.x, spot.z));
        }
    }
}

const avatarManager = new AvatarManager();

// --- GAME OVER LOGIC ---

function triggerGameOver() {
    if (gameState.isGameOver) return;
    gameState.isGameOver = true;
    gameState.isBusy = true;

    console.log("TRIGGERING GAME OVER EXPLOSION!");

    // Gather all meshes
    const allMeshes = [];
    for (let x = 0; x < CONFIG.gridSize; x++) {
        for (let z = 0; z < CONFIG.gridSize; z++) {
            if (city.meshGrid[x][z]) {
                allMeshes.push(city.meshGrid[x][z]);
            }
        }
    }

    if (allMeshes.length === 0) {
        resetGame();
        return;
    }

    // Explosion Animation
    allMeshes.forEach((mesh, chatIndex) => {
        // Random direction up and out
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 10;
        const tx = mesh.position.x + Math.cos(angle) * dist;
        const tz = mesh.position.z + Math.sin(angle) * dist;
        const ty = 10 + Math.random() * 10;

        gsap.to(mesh.position, {
            x: tx,
            y: ty,
            z: tz,
            duration: 1.5,
            ease: "power2.out"
        });

        gsap.to(mesh.rotation, {
            x: Math.random() * 10,
            y: Math.random() * 10,
            z: Math.random() * 10,
            duration: 1.5,
            ease: "linear"
        });

        gsap.to(mesh.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            delay: 1,
            ease: "back.in(1.7)"
        });
    });

    // Reset after animation
    setTimeout(resetGame, 1600);
}

function resetGame() {
    // 1. Clear Scene Meshes
    for (let x = 0; x < CONFIG.gridSize; x++) {
        for (let z = 0; z < CONFIG.gridSize; z++) {
            if (city.meshGrid[x][z]) {
                scene.remove(city.meshGrid[x][z]);
                city.meshGrid[x][z] = null;
            }
        }
    }

    // 2. Clear Data
    city.grid = Array(CONFIG.gridSize).fill().map(() => Array(CONFIG.gridSize).fill(null));
    city.meshGrid = Array(CONFIG.gridSize).fill().map(() => Array(CONFIG.gridSize).fill(null));

    // 3. Reset State
    city.score = 0;
    city.buildingCount = 0;

    // Reset Avatars
    avatarManager.avatars.forEach(a => a.dispose());
    avatarManager.avatars = [];

    gameState.isGameOver = false;
    gameState.isBusy = false;
    gameState.nextTier = 1; // Reset next tier

    console.log("Game Reset Complete");
}




// Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    avatarManager.update(dt);

    // Update UI
    const popCountEl = document.getElementById('pop-count');
    const buildingCountEl = document.getElementById('building-count');
    if (popCountEl) popCountEl.innerText = avatarManager.avatars.length;
    if (buildingCountEl) buildingCountEl.innerText = city.buildingCount;

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