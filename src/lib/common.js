/* @flow */
type WaveletName='HAAR'|'RBIO'|'DB'|'SYM'|'COIF'|'BIOR'|'DMEY'|'GAUS'|'MEXH'|'MORL'|'CGAU'|'SHAN'|'FBSP'|'CMOR'
type Coefficient= 0 | 1 //COEF_APPROX = 0, COEF_DETAIL = 1
type ProcessMode=
    /* default, signal extended with zeros */
    'MODE_ZEROPAD'|
        /* signal extended symmetrically (mirror)
         * For extensions greater than signal length,
         * mirror back and forth:
         * 2 3 3 2 1 | 1 2 3 | 3 2 1 1 2
         */
        'MODE_SYMMETRIC'|
        /* signal extended with the border value */
        'MODE_CONSTANT_EDGE'|
        /* linear extrapolation (first derivative) */
        'MODE_SMOOTH'|
        /* signal is treated as being periodic */
        'MODE_PERIODIC'|
        /* signal is treated as being periodic, minimal output length */
        'MODE_PERIODIZATION'|
        /* signal extended symmetrically (reflect)
         * For extensions greater than signal length,
         * reflect back and forth without repeating edge values:
         * 1 2 3 2 | 1 2 3 | 2 1 2 3
         */
        'MODE_REFLECT'|
        'MODE_MAX'
type DiscreteTransformType= 0 | 1 // 0 is DWT_TRANSFORM , 1 is SWT_TRANSFORM
type
    BaseWavelet = {
    supportWidth: number,
    symmetry: number,
    orthogonal: boolean,
    biorthogonal: boolean,
    builtIn: number,
    familyName: string,
    shortName: string
}
type DiscreteWavelet= {
    base:BaseWavelet,
    dec_hi:number,    /* highpass decomposition */
    dec_lo:number,    /* lowpass decomposition */
    rec_hi:number,    /* highpass reconstruction */
    rec_lo:number,    /* lowpass reconstruction */
    dec_len:number,
    rec_len:number,
    vanishing_moments_psi:number,
    vanishing_moments_psi:number,
}
type ContinuousWavelet={
    base:BaseWavelet,
    lower_bound:number,
    upper_bound:number,
    /* Parameters for shan, fbsp, cmor*/
    complex_cwt:number,
    center_frequency:number,
    bandwidth_frequency:number,
    fbsp_order:number,
}

function is_discrete_wavelet(name: WaveletName): boolean {
    switch (name) {
        case 'HAAR':
            return true
        case 'RBIO':
            return true
        case 'DB':
            return true
        case 'SYM':
            return true
        case 'COIF':
            return true
        case 'BIOR':
            return true
        case 'DMEY':
            return true
        case 'GAUS':
            return false
        case 'MEXH':
            return false
        case 'MORL':
            return false
        case 'CGAU':
            return false
        case 'SHAN':
            return false
        case 'FBSP':
            return false
        case 'CMOR':
            return false
    }
}
/* check how many times inputLength is divisible by 2
 * */
export function swt_max_level(inputLength: number) {
    var j = 0
    while (inputLength > 0) {
        if (inputLength % 2)
            return j
        Math.floor(inputLength /= 2)
        j++
    }
    return j
}
/* buffers and max levels params */
export function dwt_buffer_length(inputLength: number, filterLength: number, mode: ProcessMode) {
    if (inputLength < 1 || filterLength < 1)
        return 0
    switch (mode) {
        case 'MODE_PERIODIZATION':
            return Math.floor(inputLength / 2 + ((inputLength % 2) ? 1 : 0))
        default:
            return Math.floor((inputLength + filterLength - 1) / 2)
    }
}
export function reconstruction_buffer_length(coeffs_len: number, filterLength: number) {
    if (coeffs_len < 1 || filterLength < 1)
        return 0
    return 2 * coeffs_len + filterLength - 2
}
export function dwt_max_level(inputLength: number, filterLength: number) {
    if (filterLength <= 1 || inputLength < (filterLength - 1))
        return 0
    return Math.floor(Math.log2(inputLength / (filterLength - 1)))
}
export function swt_buffer_length(inputLength) {
    return inputLength
}
export function idwt_buffer_length(coeffs_len: number, filterLength: number, mode: ProcessMode) {
    switch (mode) {
        case 'MODE_PERIODIZATION':
            return 2 * coeffs_len
        default:
            return 2 * coeffs_len - filterLength + 2
    }
}
export var ErrorConsole = function (e) {
    throw e
}