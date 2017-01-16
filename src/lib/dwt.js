/* @flow */
import type {
    BaseWavelet,
    WaveletName,
    DiscreteWavelet,
    ContinuousWavelet,
    Coefficient,
    ProcessMode,
    DiscreteTransformType
} from './common'
import {discrete_wavelet, continous_wavelet} from './wavelets'
import * as cm from './common'
import * as cv from './convolution'

function swt_a(input: Array<number>, inputLength: number, wavelet: DiscreteWavelet, level: number, output: Array<number>, outputLength: number) {
    return swt(input, inputLength, wavelet.dec_lo, wavelet.dec_len, output, outputLength)
}
function swt_d(input: Array<number>, inputLength: number, wavelet: DiscreteWavelet, level: number, output: Array<number>, outputLength: number) {
    return swt(input, inputLength, wavelet.dec_hi, wavelet.dec_len, output, outputLength)
}
function swt(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, level: number, output: Array<number>, outputLength: number) {
    output = !!output ? output : []
    if (level < 1 || level > cm.swt_max_level(inputLength)) {
        throw 'Invalid level'
    }
    // if(outputLength!=cm.swt_buffer_length(inputLength)){
    //     throw 'Invalid inputLength or outputLength'
    // }
    var e_filter = new Array(filter.length << (level - 1)).fill(0)
    var fstep = 1 << (level - 1)
    for (i = 0; i < filterLength; ++i) {
        e_filter[i << (level - 1)] = filter[i]
    }
    if (level > 1) {
        output = cv.downsampling_convolution_periodization(input, inputLength, e_filter, e_filter.length, 1, fstep)
    }
    else {
        output = cv.downsampling_convolution_periodization(input, inputLength, e_filter, e_filter.length, 1, 1)
    }
}
function dec_a(input: Array<number>, inputLength: number, wavelet: DiscreteWavelet, dwt_mode: ProcessMode, output: Array<number>, outputLength: number) {
    //downsampling_convolution(input: Array<number>, inputLength: number, filter: Array<number>, filterLength: number, step: number, mode: string, output: Array<number>)
    return cv.downsampling_convolution(input, inputLength, wavelet.dec_lo, wavelet.dec_len, 2, dwt_mode, output)
}
function dec_d(input: Array<number>, inputLength: number, wavelet: DiscreteWavelet, dwt_mode: ProcessMode, output: Array<number>, outputLength: number) {
    return cv.downsampling_convolution(input, inputLength, wavelet.dec_hi, wavelet.dec_len, 2, dwt_mode, output)
}
function downcoef_axis(input: Array<number>, input_info: object, wavelet: DiscreteWavelet, axis: number, level: number, coef: Coefficient, dwt_mode: ProcessMode, discreteType: DiscreteTransformType) {
    if (!input_info.ndim > 0) {
        throw 'Wrong dim of input option'
    }
    if (!Array.isArray(input_info.shape)) {
        throw 'Wrong shape of input option'
    }
    if (!Array.isArray(input_info.strides)) {
        throw 'Wrong strides of input option'
    }
    var outputOption = {}
    var output = []
    outputOption.shape = []
    input_info.shape.map(function (o, index) {
        outputOption.shape.push(!!discreteType ? cm.swt_buffer_length(o) : cm.dwt_buffer_length(o, wavelet.dec_len, dwt_mode))
    })
    var numlops = 1
    for (var i = 0; i < input_info.ndim; ++i) {
        if (i != axis)
            num_loops *= outputOption.shape[i]
    }
    for (var i = 0; i < numlops; i++) {
        var reduced_idx = i, input_offset = 0
        for (j = 0; j < input_info.ndim; ++j) {
            var j_rev = input_info.ndim - 1 - j
            if (j_rev != axis) {
                var axis_idx = reduced_idx % outputOption.shape[j_rev]
                reduced_idx /= outputOption.shape[j_rev]
                reduced_idx = Math.floor(reduced_idx)
                input_offset += (axis_idx * input_info.strides[j_rev])
            }
        }
        if (discreteType) {
            output.concat(dec_d(input.slice(input_offset, input_info.shape[axis] + input_offset + 1), input_info.shape[axis], wavelet, dwt_mode))
        }
        else {
            output.concat(dec_a(input.slice(input_offset, input_info.shape[axis] + input_offset + 1), input_info.shape[axis], wavelet, dwt_mode))
        }
    }
    return output
}

