// Jest setup file for DOM testing
import '@testing-library/jest-dom';

// Mock File API for Node.js environment
global.File = class File {
  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.type = options.type || '';
    this.size = 0;
    this.lastModified = Date.now();
  }
  
  name: string;
  type: string;
  size: number;
  lastModified: number;
} as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Canvas API
(global as any).HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4)
  })),
  putImageData: jest.fn(),
  imageSmoothingEnabled: true,
}));

(global as any).HTMLCanvasElement.prototype.toBlob = jest.fn((callback: (blob: Blob | null) => void) => {
  const mockBlob = {
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    size: 0,
    type: 'image/png',
    slice: jest.fn(),
    stream: jest.fn(),
    text: jest.fn()
  } as Blob;
  callback(mockBlob);
});

// Mock Image constructor
(global as any).Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  width: number = 100;
  height: number = 100;
};