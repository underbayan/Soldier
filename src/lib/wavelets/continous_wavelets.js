/* @flow */
'use strict'
import type {
  BaseWavelet,
  WaveletName,
  DiscreteWavelet,
  ContinuousWavelet,
  Coefficient,
} from '../common'
function continous_wavelet(name: WAVELET_NAME, order: number): ContinuousWavelet {
  let w: ContinuousWavelet;
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
  let w: ContinuousWavelet;
  w = {};
  /* set properties to 'blank' values */
  w.center_frequency = -1;
  w.bandwidth_frequency = -1;
  w.fbsp_order = 0;
  return w;
}
export {continous_wavelet}