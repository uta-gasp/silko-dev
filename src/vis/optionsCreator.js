export default class OptionsCreator {

    static get SGWM() {
        return {};
    }

    static createOptions( options, receiver ) {
        let result;
        if (options instanceof Array) {
            result = options.map( item => {
                return {
                    title: item.title,
                    options: OptionsCreator.createOptions( item.options, receiver )
                };
            });
        }
        else {
            for (let id in options) {
                options[ id ].ref = createOptionReference( id, receiver );
            }

            result = options;
        }

        return result;
    }

}

function createOptionReference( id, receiver ) {
    return value => {
        const ids = id.split( '.' );
        if (value === undefined) {
            let v = receiver;
            ids.forEach( _ => {
                if (!v) { console.error( `Option GET: Path '${id} has no match in receiver` ); }
                v = v[ _ ];
            });
            return v;
        }
        else {
            let v = receiver;
            for (let i = 0; i < ids.length - 1; i++) {
                if (!v) { console.error( `Option SET: Path '${id} has no match in receiver` ); }
                v = v[ ids[i] ];
            }
            v[ ids[ ids.length - 1 ] ] = value;
        }
    };
};
