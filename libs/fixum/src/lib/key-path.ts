const cache = new Map<string, (string | number)[]>();

export function parseKeyPath(path: string): (string | number)[] {
    return cache.get(path) ?? _parseKeyPath(path);
}

function _parseKeyPath(path: string): (string | number)[] {
    const keys: (string | number)[] = [];
    const length = path.length;

    let i = 0;
    let key: string | number = '';

    while (i < length) {
        const char = path[i++];

        if (char === '[') {
            if (key) {
                validateIdentifier(key);
                keys.push(key);
            }

            [key, i] = parseBracket(path, i);

            path[i] === '.' && i++;
        } else if (char === '.') {
            validateIdentifier(key);
        } else {
            key += char;

            continue;
        }

        keys.push(key);

        key = '';
    }

    if (key) {
        validateIdentifier(key);
        keys.push(key);
    }

    cache.set(path, keys);

    return keys;
}

function validateIdentifier(key: string): void {
    if (!/^[A-Za-z_$][\w$]*$/.test(key)) {
        throw Error('Invalid identifier in dot notation: ' + key);
    }
}

function parseBracket(path: string, i: number): [string | number, number] {
    const length = path.length;

    let key = '';
    let char = path[i++];

    if (char !== '"' && char !== "'") {
        while (i <= length) {
            if (char === ']') {
                if (!/^\d+$/.test(key)) {
                    throw Error('Invalid numeric key in unquoted bracket notation: ' + key);
                }

                return [+key, i];
            }

            key += char;
            char = path[i++];
        }

        throw Error('Missing closing bracket in unquoted bracket notation');
    }

    const quote = char;

    let escape = false;

    while (i <= length) {
        char = path[i++];

        if (char === quote) {
            if (!escape) {
                if (path[i] !== ']') {
                    throw Error('Missing closing bracket after ending quote');
                }

                return [key, ++i];
            }

            escape = false;
        }

        if (char === '\\') {
            escape = true;
        } else {
            key += char;
        }
    }

    throw Error('Missing ending quote in bracket notation');
}

// type Join<K, P> = K extends string
//     ? P extends string | number
//         ? `${ K }${ "" extends P ? "" : "." }${ P }`
//         : never
//     : K extends number
//         ? P extends string | number
//             ? `[${ K }]${ "" extends P ? "" : "." }${ P }`
//             : never
//         : never;

// type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

// type Paths<T, D extends number = 10> = [D] extends [never]
//     ? never
//     : T extends object
//         ? { [K in keyof T]-?: K extends string | number ?
//             `${ K }` | Join<K, Paths<T[K], Prev[D]>>
//             : never
//         }[keyof T]
//         : ""
