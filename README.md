# custom-pack
## 手写一个简单的webpack

### 主要实现功能
  
>1.将ES6文件打包成ES5文件
>2.生成dist目录存放打包后生成的目标文件  
>3.读取public目录里面的index.html 并在dist目录下生成一个index.html  
>4.将打包好的文件引入到index.html上去

以`custom.pack.config.js` 文件为配置项文件 类比 `webpack.config.js`  

### 主要流程  
  
>1.使用`babylon` 生成AST  
>2.使用 `babel-traverse` 分析 AST 的依赖  
>3.使用 `babel-core` 里的 `transformFromAst` 转换成ES5代码


