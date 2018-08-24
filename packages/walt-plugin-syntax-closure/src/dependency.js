import { unstableCompileWalt } from 'walt-compiler';
import source from './closures.walt';
export const DEPENDENCY_NAME = 'walt-plugin-closure';

export const dependency = () => {
  return unstableCompileWalt(source, {
    version: 0x1,
    encodeNames: false,
    filename: 'walt-closure-plugin',
    lines: source.split('\n'),
  });
};
