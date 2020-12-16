//引入compiler
const Compiler = require("./compiler");
//引入配置文件  类似于webpack.config.js
const options = require("../custom.pack.config");

new Compiler(options).run();