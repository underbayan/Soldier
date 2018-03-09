import '../src/lib/prefix'
import * as cv from '../src/lib/convolution'
import range from 'lodash/range'
import * as wv from '../src/lib/wavelets/discrete_wavelet'
import {gaus, fbsp, cmor, shan, cgau, morl, mexh} from '../src/lib/cwt'
describe('Lib convolution function', function () {
  var xaix = range(-20, 20.5, .5)
  var input = xaix.map((o)=>(5 * Math.sin(o) + Math.random()))
  it('downsampling_convolution_periodization', function () {
    var wavelet = wv.discrete_wavelet('DB', 10)
    var RfilterH = wavelet.dec_hi
    var RfilterL = wavelet.dec_lo
    var CfilterH = wavelet.rec_hi
    var CfilterL = wavelet.rec_lo
    var H = cv.downsampling_convolution_periodization(input, RfilterH, 2, 1)
    var L = cv.downsampling_convolution_periodization(input, RfilterL, 2, 1)
    var output = new Array()
    cv.upsampling_convolution_periodization(H, CfilterH, output)
    cv.upsampling_convolution_periodization(L, CfilterL, output)
    input.map(function (o, i) {
      expect(o).toBeCloseTo(output[i])
    })
  });
  it('downsampling_convolution', function () {
    var wavelet = wv.discrete_wavelet('DB', 18)
    var RfilterH = wavelet.dec_hi
    var RfilterL = wavelet.dec_lo
    var CfilterH = wavelet.rec_hi
    var CfilterL = wavelet.rec_lo;
    ['MODE_PERIODIZATION', 'MODE_REFLECT', 'MODE_CONSTANT_EDGE'].map(o => {
      var output = new Array()
      var H = cv.downsampling_convolution(input, RfilterH, o)
      var L = cv.downsampling_convolution(input, RfilterL, o)
      cv.upsampling_convolution(H, CfilterH, o, 2, output)
      cv.upsampling_convolution(L, CfilterL, o, 2, output)
      var fixedOutput = output.slice(CfilterL.length - 2, input.length + CfilterL.length - 2)
      input.map(function (k, i) {
        expect(k).toBeCloseTo(fixedOutput[i])
      })
    })
  });
});
