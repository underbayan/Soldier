import '../src/lib/prefix'
import * as cv from '../src/lib/convolution'
import range from 'lodash/range'
import * as wv from '../src/lib/wavelets'

import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'

describe('Lib convolution function', function () {
    var xaix = range(-20, 20.5, .5)
    var input = xaix.map((o)=>(5 * Math.sin(o) + Math.random()))

    it('convolution extend', function () {
        var localInput = range(-10, 10, 1)
        expect(cv.extend('MODE_SYMMETRIC', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(-7)
        expect(cv.extend('MODE_REFLECT', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(-6)
        expect(cv.extend('MODE_CONSTANT_EDGE', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(-10)
        expect(cv.extend('MODE_SMOOTH', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(-14)
        expect(cv.extend('MODE_PERIODIC', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(-10)
        expect(cv.extend('MODE_ZEROPAD', localInput, [1, 1, 1, 1, 1, 1, 1, 1])[0]).toBeCloseTo(0)
        // var wavelet = wv.discrete_wavelet('DB', 20)
        // var output = new Array()
        // var RfilterH = wavelet.dec_hi
        // var RfilterL = wavelet.dec_lo
        // var CfilterH = wavelet.rec_hi
        // var CfilterL = wavelet.rec_lo
        // var H = cv.convolution(input, RfilterH)
        // var L = cv.convolution(input, RfilterL)
        // cv.convolution(H, CfilterH, output)
        // cv.convolution(L, CfilterL, output)
        // console.log('\n------------hehe------------------\n', output)
        // console.log('\n--------------gege----------------\n', input)
        // console.log(cv.convolution(RfilterH, CfilterH))
        // console.log(cv.convolution(RfilterL, CfilterL))
    })
    it('up_down_convolution', function () {
        var wavelet = wv.discrete_wavelet('DB', 20)
        var output = new Array()
        var RfilterH = wavelet.dec_hi
        var RfilterL = wavelet.dec_lo
        var CfilterH = wavelet.rec_hi
        var CfilterL = wavelet.rec_lo
        var tmpInput=cv.extend('MODE_ZEROPAD',input,RfilterH)
        console.log(tmpInput)
        var H = cv.down_convolution(tmpInput, RfilterH)
        var L = cv.down_convolution(tmpInput, RfilterL)

        console.log(H.length,L.length,RfilterL.length,input.length,"+++++++")
        cv.up_convolution(H, CfilterH, output)
        cv.up_convolution(L, CfilterL, output)
        console.log('\n------------output------------------\n', output)
        console.log('\n--------------input----------------\n', input)
    })
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
        var wavelet = wv.discrete_wavelet('DB', 18)
        var RfilterH = wavelet.dec_hi
        var RfilterL = wavelet.dec_lo
        var CfilterH = wavelet.rec_hi
        var CfilterL = wavelet.rec_lo
        var output = new Array()
        var H = cv.downsampling_convolution(input, input.length, RfilterH, RfilterH.length, 2, 'MODE_PERIODIZATION')
        var L = cv.downsampling_convolution(input, input.length, RfilterL, RfilterL.length, 2, 'MODE_PERIODIZATION')

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
