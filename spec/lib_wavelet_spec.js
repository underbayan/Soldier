import range from 'lodash/range'
import * as wv from '../src/lib/wavelets'

import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'
describe('Discrete wavelet function', function () {
    it('Discrete wavelet', function () {

        // console.log('DB1', wv.discrete_wavelet('DB', 1))
        // console.log('DB38', wv.discrete_wavelet('DB', 38))
        // console.log('sym2', wv.discrete_wavelet('sym', 2))
        // console.log('sym20', wv.discrete_wavelet('sym', 20))
        //
        // console.log('COIF1', wv.discrete_wavelet('COIF', 1))
        // console.log('COIF17', wv.discrete_wavelet('COIF', 17))
        // console.log('DMEY', wv.discrete_wavelet('DMEY'))
        //
        // console.log('RBIO', 13, wv.discrete_wavelet('RBIO', 13))
        // console.log('RBIO', 11, wv.discrete_wavelet('RBIO', 11))
        // console.log('RBIO', 24, wv.discrete_wavelet('RBIO', 24))
        // console.log('RBIO', 28, wv.discrete_wavelet('RBIO', 28))
        // console.log('RBIO', 22, wv.discrete_wavelet('RBIO', 22))
        // console.log('RBIO', 26, wv.discrete_wavelet('RBIO', 26))
        // console.log('RBIO', 31, wv.discrete_wavelet('RBIO', 31))
        // console.log('RBIO', 33, wv.discrete_wavelet('RBIO', 33))
        // console.log('RBIO', 35, wv.discrete_wavelet('RBIO', 35))
        // console.log('RBIO', 37, wv.discrete_wavelet('RBIO', 37))
        // console.log('RBIO', 39, wv.discrete_wavelet('RBIO', 39))
        // console.log('RBIO', 44, wv.discrete_wavelet('RBIO', 44))
        // console.log('RBIO', 55, wv.discrete_wavelet('RBIO', 55))
        // console.log('RBIO', 68, wv.discrete_wavelet('RBIO', 68))


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