// ============================================
// CHUNK - Voxel Data & Mesh Builder
// ============================================

import * as THREE from 'three';

export class Chunk {
  constructor(chunkX, chunkZ, size, materials) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.size = size;
    this.height = 32; // Max height
    this.materials = materials;
    this.blocks = new Uint8Array(size * this.height * size); // 3D array flattened
    this.mesh = new THREE.Group();
  }

  generate(generator) {
    const seed = this.chunkX * 1000 + this.chunkZ;
    generator.generate(this, seed);
  }

  getIndex(x, y, z) {
    return y * this.size * this.size + z * this.size + x;
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return 0;
    }
    return this.blocks[this.getIndex(x, y, z)];
  }

  setBlock(x, y, z, blockType) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return;
    }
    this.blocks[this.getIndex(x, y, z)] = blockType;
  }

  buildMesh() {
    const vertices = [];
    const colors = [];
    const indices = [];
    
    const worldOffsetX = this.chunkX * this.size;
    const worldOffsetZ = this.chunkZ * this.size;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.size; z++) {
          const block = this.getBlock(x, y, z);
          if (block === 0) continue;

          const materialIndex = block - 1;
          const color = this.materials[materialIndex].color;
          const r = ((color >> 16) & 255) / 255;
          const g = ((color >> 8) & 255) / 255;
          const b = (color & 255) / 255;

          // Check each face - only render if adjacent block is air
          // Top face
          if (this.getBlock(x, y + 1, z) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX, y + 1, z + worldOffsetZ, 'top', r, g, b);
          }
          // Bottom face
          if (this.getBlock(x, y - 1, z) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX, y, z + worldOffsetZ, 'bottom', r, g, b);
          }
          // Front face
          if (this.getBlock(x, y, z + 1) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX, y, z + worldOffsetZ + 1, 'front', r, g, b);
          }
          // Back face
          if (this.getBlock(x, y, z - 1) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX, y, z + worldOffsetZ, 'back', r, g, b);
          }
          // Right face
          if (this.getBlock(x + 1, y, z) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX + 1, y, z + worldOffsetZ, 'right', r, g, b);
          }
          // Left face
          if (this.getBlock(x - 1, y, z) === 0) {
            this.addFace(vertices, indices, x + worldOffsetX, y, z + worldOffsetZ, 'left', r, g, b);
          }
        }
      }
    }

    if (vertices.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, this.materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.mesh = mesh;
  }

  addFace(vertices, indices, x, y, z, face, r, g, b) {
    const baseIndex = vertices.length / 3;

    // Add vertices based on face direction
    switch (face) {
      case 'top':
        vertices.push(x, y, z, x + 1, y, z, x + 1, y, z + 1, x, y, z, x + 1, y, z + 1, x, y, z + 1);
        break;
      case 'bottom':
        vertices.push(x, y, z, x + 1, y, z, x + 1, y, z - 1, x, y, z, x + 1, y, z - 1, x, y, z - 1);
        break;
      case 'front':
        vertices.push(x, y, z, x, y + 1, z, x + 1, y + 1, z, x, y, z, x + 1, y + 1, z, x + 1, y, z);
        break;
      case 'back':
        vertices.push(x, y, z - 1, x, y + 1, z - 1, x + 1, y + 1, z - 1, x, y, z - 1, x + 1, y + 1, z - 1, x + 1, y, z - 1);
        break;
      case 'right':
        vertices.push(x + 1, y, z, x + 1, y + 1, z, x + 1, y + 1, z + 1, x + 1, y, z, x + 1, y + 1, z + 1, x + 1, y, z + 1);
        break;
      case 'left':
        vertices.push(x, y, z, x, y + 1, z, x, y + 1, z + 1, x, y, z, x, y + 1, z + 1, x, y, z + 1);
        break;
    }

    // Add colors (3 per vertex, 6 vertices per face)
    for (let i = 0; i < 6; i++) {
      colors.push(r, g, b);
    }

    // Add indices (two triangles)
    indices.push(
      baseIndex, baseIndex + 1, baseIndex + 2,
      baseIndex, baseIndex + 2, baseIndex + 3
    );
  }

  rebuildMesh() {
    this.scene?.remove(this.mesh);
    this.buildMesh();
    this.scene?.add(this.mesh);
  }
}