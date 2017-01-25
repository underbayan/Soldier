import '../src/lib/prefix'
import * as cv from '../src/lib/convolution'
import range from 'lodash/range'
import * as wv from '../src/lib/wavelets'

import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'

describe('Lib convolution function', function () {
    var xaix = range(-20, 20, 0.5)
    var input = xaix.map((o)=>5 * Math.sin(o))
    it('downsampling_convolution_periodization', function () {
        var wavelet = wv.discrete_wavelet('DB', 16)
        var RfilterH = wavelet.dec_hi
        var RfilterL = wavelet.dec_lo
        var CfilterH = wavelet.rec_hi
        var CfilterL = wavelet.rec_lo
        var output = new Array()
        var H = cv.downsampling_convolution_periodization(input, input.length, RfilterH, RfilterH.length, 2, 1)
        var L = cv.downsampling_convolution_periodization(input, input.length, RfilterL, RfilterL.length, 2, 1)
        cv.upsampling_convolution_valid_sf_periodization(H, H.length, CfilterH, CfilterH.length, output)
        cv.upsampling_convolution_valid_sf_periodization(L, L.length, CfilterL, CfilterL.length, output)
        input.map(function (o, i) {
            expect(o).toBeCloseTo(output[i])
        })
    });
    it('downsampling_convolution', function () {
        var wavelet = wv.discrete_wavelet('DB', 1)
        var RfilterH = wavelet.dec_hi
        var RfilterL = wavelet.dec_lo
        var CfilterH = wavelet.rec_hi
        var CfilterL = wavelet.rec_lo
        var output = new Array()
        var H = cv.downsampling_convolution(input, input.length, RfilterH, RfilterH.length, 2, 'MODE_ZEROPAD')
        var L = cv.downsampling_convolution(input, input.length, RfilterL, RfilterL.length, 2, 'MODE_ZEROPAD')
        cv.upsampling_convolution_full(H, H.length, CfilterH, CfilterH.length, output)
        cv.upsampling_convolution_full(L, L.length, CfilterL, CfilterL.length, output)
        var fixedOutput = output.slice(CfilterL.length - 2, input.length + CfilterL.length - 2)
        input.map(function (o, i) {
            expect(o).toBeCloseTo(fixedOutput[i])
        })

        output = new Array()
        H = cv.downsampling_convolution(input, input.length, RfilterH, RfilterH.length, 2, 'MODE_REFLECT')
        L = cv.downsampling_convolution(input, input.length, RfilterL, RfilterL.length, 2, 'MODE_REFLECT')
        cv.upsampling_convolution_full(H, H.length, CfilterH, CfilterH.length, output)
        cv.upsampling_convolution_full(L, L.length, CfilterL, CfilterL.length, output)
        fixedOutput = output.slice(CfilterL.length - 2, input.length + CfilterL.length - 2)
        input.map(function (o, i) {
            expect(o).toBeCloseTo(fixedOutput[i])
        })
        output = new Array()
        H = cv.downsampling_convolution(input, input.length, RfilterH, RfilterH.length, 2, 'MODE_CONSTANT_EDGE')
        L = cv.downsampling_convolution(input, input.length, RfilterL, RfilterL.length, 2, 'MODE_CONSTANT_EDGE')
        cv.upsampling_convolution_full(H, H.length, CfilterH, CfilterH.length, output)
        cv.upsampling_convolution_full(L, L.length, CfilterL, CfilterL.length, output)
        fixedOutput = output.slice(CfilterL.length - 2, input.length + CfilterL.length - 2)
        input.map(function (o, i) {
            expect(o).toBeCloseTo(fixedOutput[i])
        })
    });
});