function idwt_axis(coefs_a, a_info, coefs_d, d_info, wavelet: DiscreteWavelet, axis, MODE: ProcessMode) {
    var i;
    var num_loops = 1;
    var temp_coefs_a = null, temp_coefs_d = null, temp_output = null;
    var make_temp_coefs_a, make_temp_coefs_d, make_temp_output;
    var have_a = ((coefs_a != null) && (a_info != null));
    var have_d = ((coefs_d != null) && (d_info != null));
    if (!have_a && !have_d || a_info.ndim != d_info.ndim) {
        throw "Wrong input "
    }
    var outputOption = {}
    var output = []
    outputOption.shape = []
    a_info.shape.map(function (o, index) {
        outputOption.shape.push(!!discreteType ? cm.idwt_buffer_length(o) : cm.idwt_buffer_length(o, wavelet.dec_len, dwt_mode))
    })
    for (i = 0; i < a_info.ndim; ++i) {

        if (i == axis) {
            var input_shape;
            if (have_a && have_d && (d_info.shape[i] != a_info.shape[i])) {
                throw "Wrong shape of input "
            }
            input_shape = have_a ? a_info.shape[i] : d_info.shape[i];
            if (cm.idwt_buffer_length(input_shape, wavelet.rec_len, mode) != outputOption.shape[i]) {
                throw "Wrong shape of input "
            }
        } else {
            if ((have_a && (a_info.shape[i] != outputOption.shape[i])) ||
                (have_d && (d_info.shape[i] != outputOption.shape[i]))) {
                throw "Wrong shape of input "
            }
        }
    }

    for (i = 0; i < a_info.ndim; ++i) {
        if (i != axis)
            num_loops *= outputOption.shape[i];
    }

    for (i = 0; i < num_loops; ++i) {
        var j;
        var a_offset = 0, d_offset = 0, output_offset = 0;
        {
            var reduced_idx = i;
            for (j = 0; j < outputOption.ndim; ++j) {
                var j_rev = outputOption.ndim - 1 - j;
                if (j_rev != axis) {
                    var axis_idx = reduced_idx % outputOption.shape[j_rev];
                    reduced_idx /= outputOption.shape[j_rev];

                    if (have_a)
                        a_offset += (axis_idx * a_info.strides[j_rev]);
                    if (have_d)
                        d_offset += (axis_idx * d_info.strides[j_rev]);
                    output_offset += (axis_idx * outputOption.strides[j_rev]);
                }
            }
        }
        if (have_a) {
            output.concat(cv.upsampling_convolution_valid_sf(coefs_a.slice(a_offset, a_info.shape[axis] + a_offset + 1), a_info.shape[axis], wavelet.rec_lo, wavelet.rec_len, mode));
        }
        if (have_d) {
            output.concat(cv.upsampling_convolution_valid_sf(coefs_d.slice(d_offset, d_offset + d_info.shape[axis] + 1), d_info.shape[axis], wavelet.rec_hi, wavelet.rec_len, mode));
        }
    }
}
function idwt(coeffs_a: Array<number>, coeffs_a_len: number, coeffs_d: Array<number>, coeffs_d_len: number, wavelet: DiscreteWavelet, mode: ProcessMode, output: Array<number>) {
    var input_len;
    if (coeffs_a != null && coeffs_d != null) {
        if (coeffs_a_len != coeffs_d_len)
            throw 'Wrong coeff length!'
        input_len = coeffs_a_len;
    } else if (coeffs_a != null) {
        input_len = coeffs_a_len;
    } else if (coeffs_d != null) {
        input_len = coeffs_d_len;
    } else {
        throw 'Wrong coeff length!'
    }
    output = !!output ? output : new Array(cm.idwt_buffer_length(input_len, wavelet.rec_len, mode)).fill(0)
    if (coeffs_a) {
        cv.upsampling_convolution_valid_sf(coeffs_a, input_len, wavelet.rec_lo, wavelet.rec_len, mode, output)
    }
    if (coeffs_d) {
        cv.upsampling_convolution_valid_sf(coeffs_d, input_len, wavelet.rec_hi, wavelet.rec_len, mode, output)
    }
    return output
}