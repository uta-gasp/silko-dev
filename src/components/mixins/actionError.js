export default {
  data() {
    return {
      showError: 0,
      errorMessage: '',
    };
  },

  methods: {
    /**
     * @param {Error | string} err 
     * @param {string} pre 
     */
    setError( err, pre ) {
      if ( /** @type {Error} */ (err).message ) {
        err = /** @type {Error} */ (err).message;
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
