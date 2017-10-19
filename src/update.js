// @flow
import type { Listener, Merge } from './cell'

// An Update represents a value that may (or may not) have been updated
// with more information
export type Update<A> = Updated<A> | Conflict<A>

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
}

export class Conflict<A> {
  updated: void
  value: void
  constructor () {
    this.updated = undefined
    this.value = undefined
  }

  merge (merge: Merge<A>, a: A): Update<A> {
    return this
  }

  propagate (ls: Listener<A>): void {}
}

export const conflict = <A> (): Update<A> => new Conflict()
export const unchanged = <A> (value: A): Update<A> => new Updated(false, value)
export const updated = <A> (value: A): Update<A> => new Updated(true, value)
