export default {
  methods: {
    displayCount( arr, name ) {
      if ( arr === null ) {
        return '';
      }
      return `${arr.length ? arr.length : 'No'} ${name}${arr.length !== 1 ? 's' : ''}`;
    },
  },
};
