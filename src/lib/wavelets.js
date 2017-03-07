/* @flow */
'use strict'
import type {
    BaseWavelet,
    WaveletName,
    DiscreteWavelet,
    ContinuousWavelet,
    Coefficient,
    ProcessMode,
    DiscreteTransformType
} from './common'
import * as wfs from 'wavelet_filters'
function swap(a, b) {
    var tmp = b
    b = a
    a = tmp
}
function discrete_wavelet(name: WAVELET_NAME, order: number): DiscreteWavelet {
    var w: DiscreteWavelet
    /* Haar wavelet */
    if (name == 'HAAR') {
        /* the same as db1 */
        w = discrete_wavelet('DB', 1)
        w.base.family_name = 'Haar'
        w.base.short_name = 'haar'
        return w
        /* Reverse biorthogonal wavelets family */
    } else if (name == 'RBIO') {
        /* rbio is like bior, only with switched filters */
        w = discrete_wavelet('BIOR', order)
        if (w == null) return null
        swap(w.dec_len, w.rec_len)
        swap(w.rec_lo, w.dec_lo)
        swap(w.rec_hi, w.dec_hi)
        swap(w.rec_lo, w.dec_lo)
        swap(w.rec_hi, w.dec_hi)
        for (var i = 0, j = w.rec_len - 1; i < j; i++, j--) {
            swap(w.rec_lo[i], w.rec_lo[j])
            swap(w.rec_hi[i], w.rec_hi[j])
            swap(w.dec_lo[i], w.dec_lo[j])
            swap(w.dec_hi[i], w.dec_hi[j])
        }
        w.base.family_name = 'Reverse biorthogonal'
        w.base.short_name = 'rbio'
        return w
    }

    switch (name) {
        /* Daubechies wavelets family */
        case 'DB': {
            var coeffs_idx = order - 1
            w = blank_discrete_wavelet(2 * order)
            w.vanishing_moments_psi = order
            w.vanishing_moments_phi = 0
            w.base.support_width = 2 * order - 1
            w.base.orthogonal = 1
            w.base.biorthogonal = 1
            w.base.symmetry = 'ASYMMETRIC'
            w.base.compact_support = 1
            w.base.family_name = 'Daubechies'
            w.base.short_name = 'db'
            for (var i = 0; i < w.rec_len; ++i) {
                w.rec_lo[i] = wfs.db[coeffs_idx][i]
                w.dec_lo[i] = wfs.db[coeffs_idx][w.dec_len - 1 - i]
                w.rec_hi[i] = ((i % 2) ? -1 : 1)
                    * wfs.db[coeffs_idx][w.dec_len - 1 - i]
                w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                    * wfs.db[coeffs_idx][i]
            }
            break
        }

        /* Symlets wavelets family */
        case 'SYM': {
            var coeffs_idx = order - 2
            w = blank_discrete_wavelet(2 * order)
            w.vanishing_moments_psi = order
            w.vanishing_moments_phi = 0
            w.base.support_width = 2 * order - 1
            w.base.orthogonal = 1
            w.base.biorthogonal = 1
            w.base.symmetry = 'NEAR_SYMMETRIC'
            w.base.compact_support = 1
            w.base.family_name = 'Symlets'
            w.base.short_name = 'sym'
            for (var i = 0; i < w.rec_len; ++i) {
                w.rec_lo[i] = wfs.sym[coeffs_idx][i]
                w.dec_lo[i] = wfs.sym[coeffs_idx][w.dec_len - 1 - i]
                w.rec_hi[i] = ((i % 2) ? -1 : 1)
                    * wfs.sym[coeffs_idx][w.dec_len - 1 - i]
                w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                    * wfs.sym[coeffs_idx][i]
            }
            break
        }

        /* Coiflets wavelets family */
        case 'COIF': {
            var coeffs_idx = order - 1
            w = blank_discrete_wavelet(6 * order)
            w.vanishing_moments_psi = 2 * order
            w.vanishing_moments_phi = 2 * order - 1
            w.base.support_width = 6 * order - 1
            w.base.orthogonal = 1
            w.base.biorthogonal = 1
            w.base.symmetry = 'NEAR_SYMMETRIC'
            w.base.compact_support = 1
            w.base.family_name = 'Coiflets'
            w.base.short_name = 'coif'
            for (var i = 0; i < w.rec_len; ++i) {
                w.rec_lo[i] = wfs.coif[coeffs_idx][i] * wfs.sqrt2
                w.dec_lo[i] = wfs.coif[coeffs_idx][w.dec_len - 1 - i]
                    * wfs.sqrt2
                w.rec_hi[i] = ((i % 2) ? -1 : 1)
                    * wfs.coif[coeffs_idx][w.dec_len - 1 - i] * wfs.sqrt2
                w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                    * wfs.coif[coeffs_idx][i] * wfs.sqrt2
            }

            break
        }
        /* Biorthogonal wavelets family */
        case 'BIOR': {
            var N = Math.floor(order / 10), M = order % 10
            var M_idx
            var M_max
            switch (N) {
                case 1:
                    if (M % 2 != 1 || M > 5) return null
                    M_idx = Math.floor(M / 2)
                    M_max = 5
                    break
                case 2:
                    if (M % 2 != 0 || M < 2 || M > 8) return null
                    M_idx = Math.floor(M / 2) - 1
                    M_max = 8
                    break
                case 3:
                    if (M % 2 != 1) return null
                    M_idx = Math.floor(M / 2)
                    M_max = 9
                    break
                case 4:
                case 5:
                    if (M != N) return null
                    M_idx = 0
                    M_max = M
                    break
                case 6:
                    if (M != 8) return null
                    M_idx = 0
                    M_max = 8
                    break
                default:
                    return null
            }
            w = blank_discrete_wavelet((N == 1) ? 2 * M : 2 * M + 2)
            w.vanishing_moments_psi = Math.floor(order / 10)
            w.vanishing_moments_phi = order % 10
            w.base.support_width = -1
            w.base.orthogonal = 0
            w.base.biorthogonal = 1
            w.base.symmetry = 'SYMMETRIC'
            w.base.compact_support = 1
            w.base.family_name = 'Biorthogonal'
            w.base.short_name = 'bior'
            {
                var n = M_max - M
                var i
                for (i = 0; i < w.rec_len; ++i) {
                    w.rec_lo[i] = wfs.bior[N - 1][0][i + n]
                    w.dec_lo[i] = wfs.bior[N - 1][M_idx + 1][w.dec_len - 1 - i]
                    w.rec_hi[i] = ((i % 2) ? -1 : 1)
                        * wfs.bior[N - 1][M_idx + 1][w.dec_len - 1 - i]
                    w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                        * wfs.bior[N - 1][0][i + n]
                }
            }

            {
                var n = M_max - M
                var i
                for (i = 0; i < w.rec_len; ++i) {
                    w.rec_lo[i] = wfs.bior[N - 1][0][i + n]
                    w.dec_lo[i] = wfs.bior[N - 1][M_idx + 1][w.dec_len - 1 - i]
                    w.rec_hi[i] = ((i % 2) ? -1 : 1)
                        * wfs.bior[N - 1][M_idx + 1][w.dec_len - 1 - i]
                    w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                        * wfs.bior[N - 1][0][i + n]
                }
            }

            break
        }

        /* Discrete FIR filter approximation of Meyer wavelet */
        case 'DMEY':
            w = blank_discrete_wavelet(62)
            if (w == null) return null

            w.vanishing_moments_psi = -1
            w.vanishing_moments_phi = -1
            w.base.support_width = -1
            w.base.orthogonal = 1
            w.base.biorthogonal = 1
            w.base.symmetry = 'SYMMETRIC'
            w.base.compact_support = 1
            w.base.family_name = 'Discrete Meyer (FIR Approximation)'
            w.base.short_name = 'dmey'

            for (var i = 0; i < w.rec_len; ++i) {
                w.rec_lo[i] = wfs.dmey[i]
                w.dec_lo[i] = wfs.dmey[w.dec_len - 1 - i]
                w.rec_hi[i] = ((i % 2) ? -1 : 1)
                    * wfs.dmey[w.dec_len - 1 - i]
                w.dec_hi[i] = (((w.dec_len - 1 - i) % 2) ? -1 : 1)
                    * wfs.dmey[i]
            }
            break
        default:
            return null
    }
    return w
}

