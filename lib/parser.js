const fs = require("fs");
const path = require("path");
const baylon = require("babylon");
const traverse = require("babel-traverse").default;
const {transformFromAst} = require("babel-core");


module.exports =  {
    getAST:(path)=>{
        const resource = fs.readFileSync(path,"utf-8");

        //返回一个ast
        return baylon.parse(resource,{
            sourceType:"module"
        })
    },

    //输入一个ast 分析依赖
    getConcat:(ast)=>{
        const concats = [];
        traverse(ast,{
            ImportDeclaration:({node}) =>{
                concats.push(node.source.value);
            }
        });

        return concats;
    },

    transform:(ast)=>{
        const {code} =  transformFromAst(ast,null,{
            presets:['env']
        });
        return code
    }
}