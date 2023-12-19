import { parseKeyPath } from './key-path';

describe('parseKeyPath', () => {
    it('should parse identifiers in dot notation', () => {
        expect(parseKeyPath('foo0.$bar._baz')).toEqual(['foo0', '$bar', '_baz']);
    });

    it('should throw on invalid identifiers in dot notation', () => {
        expect(() => parseKeyPath('0foo.bar.baz')).toThrowError('Invalid identifier in dot notation: 0foo');
        expect(() => parseKeyPath('foo.bär.baz')).toThrowError('Invalid identifier in dot notation: bär');
    });

    it('should parse numeric values in bracket notation', () => {
        expect(parseKeyPath('foo[0].bar')).toEqual(['foo', 0, 'bar']);
    });

    it('should throw on non numeric values in bracket notation', () => {
        expect(() => parseKeyPath('foo[bar].baz')).toThrowError('Invalid numeric key in unquoted bracket notation: bar');
    });

    it('should parse quoted keys in bracket notation', () => {
        expect(parseKeyPath('foo["bär"].baz')).toEqual(['foo', 'bär', 'baz']);
        expect(parseKeyPath("foo['bär'].baz")).toEqual(['foo', 'bär', 'baz']);
    });
});
