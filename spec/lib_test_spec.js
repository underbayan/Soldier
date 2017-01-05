import '../src/lib/prefix'
import * as cv from '../src/lib/convolution'
import range from 'lodash/range'
import * as wv from '../src/lib/wavelets'
import {fbsp, cmor, shan, cgau, morl, mexh, gaus} from '../src/lib/cwt'
describe('Lib convolution function', function () {
    beforeEach(function () {
    });
    var input = range(1,101)
    var filter = new Array(10).fill(1)
    it('downsampling_convolution_periodization', function () {
        var output = new Array()
        var result = cv.downsampling_convolution_periodization(input, input.length, filter, filter.length, output, 1, 1)
        console.log(output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_PERIODIZATION', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, output, 1, 'MODE_SYMMETRIC')
        console.log('MODE_SYMMETRIC',output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_CONSTANT_EDGE', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, output, 1, 'MODE_CONSTANT_EDGE')
        console.log('MODE_CONSTANT_EDGE',output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_REFLECT', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, output, 1, 'MODE_REFLECT')
        console.log('MODE_REFLECT',output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_PERIODIC', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, output, 1, 'MODE_PERIODIC')
        console.log('MODE_PERIODIC',output)
        expect(result).toEqual(result);
    });
    it('downsampling_convolution_MODE_SMOOTH', function () {
        var output = new Array()
        var result = cv.downsampling_convolution(input, input.length, filter, filter.length, output, 1, 'MODE_SMOOTH')
        console.log('MODE_PERIODIC',output)
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
    beforeEach(function () {
    });
    it('wavelet', function () {
        console.log(wv.discrete_wavelet('DB',1))
        console.log(wv.discrete_wavelet('DB',38))

        console.log(wv.discrete_wavelet('sym',2))
        console.log(wv.discrete_wavelet('sym',20))

        console.log(wv.discrete_wavelet('COIF',1))
        console.log(wv.discrete_wavelet('COIF',17))
        console.log(wv.discrete_wavelet('DMEY'))

        console.log(wv.discrete_wavelet('RBIO',13))
        console.log(wv.discrete_wavelet('RBIO',11))
    });
});

describe('cwt function', function () {
    beforeEach(function () {
    });
    var input = range(1,100)
    var filter = new Array(10).fill(1)
    //fbsp, cmor, shan, cgau, morl, mexh, gaus
    it('cwt', function () {
        console.log(fbsp('DB',1))

    });
});