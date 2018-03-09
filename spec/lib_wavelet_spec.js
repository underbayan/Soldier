import range from 'lodash/range'
import * as dwv from '../src/lib/wavelets/discrete_wavelet'
import * as cwv from '../src/lib/wavelets/continous_wavelets'

import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'
describe('Discrete wavelet function', function () {
  it('Discrete wavelet', function () {
    // expect(dwv.discrete_wavelet('HAAR')).not.toBe(null)
    // expect(dwv.discrete_wavelet('DMEY')).not.toBe(null)
    // range(1, 39, 1).map(i => expect(dwv.discrete_wavelet('DB', i)).not.toBe(null))
    // range(2, 21, 1).map(i => expect(dwv.discrete_wavelet('SYM', i)).not.toBe(null))
    // range(1, 18, 1).map(i => expect(dwv.discrete_wavelet('COIF', i)).not.toBe(null));
    // [13,11,24,28,22,26,31,33,35,37,39,44,55,68].map(i => expect(dwv.discrete_wavelet('RBIO', i)).not.toBe(null))
  });
});

describe('Continuous wavelet function', function () {
  var input = range(-2, 2, 0.05)
  //fbsp, cmor, shan, cgau, morl, mexh, gaus
  it('Continuous wavelet', function () {
    // console.log('gaus(input, input.length, 8)', gaus(input, input.length, 8))
    // console.log('mexh(input, input.length)', mexh(input, input.length))
    // console.log('morl(input, input.length)', morl(input, input.length))
    // console.log('cgau(input, input.length, 8)', cgau(input, input.length, 8))
    // console.log('shan(input, input.length, 1, 1)', shan(input, input.length, 1, 1))
    // console.log('fbsp(input, input.length, 1, 1)', fbsp(input, input.length, 1, 1, 1))
    // console.log('cmor(input, input.length, 1, 1)', cmor(input, input.length, 1, 1))
  });
});
