import { $Array } from './store/array/$array';
import { Store } from './store/store.service';

export class AppService extends Store<AppState> {

    public qux = this.select(state => state.qux);

    public addQux(name: string, baz: string): void {
        this.update(() => {
            return {
                bar: {
                    baz
                },
                qux: $Array.push(name)
            }
        });
    }

}

interface AppState {
    foo: string;
    bar: {
        baz: string;
    };
    qux: string[];
}
