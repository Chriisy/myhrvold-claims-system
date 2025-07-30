import { parseMyhrvold } from '@/utils/myhrvoldParser';
import fs from 'fs';
import path from 'path';

// Test cases for known Myhrvold invoices
const testCases = [
  ['2313024.pdf', { workCost: 325, partsCost: 248, grandTotal: 573 }],
  ['2313028.pdf', { workCost: 1300, partsCost: 1125, grandTotal: 3025 }],
  ['2313034.pdf', { workCost: 8800, partsCost: 29194, grandTotal: 42994 }],
  ['2313044.pdf', { workCost: 1950, partsCost: 9647.3, grandTotal: 11597 }],
];

describe('Myhrvold Invoice Parser', () => {
  test.each(testCases)('should parse %s correctly', async (filename, expectedTotals) => {
    const filePath = path.join(__dirname, '../fixtures', filename);
    
    // Check if test file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Test file ${filename} not found, skipping test`);
      return;
    }
    
    // Create a File object from the PDF buffer
    const pdfBuffer = fs.readFileSync(filePath);
    const file = new File([pdfBuffer], filename, { type: 'application/pdf' });
    
    try {
      const result = await parseMyhrvold(file);
      
      // Test work cost
      expect(result.totals.workCost).toBeCloseTo(expectedTotals.workCost, 1);
      
      // Test parts cost  
      expect(result.totals.partsCost).toBeCloseTo(expectedTotals.partsCost, 1);
      
      // Test grand total
      expect(result.totals.grandTotal).toBeCloseTo(expectedTotals.grandTotal, 1);
      
      // Test that invoice has required fields
      expect(result.fakturaNr).toBeTruthy();
      expect(result.source).toBe('myhrvoldParser');
      expect(result.confidence).toBeGreaterThan(70);
      
      console.log(`✅ ${filename} parsed successfully:`, {
        workCost: result.totals.workCost,
        partsCost: result.totals.partsCost,
        grandTotal: result.totals.grandTotal,
        confidence: result.confidence
      });
      
    } catch (error) {
      console.error(`❌ Failed to parse ${filename}:`, error);
      throw error;
    }
  });
  
  test('should validate Myhrvold invoice structure', async () => {
    const testFile = path.join(__dirname, '../fixtures/2313028.pdf');
    
    if (!fs.existsSync(testFile)) {
      console.warn('Test file 2313028.pdf not found, skipping validation test');
      return;
    }
    
    const pdfBuffer = fs.readFileSync(testFile);
    const file = new File([pdfBuffer], '2313028.pdf', { type: 'application/pdf' });
    
    const result = await parseMyhrvold(file);
    
    // Validate structure
    expect(result).toHaveProperty('source', 'myhrvoldParser');
    expect(result).toHaveProperty('totals');
    expect(result.totals).toHaveProperty('workCost');
    expect(result.totals).toHaveProperty('partsCost');
    expect(result.totals).toHaveProperty('grandTotal');
    expect(result).toHaveProperty('rows');
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result).toHaveProperty('confidence');
  });
});