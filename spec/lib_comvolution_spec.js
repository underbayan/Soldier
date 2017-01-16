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
