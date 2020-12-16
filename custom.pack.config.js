const path = require("path");

module.exports = {
    entry:path.join(__dirname,"./src/index.js"),
    output:{
        filename:"bunlde.js",
        path:path.join(__dirname,"./dist")
    }
}