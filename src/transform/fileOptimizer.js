"use strict";

var through = require('through2')
var path = require("../model/utilpath.js");
var register = require("../model/register.js");
var fs = require('fs');
var instrumentor = require("../task/instrumentor.js");


/**
 * Private functions
 *
 * @param profilingFile
 */

var dl = "function $dl(scriptURL){"+
    "if(!window.uffs){"+
        "window.uffs = {};"+
    "}"+
    "if(!window.uffs[scriptURL]){"+
        "var xhReq = new XMLHttpRequest();"+
        "xhReq.open(\"GET\", scriptURL, false);"+
        "xhReq.send(null);"+
        " window.uffs[scriptURL] = xhReq.responseText;"+
    "}"+
    "return window.uffs[scriptURL];"+
"}";

var loadRegister = function (profilingFile) {
    if(profilingFile!==null  && profilingFile!==undefined && profilingFile.length >0){
        register.loadRegister(profilingFile);
    }else{
        register.loadRegister('profiling.txt');
    }
};

var desInstrumentAndOptimizeFile = function (file) {
    var desInstrumentedCode = "";
   // console.log("Reading file "+file);
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log("ERROR reading file " + file);
        }
        desInstrumentedCode = instrumentor.desinstrumentAndOptimizeFunctions(file, data, register);
        fs.writeFile(file, desInstrumentedCode, function (err) {
            if (err) {
                return console.log("ERROR desinstrumented " + file);
            }
            console.log("file desinstrumented: "+file);
        });
    });
}

var desInstrumentFile = function (file) {
    var desInstrumentedCode = "";
    // console.log("Reading file "+file);
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log("ERROR reading file " + file);
        }
        desInstrumentedCode = instrumentor.desinstrumentFunctions(file, data, register);
        fs.writeFile(file, desInstrumentedCode, function (err) {
            if (err) {
                return console.log("ERROR desinstrumented " + file);
            }
            console.log("file desinstrumented: "+file);
        });
    });
}

var optimizeFile = function (file) {
    var optimizedCode = "";
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log("ERROR reading file " + file);
        }
        optimizedCode = instrumentor.optimizeFunctions(file, data, register);
        fs.writeFile(file, optimizedCode, function (err) {
            if (err) {
                return console.log("ERROR desinstrumented " + file);
            }
            console.log("file desinstrumented: "+file);
        });
    });
}

var optimizeFileBrowser = function (file) {
    var optimizedCode = "";
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log("ERROR reading file " + file);
        }
        optimizedCode = instrumentor.optimizeForBrowser(file, data, register);
        fs.writeFile(file.replace(".js","")+"-optimized.js", dl+"\r\n"+optimizedCode, function (err) {
            if (err) {
                return console.log("ERROR desinstrumented " + file);
            }
            console.log("File optimized: "+file);
            console.log("File generated: "+file.replace(".js","")+"-optimized.js");
        });
    });
}

var logUFFList = function (file) {
    var optimizedCode = "";
    console.log("$$$ UFF LIST $$$");
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log("ERROR reading file " + file);
        }
        instrumentor.logUFFList(file, data, register);
    });
}

module.exports = function (file) {
    loadRegister(profilingFile);
    if (file.endsWith('.js') && path.isInstrumentable(file)&& file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            //console.log("Sync");
            desInstrumentAndOptimizeFile(file);
        } else {
            register.getReader().on('close', function () {
                //console.log("ASync");
                desInstrumentAndOptimizeFile(file);
            })
        }
    }
    return through();
}


/**
 * Public Functions
 *
 * @param file
 * @param profilingFile
 * @returns {*}
 */
module.exports.optimizeFile = function (file, profilingFile) {
    //console.log(file);
    loadRegister(profilingFile);
    if (file.endsWith('.js') && file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            optimizeFile(file);
        } else {
            register.getReader().on('close', function () {
                optimizeFile(file);
            })
        }
    }
    return through();
}

module.exports.optimizeFileBrowser = function (file, profilingFile) {
    //console.log(file);
    loadRegister(profilingFile);
    if (file.endsWith('.js') && file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            optimizeFileBrowser(file);
        } else {
            register.getReader().on('close', function () {
                optimizeFileBrowser(file);
            })
        }
    }
    return through();
}

module.exports.logUFFListFromFile = function (file, profilingFile) {
    //console.log(file);
    loadRegister(profilingFile);
    if (file.endsWith('.js') && file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            logUFFList(file);
        } else {
            register.getReader().on('close', function () {
                logUFFList(file);
            })
        }
    }
    return through();
}

module.exports.optimizeInstrumentedFile = function (file, profilingFile) {
    //console.log(file);
    loadRegister(profilingFile);
    if (file.endsWith('.js') && file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            //console.log("Sync");
            desInstrumentAndOptimizeFile(file);
        } else {
            register.getReader().on('close', function () {
                // console.log("ASync");
                desInstrumentAndOptimizeFile(file);
            })
        }
    }
    return through();
}


module.exports.desinstrumentFile = function (file) {
    //console.log(file);
    if (file.endsWith('.js') && file.indexOf("UFFOptimizer")===-1) {
        if (register.isLoaded()) {
            //console.log("Sync");
            desInstrumentFile(file);
        } else {
            register.getReader().on('close', function () {
                // console.log("ASync");
                desInstrumentFile(file);
            })
        }
    }
    return through();
}
