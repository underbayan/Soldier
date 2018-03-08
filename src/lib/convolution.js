/* @flow */
'use strict'
import * as cm from './common'
import type {ProcessMode, ErrorConsole} from './common'
export function downsampling_convolution_periodization(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, step: number, fstep: number, output: Array<number>) {
  var halfFilterLength = Math.floor(filterLength / 2)
  var i = halfFilterLength, o = 0;
  var padding = (step - (inputLength % step)) % step;
  output = !!output ? output : []
  for (; i < filterLength && i < inputLength; i += step, ++o) {
    var sum = 0;
    var k_start = 0;
    for (var j = 0; j <= i; j += fstep)
      sum += filter[j] * input[i - j];
    if (fstep > 1)
      k_start = j - (i + 1);
    while (j < filterLength) {
      var k;
      for (var k = k_start; k < padding && j < filterLength; k += fstep, j += fstep)
        sum += filter[j] * input[inputLength - 1];
      for (var k = k_start; k < inputLength && j < filterLength; k += fstep, j += fstep)
        sum += filter[j] * input[inputLength - 1 - k];
    }
    output[o] = sum;
  }

  for (; i < inputLength; i += step, ++o) {
    var sum = 0;
    for (var j = 0; j < filterLength; j += fstep)
      sum += input[i - j] * filter[j];
    output[o] = sum;
  }

  for (; i < filterLength && i < inputLength + halfFilterLength; i += step, ++o) {
    var sum = 0;
    var j = 0;
    var k_start = 0
    while (i - j >= inputLength) {
      var k;
      // for simplicity, not using fstep here
      for (var k = 0; k < padding && i - j >= inputLength; ++k, ++j)
        sum += filter[i - inputLength - j] * input[inputLength - 1];
      for (var k = 0; k < inputLength && i - j >= inputLength; ++k, ++j)
        sum += filter[i - inputLength - j] * input[k];
    }
    if (fstep > 1)
      j += (fstep - j % fstep) % fstep;  // move to next non-zero entry
    for (; j <= i; j += fstep)
      sum += filter[j] * input[i - j];
    if (fstep > 1)
      k_start = j - (i + 1);
    while (j < filterLength) {
      var k;
      for (var k = k_start; k < padding && j < filterLength; k += fstep, j += fstep)
        sum += filter[j] * input[inputLength - 1];
      for (var k = k_start; k < inputLength && j < filterLength; k += fstep, j += fstep)
        sum += filter[j] * input[inputLength - 1 - k];
    }
    output[o] = sum;
  }

  for (; i < inputLength + halfFilterLength; i += step, ++o) {
    var sum = 0;
    var j = 0;
    while (i - j >= inputLength) {
      // for simplicity, not using fstep here
      var k;
      for (var k = 0; k < padding && i - j >= inputLength; ++k, ++j)
        sum += filter[i - inputLength - j] * input[inputLength - 1];
      for (var k = 0; k < inputLength && i - j >= inputLength; ++k, ++j)
        sum += filter[i - inputLength - j] * input[k];
    }
    if (fstep > 1)
      j += (fstep - j % fstep) % fstep;  // move to next non-zero entry
    for (; j < filterLength; j += fstep)
      sum += filter[j] * input[i - j];
    output[o] = sum;
  }
  return output;
}

export function convolution(input: Array<number>, filter: Array<number>, output: Array<number>, step = 1): array {
  var sum, i, j, o, outputLength, filterLength = filter.length
  outputLength = Math.floor((input.length + filterLength) / step)
  output = output || new Array(outputLength)
  for (i = 0, o = 0; o < outputLength; o++, i += step) {
    sum = 0
    for (j = 0; j < filterLength; j++) {
      sum += (input[i + j] || 0) * (filter[filterLength - j - 1])
    }
    output[o] = sum
  }
  return output
}

