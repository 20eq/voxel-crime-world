// ============================================
// WORLD GENERATOR - Procedural Terrain
// ============================================

// Block type indices
const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  WATER: 5,
  WOOD: 6,
  BRICK: 7,
  CONCRETE: 8,
  ASPHALT: 9,
  GLASS: 10,
  METAL: 11
};

export class Generator {
  constructor() {
    this.seed = 0;
  }

  // Simple seeded random number generator
  random(x, z, y = 0) {
    const n = Math.sin(x * 12.9898 + z * 78.233 + y * 45.164) * 43758.5453;
    return n - Math.floor(n);
  }

  noise2D(x, z, scale = 0.1) {
    const sx = x * scale;
    const sz = z * scale;
    const x0 = Math.floor(sx);
    const z0 = Math.floor(sz);
    
    const fx = sx - x0;
    const fz = sz - z0;

    // Smooth interpolation
    const smoothFx = fx * fx * (3 - 2 * fx);
    const smoothFz = fz * fz * (3 - 2 * fz);

    const n00 = this.random(x0, z0);
    const n10 = this.random(x0 + 1, z0);
    const n01 = this.random(x0, z0 + 1);
    const n11 = this.random(x0 + 1, z0 + 1);

    const nx0 = n00 * (1 - smoothFx) + n10 * smoothFx;
    const nx1 = n01 * (1 - smoothFx) + n11 * smoothFx;

    return nx0 * (1 - smoothFz) + nx1 * smoothFz;
  }

  generate(chunk, seed) {
    this.seed = seed;
    const size = chunk.size;
    const height = chunk.height;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const worldX = chunk.chunkX * size + x;
        const worldZ = chunk.chunkZ * size + z;

        // Generate height using noise
        const heightNoise = this.noise2D(worldX, worldZ, 0.02);
        const terrainHeight = Math.floor(8 + heightNoise * 12);

        // City noise - determine if this area is buildings
        const cityNoise = this.noise2D(worldX * 0.5, worldZ * 0.5, 0.05);
        const isCityArea = cityNoise > 0.4 && cityNoise < 0.6;

        for (let y = 0; y < height; y++) {
          let block = BLOCK.AIR;

          if (y < terrainHeight) {
            if (y === terrainHeight - 1) {
              block = isCityArea ? BLOCK.CONCRETE : BLOCK.GRASS;
            } else if (y > terrainHeight - 4) {
              block = BLOCK.DIRT;
            } else {
              block = BLOCK.STONE;
            }
          }

          chunk.setBlock(x, y, z, block);
        }

        // Generate buildings in city areas
        if (isCityArea) {
          this.generateBuilding(chunk, x, terrainHeight, z, worldX, worldZ);
        }

        // Generate roads
        const roadNoise = this.noise2D(worldX, worldZ, 0.1);
        if (Math.abs(roadNoise - 0.5) < 0.03) {
          for (let y = 0; y < 2; y++) {
            chunk.setBlock(x, terrainHeight - 1 + y, z, BLOCK.ASPHALT);
          }
        }
      }
    }
  }

  generateBuilding(chunk, x, baseY, z, worldX, worldZ) {
    // Building placement noise
    const buildingNoise = this.noise2D(worldX, worldZ, 0.3);
    if (buildingNoise > 0.3) return; // Don't place building here

    const height = 5 + Math.floor(this.random(worldX, worldZ) * 10);
    const width = 2 + Math.floor(this.random(worldX * 2, worldZ) * 2);

    for (let bx = 0; bx < width; bx++) {
      for (let bz = 0; bz < width; bz++) {
        for (let by = 0; by < height; by++) {
          const px = x + bx;
          const pz = z + bz;
          
          if (px >= chunk.size || pz >= chunk.size) continue;

          // Building walls
          if (bx === 0 || bx === width - 1 || bz === 0 || bz === width - 1) {
            if (by < height - 1) {
              chunk.setBlock(px, baseY + by, pz, BLOCK.BRICK);
            }
          }
          // Building top
          if (by === height - 1) {
            chunk.setBlock(px, baseY + by, pz, BLOCK.CONCRETE);
          }
        }
      }
    }
  }
}