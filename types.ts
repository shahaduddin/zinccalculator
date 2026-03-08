
export enum AppView {
  LANDING = 'LANDING',
  CALCULATOR = 'CALCULATOR',
  MATRIX = 'MATRIX',
  EQUATION = 'EQUATION',
  CONSTANTS = 'CONSTANTS',
  SETTINGS = 'SETTINGS'
}

export interface ScienceConstant {
  symbol: string;
  name: string;
  value: number; // SI (Scientific) value
  unit: string;  // SI unit
  engValue?: number; // Engineering value
  engUnit?: string;  // Engineering unit
  category: 'Universal' | 'Physics' | 'Chemistry' | 'Math' | 'Astronomy' | 'Earth' | 'Mechanical';
}

export type Matrix = number[][];

export interface MatrixState {
  a: Matrix;
  b: Matrix;
}

export enum EquationType {
  QUADRATIC = 'QUADRATIC',
  CUBIC = 'CUBIC',
  SYSTEM_2 = 'SYSTEM_2',
  SYSTEM_3 = 'SYSTEM_3'
}

export interface HistoryItem {
  id?: number;
  expression: string;
  result: string;
  timestamp: number;
  note?: string;
}
