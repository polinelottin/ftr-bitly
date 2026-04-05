import { describe, expect, test } from 'vitest'
import {
  isLeft,
  isRight,
  makeLeft,
  makeRight,
  unwrapEither,
} from './either'

describe('either', () => {
  test('makeLeft / isLeft', () => {
    const e = makeLeft('err')
    expect(isLeft(e)).toBe(true)
    expect(isRight(e)).toBe(false)
    expect(unwrapEither(e)).toBe('err')
  })

  test('makeRight / isRight', () => {
    const e = makeRight(42)
    expect(isRight(e)).toBe(true)
    expect(isLeft(e)).toBe(false)
    expect(unwrapEither(e)).toBe(42)
  })

  test('unwrapEither throws when both branches are set', () => {
    const e = { left: 'a', right: 'b' } as any
    expect(() => unwrapEither(e)).toThrow(/both left and right/)
  })

  test('unwrapEither throws when neither branch is set', () => {
    const e = {} as any
    expect(() => unwrapEither(e)).toThrow(/no left or right/)
  })
})
