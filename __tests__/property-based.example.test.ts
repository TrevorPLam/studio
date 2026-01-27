/**
 * Property-Based Testing Examples
 * 
 * Property-based testing generates thousands of random inputs to test properties
 * of your code. It finds edge cases that manual tests miss.
 * 
 * Learn more: https://github.com/dubzzz/fast-check
 */

import * as fc from 'fast-check'

/**
 * Example 1: Testing a sorting function
 */
describe('Property-Based Testing Examples', () => {
  it('property: array sort maintains length', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = [...arr].sort((a, b) => a - b)
        return sorted.length === arr.length
      })
    )
  })

  it('property: array sort is idempotent', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sortedOnce = [...arr].sort((a, b) => a - b)
        const sortedTwice = [...sortedOnce].sort((a, b) => a - b)
        return JSON.stringify(sortedOnce) === JSON.stringify(sortedTwice)
      })
    )
  })

  /**
   * Example 2: Testing string operations
   */
  it('property: string reverse is involutive', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const reversed = str.split('').reverse().join('')
        const doubleReversed = reversed.split('').reverse().join('')
        return doubleReversed === str
      })
    )
  })

  /**
   * Example 3: Testing mathematical operations
   */
  it('property: addition is commutative', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a
      })
    )
  })
})
