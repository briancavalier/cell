// @flow
import type { Listener, Merge } from './cell'

// An Update represents a value that may (or may not) have been updated
// with more information
export type Update<A> = None<A> | Updated<A> | Conflict<A>

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

  propagate (ls: Listener<A>): void {}

  satisfies (p: A => boolean): boolean {
    return false
  }

  toString (): string {
    return '<conflict>'
  }
}

export class None<A> {
  updated: false
  value: void
  constructor () {
    this.updated = false
    this.value = undefined
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    return updated(a)
  }

  propagate (ls: Listener<A>): void {}

  satisfies (p: A => boolean): boolean {
    return false
  }

  toString (): string {
    return '<none>'
  }
}

export const none = <A> (): Update<A> => new None()
export const conflict = <A> (): Update<A> => new Conflict()
export const unchanged = <A> (value: A): Update<A> => new Updated(false, value)
export const updated = <A> (value: A): Update<A> => new Updated(true, value)

export const isNone = <A> (u: Update<A>): boolean => u instanceof None
export const isConflict = <A> (u: Update<A>): boolean => u instanceof Conflict
