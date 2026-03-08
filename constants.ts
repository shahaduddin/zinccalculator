
import { ScienceConstant } from './types';

export const SCIENTIFIC_CONSTANTS: ScienceConstant[] = [
  // --- Universal ---
  { symbol: 'c', name: 'Speed of Light', value: 299792458, unit: 'm/s', engValue: 983571056, engUnit: 'ft/s', category: 'Universal' },
  { symbol: 'G', name: 'Gravitational Constant', value: 6.67430e-11, unit: 'm³/(kg·s²)', engValue: 3.439e-8, engUnit: 'ft³/(slug·s²)', category: 'Universal' },
  { symbol: 'h', name: 'Planck Constant', value: 6.62607015e-34, unit: 'J·s', engValue: 4.885e-34, engUnit: 'ft·lbf·s', category: 'Universal' },
  { symbol: 'ħ', name: 'Reduced Planck Constant', value: 1.054571817e-34, unit: 'J·s', engValue: 7.777e-35, engUnit: 'ft·lbf·s', category: 'Universal' },
  { symbol: 'ε₀', name: 'Vacuum Permittivity', value: 8.8541878128e-12, unit: 'F/m', engValue: 2.699e-12, engUnit: 'F/ft', category: 'Universal' },
  { symbol: 'μ₀', name: 'Vacuum Permeability', value: 1.25663706e-6, unit: 'H/m', engValue: 3.830e-7, engUnit: 'H/ft', category: 'Universal' },
  { symbol: 'Z₀', name: 'Characteristic Impedance', value: 376.730313, unit: 'Ω', category: 'Universal' },

  // --- Physics ---
  { symbol: 'e', name: 'Elementary Charge', value: 1.602176634e-19, unit: 'C', category: 'Physics' },
  { symbol: 'mₑ', name: 'Electron Mass', value: 9.10938356e-31, unit: 'kg', engValue: 6.242e-32, engUnit: 'slug', category: 'Physics' },
  { symbol: 'mₚ', name: 'Proton Mass', value: 1.6726219e-27, unit: 'kg', engValue: 1.146e-28, engUnit: 'slug', category: 'Physics' },
  { symbol: 'mₙ', name: 'Neutron Mass', value: 1.67492749e-27, unit: 'kg', engValue: 1.147e-28, engUnit: 'slug', category: 'Physics' },
  { symbol: 'α', name: 'Fine Structure Constant', value: 0.007297352, unit: '', category: 'Physics' },
  { symbol: 'R∞', name: 'Rydberg Constant', value: 10973731.56, unit: 'm⁻¹', engValue: 3344826, engUnit: 'ft⁻¹', category: 'Physics' },
  { symbol: 'σ', name: 'Stefan-Boltzmann Constant', value: 5.670374e-8, unit: 'W/(m²·K⁴)', engValue: 1.714e-9, engUnit: 'BTU/(h·ft²·R⁴)', category: 'Physics' },
  { symbol: 'k', name: 'Boltzmann Constant', value: 1.380649e-23, unit: 'J/K', engValue: 5.657e-24, engUnit: 'ft·lbf/R', category: 'Physics' },

  // --- Chemistry ---
  { symbol: 'Nₐ', name: 'Avogadro Constant', value: 6.02214076e23, unit: 'mol⁻¹', category: 'Chemistry' },
  { symbol: 'R', name: 'Molar Gas Constant', value: 8.314462618, unit: 'J/(mol·K)', engValue: 1545.3, engUnit: 'ft·lbf/(lb·mol·R)', category: 'Chemistry' },
  { symbol: 'F', name: 'Faraday Constant', value: 96485.332, unit: 'C/mol', category: 'Chemistry' },
  { symbol: 'Vₘ', name: 'Molar Volume (STP)', value: 0.022413969, unit: 'm³/mol', engValue: 359.05, engUnit: 'ft³/lb-mol', category: 'Chemistry' },

  // --- Astronomy ---
  { symbol: 'au', name: 'Astronomical Unit', value: 149597870700, unit: 'm', engValue: 4.908e11, engUnit: 'ft', category: 'Astronomy' },
  { symbol: 'ly', name: 'Light Year', value: 9.46073047e15, unit: 'm', engValue: 3.104e16, engUnit: 'ft', category: 'Astronomy' },
  { symbol: 'pc', name: 'Parsec', value: 3.08567758e16, unit: 'm', engValue: 1.012e17, engUnit: 'ft', category: 'Astronomy' },
  { symbol: 'M☉', name: 'Solar Mass', value: 1.98847e30, unit: 'kg', engValue: 1.362e29, engUnit: 'slug', category: 'Astronomy' },
  { symbol: 'R☉', name: 'Solar Radius', value: 695700000, unit: 'm', engValue: 2.282e9, engUnit: 'ft', category: 'Astronomy' },

  // --- Earth & Mechanical ---
  { symbol: 'g', name: 'Standard Gravity', value: 9.80665, unit: 'm/s²', engValue: 32.174, engUnit: 'ft/s²', category: 'Earth' },
  { symbol: 'M⊕', name: 'Earth Mass', value: 5.9722e24, unit: 'kg', engValue: 4.092e23, engUnit: 'slug', category: 'Earth' },
  { symbol: 'R⊕', name: 'Earth Radius (Mean)', value: 6371000, unit: 'm', engValue: 20902231, engUnit: 'ft', category: 'Earth' },
  { symbol: 'atm', name: 'Standard Atmosphere', value: 101325, unit: 'Pa', engValue: 14.696, engUnit: 'psi', category: 'Earth' },
  { symbol: 'hp', name: 'Horsepower (Mechanical)', value: 745.699872, unit: 'W', engValue: 550, engUnit: 'ft·lbf/s', category: 'Mechanical' },

  // --- Math ---
  { symbol: 'π', name: 'Pi', value: Math.PI, unit: '', category: 'Math' },
  { symbol: 'e', name: 'Euler\'s Number', value: Math.E, unit: '', category: 'Math' },
  { symbol: 'φ', name: 'Golden Ratio', value: 1.6180339887, unit: '', category: 'Math' },
];
