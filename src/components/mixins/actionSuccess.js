export default {
    data() {
        return {
          showSuccess: 0,
          successMessage: '',
        };
    },

    methods: {
        setSuccess( message ) {
          this.successMessage = message;
          this.showSuccess = Math.random();
        },
    },
};
