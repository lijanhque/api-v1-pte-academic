import { cn } from '../utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })

  it('handles conditional classes', () => {
    const result = cn('base', true && 'included', false && 'excluded')
    expect(result).toContain('base')
    expect(result).toContain('included')
    expect(result).not.toContain('excluded')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'valid')).toContain('base')
    expect(cn('base', undefined, null, 'valid')).toContain('valid')
  })

  it('merges tailwind classes with precedence', () => {
    const result = cn('px-2', 'px-4')
    expect(result).not.toContain('px-2')
    expect(result).toContain('px-4')
  })

  it('handles arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
    expect(result).toContain('baz')
  })

  it('handles objects with boolean values', () => {
    const result = cn({ 'a': true, 'b': false, 'c': true })
    expect(result).toContain('a')
    expect(result).not.toContain('b')
    expect(result).toContain('c')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles complex tailwind conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500', 'p-4', 'p-2')
    expect(result).not.toContain('bg-red-500')
    expect(result).toContain('bg-blue-500')
    expect(result).not.toContain('p-4')
    expect(result).toContain('p-2')
  })

  it('handles responsive classes', () => {
    const result = cn('md:flex', 'lg:grid')
    expect(result).toContain('md:flex')
    expect(result).toContain('lg:grid')
  })

  it('handles pseudo-class variants', () => {
    const result = cn('hover:bg-blue-500', 'focus:ring-2')
    expect(result).toContain('hover:bg-blue-500')
    expect(result).toContain('focus:ring-2')
  })

  it('handles dark mode variants', () => {
    const result = cn('bg-white', 'dark:bg-black')
    expect(result).toContain('bg-white')
    expect(result).toContain('dark:bg-black')
  })

  it('handles arbitrary values', () => {
    const result = cn('top-[117px]', 'bg-[#1da1f2]')
    expect(result).toContain('top-[117px]')
    expect(result).toContain('bg-[#1da1f2]')
  })
})