function blank_discrete_wavelet(filters_length: number): DiscreteWavelet {
    var w = {}
    /* pad to even length */
    if (filters_length > 0 && filters_length % 2)++filters_length
    w.dec_len = w.rec_len = filters_length
    if (filters_length > 0) {
        w.dec_lo = new Array(filters_length)
        w.dec_hi = new Array(filters_length)
        w.rec_lo = new Array(filters_length)
        w.rec_hi = new Array(filters_length)
    }
    else {
        w.dec_lo = null
        w.dec_hi = null
        w.rec_lo = null
        w.rec_hi = null
    }
    /* set w.base properties to 'blank' values */
    w.base = {}
    w.base.support_width = -1
    w.base.orthogonal = 0
    w.base.biorthogonal = 0
    w.base.symmetry = 'UNKNOWN'
    w.base.compact_support = 0
    w.base.family_name = ''
    w.base.short_name = ''
    w.vanishing_moments_psi = 0
    w.vanishing_moments_phi = 0
    return w
}
function continous_wavelet(name: WAVELET_NAME, order: number): ContinuousWavelet {
    var w: ContinuousWavelet;
    switch (name) {
        /* Gaussian Wavelets */
        case 'GAUS':
            if (order > 8)
                return NULL;
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            if (order % 2 == 0)
                w.base.symmetry = 'SYMMETRIC';
            else
                w.base.symmetry = 'ANTI_SYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Gaussian';
            w.base.short_name = 'gaus';
            w.complex_cwt = 0;
            w.lower_bound = -5;
            w.upper_bound = 5;
            w.center_frequency = 0;
            w.bandwidth_frequency = 0;
            w.fbsp_order = 0;
            break;
        case 'MEXH':
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            w.base.symmetry = 'SYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Mexican hat wavelet';
            w.base.short_name = 'mexh';
            w.complex_cwt = 0;
            w.lower_bound = -8;
            w.upper_bound = 8;
            w.center_frequency = 0;
            w.bandwidth_frequency = 0;
            w.fbsp_order = 0;
            break;
        case 'MORL':
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            w.base.symmetry = 'SYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Morlet wavelet';
            w.base.short_name = 'morl';
            w.complex_cwt = 0;
            w.lower_bound = -8;
            w.upper_bound = 8;
            w.center_frequency = 0;
            w.bandwidth_frequency = 0;
            w.fbsp_order = 0;
            break;
        case 'CGAU':
            if (order > 8)
                return NULL;
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            if (order % 2 == 0)
                w.base.symmetry = 'SYMMETRIC';
            else
                w.base.symmetry = 'ANTI_SYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Complex Gaussian wavelets';
            w.base.short_name = 'cgau';
            w.complex_cwt = 1;
            w.lower_bound = -5;
            w.upper_bound = 5;
            w.center_frequency = 0;
            w.bandwidth_frequency = 0;
            w.fbsp_order = 0;
            break;
        case 'SHAN':
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            w.base.symmetry = 'ASYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Shannon wavelets';
            w.base.short_name = 'shan';
            w.complex_cwt = 1;
            w.lower_bound = -20;
            w.upper_bound = 20;
            w.center_frequency = 1;
            w.bandwidth_frequency = 0.5;
            w.fbsp_order = 0;
            break;
        case 'FBSP':
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            w.base.symmetry = 'ASYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Frequency B-Spline wavelets';
            w.base.short_name = 'fbsp';
            w.complex_cwt = 1;
            w.lower_bound = -20;
            w.upper_bound = 20;
            w.center_frequency = 0.5;
            w.bandwidth_frequency = 1;
            w.fbsp_order = 2;
            break;
        case 'CMOR':
            w = blank_continous_wavelet();
            w.base.support_width = -1;
            w.base.orthogonal = 0;
            w.base.biorthogonal = 0;
            w.base.symmetry = 'ASYMMETRIC';
            w.base.compact_support = 0;
            w.base.family_name = 'Complex Morlet wavelets';
            w.base.short_name = 'cmor';
            w.complex_cwt = 1;
            w.lower_bound = -8;
            w.upper_bound = 8;
            w.center_frequency = 0.5;
            w.bandwidth_frequency = 1;
            w.fbsp_order = 0;
            break;
        default:
            return NULL;
    }
    return w;
}


function blank_continous_wavelet(): ContinuousWavelet {
    var w: ContinuousWavelet;
    w = {};
    /* set properties to 'blank' values */
    w.center_frequency = -1;
    w.bandwidth_frequency = -1;
    w.fbsp_order = 0;
    return w;
}

export { discrete_wavelet, continous_wavelet}