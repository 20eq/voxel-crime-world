// ============================================
// WORLD - Voxel Chunk System
// ============================================

import * as THREE from 'three';
import { Chunk } from './Chunk.js';
import { Generator } from './Generator.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map(); // Map<string, Chunk>
    this.chunkSize = 16; // Voxels per chunk side
    this.renderDistance = 3; // Chunks in each direction
    this.generator = new Generator();
    this.blocks = {}; // Block types definition
    this.blockTypes = []; // Array of block materials
  }

  async generate() {
    console.log('🌍 Generating world...');
    this.defineBlocks();
    
    const radius = this.renderDistance;
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        this.createChunk(x, z);
      }
    }

    console.log(`✅ Generated ${this.chunks.size} chunks`);
  }

  defineBlocks() {
    // Define block types with colors
    this.blocks = {
      GRASS: { color: 0x4a7c23, name: 'Grass' },
      DIRT: { color: 0x8b5a2b, name: 'Dirt' },
      STONE: { color: 0x808080, name: 'Stone' },
      SAND: { color: 0xc2b280, name: 'Sand' },
      WATER: { color: 0x3498db, transparent: true, name: 'Water' },
      WOOD: { color: 0x8b4513, name: 'Wood' },
      LEAVES: { color: 0x228b22, transparent: true, name: 'Leaves' },
      BRICK: { color: 0xb22222, name: 'Brick' },
      GLASS: { color: 0xadd8e6, transparent: true, name: 'Glass' },
      METAL: { color: 0x696969, name: 'Metal' },
      CONCRETE: { color: 0x808080, name: 'Concrete' },
      ASPHALT: { color: 0x333333, name: 'Asphalt' },
    };

    // Create materials for each block type
    this.blockTypes = Object.entries(this.blocks).map(([name, data]) => {
      return new THREE.MeshLambertMaterial({
        color: data.color,
        transparent: data.transparent || false,
        opacity: data.transparent ? 0.7 : 1,
        name: name
      });
    });
  }

  createChunk(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;
    if (this.chunks.has(key)) return;

    const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, this.blockTypes);
    chunk.generate(this.generator);
    chunk.buildMesh();
    
    this.chunks.set(key, chunk);
    this.scene.add(chunk.mesh);
  }

  getChunkKey(worldX, worldZ) {
    const chunkX = Math.floor(worldX / this.chunkSize);
    const chunkZ = Math.floor(worldZ / this.chunkSize);
    return `${chunkX},${chunkZ}`;
  }

  getBlock(x, y, z) {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const key = `${chunkX},${chunkZ}`;
    
    const chunk = this.chunks.get(key);
    if (!chunk) return 0;

    return chunk.getBlock(x % this.chunkSize, y, z % this.chunkSize);
  }

  setBlock(x, y, z, blockType) {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const key = `${chunkX},${chunkZ}`;
    
    const chunk = this.chunks.get(key);
    if (!chunk) return;

    chunk.setBlock(x % this.chunkSize, y, z % this.chunkSize, blockType);
    chunk.rebuildMesh();
  }

  raycast(origin, direction, maxDistance = 100) {
    const step = 0.1;
    const pos = origin.clone();
    
    for (let d = 0; d < maxDistance; d += step) {
      pos.add(direction.clone().multiplyScalar(step));
      
      const blockX = Math.floor(pos.x);
      const blockY = Math.floor(pos.y);
      const blockZ = Math.floor(pos.z);
      
      const block = this.getBlock(blockX, blockY, blockZ);
      if (block > 0) {
        return { x: blockX, y: blockY, z: blockZ, block: block };
      }
    }
    
    return null;
  }

  update(playerPosition) {
    // Update chunks around player ( LOD system)
    const radius = this.renderDistance;
    const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
    const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

    // Load new chunks if player moved to a new area
    for (let x = playerChunkX - radius; x <= playerChunkX + radius; x++) {
      for (let z = playerChunkZ - radius; z <= playerChunkZ + radius; z++) {
        const key = `${x},${z}`;
        if (!this.chunks.has(key)) {
          this.createChunk(x, z);
        }
      }
    }
  }
}