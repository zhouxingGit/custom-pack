const fs = require("fs");
const babylon = require("babylon");//使用babylon生成AST
const traverse = require("babel-traverse").default;
const {transformFromAst} = require("babel-core");


module.exports =  {
    getAST:(path)=>{
        const resource = fs.readFileSync(path,"utf-8");

        //生成一个ast
        return babylon.parse(resource,{
            sourceType:"module"
        })
    },

    //输入一个ast 分析ast依赖
    getConcat:(ast)=>{
        const concats = [];
        traverse(ast,{
            ImportDeclaration:({node}) =>{
                concats.push(node.source.value);
            }
        });

        return concats;
    },

    //将ast转换成ES5源码
    transform:(ast)=>{
        const {code} =  transformFromAst(ast,null,{
            presets:['env']
        });
        return code
    }
}