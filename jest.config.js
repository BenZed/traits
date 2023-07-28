/* eslint-env node */
module.exports = {
    roots: ['./src'],
    moduleIgnorePatterns: ['node*'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json'
            }
        ]
    }
}
