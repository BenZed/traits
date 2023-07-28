module.exports = {
    roots: [
        './src'
    ],
    testEnvironment: 'jest-environment-node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '../../tsconfig.test.json'
            }
        ]
    }
}