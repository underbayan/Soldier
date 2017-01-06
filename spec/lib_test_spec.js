import '../src/lib/prefix'
import * as cv from '../src/lib/convolution'
import range from 'lodash/range'
import * as wv from '../src/lib/wavelets'

import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'

describe('Lib convolution function', function () {
    var input =  range(-2,2,0.05)
    var filter = new Array(10).fill(1)
    it('downsampling_convolution_periodization', function () {
        var output = new Array()
        var result = cv.downsampling_convolution_periodization(input, input.length, filter, filter.length, 1, 1, output)
        console.log('downsampling_convolution_periodization', output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_PERIODIZATION', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, 1, 'MODE_SYMMETRIC', output)
        console.log('MODE_SYMMETRIC', output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_CONSTANT_EDGE', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, 1, 'MODE_CONSTANT_EDGE', output)
        console.log('MODE_CONSTANT_EDGE', output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_REFLECT', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, 1, 'MODE_REFLECT', output)
        console.log('MODE_REFLECT', output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_PERIODIC', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, 1, 'MODE_PERIODIC', output)
        console.log('MODE_PERIODIC', output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_SMOOTH', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, 1, 'MODE_SMOOTH', output)
        console.log('MODE_PERIODIC', output)
        expect(result).toEqual(result);
    });

    it('upsampling_convolution_full', function () {
        var output = new Array()
        // input, N, filter, F, output
        var result = cv.upsampling_convolution_full(input, input.length, filter, filter.length, output)
        console.log(output)
        expect(result).toEqual(result);
    });
});
describe('Lib wavelet function', function () {
    it('wavelet', function () {
        console.log('DB1', wv.discrete_wavelet('DB', 1))
        console.log('DB38', wv.discrete_wavelet('DB', 38))

        console.log('sym2', wv.discrete_wavelet('sym', 2))
        console.log('sym20', wv.discrete_wavelet('sym', 20))

        console.log('COIF1', wv.discrete_wavelet('COIF', 1))
        console.log('COIF17', wv.discrete_wavelet('COIF', 17))
        console.log('DMEY', wv.discrete_wavelet('DMEY'))

        console.log('RBIO', 13, wv.discrete_wavelet('RBIO', 13))
        console.log('RBIO', 11, wv.discrete_wavelet('RBIO', 11))
    });
});

describe('cwt function', function () {
    var input = range(-2,2,0.05)
    //fbsp, cmor, shan, cgau, morl, mexh, gaus
    it('cwt', function () {
        console.log('gaus(input, input.length, 8)', gaus(input, input.length, 8))
        console.log('mexh(input, input.length)', mexh(input, input.length))
        console.log('morl(input, input.length)', morl(input, input.length))
        console.log('cgau(input, input.length, 8)', cgau(input, input.length, 8))
        console.log('shan(input, input.length, 1, 1)', shan(input, input.length, 1, 1))
        console.log('fbsp(input, input.length, 1, 1)', fbsp(input, input.length, 1, 1, 1))
        console.log('cmor(input, input.length, 1, 1)', cmor(input, input.length, 1, 1))
    });
});