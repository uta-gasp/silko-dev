export default {
  data() {
    return {
      showError: 0,
      errorMessage: '',
    };
  },

  methods: {
    setError( err, pre ) {
      if ( err.message ) {
        err = err.message;
      }

      if ( pre ) {
        this.errorMessage = `${pre}:\n\n${err}`;
      }
      else {
        this.errorMessage = err;
      }

      this.showError = Math.random();
    },
  },
};
