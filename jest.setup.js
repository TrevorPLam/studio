// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import * as fc from 'fast-check'

// Extend Jest matchers with jest-axe for accessibility testing
expect.extend(toHaveNoViolations)

// Make fast-check available globally for property-based testing
global.fc = fc