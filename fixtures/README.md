# Test Fixtures for Myhrvold OCR

This directory should contain PDF files for testing the OCR pipeline:

- `2313024.pdf` - Expected: workCost: 325, partsCost: 248, grandTotal: 573
- `2313028.pdf` - Expected: workCost: 1300, partsCost: 1125, grandTotal: 3025  
- `2313034.pdf` - Expected: workCost: 8800, partsCost: 29194, grandTotal: 42994
- `2313044.pdf` - Expected: workCost: 1950, partsCost: 9647.3, grandTotal: 11597

## Usage

Place the actual PDF files in this directory to enable regression testing.

The test suite will automatically skip tests for missing fixtures and log warnings instead of failing.

## Security Note

These test files should NOT contain sensitive customer information. Use anonymized or mock data for testing purposes.