// @flow
import { type Update, isConflict, none, unchanged, updated } from './update'

export type Listener<A> = A => void
export type Unlisten = () => void

export type Merge<A> = (A, A) => Update<A>
export type Threshold<A> = A => boolean

// A cell holds a value and a merge strategy for updating the value
// with additional information
export class Cell<A> {
  merge: Merge<A>
  update: Update<A>
  listeners: Listener<A>[]

  constructor (merge: Merge<A>, update: Update<A>) {
    this.merge = merge
    this.update = update
    this.listeners = []
  }

  inspect (): string {
    return `Cell { ${String(this.update)} }`
  }
}

// A default merge strategy that uses === comparison.
export const defaultMerge = <A> (o: A, n: A): Update<A> => o === n ? unchanged(o) : updated(n)

// Create an empty cell with the provided merge strategy
export const emptyCell = <A> (merge: Merge<A> = defaultMerge): Cell<A> => new Cell(merge, none())

// Create a cell containing an initial value, and which uses the provided merge strategy
export const cell = <A> (a: A, merge: Merge<A> = defaultMerge): Cell<A> => new Cell(merge, unchanged(a))

// Write a new value into the cell, using the cell's merge strategy
// and propagating any updates to readers
export const write = <A> (a: A, cell: Cell<A>): void => {
  const { merge, update, listeners } = cell
  const merged = update == null
    ? updated(a) : update.merge(merge, a)

  cell.update = merged
  if (merged.updated === true) {
    listeners.forEach(l => merged.propagate(l))
  }
}

// Attempt to read the cell's value, waiting until the value reaches
// the state represented by the threshold predicate
export const read = <A> (threshold: Threshold<A>, cell: Cell<A>, reject: A => void, fulfill: A => void): void => {
  if (isConflict(cell.update)) {
    cell.update.propagate(reject)
  } else if (cell.update.satisfies(threshold)) {
    cell.update.propagate(fulfill)
  } else {
    const unlisten = listen(value => {
      if (threshold(value)) {
        unlisten()
        fulfill(value)
      }
    }, cell)
  }
}

// Listen for updated values in the cell
export const listen = <A> (l: Listener<A>, cell: Cell<A>): Unlisten => {
  cell.listeners.push(l)
  cell.update.propagate(l)
  return () => { cell.listeners = cell.listeners.filter(x => x !== l) }
}

// Connect two cells, making cb's value dependent on ca's value.  When ca
// is updated, it's value will be transformed by f and then written
// to cb (obeying cb's merge strategy)
export const connect = <A, B> (f: A => B, ca: Cell<A>, cb: Cell<B>): Unlisten =>
  listen(a => write(f(a), cb), ca)