export function down_convolution(input: Array<number>, filter: Array<number>, output: Array<number>) {
  return convolution(input, filter, output, 2)
}
export function up_convolution(input: Array<number>, filter: Array<number>, output: Array<number>) {
  var halfFilterLength = Math.floor(filter.length / 2)
  var outputLength = input.length * 2
  var inputLength = input.length

  output = output || new Array(outputLength)
  var o = 0, i = 0

  for (; o < outputLength; ++i, o += 2) {
    var sum_even = 0;
    var sum_odd = 0;
    for (var j = 0; j < halfFilterLength; ++j) {
      sum_even += filter[j * 2] * (input[i - j] || 0);
      sum_odd += filter[j * 2 + 1] * (input[i - j] || 0);
    }
    output[o] = (output[o] || 0) + sum_even;
    output[o + 1] = (output[o + 1] || 0) + sum_odd;
  }
  return output
}
export function extend(mode: ProcessMode, input: Array<number>, filter: Array<number>) {
  var filterLength = filter.length
  var inputLength = input.length
  var addingLength = Math.floor(filterLength / 2)
  var result
  if (inputLength < addingLength - 1) {
    ErrorConsole("Error input")
  }
  switch (mode) {
    case 'MODE_SYMMETRIC':
      result = [].concat(input.slice(0, addingLength).reverse(), input, input.slice(-addingLength, inputLength).reverse())
      break;
    case 'MODE_REFLECT':
      result = [].concat(input.slice(1, addingLength + 1).reverse(), input, input.slice(-addingLength - 1, inputLength - 1).reverse())
      break;
    case 'MODE_CONSTANT_EDGE':
      result = [].concat(new Array(addingLength).fill(input[0]), input, new Array(addingLength).fill(input[inputLength - 1]))
      break;
    case 'MODE_SMOOTH': {
      var head = range(input[0] - (input[1] - input[0]) * addingLength, input[0], input[1] - input[0])
      var tail = range(input[inputLength - 1] + input[inputLength - 1] - input[inputLength - 2], input[inputLength - 1] + (input[inputLength - 1] - input[inputLength - 2]) * (addingLength + 1), input[inputLength - 1] - input[inputLength - 2])
      result = [].concat(head, input, tail)
      break;
    }
    case 'MODE_PERIODIC':
      result = [].concat(input.slice(0, addingLength), input, input.slice(-addingLength, inputLength))
      break;
    case 'MODE_ZEROPAD':
      result = [].concat(new Array(addingLength).fill(0), input, new Array(addingLength).fill(0))
      break;
    default:
      result = [].concat(new Array(addingLength).fill(0), input, new Array(addingLength).fill(0))
      break;
  }
  return result
}
export function downsampling_convolution(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, step: number, mode: ProcessMode, output: Array<number>) {
  var i = step - 1, o = 0;
  output = !!output ? output : new Array(cm.dwt_buffer_length(inputLength, filterLength, mode))
  if (mode == 'MODE_PERIODIZATION') {
    downsampling_convolution_periodization(input, inputLength, filter, filterLength, step, 1, output);
  }
  if (mode == 'MODE_SMOOTH' && inputLength < 2)
    mode = 'MODE_CONSTANT_EDGE';

  // left boundary overhang
  for (; i < filterLength && i < inputLength; i += step, ++o) {
    var sum = 0;

    for (var j = 0; j <= i; ++j)
      sum += filter[j] * input[i - j];

    switch (mode) {
      case 'MODE_SYMMETRIC':
        while (j < filterLength) {
          var k;
          for (var k = 0; k < inputLength && j < filterLength; ++j, ++k)
            sum += filter[j] * input[k];
          for (var k = 0; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_REFLECT':
        while (j < filterLength) {
          var k;
          for (var k = 1; k < inputLength && j < filterLength; ++j, ++k)
            sum += filter[j] * input[k];
          for (var k = 1; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_CONSTANT_EDGE':
        for (; j < filterLength; ++j)
          sum += filter[j] * input[0];
        break;
      case 'MODE_SMOOTH': {
        var k;
        for (var k = 1; j < filterLength; ++j, ++k)
          sum += filter[j] * (input[0] + k * (input[0] - input[1]));
        break;
      }
      case 'MODE_PERIODIC':
        while (j < filterLength) {
          var k;
          for (var k = 0; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_ZEROPAD':
      default:
        break;
    }
    output[o] = sum;

  }

  // center (if input equal or wider than filter:inputLength >=filterLength)
  for (; i < inputLength; i += step, ++o) {
    var sum = 0;

    for (var j = 0; j < filterLength; ++j)
      sum += input[i - j] * filter[j];
    output[o] = sum;
  }

  // center (if filter is wider than input:filterLength >inputLength)
  for (; i < filterLength; i += step, ++o) {
    var sum = 0;
    var j = 0;

    switch (mode) {
      case 'MODE_SYMMETRIC':
        // Included from original: TODO: j <filterLength-_offset
        /* Iterate over filter in reverse to process elements away from
         * data. This gives a known first input element to process (N-1)
         */
        while (i - j >= inputLength) {
          var k;
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[inputLength - 1 - k];
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_REFLECT':
        while (i - j >= inputLength) {
          var k;
          for (var k = 1; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[inputLength - 1 - k];
          for (var k = 1; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_CONSTANT_EDGE':
        for (; i - j >= inputLength; ++j)
          sum += filter[j] * input[inputLength - 1];
        break;
      case 'MODE_SMOOTH': {
        var k;
        for (var k = i - inputLength + 1; i - j >= inputLength; ++j, --k)
          sum += filter[j] * (input[inputLength - 1] + k * (input[inputLength - 1] - input[inputLength - 2]));
        break;
      }
      case 'MODE_PERIODIC':
        while (i - j >= inputLength) {
          var k;
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_ZEROPAD':
      default:
        j = i - inputLength + 1;
        break;
    }

    for (; j <= i; ++j)
      sum += filter[j] * input[i - j];

    switch (mode) {
      case 'MODE_SYMMETRIC':
        while (j < filterLength) {
          var k;
          for (var k = 0; k < inputLength && j < filterLength; ++j, ++k)
            sum += filter[j] * input[k];
          for (var k = 0; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_REFLECT':
        while (j < filterLength) {
          var k;
          for (var k = 1; k < inputLength && j < filterLength; ++j, ++k)
            sum += filter[j] * input[k];
          for (var k = 1; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_CONSTANT_EDGE':
        for (; j < filterLength; ++j)
          sum += filter[j] * input[0];
        break;
      case'MODE_SMOOTH': {
        var k;
        for (var k = 1; j < filterLength; ++j, ++k)
          sum += filter[j] * (input[0] + k * (input[0] - input[1]));
        break;
      }
      case 'MODE_PERIODIC':
        while (j < filterLength) {
          var k;
          for (var k = 0; k < inputLength && j < filterLength; ++k, ++j)
            sum += filter[j] * input[inputLength - 1 - k];
        }
        break;
      case 'MODE_ZEROPAD':
      default:
        break;
    }
    output[o] = sum;
  }

  // right boundary overhang
  for (; i < inputLength + filterLength - 1; i += step, ++o) {
    var sum = 0;
    var j = 0;
    switch (mode) {
      case 'MODE_SYMMETRIC':
        // Included from original: TODO: j <filterLength-_offset
        while (i - j >= inputLength) {
          var k;
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[inputLength - 1 - k];
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_REFLECT':
        while (i - j >= inputLength) {
          var k;
          for (var k = 1; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[inputLength - 1 - k];
          for (var k = 1; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_CONSTANT_EDGE':
        for (; i - j >= inputLength; ++j)
          sum += filter[j] * input[inputLength - 1];
        break;
      case'MODE_SMOOTH': {
        var k;
        for (var k = i - inputLength + 1; i - j >= inputLength; ++j, --k)
          sum += filter[j] * (input[inputLength - 1] + k * (input[inputLength - 1] - input[inputLength - 2]));
        break;
      }
      case 'MODE_PERIODIC':
        while (i - j >= inputLength) {
          var k;
          for (var k = 0; k < inputLength && i - j >= inputLength; ++j, ++k)
            sum += filter[i - inputLength - j] * input[k];
        }
        break;
      case 'MODE_ZEROPAD':
      default:
        j = i - inputLength + 1;
        break;
    }
    for (; j < filterLength; ++j)
      sum += filter[j] * input[i - j];

    output[o] = sum;
  }


  return output;
}

export function upsampling_convolution_full(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, output: Array<number>) {
  /* Performs a zero-padded convolution, using each input element for two
   * consecutive filter elements. This simulates an upsampled input.
   *
   * In contrast to downsampling_convolution, this adds to the output. This
   * allows multiple runs with different inputs and the same output to be used
   * for idwt.
   */
  // If check omitted, this export function would be a no-op forfilterLength<2
  var halfFilterLength = Math.floor(filterLength / 2)
  var i = 0, o = 0;
  output = !!output ? output : []

  if (filterLength < 2)
    return -1;
  if (filterLength % 2)
    return -3;

  for (; i < inputLength && i < halfFilterLength; ++i, o += 2) {

    for (var j = 0; j <= i; ++j) {
      output[o] = (output[o] || 0) + filter[j * 2] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[j * 2 + 1] * input[i - j];
    }
  }
  for (; i < inputLength; ++i, o += 2) {

    for (var j = 0; j < halfFilterLength; ++j) {
      output[o] = (output[o] || 0) + filter[j * 2] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[j * 2 + 1] * input[i - j];
    }
  }

  for (; i < halfFilterLength; ++i, o += 2) {

    for (var j = i - (inputLength - 1); j <= i; ++j) {
      output[o] = (output[o] || 0) + filter[j * 2] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[j * 2 + 1] * input[i - j];
    }
  }

  for (; i < inputLength + halfFilterLength; ++i, o += 2) {
    for (var j = i - (inputLength - 1); j < halfFilterLength; ++j) {
      output[o] = (output[o] || 0) + filter[j * 2] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[j * 2 + 1] * input[i - j];
    }
  }
  return output;
}


export function upsampling_convolution_valid_sf_periodization(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, output: Array<number>) {
  // TODO? Allow for non-2 step
  var halfFilterLength = Math.floor(filterLength / 2)

  var start = Math.floor(filterLength / 4);
  var i = start;
  var end = inputLength + start - (((halfFilterLength) % 2) ? 0 : 1);
  var o = 0;
  output = !!output ? output : []

  if (filterLength % 2) return -3;
  /*filterLengthilter must have even-length. */

  if ((halfFilterLength) % 2 == 0) {
    // Shift output one element right. This is necessary for perfect reconstruction.

    // i =inputLength-1; even element goes to output[O-1], odd element goes to output[0]
    var j = 0;
    while (j <= start - 1) {
      var k;
      for (var k = 0; k < inputLength && j <= start - 1; ++k, ++j) {
        output[2 * inputLength - 1] = (output[2 * inputLength - 1] || 0) + filter[2 * (start - 1 - j)] * input[k];
        output[0] = (output[0] || 0) + filter[2 * (start - 1 - j) + 1] * input[k];
      }
    }
    for (; j <= inputLength + start - 1 && j < halfFilterLength; ++j) {
      output[2 * inputLength - 1] = (output[2 * inputLength - 1] || 0) + filter[2 * j] * input[inputLength + start - 1 - j];
      output[0] = (output[0] || 0) + filter[2 * j + 1] * input[inputLength + start - 1 - j];
    }
    while (j < halfFilterLength) {
      var k;
      for (var k = 0; k < inputLength && j < halfFilterLength; ++k, ++j) {
        output[2 * inputLength - 1] += filter[2 * j] * input[inputLength - 1 - k];
        output[0] += filter[2 * j + 1] * input[inputLength - 1 - k];
      }
    }

    o += 1;
  }

  for (; i < halfFilterLength && i < inputLength; ++i, o += 2) {
    var j = 0;
    for (; j <= i; ++j) {
      output[o] = (output[o] || 0) + filter[2 * j] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[i - j];
    }
    while (j < halfFilterLength) {
      var k;
      for (var k = 0; k < inputLength && j < halfFilterLength; ++k, ++j) {
        output[o] = (output[o] || 0) + filter[2 * j] * input[inputLength - 1 - k];
        output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[inputLength - 1 - k];
      }
    }
  }

  for (; i < inputLength; ++i, o += 2) {

    for (var j = 0; j < halfFilterLength; ++j) {
      output[o] = (output[o] || 0) + filter[2 * j] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[i - j];
    }
  }

  for (; i < halfFilterLength && i < end; ++i, o += 2) {
    var j = 0;
    while (i - j >= inputLength) {
      var k;
      for (var k = 0; k < inputLength && i - j >= inputLength; ++k, ++j) {
        output[o] = (output[o] || 0) + filter[2 * (i - inputLength - j)] * input[k];
        output[o + 1] = (output[o + 1] || 0) + filter[2 * (i - inputLength - j) + 1] * input[k];
      }
    }
    for (; j <= i && j < halfFilterLength; ++j) {
      output[o] = (output[o] || 0) + filter[2 * j] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[i - j];
    }
    while (j < halfFilterLength) {
      var k;
      for (var k = 0; k < inputLength && j < halfFilterLength; ++k, ++j) {
        output[o] = (output[o] || 0) + filter[2 * j] * input[inputLength - 1 - k];
        output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[inputLength - 1 - k];
      }
    }
  }

  for (; i < end; ++i, o += 2) {
    var j = 0;
    while (i - j >= inputLength) {
      var k;
      for (var k = 0; k < inputLength && i - j >= inputLength; ++k, ++j) {
        output[o] = (output[o] || 0) + filter[2 * (i - inputLength - j)] * input[k];
        output[o + 1] = (output[o + 1] || 0) + filter[2 * (i - inputLength - j) + 1] * input[k];
      }
    }
    for (; j <= i && j < halfFilterLength; ++j) {
      output[o] = (output[o] || 0) + filter[2 * j] * input[i - j];
      output[o + 1] = (output[o + 1] || 0) + filter[2 * j + 1] * input[i - j];
    }
  }

  return output;
}


/*
 * performs IDWT for all modes
 *
 * The upsampling is performed by splitting filters to even and odd elements
 * and performing 2 convolutions.  After refactoring the PERIODIZATION mode
 * case to separate export function this looks much clearer now.
 */

export function upsampling_convolution_valid_sf(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, mode: stirng, output: Array<number>) {
  // TODO: Allow non-2 step?
  var halfFilterLength = Math.floor(filterLength / 2)
  output = !!output ? output : []
  if (mode == 'MODE_PERIODIZATION')
    upsampling_convolution_valid_sf_periodization(input, inputLength, filter, filterLength, output, O);
  if ((filterLength % 2) || (inputLength < halfFilterLength))
    return -1;
  // Perform only stage 2 - all elements in the filter overlap an input element.
  {
    var o, i;
    for (o = 0, i = halfFilterLength - 1; i < inputLength; ++i, o += 2) {
      var sum_even = 0;
      var sum_odd = 0;

      for (var j = 0; j < halfFilterLength; ++j) {
        sum_even += filter[j * 2] * input[i - j];
        sum_odd += filter[j * 2 + 1] * input[i - j];
      }
      output[o] = (output[o] || 0) + sum_even;
      output[o + 1] = (output[o + 1] || 0) + sum_odd;
    }
  }
  return output;
}

export function upsampled_filter_convolution(input, inputLength, filter, filterLength, output, step, mode) {
  return -1;
}
