export default {
  data() {
    return {
      showSuccess: 0,
      successMessage: '',
    };
  },

  methods: {
    /**
     * @param {string} message 
     */
    setSuccess( message ) {
      this.successMessage = message;
      this.showSuccess = Math.random();
    },
  },
};
