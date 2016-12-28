'use strict';

const ts = require('typescript');

const compilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES6,
    sourceMap: true,
    inlineSourceMap: true,
    inlineSources: true
};

module.exports = [
    {
        ext: '.ts',
        transform: (content, fileName) => ts.transpileModule(content, { fileName, compilerOptions }).outputText
    }
];
