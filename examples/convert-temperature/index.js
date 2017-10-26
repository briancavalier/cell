// @flow
import { type Cell, type Update, connect, unchanged, updated, emptyCell, cell, write, listen } from '../../src/index'

// DOM helpers
const fail = (message) => { throw new Error(message) }
const qs = (selector) => document.querySelector(selector) || fail(`${selector} not found`)

// Connect a DOM input to a cell in *both* directions:
// - when the input changes, update the cell
// - when the cell changes, update the input
const connectInput = (cell: Cell<number>, input: HTMLInputElement): void => {
  input.addEventListener('input', e => {
    const value = Number(e.target.value)
    write(value, cell)
  })
  listen(x => { input.value = String(x) }, cell)
}

// A reasonable merge strategy for floats that indicates a value
// has changed when it has moved by more than an epsilon value.
const mergeFloat = (f1: number, f2: number): Update<number> =>
  Math.abs(f1 - f2) < 0.01 ? unchanged(f1) : updated(f2)

// Create cells to hold temperature values in various units
// Initialize celsius to 0.  The starting values of the other
// cells will be derived from celsius when they are connected below.
const celsius = cell(0, mergeFloat)
const fahrenheit = emptyCell(mergeFloat)
const kelvin = emptyCell(mergeFloat)

// Temperature conversion functions
// These could be generated by a constraint solver, for example
const c2f = c => (c * 9.0 / 5.0) + 32
const f2c = f => (f - 32) * (5.0 / 9.0)
const c2k = c => c + 273.15
const k2c = k => k - 273.15
const k2f = k => c2f(k2c(k))
const f2k = f => c2k(f2c(f))

// Setup relationships between temperature cells, such that
// whenever one changes, the others are updated.
// Obviously, this creates a cyclic graph.  That's not
// a problem because Cells use a merge strategy that
// only propagates updates when they are "meaningful", that is,
// they added new information (as defined by the merge
// strategy) to the cell's value.
// These cells are using the default merge strategy which just
// uses `===` to determine if an update is meaningful or not.
connect(c2f, celsius, fahrenheit)
connect(c2k, celsius, kelvin)
connect(f2c, fahrenheit, celsius)
connect(f2k, fahrenheit, kelvin)
connect(k2c, kelvin, celsius)
connect(k2f, kelvin, fahrenheit)

// Get the DOM input elements
const celsiusInput = qs('[name=celsius]')
const fahrenheitInput = qs('[name=fahrenheit]')
const kelvinInput = qs('[name=kelvin]')

// Connect cells to DOM input elements
connectInput(celsius, celsiusInput)
connectInput(fahrenheit, fahrenheitInput)
connectInput(kelvin, kelvinInput)