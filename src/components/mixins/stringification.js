export default {
    methods: {
        displayCount( arr, name ) {
            return `${arr.length ? arr.length : 'No'} ${name}${arr.length !== 1 ? 's' : ''}`;
        }
    }
};
