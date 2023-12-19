
export function measure(name: string, fn: () => void): void;
export function measure<T>(name: string, setup: () => T, fn?: (args: T) => void): void;
export function measure(name: string, setup: () => any, fn?: (args: any) => void): void {
    const times = [...Array(5)].map(() => measureTime(setup, fn));
    const medianTime = times.sort()[Math.round(times.length / 2)];

    console.log(`${ name }: ${ medianTime }ms`);
}

function measureTime(fn: () => void): number;
function measureTime<T>(setup: () => T, fn?: (args: T) => void): number;
function measureTime(setup: () => any, fn?: (args: any) => void): number {
    if (!fn) {
        fn = setup;
        setup = () => { /**/ };
    }

    const args = setup();

    global.gc && global.gc();

    const startTime = Date.now();

    fn(args);

    const endTime = Date.now();

    return endTime - startTime;
}
