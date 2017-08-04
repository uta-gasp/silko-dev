class DataUtils {

    static toArray( list ) {
        const result = [];
        for (let id in list) {
            result.push({
                id,
                name: list[ id ]
            });
        }
        return result;
    }

    static byName(a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase();
    }

}

const dataUtils = new DataUtils();
export default dataUtils;
