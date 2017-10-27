// @flow
import type { Listener, Merge } from './cell'

// An Update represents a value that may (or may not) have been updated
// with more information
export type Update<A> = Bottom<A> | Updated<A> | Top<A> | Conflict<A>

export const bottom = <A> (): Update<A> => new Bottom()
export const conflict = <A> (): Update<A> => new Conflict()
export const unchanged = <A> (value: A): Update<A> => new Updated(false, value)
export const updated = <A> (value: A): Update<A> => new Updated(true, value)
export const top = <A> (value: A): Update<A> => new Top(value)

export const isConflict = <A> (u: Update<A>): boolean => u instanceof Conflict

export class Updated<A> {
  updated: boolean
  value: A
  constructor (updated: boolean, value: A) {
    this.updated = updated
    this.value = value
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    return merge(this.value, a)
  }

  propagate (l: Listener<A>): void {
    l(this.value)
  }

  satisfies (p: A => boolean): boolean {
    return p(this.value)
  }

  toString (): string {
    return `updated: ${String(this.updated)}, value: ${String(this.value)}`
  }
}

export class Conflict<A> {
  updated: false
  value: void
  constructor () {
    this.updated = false
    this.value = undefined
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    return this
  }

  propagate (l: Listener<A>): void {}

  satisfies (p: A => boolean): boolean {
    return false
  }

  toString (): string {
    return '<conflict>'
  }
}

export class Bottom<A> {
  updated: false
  value: void
  constructor () {
    this.updated = false
    this.value = undefined
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    return updated(a)
  }

  propagate (l: Listener<A>): void {}

  satisfies (p: A => boolean): boolean {
    return false
  }

  toString (): string {
    return '<none>'
  }
}

export class Top<A> {
  updated: true
  value: A
  constructor (value: A) {
    this.updated = true
    this.value = value
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    const merged = merge(this.value, a)
    return merged.updated ? conflict() : merged
  }

  propagate (l: Listener<A>): void {
    l(this.value)
  }

  satisfies (p: A => boolean): boolean {
    return p(this.value)
  }

  toString (): string {
    return `updated: ${String(this.updated)}, value: ${String(this.value)}`
  }
}
