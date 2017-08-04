module.exports = {
    "extends": "standard",
    "parser": "vue-eslint-parser",
    "globals": {
        "firebase": true,
        "SGWM": true,
        "GazeTargets": true,
        "responsiveVoice": true,
        "EventEmitter": true,
    },
    "rules": {
        "space-in-parens": 0,
        "indent": 0,
        "semi": ["error", "always"],
        "space-before-function-paren": ["error", "never"],
        "brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
        "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
        "comma-dangle": 0,
        "padded-blocks": ["error", { "blocks": "never", "classes": "always",  }]
    }
};