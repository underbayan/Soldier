import 'common'
import range from 'lodash/range'
export type ProcessMode=
  /* default, signal extended with zeros */
  'MODE_ZEROPAD'|
    /* signal extended symmetrically (mirror)
     * For extensions greater than signal length,
     * mirror back and forth:
     * 2 3 3 2 1 | 1 2 3 | 3 2 1 1 2
     */
    'MODE_SYMMETRIC'|
    /* signal extended with the border value */
    'MODE_CONSTANT_EDGE'|
    /* linear extrapolation (first derivative) */
    'MODE_SMOOTH'|
    /* signal is treated as being periodic */
    'MODE_PERIODIC'|
    /* signal is treated as being periodic, minimal output length */
    'MODE_PERIODIZATION'|
    /* signal extended symmetrically (reflect)
     * For extensions greater than signal length,
     * reflect back and forth without repeating edge values:
     * 1 2 3 2 | 1 2 3 | 2 1 2 3
     */
    'MODE_REFLECT'|
    'MODE_MAX'
export function extend(mode: ProcessMode, input: Array<number>, extendLength: number) {
  var inputLength = input.length
  var addingLength = Math.floor(extendLength / 2)
  if (inputLength < addingLength - 1) {
    ErrorConsole("Error input array and extendLength")
  }
  switch (mode) {
    case 'MODE_SYMMETRIC':
      return [].concat(input.slice(0, addingLength).reverse(), input, input.slice(-addingLength, inputLength).reverse())
      break;
    case 'MODE_REFLECT':
      return [].concat(input.slice(1, addingLength + 1).reverse(), input, input.slice(-addingLength - 1, inputLength - 1).reverse())
      break;
    case 'MODE_CONSTANT_EDGE':
      return [].concat(new Array(addingLength).fill(input[0]), input, new Array(addingLength).fill(input[inputLength - 1]))
    case 'MODE_SMOOTH': {
      var head = range(input[0] - (input[1] - input[0]) * addingLength, input[0], input[1] - input[0])
      var tail = range(input[inputLength - 1] + input[inputLength - 1] - input[inputLength - 2], input[inputLength - 1] + (input[inputLength - 1] - input[inputLength - 2]) * (addingLength + 1), input[inputLength - 1] - input[inputLength - 2])
      return  [].concat(head, input, tail)
    }
    case 'MODE_PERIODIC':
      return  [].concat(input.slice(0, addingLength), input, input.slice(-addingLength, inputLength))
    case 'MODE_ZEROPAD':
      return  [].concat(new Array(addingLength).fill(0), input, new Array(addingLength).fill(0))
    default:
      return  [].concat(new Array(addingLength).fill(0), input, new Array(addingLength).fill(0))
  }
}