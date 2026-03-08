
import * as math from 'mathjs';
import { SCIENTIFIC_CONSTANTS } from '../constants';

// Setup mathjs configuration
// Fix: Add 'as const' to string literal properties to match specific type requirements of math.ConfigOptions
const mathConfig = {
  epsilon: 1e-12,
  matrix: 'Array' as const,
  number: 'number' as const,
  precision: 64,
  predictable: false,
  randomSeed: null
};

// Create a customized mathjs instance
const m = math.create(math.all, mathConfig);

// Create a scope with all constants
const constantScope = SCIENTIFIC_CONSTANTS.reduce((acc, curr) => {
  acc[curr.symbol] = curr.value;
  return acc;
}, {} as Record<string, number>);

/**
 * Evaluates a standard mathematical expression.
 */
export const evaluateExpression = (expression: string, isDegree: boolean = false): any => {
  try {
    if (!expression.trim()) return null;

    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/ln\(/g, 'log(')
      .replace(/log\(/g, 'log10(');

    sanitized = sanitized
      .replace(/(\d+(\.\d+)?)\s*P\s*(\d+(\.\d+)?)/g, 'permutations($1, $3)')
      .replace(/(\d+(\.\d+)?)\s*C\s*(\d+(\.\d+)?)/g, 'combinations($1, $3)');

    const scope: any = { ...constantScope };

    if (isDegree) {
        scope.sin = (x: any) => m.sin(m.unit(x, 'deg'));
        scope.cos = (x: any) => m.cos(m.unit(x, 'deg'));
        scope.tan = (x: any) => m.tan(m.unit(x, 'deg'));
        scope.sec = (x: any) => m.sec(m.unit(x, 'deg'));
        scope.csc = (x: any) => m.csc(m.unit(x, 'deg'));
        scope.cot = (x: any) => m.cot(m.unit(x, 'deg'));

        const toDeg = (rad: any) => (typeof rad === 'number' ? rad * (180 / Math.PI) : rad);
        scope.asin = (x: any) => toDeg(m.asin(x));
        scope.acos = (x: any) => toDeg(m.acos(x));
        scope.atan = (x: any) => toDeg(m.atan(x));
        scope.asec = (x: any) => toDeg(m.asec(x));
        scope.acsc = (x: any) => toDeg(m.acsc(x));
        scope.acot = (x: any) => toDeg(m.acot(x));
    }

    return m.evaluate(sanitized, scope);
  } catch (error) {
    return 'Error';
  }
};

/**
 * Extracts coefficients [a0, a1, ..., an] from a polynomial expression in 'x'.
 */
export const parsePolynomial = (expression: string): number[] | null => {
  try {
    let clean = expression.trim();
    if (!clean) return null;

    clean = clean.replace(/×/g, '*').replace(/÷/g, '/');

    if (clean.includes('=')) {
      const parts = clean.split('=');
      if (parts.length === 2) {
        clean = `(${parts[0]}) - (${parts[1] || '0'})`;
      }
    }

    // Try parsing
    const node = m.parse(clean);
    
    // Rationalize with symbolic expansion
    const rationalResult = (m as any).rationalize(node, {}, true);
    
    if (!rationalResult || !rationalResult.coefficients) {
      return null;
    }

    const coeffs = (rationalResult.coefficients as any[]).map(c => {
      const val = m.number(c);
      // Fix: Use 'as any' to allow calling toString on values that might be BigNumber or Fraction but are perceived as 'never' due to narrow typing
      return typeof val === 'number' ? val : parseFloat((val as any).toString());
    });

    // Trim trailing zeros (highest power)
    while (coeffs.length > 1 && Math.abs(coeffs[coeffs.length - 1]) < 1e-12) {
      coeffs.pop();
    }

    return coeffs;
  } catch (e) {
    return null;
  }
};

/**
 * Robustly solves a polynomial UpTo Degree 5.
 */
export const solvePolynomial = (coeffs: number[]): string[] => {
  try {
    if (!coeffs || coeffs.length < 2) return ['Invalid Input'];
    
    // Degrees above 5 are supported by the library but results may vary in stability
    if (coeffs.length > 6) return ['Max degree is 5'];

    let roots: any[] = [];

    // Explicit solvers for low degrees (1 and 2) for performance
    if (coeffs.length === 2) { // a1*x + a0 = 0
      roots = [-coeffs[0] / coeffs[1]];
    } else if (coeffs.length === 3) { // a2*x^2 + a1*x + a0 = 0
      const [c, b, a] = coeffs;
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const s = Math.sqrt(disc);
        roots = [(-b + s) / (2 * a), (-b - s) / (2 * a)];
      } else {
        const s = Math.sqrt(-disc);
        roots = [
          m.complex(-b / (2 * a), s / (2 * a)),
          m.complex(-b / (2 * a), -s / (2 * a))
        ];
      }
    } else {
      // Use mathjs numerical solver for degrees 3, 4, and 5
      try {
        // We need to pass coefficients to math.polynomialRoots
        // Note: mathjs polynomialRoots expects coefficients in order [a0, a1, ..., an]
        roots = (m as any).polynomialRoots(coeffs);
      } catch (err) {
        return ['Solver Error'];
      }
    }

    if (!Array.isArray(roots)) return ['No roots found'];

    // Clean up roots: deduplicate and format
    const formattedRoots: string[] = [];
    const seen = new Set<string>();

    roots.forEach((root: any) => {
      let re = 0, im = 0;
      if (typeof root === 'number') {
        re = root;
      } else if (root && typeof root === 'object') {
        re = root.re ?? 0;
        im = root.im ?? 0;
      } else {
        re = Number(root);
      }

      // Snap very small values to zero
      const cleanRe = Math.abs(re) < 1e-10 ? 0 : re;
      const cleanIm = Math.abs(im) < 1e-10 ? 0 : im;

      let rootStr = '';
      if (cleanIm === 0) {
        rootStr = cleanRe.toFixed(6).replace(/\.?0+$/, '');
      } else {
        const rePart = Math.abs(cleanRe) < 1e-10 ? '' : cleanRe.toFixed(4).replace(/\.?0+$/, '');
        const imAbs = Math.abs(cleanIm);
        const imPart = (imAbs === 1 ? '' : imAbs.toFixed(4).replace(/\.?0+$/, '')) + 'i';
        
        if (rePart === '') {
            rootStr = (cleanIm < 0 ? '-' : '') + imPart;
        } else {
            rootStr = `${rePart} ${cleanIm > 0 ? '+' : '-'} ${imPart}`;
        }
      }

      if (!seen.has(rootStr)) {
        formattedRoots.push(rootStr);
        seen.add(rootStr);
      }
    });

    return formattedRoots.length > 0 ? formattedRoots : ['No roots found'];
  } catch (e) {
    return ['Calculation Error'];
  }
};

export const solveLinearSystem = (matrixA: number[][], matrixB: number[]) => {
  try {
    const det = m.det(matrixA);
    if (Math.abs(det) < 1e-12) return ['Singular Matrix (No Unique Solution)'];
    const result = m.lusolve(matrixA, matrixB);
    const flat = (result as any).valueOf().flat();
    return flat.map((val: number, idx: number) => `x${idx + 1} = ${Number(val).toFixed(4).replace(/\.?0+$/, '')}`);
  } catch (e) {
    return ['No Solution'];
  }
};

export const formatValue = (value: any): string => {
  if (value === 'Error') return 'Error';
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (Math.abs(value) < 1e-13 && Math.abs(value) > 0) return value.toExponential(4);
    return parseFloat(value.toPrecision(12)).toString();
  }
  return value.toString();
};

export const toFraction = (value: any): string => {
  if (typeof value !== 'number') return '';
  try {
    const f = m.fraction(value);
    // Fix: Explicitly convert f.d to Number to compare with 1, as mathjs may return f.d as a bigint
    if (Number(f.d) === 1) return '';
    return m.format(f, { fraction: 'ratio' });
  } catch (e) {
    return '';
  }
};
