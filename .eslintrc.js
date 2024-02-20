module.exports = {
    "env": {
        "es2021": true,
        "node": true,
        "react-native/react-native": true
    },
    "extends": [
        "standard-with-typescript",
        "plugin:react/recommended",
        "prettier", "prettier",
        "plugin:promise/recommended",
        "eslint:recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": true,
        "tsconfigRootDir": __dirname,
    },
    "plugins": [
        "react",
        "react-native",
        "promise"
    ],
    "settings": {
        "react": {
            "version": "detect"
        }
    },
    "rules": {
        "@typescript-eslint/explicit-function-return-type": 0
    }
}
