
const { getAST, getConcat, transform } = require('./parser');
const path = require("path");
const fs = require("fs");

module.exports = class Compiler {
    constructor(options) {
        //接收配置文件  后面可扩展plugin和loader,mode等
        const { entry, output } = options;
        this.entry = entry;
        this.output = output;

        this.modules = [];//存储模块
    }

    //启动方法
    run() {
        //打包入口文件
        const entryModule = this.buildModule(this.entry, true);
        
        this.modules.push(entryModule);

        //从入口文件的依赖出发 递归 存储模块
        this.modules.map(_module => {
            _module.concats.map(concat => {
                this.modules.push(this.buildModule(concat, false));
            })
        })

        //执行输出文件
        this.emitFiles();
    }

    //打包一个模块
    buildModule(filename, isEntry) {
        let ast;

        //isEntry  是否为入口文件
        if (isEntry) {
            ast = getAST(filename);
        } else {
            let absolutePath = path.join(process.cwd(), "/src", filename);
            ast = getAST(absolutePath);
        }

        return {
            filename,
            concats: getConcat(ast),
            code: transform(ast)
        }
    }

    //输出文件 
    emitFiles() {
        let src = path.join(this.output.path, this.output.filename);
        let modules = "";

        this.modules.map(_module => {
            modules += `'${_module.filename}':
            function(require,module,exports){ 
                ${_module.code} 
            },`
        });

        //组装webpack输出的内容
        let bundle = `(function(modules){
            function require(filename){
                var fn = modules[filename];
                var module = { exports:{} };

                fn(require,module,module.exports);

                return module.exports;
            }

            require('${this.entry}');
        })({${modules}})`


        //先生成文件夹
        this.createDist(this.output.path, () => {
            //生成bundle.js
            fs.writeFileSync(src, bundle, "utf-8");
        });



    }

    /*
    判断是否存在
    dist目录,如果存在则清空
    若不存在则创建一个dist目录
    */
    createDist(url, cb) {
        var files = [];
        /**
         * 判断给定的路径是否存在
         */
       
        if (fs.existsSync(url)) {
            /**
             * 返回文件和子目录的数组
             */
            files = fs.readdirSync(url);
            files.forEach(file => {

                var curPath = path.join(url, file);
                /**
                 * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
                 */
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    this.createDist(curPath);

                } else {
                    fs.unlinkSync(curPath);
                }
            });
            /**
             * 清空至只剩下dist目录
             */
            if (url !== this.output.path) {
                fs.rmdirSync(url);
            } else {
                this.createIndexMl(path.join(this.output.path, 'index.html'), cb);
            }

        } else {//不存在则创建一个dist目录
            fs.mkdirSync(url);
            this.createIndexMl(path.join(this.output.path, 'index.html'), cb);
        }
    }

    //创建一个index.html 
    //创建完成后将打包后的文件插入到index.html
    createIndexMl(url, cb) {
        //读取public目录下index.html  同vue-cli3
        let code = fs.readFileSync(path.join(process.cwd(), "/public/index.html")).toString();

        let scriptMl = `<script src='./${this.output.filename}'></script>`;

        //将script放进去
        let newCode = code.replace('</body>', `${scriptMl}\n</body>`);

        //生成bundle.js
        cb();
        
        //写入文件
        fs.appendFile(url, newCode, err => {
            if (err) {
                console.log(err)
                return;
            } 
            console.log("完成")
        });

    }
}