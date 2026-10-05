// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != "undefined" ? Module : {};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";

// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";

if (ENVIRONMENT_IS_NODE) {}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: /var/folders/pm/461ntwb12b7bbqcjw1s6t0kw0000gn/T/tmps1vyon66.js
Module["expectedDataFileDownloads"] ??= 0;

Module["expectedDataFileDownloads"]++;

(() => {
  // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
  var isPthread = typeof ENVIRONMENT_IS_PTHREAD != "undefined" && ENVIRONMENT_IS_PTHREAD;
  var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != "undefined" && ENVIRONMENT_IS_WASM_WORKER;
  if (isPthread || isWasmWorker) return;
  var isNode = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
  function loadPackage(metadata) {
    var PACKAGE_PATH = "";
    if (typeof window === "object") {
      PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/");
    } else if (typeof process === "undefined" && typeof location !== "undefined") {
      // web worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/");
    }
    var PACKAGE_NAME = "player.data";
    var REMOTE_PACKAGE_BASE = "player.data";
    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      if (isNode) {
        require("fs").readFile(packageName, (err, contents) => {
          if (err) {
            errback(err);
          } else {
            callback(contents.buffer);
          }
        });
        return;
      }
      Module["dataFileDownloads"] ??= {};
      fetch(packageName).catch(cause => Promise.reject(new Error(`Network Error: ${packageName}`, {
        cause
      }))).then(// If fetch fails, rewrite the error to include the failing URL & the cause.
      response => {
        if (!response.ok) {
          return Promise.reject(new Error(`${response.status}: ${response.url}`));
        }
        if (!response.body && response.arrayBuffer) {
          // If we're using the polyfill, readers won't be available...
          return response.arrayBuffer().then(callback);
        }
        const reader = response.body.getReader();
        const iterate = () => reader.read().then(handleChunk).catch(cause => Promise.reject(new Error(`Unexpected error while handling : ${response.url} ${cause}`, {
          cause
        })));
        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get("Content-Length") ?? packageSize);
        let loaded = 0;
        const handleChunk = ({done, value}) => {
          if (!done) {
            chunks.push(value);
            loaded += value.length;
            Module["dataFileDownloads"][packageName] = {
              loaded,
              total
            };
            let totalLoaded = 0;
            let totalSize = 0;
            for (const download of Object.values(Module["dataFileDownloads"])) {
              totalLoaded += download.loaded;
              totalSize += download.total;
            }
            Module["setStatus"]?.(`Downloading data... (${totalLoaded}/${totalSize})`);
            return iterate();
          } else {
            const packageData = new Uint8Array(chunks.map(c => c.length).reduce((a, b) => a + b, 0));
            let offset = 0;
            for (const chunk of chunks) {
              packageData.set(chunk, offset);
              offset += chunk.length;
            }
            callback(packageData.buffer);
          }
        };
        Module["setStatus"]?.("Downloading data...");
        return iterate();
      });
    }
    function handleError(error) {
      console.error("package error:", error);
    }
    var fetchedCallback = null;
    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, data => {
      if (fetchedCallback) {
        fetchedCallback(data);
        fetchedCallback = null;
      } else {
        fetched = data;
      }
    }, handleError);
    function runWithFS(Module) {
      function assert(check, msg) {
        if (!check) throw msg + (new Error).stack;
      }
      Module["FS_createPath"]("/", "python", true, true);
      Module["FS_createPath"]("/python", "lib", true, true);
      Module["FS_createPath"]("/python/lib", "python2.6", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "bsddb", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/bsddb", "test", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "compiler", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "ctypes", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/ctypes", "macholib", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/ctypes", "test", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "curses", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "distutils", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/distutils", "command", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/distutils", "tests", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "email", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/email", "mime", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/email", "test", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/email/test", "data", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "encodings", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "hotshot", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "idlelib", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/idlelib", "Icons", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "json", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/json", "tests", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "lib-tk", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "lib2to3", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3", "fixes", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3", "pgen2", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3", "tests", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3/tests", "data", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3/tests/data", "fixers", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/lib2to3/tests/data/fixers", "myfixes", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "logging", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "msilib", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "multiprocessing", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/multiprocessing", "dummy", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-aix3", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-aix4", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-atheos", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-beos5", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-darwin", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-freebsd4", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-freebsd5", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-freebsd6", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-freebsd7", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-freebsd8", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-generic", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-irix5", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-irix6", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-linux2", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-mac", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac", "Carbon", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac", "lib-scriptpackages", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "CodeWarrior", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "Explorer", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "Finder", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "Netscape", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "StdSuites", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "SystemEvents", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "Terminal", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/plat-mac/lib-scriptpackages", "_builtinSuites", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-netbsd1", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-next3", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-os2emx", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-riscos", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-sunos5", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "plat-unixware7", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "site-packages", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "sqlite3", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/sqlite3", "test", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "test", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/test", "crashers", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/test", "decimaltestdata", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/test", "leakers", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "wsgiref", true, true);
      Module["FS_createPath"]("/python/lib/python2.6", "xml", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/xml", "dom", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/xml", "etree", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/xml", "parsers", true, true);
      Module["FS_createPath"]("/python/lib/python2.6/xml", "sax", true, true);
      /** @constructor */ function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module["addRunDependency"](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
          Module["removeRunDependency"](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };
      var files = metadata["files"];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
      }
      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, "Loading data file failed.");
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
        var byteArray = new Uint8Array(arrayBuffer);
        // Reuse the bytearray from the XHR as the source for file reads.
        DataRequest.prototype.byteArray = byteArray;
        var files = metadata["files"];
        for (var i = 0; i < files.length; ++i) {
          DataRequest.prototype.requests[files[i].filename].onload();
        }
        Module["removeRunDependency"]("datafile_player.data");
      }
      Module["addRunDependency"]("datafile_player.data");
      Module["preloadResults"] ??= {};
      Module["preloadResults"][PACKAGE_NAME] = {
        fromCache: false
      };
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    }
    if (Module["calledRun"]) {
      runWithFS(Module);
    } else {
      (Module["preRun"] ??= []).push(runWithFS);
    }
  }
  // FS is not initialized yet, wait for it
  loadPackage({
    "files": [ {
      "filename": "/python/lib/python2.6/BaseHTTPServer.py",
      "start": 0,
      "end": 21972
    }, {
      "filename": "/python/lib/python2.6/Bastion.py",
      "start": 21972,
      "end": 27716
    }, {
      "filename": "/python/lib/python2.6/CGIHTTPServer.py",
      "start": 27716,
      "end": 40403
    }, {
      "filename": "/python/lib/python2.6/ConfigParser.py",
      "start": 40403,
      "end": 64891
    }, {
      "filename": "/python/lib/python2.6/Cookie.py",
      "start": 64891,
      "end": 90340
    }, {
      "filename": "/python/lib/python2.6/DocXMLRPCServer.py",
      "start": 90340,
      "end": 100939
    }, {
      "filename": "/python/lib/python2.6/HTMLParser.py",
      "start": 100939,
      "end": 114346
    }, {
      "filename": "/python/lib/python2.6/MimeWriter.py",
      "start": 114346,
      "end": 120828
    }, {
      "filename": "/python/lib/python2.6/Queue.py",
      "start": 120828,
      "end": 129402
    }, {
      "filename": "/python/lib/python2.6/SimpleHTTPServer.py",
      "start": 129402,
      "end": 136743
    }, {
      "filename": "/python/lib/python2.6/SimpleXMLRPCServer.py",
      "start": 136743,
      "end": 158649
    }, {
      "filename": "/python/lib/python2.6/SocketServer.py",
      "start": 158649,
      "end": 180571
    }, {
      "filename": "/python/lib/python2.6/StringIO.py",
      "start": 180571,
      "end": 191164
    }, {
      "filename": "/python/lib/python2.6/UserDict.py",
      "start": 191164,
      "end": 196942
    }, {
      "filename": "/python/lib/python2.6/UserList.py",
      "start": 196942,
      "end": 200586
    }, {
      "filename": "/python/lib/python2.6/UserString.py",
      "start": 200586,
      "end": 210273
    }, {
      "filename": "/python/lib/python2.6/_LWPCookieJar.py",
      "start": 210273,
      "end": 216826
    }, {
      "filename": "/python/lib/python2.6/_MozillaCookieJar.py",
      "start": 216826,
      "end": 222647
    }, {
      "filename": "/python/lib/python2.6/__future__.py",
      "start": 222647,
      "end": 227027
    }, {
      "filename": "/python/lib/python2.6/__phello__.foo.py",
      "start": 227027,
      "end": 227091
    }, {
      "filename": "/python/lib/python2.6/_abcoll.py",
      "start": 227091,
      "end": 240716
    }, {
      "filename": "/python/lib/python2.6/_strptime.py",
      "start": 240716,
      "end": 260470
    }, {
      "filename": "/python/lib/python2.6/_threading_local.py",
      "start": 260470,
      "end": 267420
    }, {
      "filename": "/python/lib/python2.6/abc.py",
      "start": 267420,
      "end": 274290
    }, {
      "filename": "/python/lib/python2.6/aifc.py",
      "start": 274290,
      "end": 307725
    }, {
      "filename": "/python/lib/python2.6/anydbm.py",
      "start": 307725,
      "end": 310345
    }, {
      "filename": "/python/lib/python2.6/ast.py",
      "start": 310345,
      "end": 321692
    }, {
      "filename": "/python/lib/python2.6/asynchat.py",
      "start": 321692,
      "end": 333094
    }, {
      "filename": "/python/lib/python2.6/asyncore.py",
      "start": 333094,
      "end": 352275
    }, {
      "filename": "/python/lib/python2.6/atexit.py",
      "start": 352275,
      "end": 353980
    }, {
      "filename": "/python/lib/python2.6/audiodev.py",
      "start": 353980,
      "end": 361577
    }, {
      "filename": "/python/lib/python2.6/base64.py",
      "start": 361577,
      "end": 372909
    }, {
      "filename": "/python/lib/python2.6/bdb.py",
      "start": 372909,
      "end": 393322
    }, {
      "filename": "/python/lib/python2.6/binhex.py",
      "start": 393322,
      "end": 408150
    }, {
      "filename": "/python/lib/python2.6/bisect.py",
      "start": 408150,
      "end": 410812
    }, {
      "filename": "/python/lib/python2.6/bsddb/__init__.py",
      "start": 410812,
      "end": 426501
    }, {
      "filename": "/python/lib/python2.6/bsddb/db.py",
      "start": 426501,
      "end": 429231
    }, {
      "filename": "/python/lib/python2.6/bsddb/dbobj.py",
      "start": 429231,
      "end": 440950
    }, {
      "filename": "/python/lib/python2.6/bsddb/dbrecio.py",
      "start": 440950,
      "end": 446258
    }, {
      "filename": "/python/lib/python2.6/bsddb/dbshelve.py",
      "start": 446258,
      "end": 457314
    }, {
      "filename": "/python/lib/python2.6/bsddb/dbtables.py",
      "start": 457314,
      "end": 487781
    }, {
      "filename": "/python/lib/python2.6/bsddb/dbutils.py",
      "start": 487781,
      "end": 490751
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/__init__.py",
      "start": 490751,
      "end": 490751
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_all.py",
      "start": 490751,
      "end": 506819
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_associate.py",
      "start": 506819,
      "end": 521299
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_basics.py",
      "start": 521299,
      "end": 554139
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_compare.py",
      "start": 554139,
      "end": 562649
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_compat.py",
      "start": 562649,
      "end": 567178
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_cursor_pget_bug.py",
      "start": 567178,
      "end": 569060
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_dbobj.py",
      "start": 569060,
      "end": 571474
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_dbshelve.py",
      "start": 571474,
      "end": 582764
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_dbtables.py",
      "start": 582764,
      "end": 598100
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_distributed_transactions.py",
      "start": 598100,
      "end": 603264
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_early_close.py",
      "start": 603264,
      "end": 609959
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_get_none.py",
      "start": 609959,
      "end": 612197
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_join.py",
      "start": 612197,
      "end": 615374
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_lock.py",
      "start": 615374,
      "end": 621145
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_misc.py",
      "start": 621145,
      "end": 625550
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_pickle.py",
      "start": 625550,
      "end": 627444
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_queue.py",
      "start": 627444,
      "end": 631562
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_recno.py",
      "start": 631562,
      "end": 639691
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_replication.py",
      "start": 639691,
      "end": 657048
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_sequence.py",
      "start": 657048,
      "end": 662519
    }, {
      "filename": "/python/lib/python2.6/bsddb/test/test_thread.py",
      "start": 662519,
      "end": 678465
    }, {
      "filename": "/python/lib/python2.6/cProfile.py",
      "start": 678465,
      "end": 684724
    }, {
      "filename": "/python/lib/python2.6/calendar.py",
      "start": 684724,
      "end": 707719
    }, {
      "filename": "/python/lib/python2.6/cgi.py",
      "start": 707719,
      "end": 742183
    }, {
      "filename": "/python/lib/python2.6/cgitb.py",
      "start": 742183,
      "end": 754308
    }, {
      "filename": "/python/lib/python2.6/chunk.py",
      "start": 754308,
      "end": 759680
    }, {
      "filename": "/python/lib/python2.6/cmd.py",
      "start": 759680,
      "end": 774642
    }, {
      "filename": "/python/lib/python2.6/code.py",
      "start": 774642,
      "end": 784859
    }, {
      "filename": "/python/lib/python2.6/codecs.py",
      "start": 784859,
      "end": 819566
    }, {
      "filename": "/python/lib/python2.6/codeop.py",
      "start": 819566,
      "end": 825565
    }, {
      "filename": "/python/lib/python2.6/collections.py",
      "start": 825565,
      "end": 831651
    }, {
      "filename": "/python/lib/python2.6/colorsys.py",
      "start": 831651,
      "end": 835110
    }, {
      "filename": "/python/lib/python2.6/commands.py",
      "start": 835110,
      "end": 837650
    }, {
      "filename": "/python/lib/python2.6/compileall.py",
      "start": 837650,
      "end": 842935
    }, {
      "filename": "/python/lib/python2.6/compiler/__init__.py",
      "start": 842935,
      "end": 843934
    }, {
      "filename": "/python/lib/python2.6/compiler/ast.py",
      "start": 843934,
      "end": 879669
    }, {
      "filename": "/python/lib/python2.6/compiler/consts.py",
      "start": 879669,
      "end": 880105
    }, {
      "filename": "/python/lib/python2.6/compiler/future.py",
      "start": 880105,
      "end": 881998
    }, {
      "filename": "/python/lib/python2.6/compiler/misc.py",
      "start": 881998,
      "end": 883792
    }, {
      "filename": "/python/lib/python2.6/compiler/pyassem.py",
      "start": 883792,
      "end": 909945
    }, {
      "filename": "/python/lib/python2.6/compiler/pycodegen.py",
      "start": 909945,
      "end": 957053
    }, {
      "filename": "/python/lib/python2.6/compiler/symbols.py",
      "start": 957053,
      "end": 971480
    }, {
      "filename": "/python/lib/python2.6/compiler/syntax.py",
      "start": 971480,
      "end": 972924
    }, {
      "filename": "/python/lib/python2.6/compiler/transformer.py",
      "start": 972924,
      "end": 1024542
    }, {
      "filename": "/python/lib/python2.6/compiler/visitor.py",
      "start": 1024542,
      "end": 1028438
    }, {
      "filename": "/python/lib/python2.6/contextlib.py",
      "start": 1028438,
      "end": 1032574
    }, {
      "filename": "/python/lib/python2.6/cookielib.py",
      "start": 1032574,
      "end": 1097079
    }, {
      "filename": "/python/lib/python2.6/copy.py",
      "start": 1097079,
      "end": 1108075
    }, {
      "filename": "/python/lib/python2.6/copy_reg.py",
      "start": 1108075,
      "end": 1114875
    }, {
      "filename": "/python/lib/python2.6/csv.py",
      "start": 1114875,
      "end": 1130605
    }, {
      "filename": "/python/lib/python2.6/ctypes/__init__.py",
      "start": 1130605,
      "end": 1147916
    }, {
      "filename": "/python/lib/python2.6/ctypes/_endian.py",
      "start": 1147916,
      "end": 1149957
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/README.ctypes",
      "start": 1149957,
      "end": 1150253
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/__init__.py",
      "start": 1150253,
      "end": 1150620
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/dyld.py",
      "start": 1150620,
      "end": 1155961
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/dylib.py",
      "start": 1155961,
      "end": 1158002
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/fetch_macholib",
      "start": 1158002,
      "end": 1158086
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/fetch_macholib.bat",
      "start": 1158086,
      "end": 1158160
    }, {
      "filename": "/python/lib/python2.6/ctypes/macholib/framework.py",
      "start": 1158160,
      "end": 1160574
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/__init__.py",
      "start": 1160574,
      "end": 1167684
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/runtests.py",
      "start": 1167684,
      "end": 1168365
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_anon.py",
      "start": 1168365,
      "end": 1170460
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_array_in_pointer.py",
      "start": 1170460,
      "end": 1172201
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_arrays.py",
      "start": 1172201,
      "end": 1176579
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_as_parameter.py",
      "start": 1176579,
      "end": 1183179
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_bitfields.py",
      "start": 1183179,
      "end": 1192e3
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_buffers.py",
      "start": 1192e3,
      "end": 1194694
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_byteswap.py",
      "start": 1194694,
      "end": 1205208
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_callbacks.py",
      "start": 1205208,
      "end": 1209909
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_cast.py",
      "start": 1209909,
      "end": 1213233
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_cfuncs.py",
      "start": 1213233,
      "end": 1221094
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_checkretval.py",
      "start": 1221094,
      "end": 1222109
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_delattr.py",
      "start": 1222109,
      "end": 1222642
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_errcheck.py",
      "start": 1222642,
      "end": 1223119
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_errno.py",
      "start": 1223119,
      "end": 1225415
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_find.py",
      "start": 1225415,
      "end": 1227887
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_frombuffer.py",
      "start": 1227887,
      "end": 1230339
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_funcptr.py",
      "start": 1230339,
      "end": 1234301
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_functions.py",
      "start": 1234301,
      "end": 1247115
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_incomplete.py",
      "start": 1247115,
      "end": 1248138
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_init.py",
      "start": 1248138,
      "end": 1249208
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_integers.py",
      "start": 1249208,
      "end": 1249305
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_internals.py",
      "start": 1249305,
      "end": 1252002
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_keeprefs.py",
      "start": 1252002,
      "end": 1256031
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_libc.py",
      "start": 1256031,
      "end": 1256924
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_loading.py",
      "start": 1256924,
      "end": 1261028
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_macholib.py",
      "start": 1261028,
      "end": 1262629
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_memfunctions.py",
      "start": 1262629,
      "end": 1265972
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_numbers.py",
      "start": 1265972,
      "end": 1274844
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_objects.py",
      "start": 1274844,
      "end": 1276600
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_parameters.py",
      "start": 1276600,
      "end": 1283205
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_pep3118.py",
      "start": 1283205,
      "end": 1291183
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_pickling.py",
      "start": 1291183,
      "end": 1293245
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_pointers.py",
      "start": 1293245,
      "end": 1299620
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_prototypes.py",
      "start": 1299620,
      "end": 1306534
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_python_api.py",
      "start": 1306534,
      "end": 1309635
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_random_things.py",
      "start": 1309635,
      "end": 1312494
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_refcounts.py",
      "start": 1312494,
      "end": 1315003
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_repr.py",
      "start": 1315003,
      "end": 1315854
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_returnfuncptrs.py",
      "start": 1315854,
      "end": 1317303
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_simplesubclasses.py",
      "start": 1317303,
      "end": 1318687
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_sizes.py",
      "start": 1318687,
      "end": 1319433
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_slicing.py",
      "start": 1319433,
      "end": 1326144
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_stringptr.py",
      "start": 1326144,
      "end": 1328648
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_strings.py",
      "start": 1328648,
      "end": 1335605
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_struct_fields.py",
      "start": 1335605,
      "end": 1337112
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_structures.py",
      "start": 1337112,
      "end": 1351811
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_unaligned_structures.py",
      "start": 1351811,
      "end": 1353042
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_unicode.py",
      "start": 1353042,
      "end": 1358319
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_values.py",
      "start": 1358319,
      "end": 1361544
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_varsize_struct.py",
      "start": 1361544,
      "end": 1363450
    }, {
      "filename": "/python/lib/python2.6/ctypes/test/test_win32.py",
      "start": 1363450,
      "end": 1366569
    }, {
      "filename": "/python/lib/python2.6/ctypes/util.py",
      "start": 1366569,
      "end": 1374938
    }, {
      "filename": "/python/lib/python2.6/ctypes/wintypes.py",
      "start": 1374938,
      "end": 1380287
    }, {
      "filename": "/python/lib/python2.6/curses/__init__.py",
      "start": 1380287,
      "end": 1382161
    }, {
      "filename": "/python/lib/python2.6/curses/ascii.py",
      "start": 1382161,
      "end": 1384768
    }, {
      "filename": "/python/lib/python2.6/curses/has_key.py",
      "start": 1384768,
      "end": 1390401
    }, {
      "filename": "/python/lib/python2.6/curses/panel.py",
      "start": 1390401,
      "end": 1390557
    }, {
      "filename": "/python/lib/python2.6/curses/textpad.py",
      "start": 1390557,
      "end": 1397895
    }, {
      "filename": "/python/lib/python2.6/curses/wrapper.py",
      "start": 1397895,
      "end": 1399540
    }, {
      "filename": "/python/lib/python2.6/dbhash.py",
      "start": 1399540,
      "end": 1400064
    }, {
      "filename": "/python/lib/python2.6/decimal.py",
      "start": 1400064,
      "end": 1596607
    }, {
      "filename": "/python/lib/python2.6/difflib.py",
      "start": 1596607,
      "end": 1677650
    }, {
      "filename": "/python/lib/python2.6/dircache.py",
      "start": 1677650,
      "end": 1678776
    }, {
      "filename": "/python/lib/python2.6/dis.py",
      "start": 1678776,
      "end": 1685260
    }, {
      "filename": "/python/lib/python2.6/distutils/README",
      "start": 1685260,
      "end": 1686274
    }, {
      "filename": "/python/lib/python2.6/distutils/__init__.py",
      "start": 1686274,
      "end": 1686944
    }, {
      "filename": "/python/lib/python2.6/distutils/archive_util.py",
      "start": 1686944,
      "end": 1693186
    }, {
      "filename": "/python/lib/python2.6/distutils/bcppcompiler.py",
      "start": 1693186,
      "end": 1708277
    }, {
      "filename": "/python/lib/python2.6/distutils/ccompiler.py",
      "start": 1708277,
      "end": 1760287
    }, {
      "filename": "/python/lib/python2.6/distutils/cmd.py",
      "start": 1760287,
      "end": 1779540
    }, {
      "filename": "/python/lib/python2.6/distutils/command/__init__.py",
      "start": 1779540,
      "end": 1780455
    }, {
      "filename": "/python/lib/python2.6/distutils/command/bdist.py",
      "start": 1780455,
      "end": 1786016
    }, {
      "filename": "/python/lib/python2.6/distutils/command/bdist_dumb.py",
      "start": 1786016,
      "end": 1790917
    }, {
      "filename": "/python/lib/python2.6/distutils/command/bdist_msi.py",
      "start": 1790917,
      "end": 1822146
    }, {
      "filename": "/python/lib/python2.6/distutils/command/bdist_rpm.py",
      "start": 1822146,
      "end": 1842335
    }, {
      "filename": "/python/lib/python2.6/distutils/command/bdist_wininst.py",
      "start": 1842335,
      "end": 1857264
    }, {
      "filename": "/python/lib/python2.6/distutils/command/build.py",
      "start": 1857264,
      "end": 1862862
    }, {
      "filename": "/python/lib/python2.6/distutils/command/build_clib.py",
      "start": 1862862,
      "end": 1871521
    }, {
      "filename": "/python/lib/python2.6/distutils/command/build_ext.py",
      "start": 1871521,
      "end": 1903600
    }, {
      "filename": "/python/lib/python2.6/distutils/command/build_py.py",
      "start": 1903600,
      "end": 1920302
    }, {
      "filename": "/python/lib/python2.6/distutils/command/build_scripts.py",
      "start": 1920302,
      "end": 1924994
    }, {
      "filename": "/python/lib/python2.6/distutils/command/clean.py",
      "start": 1924994,
      "end": 1927912
    }, {
      "filename": "/python/lib/python2.6/distutils/command/command_template",
      "start": 1927912,
      "end": 1928631
    }, {
      "filename": "/python/lib/python2.6/distutils/command/config.py",
      "start": 1928631,
      "end": 1942022
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install.py",
      "start": 1942022,
      "end": 1968799
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install_data.py",
      "start": 1968799,
      "end": 1971793
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install_egg_info.py",
      "start": 1971793,
      "end": 1974380
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install_headers.py",
      "start": 1974380,
      "end": 1975829
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install_lib.py",
      "start": 1975829,
      "end": 1984120
    }, {
      "filename": "/python/lib/python2.6/distutils/command/install_scripts.py",
      "start": 1984120,
      "end": 1986301
    }, {
      "filename": "/python/lib/python2.6/distutils/command/register.py",
      "start": 1986301,
      "end": 1997810
    }, {
      "filename": "/python/lib/python2.6/distutils/command/sdist.py",
      "start": 1997810,
      "end": 2016262
    }, {
      "filename": "/python/lib/python2.6/distutils/command/upload.py",
      "start": 2016262,
      "end": 2022905
    }, {
      "filename": "/python/lib/python2.6/distutils/command/wininst-6.0.exe",
      "start": 2022905,
      "end": 2084345
    }, {
      "filename": "/python/lib/python2.6/distutils/command/wininst-7.1.exe",
      "start": 2084345,
      "end": 2149881
    }, {
      "filename": "/python/lib/python2.6/distutils/command/wininst-8.0.exe",
      "start": 2149881,
      "end": 2211321
    }, {
      "filename": "/python/lib/python2.6/distutils/command/wininst-9.0-amd64.exe",
      "start": 2211321,
      "end": 2435065
    }, {
      "filename": "/python/lib/python2.6/distutils/command/wininst-9.0.exe",
      "start": 2435065,
      "end": 2631161
    }, {
      "filename": "/python/lib/python2.6/distutils/config.py",
      "start": 2631161,
      "end": 2635453
    }, {
      "filename": "/python/lib/python2.6/distutils/core.py",
      "start": 2635453,
      "end": 2644534
    }, {
      "filename": "/python/lib/python2.6/distutils/cygwinccompiler.py",
      "start": 2644534,
      "end": 2661833
    }, {
      "filename": "/python/lib/python2.6/distutils/debug.py",
      "start": 2661833,
      "end": 2662098
    }, {
      "filename": "/python/lib/python2.6/distutils/dep_util.py",
      "start": 2662098,
      "end": 2665730
    }, {
      "filename": "/python/lib/python2.6/distutils/dir_util.py",
      "start": 2665730,
      "end": 2673866
    }, {
      "filename": "/python/lib/python2.6/distutils/dist.py",
      "start": 2673866,
      "end": 2721683
    }, {
      "filename": "/python/lib/python2.6/distutils/emxccompiler.py",
      "start": 2721683,
      "end": 2733595
    }, {
      "filename": "/python/lib/python2.6/distutils/errors.py",
      "start": 2733595,
      "end": 2737231
    }, {
      "filename": "/python/lib/python2.6/distutils/extension.py",
      "start": 2737231,
      "end": 2747556
    }, {
      "filename": "/python/lib/python2.6/distutils/fancy_getopt.py",
      "start": 2747556,
      "end": 2765983
    }, {
      "filename": "/python/lib/python2.6/distutils/file_util.py",
      "start": 2765983,
      "end": 2774299
    }, {
      "filename": "/python/lib/python2.6/distutils/filelist.py",
      "start": 2774299,
      "end": 2787099
    }, {
      "filename": "/python/lib/python2.6/distutils/log.py",
      "start": 2787099,
      "end": 2788705
    }, {
      "filename": "/python/lib/python2.6/distutils/msvc9compiler.py",
      "start": 2788705,
      "end": 2815640
    }, {
      "filename": "/python/lib/python2.6/distutils/msvccompiler.py",
      "start": 2815640,
      "end": 2839400
    }, {
      "filename": "/python/lib/python2.6/distutils/mwerkscompiler.py",
      "start": 2839400,
      "end": 2849739
    }, {
      "filename": "/python/lib/python2.6/distutils/spawn.py",
      "start": 2849739,
      "end": 2856730
    }, {
      "filename": "/python/lib/python2.6/distutils/sysconfig.py",
      "start": 2856730,
      "end": 2877847
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/__init__.py",
      "start": 2877847,
      "end": 2878869
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/support.py",
      "start": 2878869,
      "end": 2880146
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_bdist_wininst.py",
      "start": 2880146,
      "end": 2881247
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_build_ext.py",
      "start": 2881247,
      "end": 2884756
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_build_py.py",
      "start": 2884756,
      "end": 2887927
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_build_scripts.py",
      "start": 2887927,
      "end": 2891454
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_config.py",
      "start": 2891454,
      "end": 2894701
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_core.py",
      "start": 2894701,
      "end": 2896759
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_dist.py",
      "start": 2896759,
      "end": 2907094
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_filelist.py",
      "start": 2907094,
      "end": 2907913
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_install.py",
      "start": 2907913,
      "end": 2909774
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_install_scripts.py",
      "start": 2909774,
      "end": 2912329
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_msvc9compiler.py",
      "start": 2912329,
      "end": 2913560
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_register.py",
      "start": 2913560,
      "end": 2916706
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_sdist.py",
      "start": 2916706,
      "end": 2921611
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_sysconfig.py",
      "start": 2921611,
      "end": 2923947
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_upload.py",
      "start": 2923947,
      "end": 2924880
    }, {
      "filename": "/python/lib/python2.6/distutils/tests/test_versionpredicate.py",
      "start": 2924880,
      "end": 2925063
    }, {
      "filename": "/python/lib/python2.6/distutils/text_file.py",
      "start": 2925063,
      "end": 2940208
    }, {
      "filename": "/python/lib/python2.6/distutils/unixccompiler.py",
      "start": 2940208,
      "end": 2953720
    }, {
      "filename": "/python/lib/python2.6/distutils/util.py",
      "start": 2953720,
      "end": 2974544
    }, {
      "filename": "/python/lib/python2.6/distutils/version.py",
      "start": 2974544,
      "end": 2986030
    }, {
      "filename": "/python/lib/python2.6/distutils/versionpredicate.py",
      "start": 2986030,
      "end": 2991125
    }, {
      "filename": "/python/lib/python2.6/doctest.py",
      "start": 2991125,
      "end": 3091862
    }, {
      "filename": "/python/lib/python2.6/dumbdbm.py",
      "start": 3091862,
      "end": 3100682
    }, {
      "filename": "/python/lib/python2.6/dummy_thread.py",
      "start": 3100682,
      "end": 3105100
    }, {
      "filename": "/python/lib/python2.6/dummy_threading.py",
      "start": 3105100,
      "end": 3107904
    }, {
      "filename": "/python/lib/python2.6/email/__init__.py",
      "start": 3107904,
      "end": 3110760
    }, {
      "filename": "/python/lib/python2.6/email/_parseaddr.py",
      "start": 3110760,
      "end": 3125741
    }, {
      "filename": "/python/lib/python2.6/email/base64mime.py",
      "start": 3125741,
      "end": 3131533
    }, {
      "filename": "/python/lib/python2.6/email/charset.py",
      "start": 3131533,
      "end": 3147324
    }, {
      "filename": "/python/lib/python2.6/email/encoders.py",
      "start": 3147324,
      "end": 3149626
    }, {
      "filename": "/python/lib/python2.6/email/errors.py",
      "start": 3149626,
      "end": 3151254
    }, {
      "filename": "/python/lib/python2.6/email/feedparser.py",
      "start": 3151254,
      "end": 3171609
    }, {
      "filename": "/python/lib/python2.6/email/generator.py",
      "start": 3171609,
      "end": 3184751
    }, {
      "filename": "/python/lib/python2.6/email/header.py",
      "start": 3184751,
      "end": 3206489
    }, {
      "filename": "/python/lib/python2.6/email/iterators.py",
      "start": 3206489,
      "end": 3208691
    }, {
      "filename": "/python/lib/python2.6/email/message.py",
      "start": 3208691,
      "end": 3238997
    }, {
      "filename": "/python/lib/python2.6/email/mime/__init__.py",
      "start": 3238997,
      "end": 3238997
    }, {
      "filename": "/python/lib/python2.6/email/mime/application.py",
      "start": 3238997,
      "end": 3240253
    }, {
      "filename": "/python/lib/python2.6/email/mime/audio.py",
      "start": 3240253,
      "end": 3242936
    }, {
      "filename": "/python/lib/python2.6/email/mime/base.py",
      "start": 3242936,
      "end": 3243730
    }, {
      "filename": "/python/lib/python2.6/email/mime/image.py",
      "start": 3243730,
      "end": 3245494
    }, {
      "filename": "/python/lib/python2.6/email/mime/message.py",
      "start": 3245494,
      "end": 3246780
    }, {
      "filename": "/python/lib/python2.6/email/mime/multipart.py",
      "start": 3246780,
      "end": 3248353
    }, {
      "filename": "/python/lib/python2.6/email/mime/nonmultipart.py",
      "start": 3248353,
      "end": 3249108
    }, {
      "filename": "/python/lib/python2.6/email/mime/text.py",
      "start": 3249108,
      "end": 3250114
    }, {
      "filename": "/python/lib/python2.6/email/parser.py",
      "start": 3250114,
      "end": 3253414
    }, {
      "filename": "/python/lib/python2.6/email/quoprimime.py",
      "start": 3253414,
      "end": 3264253
    }, {
      "filename": "/python/lib/python2.6/email/test/__init__.py",
      "start": 3264253,
      "end": 3264253
    }, {
      "filename": "/python/lib/python2.6/email/test/data/PyBanner048.gif",
      "start": 3264253,
      "end": 3265207
    }, {
      "filename": "/python/lib/python2.6/email/test/data/audiotest.au",
      "start": 3265207,
      "end": 3288700
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_01.txt",
      "start": 3288700,
      "end": 3289159
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_02.txt",
      "start": 3289159,
      "end": 3291970
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_03.txt",
      "start": 3291970,
      "end": 3292336
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_04.txt",
      "start": 3292336,
      "end": 3293297
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_05.txt",
      "start": 3293297,
      "end": 3293855
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_06.txt",
      "start": 3293855,
      "end": 3294892
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_07.txt",
      "start": 3294892,
      "end": 3300119
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_08.txt",
      "start": 3300119,
      "end": 3300571
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_09.txt",
      "start": 3300571,
      "end": 3301001
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_10.txt",
      "start": 3301001,
      "end": 3301739
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_11.txt",
      "start": 3301739,
      "end": 3301881
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_12.txt",
      "start": 3301881,
      "end": 3302523
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_12a.txt",
      "start": 3302523,
      "end": 3303167
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_13.txt",
      "start": 3303167,
      "end": 3308534
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_14.txt",
      "start": 3308534,
      "end": 3309175
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_15.txt",
      "start": 3309175,
      "end": 3310571
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_16.txt",
      "start": 3310571,
      "end": 3315774
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_17.txt",
      "start": 3315774,
      "end": 3316104
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_18.txt",
      "start": 3316104,
      "end": 3316334
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_19.txt",
      "start": 3316334,
      "end": 3317091
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_20.txt",
      "start": 3317091,
      "end": 3317598
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_21.txt",
      "start": 3317598,
      "end": 3317974
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_22.txt",
      "start": 3317974,
      "end": 3319868
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_23.txt",
      "start": 3319868,
      "end": 3320007
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_24.txt",
      "start": 3320007,
      "end": 3320164
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_25.txt",
      "start": 3320164,
      "end": 3325286
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_26.txt",
      "start": 3325286,
      "end": 3327387
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_27.txt",
      "start": 3327387,
      "end": 3327965
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_28.txt",
      "start": 3327965,
      "end": 3328345
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_29.txt",
      "start": 3328345,
      "end": 3328928
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_30.txt",
      "start": 3328928,
      "end": 3329250
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_31.txt",
      "start": 3329250,
      "end": 3329450
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_32.txt",
      "start": 3329450,
      "end": 3329868
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_33.txt",
      "start": 3329868,
      "end": 3330618
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_34.txt",
      "start": 3330618,
      "end": 3330918
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_35.txt",
      "start": 3330918,
      "end": 3331054
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_36.txt",
      "start": 3331054,
      "end": 3331870
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_37.txt",
      "start": 3331870,
      "end": 3332079
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_38.txt",
      "start": 3332079,
      "end": 3334627
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_39.txt",
      "start": 3334627,
      "end": 3336582
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_40.txt",
      "start": 3336582,
      "end": 3336779
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_41.txt",
      "start": 3336779,
      "end": 3336964
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_42.txt",
      "start": 3336964,
      "end": 3337277
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_43.txt",
      "start": 3337277,
      "end": 3346443
    }, {
      "filename": "/python/lib/python2.6/email/test/data/msg_44.txt",
      "start": 3346443,
      "end": 3347394
    }, {
      "filename": "/python/lib/python2.6/email/test/test_email.py",
      "start": 3347394,
      "end": 3466395
    }, {
      "filename": "/python/lib/python2.6/email/test/test_email_codecs.py",
      "start": 3466395,
      "end": 3469244
    }, {
      "filename": "/python/lib/python2.6/email/test/test_email_codecs_renamed.py",
      "start": 3469244,
      "end": 3472093
    }, {
      "filename": "/python/lib/python2.6/email/test/test_email_renamed.py",
      "start": 3472093,
      "end": 3590904
    }, {
      "filename": "/python/lib/python2.6/email/test/test_email_torture.py",
      "start": 3590904,
      "end": 3594572
    }, {
      "filename": "/python/lib/python2.6/email/utils.py",
      "start": 3594572,
      "end": 3604374
    }, {
      "filename": "/python/lib/python2.6/encodings/__init__.py",
      "start": 3604374,
      "end": 3610012
    }, {
      "filename": "/python/lib/python2.6/encodings/aliases.py",
      "start": 3610012,
      "end": 3624733
    }, {
      "filename": "/python/lib/python2.6/encodings/ascii.py",
      "start": 3624733,
      "end": 3625981
    }, {
      "filename": "/python/lib/python2.6/encodings/base64_codec.py",
      "start": 3625981,
      "end": 3628319
    }, {
      "filename": "/python/lib/python2.6/encodings/big5.py",
      "start": 3628319,
      "end": 3629338
    }, {
      "filename": "/python/lib/python2.6/encodings/big5hkscs.py",
      "start": 3629338,
      "end": 3630377
    }, {
      "filename": "/python/lib/python2.6/encodings/bz2_codec.py",
      "start": 3630377,
      "end": 3633370
    }, {
      "filename": "/python/lib/python2.6/encodings/charmap.py",
      "start": 3633370,
      "end": 3635454
    }, {
      "filename": "/python/lib/python2.6/encodings/cp037.py",
      "start": 3635454,
      "end": 3648831
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1006.py",
      "start": 3648831,
      "end": 3662655
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1026.py",
      "start": 3662655,
      "end": 3676024
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1140.py",
      "start": 3676024,
      "end": 3689385
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1250.py",
      "start": 3689385,
      "end": 3703327
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1251.py",
      "start": 3703327,
      "end": 3716944
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1252.py",
      "start": 3716944,
      "end": 3730711
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1253.py",
      "start": 3730711,
      "end": 3744061
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1254.py",
      "start": 3744061,
      "end": 3757819
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1255.py",
      "start": 3757819,
      "end": 3770541
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1256.py",
      "start": 3770541,
      "end": 3783611
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1257.py",
      "start": 3783611,
      "end": 3797241
    }, {
      "filename": "/python/lib/python2.6/encodings/cp1258.py",
      "start": 3797241,
      "end": 3810861
    }, {
      "filename": "/python/lib/python2.6/encodings/cp424.py",
      "start": 3810861,
      "end": 3823172
    }, {
      "filename": "/python/lib/python2.6/encodings/cp437.py",
      "start": 3823172,
      "end": 3857992
    }, {
      "filename": "/python/lib/python2.6/encodings/cp500.py",
      "start": 3857992,
      "end": 3871369
    }, {
      "filename": "/python/lib/python2.6/encodings/cp737.py",
      "start": 3871369,
      "end": 3906306
    }, {
      "filename": "/python/lib/python2.6/encodings/cp775.py",
      "start": 3906306,
      "end": 3941038
    }, {
      "filename": "/python/lib/python2.6/encodings/cp850.py",
      "start": 3941038,
      "end": 3975399
    }, {
      "filename": "/python/lib/python2.6/encodings/cp852.py",
      "start": 3975399,
      "end": 4010657
    }, {
      "filename": "/python/lib/python2.6/encodings/cp855.py",
      "start": 4010657,
      "end": 4044763
    }, {
      "filename": "/python/lib/python2.6/encodings/cp856.py",
      "start": 4044763,
      "end": 4057442
    }, {
      "filename": "/python/lib/python2.6/encodings/cp857.py",
      "start": 4057442,
      "end": 4091606
    }, {
      "filename": "/python/lib/python2.6/encodings/cp860.py",
      "start": 4091606,
      "end": 4126543
    }, {
      "filename": "/python/lib/python2.6/encodings/cp861.py",
      "start": 4126543,
      "end": 4161432
    }, {
      "filename": "/python/lib/python2.6/encodings/cp862.py",
      "start": 4161432,
      "end": 4195058
    }, {
      "filename": "/python/lib/python2.6/encodings/cp863.py",
      "start": 4195058,
      "end": 4229566
    }, {
      "filename": "/python/lib/python2.6/encodings/cp864.py",
      "start": 4229566,
      "end": 4263485
    }, {
      "filename": "/python/lib/python2.6/encodings/cp865.py",
      "start": 4263485,
      "end": 4298359
    }, {
      "filename": "/python/lib/python2.6/encodings/cp866.py",
      "start": 4298359,
      "end": 4333011
    }, {
      "filename": "/python/lib/python2.6/encodings/cp869.py",
      "start": 4333011,
      "end": 4366232
    }, {
      "filename": "/python/lib/python2.6/encodings/cp874.py",
      "start": 4366232,
      "end": 4379083
    }, {
      "filename": "/python/lib/python2.6/encodings/cp875.py",
      "start": 4379083,
      "end": 4392193
    }, {
      "filename": "/python/lib/python2.6/encodings/cp932.py",
      "start": 4392193,
      "end": 4393216
    }, {
      "filename": "/python/lib/python2.6/encodings/cp949.py",
      "start": 4393216,
      "end": 4394239
    }, {
      "filename": "/python/lib/python2.6/encodings/cp950.py",
      "start": 4394239,
      "end": 4395262
    }, {
      "filename": "/python/lib/python2.6/encodings/euc_jis_2004.py",
      "start": 4395262,
      "end": 4396313
    }, {
      "filename": "/python/lib/python2.6/encodings/euc_jisx0213.py",
      "start": 4396313,
      "end": 4397364
    }, {
      "filename": "/python/lib/python2.6/encodings/euc_jp.py",
      "start": 4397364,
      "end": 4398391
    }, {
      "filename": "/python/lib/python2.6/encodings/euc_kr.py",
      "start": 4398391,
      "end": 4399418
    }, {
      "filename": "/python/lib/python2.6/encodings/gb18030.py",
      "start": 4399418,
      "end": 4400449
    }, {
      "filename": "/python/lib/python2.6/encodings/gb2312.py",
      "start": 4400449,
      "end": 4401476
    }, {
      "filename": "/python/lib/python2.6/encodings/gbk.py",
      "start": 4401476,
      "end": 4402491
    }, {
      "filename": "/python/lib/python2.6/encodings/hex_codec.py",
      "start": 4402491,
      "end": 4404800
    }, {
      "filename": "/python/lib/python2.6/encodings/hp_roman8.py",
      "start": 4404800,
      "end": 4412191
    }, {
      "filename": "/python/lib/python2.6/encodings/hz.py",
      "start": 4412191,
      "end": 4413202
    }, {
      "filename": "/python/lib/python2.6/encodings/idna.py",
      "start": 4413202,
      "end": 4421676
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp.py",
      "start": 4421676,
      "end": 4422729
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp_1.py",
      "start": 4422729,
      "end": 4423790
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp_2.py",
      "start": 4423790,
      "end": 4424851
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp_2004.py",
      "start": 4424851,
      "end": 4425924
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp_3.py",
      "start": 4425924,
      "end": 4426985
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_jp_ext.py",
      "start": 4426985,
      "end": 4428054
    }, {
      "filename": "/python/lib/python2.6/encodings/iso2022_kr.py",
      "start": 4428054,
      "end": 4429107
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_1.py",
      "start": 4429107,
      "end": 4442539
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_10.py",
      "start": 4442539,
      "end": 4456384
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_11.py",
      "start": 4456384,
      "end": 4468975
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_13.py",
      "start": 4468975,
      "end": 4482502
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_14.py",
      "start": 4482502,
      "end": 4496410
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_15.py",
      "start": 4496410,
      "end": 4509878
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_16.py",
      "start": 4509878,
      "end": 4523691
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_2.py",
      "start": 4523691,
      "end": 4537351
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_3.py",
      "start": 4537351,
      "end": 4550696
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_4.py",
      "start": 4550696,
      "end": 4564328
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_5.py",
      "start": 4564328,
      "end": 4577599
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_6.py",
      "start": 4577599,
      "end": 4588688
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_7.py",
      "start": 4588688,
      "end": 4601788
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_8.py",
      "start": 4601788,
      "end": 4613080
    }, {
      "filename": "/python/lib/python2.6/encodings/iso8859_9.py",
      "start": 4613080,
      "end": 4626492
    }, {
      "filename": "/python/lib/python2.6/encodings/johab.py",
      "start": 4626492,
      "end": 4627515
    }, {
      "filename": "/python/lib/python2.6/encodings/koi8_r.py",
      "start": 4627515,
      "end": 4641550
    }, {
      "filename": "/python/lib/python2.6/encodings/koi8_u.py",
      "start": 4641550,
      "end": 4655568
    }, {
      "filename": "/python/lib/python2.6/encodings/latin_1.py",
      "start": 4655568,
      "end": 4656832
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_arabic.py",
      "start": 4656832,
      "end": 4693555
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_centeuro.py",
      "start": 4693555,
      "end": 4707913
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_croatian.py",
      "start": 4707913,
      "end": 4721802
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_cyrillic.py",
      "start": 4721802,
      "end": 4735512
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_farsi.py",
      "start": 4735512,
      "end": 4750938
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_greek.py",
      "start": 4750938,
      "end": 4764915
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_iceland.py",
      "start": 4764915,
      "end": 4778669
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_latin2.py",
      "start": 4778669,
      "end": 4787234
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_roman.py",
      "start": 4787234,
      "end": 4800970
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_romanian.py",
      "start": 4800970,
      "end": 4814887
    }, {
      "filename": "/python/lib/python2.6/encodings/mac_turkish.py",
      "start": 4814887,
      "end": 4828656
    }, {
      "filename": "/python/lib/python2.6/encodings/mbcs.py",
      "start": 4828656,
      "end": 4829867
    }, {
      "filename": "/python/lib/python2.6/encodings/palmos.py",
      "start": 4829867,
      "end": 4832803
    }, {
      "filename": "/python/lib/python2.6/encodings/ptcp154.py",
      "start": 4832803,
      "end": 4841753
    }, {
      "filename": "/python/lib/python2.6/encodings/punycode.py",
      "start": 4841753,
      "end": 4848566
    }, {
      "filename": "/python/lib/python2.6/encodings/quopri_codec.py",
      "start": 4848566,
      "end": 4850713
    }, {
      "filename": "/python/lib/python2.6/encodings/raw_unicode_escape.py",
      "start": 4850713,
      "end": 4851921
    }, {
      "filename": "/python/lib/python2.6/encodings/rot_13.py",
      "start": 4851921,
      "end": 4854500
    }, {
      "filename": "/python/lib/python2.6/encodings/shift_jis.py",
      "start": 4854500,
      "end": 4855539
    }, {
      "filename": "/python/lib/python2.6/encodings/shift_jis_2004.py",
      "start": 4855539,
      "end": 4856598
    }, {
      "filename": "/python/lib/python2.6/encodings/shift_jisx0213.py",
      "start": 4856598,
      "end": 4857657
    }, {
      "filename": "/python/lib/python2.6/encodings/string_escape.py",
      "start": 4857657,
      "end": 4858610
    }, {
      "filename": "/python/lib/python2.6/encodings/tis_620.py",
      "start": 4858610,
      "end": 4871166
    }, {
      "filename": "/python/lib/python2.6/encodings/undefined.py",
      "start": 4871166,
      "end": 4872465
    }, {
      "filename": "/python/lib/python2.6/encodings/unicode_escape.py",
      "start": 4872465,
      "end": 4873649
    }, {
      "filename": "/python/lib/python2.6/encodings/unicode_internal.py",
      "start": 4873649,
      "end": 4874845
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_16.py",
      "start": 4874845,
      "end": 4878109
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_16_be.py",
      "start": 4878109,
      "end": 4879146
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_16_le.py",
      "start": 4879146,
      "end": 4880183
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_32.py",
      "start": 4880183,
      "end": 4885137
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_32_be.py",
      "start": 4885137,
      "end": 4886067
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_32_le.py",
      "start": 4886067,
      "end": 4886997
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_7.py",
      "start": 4886997,
      "end": 4887943
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_8.py",
      "start": 4887943,
      "end": 4888948
    }, {
      "filename": "/python/lib/python2.6/encodings/utf_8_sig.py",
      "start": 4888948,
      "end": 4892533
    }, {
      "filename": "/python/lib/python2.6/encodings/uu_codec.py",
      "start": 4892533,
      "end": 4896271
    }, {
      "filename": "/python/lib/python2.6/encodings/zlib_codec.py",
      "start": 4896271,
      "end": 4899286
    }, {
      "filename": "/python/lib/python2.6/filecmp.py",
      "start": 4899286,
      "end": 4908756
    }, {
      "filename": "/python/lib/python2.6/fileinput.py",
      "start": 4908756,
      "end": 4922899
    }, {
      "filename": "/python/lib/python2.6/fnmatch.py",
      "start": 4922899,
      "end": 4925918
    }, {
      "filename": "/python/lib/python2.6/formatter.py",
      "start": 4925918,
      "end": 4940811
    }, {
      "filename": "/python/lib/python2.6/fpformat.py",
      "start": 4940811,
      "end": 4945510
    }, {
      "filename": "/python/lib/python2.6/fractions.py",
      "start": 4945510,
      "end": 4965583
    }, {
      "filename": "/python/lib/python2.6/ftplib.py",
      "start": 4965583,
      "end": 4994111
    }, {
      "filename": "/python/lib/python2.6/functools.py",
      "start": 4994111,
      "end": 4996273
    }, {
      "filename": "/python/lib/python2.6/genericpath.py",
      "start": 4996273,
      "end": 4999293
    }, {
      "filename": "/python/lib/python2.6/getopt.py",
      "start": 4999293,
      "end": 5006609
    }, {
      "filename": "/python/lib/python2.6/getpass.py",
      "start": 5006609,
      "end": 5011881
    }, {
      "filename": "/python/lib/python2.6/gettext.py",
      "start": 5011881,
      "end": 5031771
    }, {
      "filename": "/python/lib/python2.6/glob.py",
      "start": 5031771,
      "end": 5034020
    }, {
      "filename": "/python/lib/python2.6/gzip.py",
      "start": 5034020,
      "end": 5050767
    }, {
      "filename": "/python/lib/python2.6/hashlib.py",
      "start": 5050767,
      "end": 5055760
    }, {
      "filename": "/python/lib/python2.6/heapq.py",
      "start": 5055760,
      "end": 5071754
    }, {
      "filename": "/python/lib/python2.6/hmac.py",
      "start": 5071754,
      "end": 5076285
    }, {
      "filename": "/python/lib/python2.6/hotshot/__init__.py",
      "start": 5076285,
      "end": 5078955
    }, {
      "filename": "/python/lib/python2.6/hotshot/log.py",
      "start": 5078955,
      "end": 5085100
    }, {
      "filename": "/python/lib/python2.6/hotshot/stats.py",
      "start": 5085100,
      "end": 5087682
    }, {
      "filename": "/python/lib/python2.6/hotshot/stones.py",
      "start": 5087682,
      "end": 5088449
    }, {
      "filename": "/python/lib/python2.6/htmlentitydefs.py",
      "start": 5088449,
      "end": 5106503
    }, {
      "filename": "/python/lib/python2.6/htmllib.py",
      "start": 5106503,
      "end": 5119372
    }, {
      "filename": "/python/lib/python2.6/httplib.py",
      "start": 5119372,
      "end": 5163295
    }, {
      "filename": "/python/lib/python2.6/idlelib/AutoComplete.py",
      "start": 5163295,
      "end": 5172336
    }, {
      "filename": "/python/lib/python2.6/idlelib/AutoCompleteWindow.py",
      "start": 5172336,
      "end": 5189618
    }, {
      "filename": "/python/lib/python2.6/idlelib/AutoExpand.py",
      "start": 5189618,
      "end": 5192101
    }, {
      "filename": "/python/lib/python2.6/idlelib/Bindings.py",
      "start": 5192101,
      "end": 5195582
    }, {
      "filename": "/python/lib/python2.6/idlelib/CREDITS.txt",
      "start": 5195582,
      "end": 5197430
    }, {
      "filename": "/python/lib/python2.6/idlelib/CallTipWindow.py",
      "start": 5197430,
      "end": 5203354
    }, {
      "filename": "/python/lib/python2.6/idlelib/CallTips.py",
      "start": 5203354,
      "end": 5210941
    }, {
      "filename": "/python/lib/python2.6/idlelib/ChangeLog",
      "start": 5210941,
      "end": 5267334
    }, {
      "filename": "/python/lib/python2.6/idlelib/ClassBrowser.py",
      "start": 5267334,
      "end": 5273666
    }, {
      "filename": "/python/lib/python2.6/idlelib/CodeContext.py",
      "start": 5273666,
      "end": 5282005
    }, {
      "filename": "/python/lib/python2.6/idlelib/ColorDelegator.py",
      "start": 5282005,
      "end": 5292131
    }, {
      "filename": "/python/lib/python2.6/idlelib/Debugger.py",
      "start": 5292131,
      "end": 5307920
    }, {
      "filename": "/python/lib/python2.6/idlelib/Delegator.py",
      "start": 5307920,
      "end": 5308751
    }, {
      "filename": "/python/lib/python2.6/idlelib/EditorWindow.py",
      "start": 5308751,
      "end": 5367564
    }, {
      "filename": "/python/lib/python2.6/idlelib/FileList.py",
      "start": 5367564,
      "end": 5371260
    }, {
      "filename": "/python/lib/python2.6/idlelib/FormatParagraph.py",
      "start": 5371260,
      "end": 5376986
    }, {
      "filename": "/python/lib/python2.6/idlelib/GrepDialog.py",
      "start": 5376986,
      "end": 5381009
    }, {
      "filename": "/python/lib/python2.6/idlelib/HISTORY.txt",
      "start": 5381009,
      "end": 5391326
    }, {
      "filename": "/python/lib/python2.6/idlelib/HyperParser.py",
      "start": 5391326,
      "end": 5401619
    }, {
      "filename": "/python/lib/python2.6/idlelib/IOBinding.py",
      "start": 5401619,
      "end": 5422583
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/folder.gif",
      "start": 5422583,
      "end": 5422703
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/idle.icns",
      "start": 5422703,
      "end": 5480138
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/minusnode.gif",
      "start": 5480138,
      "end": 5480234
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/openfolder.gif",
      "start": 5480234,
      "end": 5480359
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/plusnode.gif",
      "start": 5480359,
      "end": 5480438
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/python.gif",
      "start": 5480438,
      "end": 5480563
    }, {
      "filename": "/python/lib/python2.6/idlelib/Icons/tk.gif",
      "start": 5480563,
      "end": 5480648
    }, {
      "filename": "/python/lib/python2.6/idlelib/IdleHistory.py",
      "start": 5480648,
      "end": 5483785
    }, {
      "filename": "/python/lib/python2.6/idlelib/MultiCall.py",
      "start": 5483785,
      "end": 5501067
    }, {
      "filename": "/python/lib/python2.6/idlelib/MultiStatusBar.py",
      "start": 5501067,
      "end": 5501856
    }, {
      "filename": "/python/lib/python2.6/idlelib/NEWS.txt",
      "start": 5501856,
      "end": 5528179
    }, {
      "filename": "/python/lib/python2.6/idlelib/ObjectBrowser.py",
      "start": 5528179,
      "end": 5532327
    }, {
      "filename": "/python/lib/python2.6/idlelib/OutputWindow.py",
      "start": 5532327,
      "end": 5536723
    }, {
      "filename": "/python/lib/python2.6/idlelib/ParenMatch.py",
      "start": 5536723,
      "end": 5543334
    }, {
      "filename": "/python/lib/python2.6/idlelib/PathBrowser.py",
      "start": 5543334,
      "end": 5545951
    }, {
      "filename": "/python/lib/python2.6/idlelib/Percolator.py",
      "start": 5545951,
      "end": 5548551
    }, {
      "filename": "/python/lib/python2.6/idlelib/PyParse.py",
      "start": 5548551,
      "end": 5568061
    }, {
      "filename": "/python/lib/python2.6/idlelib/PyShell.py",
      "start": 5568061,
      "end": 5618964
    }, {
      "filename": "/python/lib/python2.6/idlelib/README.txt",
      "start": 5618964,
      "end": 5621587
    }, {
      "filename": "/python/lib/python2.6/idlelib/RemoteDebugger.py",
      "start": 5621587,
      "end": 5633221
    }, {
      "filename": "/python/lib/python2.6/idlelib/RemoteObjectBrowser.py",
      "start": 5633221,
      "end": 5634150
    }, {
      "filename": "/python/lib/python2.6/idlelib/ReplaceDialog.py",
      "start": 5634150,
      "end": 5639262
    }, {
      "filename": "/python/lib/python2.6/idlelib/ScriptBinding.py",
      "start": 5639262,
      "end": 5647024
    }, {
      "filename": "/python/lib/python2.6/idlelib/ScrolledList.py",
      "start": 5647024,
      "end": 5651019
    }, {
      "filename": "/python/lib/python2.6/idlelib/SearchDialog.py",
      "start": 5651019,
      "end": 5653038
    }, {
      "filename": "/python/lib/python2.6/idlelib/SearchDialogBase.py",
      "start": 5653038,
      "end": 5657423
    }, {
      "filename": "/python/lib/python2.6/idlelib/SearchEngine.py",
      "start": 5657423,
      "end": 5664154
    }, {
      "filename": "/python/lib/python2.6/idlelib/StackViewer.py",
      "start": 5664154,
      "end": 5667995
    }, {
      "filename": "/python/lib/python2.6/idlelib/TODO.txt",
      "start": 5667995,
      "end": 5676473
    }, {
      "filename": "/python/lib/python2.6/idlelib/ToolTip.py",
      "start": 5676473,
      "end": 5679209
    }, {
      "filename": "/python/lib/python2.6/idlelib/TreeWidget.py",
      "start": 5679209,
      "end": 5694448
    }, {
      "filename": "/python/lib/python2.6/idlelib/UndoDelegator.py",
      "start": 5694448,
      "end": 5704708
    }, {
      "filename": "/python/lib/python2.6/idlelib/WidgetRedirector.py",
      "start": 5704708,
      "end": 5709184
    }, {
      "filename": "/python/lib/python2.6/idlelib/WindowList.py",
      "start": 5709184,
      "end": 5711657
    }, {
      "filename": "/python/lib/python2.6/idlelib/ZoomHeight.py",
      "start": 5711657,
      "end": 5712950
    }, {
      "filename": "/python/lib/python2.6/idlelib/__init__.py",
      "start": 5712950,
      "end": 5712987
    }, {
      "filename": "/python/lib/python2.6/idlelib/aboutDialog.py",
      "start": 5712987,
      "end": 5719787
    }, {
      "filename": "/python/lib/python2.6/idlelib/config-extensions.def",
      "start": 5719787,
      "end": 5722484
    }, {
      "filename": "/python/lib/python2.6/idlelib/config-highlight.def",
      "start": 5722484,
      "end": 5724224
    }, {
      "filename": "/python/lib/python2.6/idlelib/config-keys.def",
      "start": 5724224,
      "end": 5731741
    }, {
      "filename": "/python/lib/python2.6/idlelib/config-main.def",
      "start": 5731741,
      "end": 5734253
    }, {
      "filename": "/python/lib/python2.6/idlelib/configDialog.py",
      "start": 5734253,
      "end": 5787624
    }, {
      "filename": "/python/lib/python2.6/idlelib/configHandler.py",
      "start": 5787624,
      "end": 5816593
    }, {
      "filename": "/python/lib/python2.6/idlelib/configHelpSourceEdit.py",
      "start": 5816593,
      "end": 5823273
    }, {
      "filename": "/python/lib/python2.6/idlelib/configSectionNameDialog.py",
      "start": 5823273,
      "end": 5826993
    }, {
      "filename": "/python/lib/python2.6/idlelib/dynOptionMenuWidget.py",
      "start": 5826993,
      "end": 5828295
    }, {
      "filename": "/python/lib/python2.6/idlelib/extend.txt",
      "start": 5828295,
      "end": 5831947
    }, {
      "filename": "/python/lib/python2.6/idlelib/help.txt",
      "start": 5831947,
      "end": 5843170
    }, {
      "filename": "/python/lib/python2.6/idlelib/idle.bat",
      "start": 5843170,
      "end": 5843297
    }, {
      "filename": "/python/lib/python2.6/idlelib/idle.py",
      "start": 5843297,
      "end": 5843961
    }, {
      "filename": "/python/lib/python2.6/idlelib/idle.pyw",
      "start": 5843961,
      "end": 5844625
    }, {
      "filename": "/python/lib/python2.6/idlelib/idlever.py",
      "start": 5844625,
      "end": 5844648
    }, {
      "filename": "/python/lib/python2.6/idlelib/keybindingDialog.py",
      "start": 5844648,
      "end": 5857032
    }, {
      "filename": "/python/lib/python2.6/idlelib/macosxSupport.py",
      "start": 5857032,
      "end": 5861634
    }, {
      "filename": "/python/lib/python2.6/idlelib/rpc.py",
      "start": 5861634,
      "end": 5881970
    }, {
      "filename": "/python/lib/python2.6/idlelib/run.py",
      "start": 5881970,
      "end": 5893170
    }, {
      "filename": "/python/lib/python2.6/idlelib/tabbedpages.py",
      "start": 5893170,
      "end": 5911358
    }, {
      "filename": "/python/lib/python2.6/idlelib/testcode.py",
      "start": 5911358,
      "end": 5911591
    }, {
      "filename": "/python/lib/python2.6/idlelib/textView.py",
      "start": 5911591,
      "end": 5914837
    }, {
      "filename": "/python/lib/python2.6/ihooks.py",
      "start": 5914837,
      "end": 5932289
    }, {
      "filename": "/python/lib/python2.6/imaplib.py",
      "start": 5932289,
      "end": 5979289
    }, {
      "filename": "/python/lib/python2.6/imghdr.py",
      "start": 5979289,
      "end": 5982833
    }, {
      "filename": "/python/lib/python2.6/imputil.py",
      "start": 5982833,
      "end": 6008824
    }, {
      "filename": "/python/lib/python2.6/inspect.py",
      "start": 6008824,
      "end": 6047070
    }, {
      "filename": "/python/lib/python2.6/io.py",
      "start": 6047070,
      "end": 6111453
    }, {
      "filename": "/python/lib/python2.6/json/__init__.py",
      "start": 6111453,
      "end": 6123739
    }, {
      "filename": "/python/lib/python2.6/json/decoder.py",
      "start": 6123739,
      "end": 6134794
    }, {
      "filename": "/python/lib/python2.6/json/encoder.py",
      "start": 6134794,
      "end": 6148232
    }, {
      "filename": "/python/lib/python2.6/json/scanner.py",
      "start": 6148232,
      "end": 6150315
    }, {
      "filename": "/python/lib/python2.6/json/tests/__init__.py",
      "start": 6150315,
      "end": 6151253
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_decode.py",
      "start": 6151253,
      "end": 6151700
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_default.py",
      "start": 6151700,
      "end": 6151908
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_dump.py",
      "start": 6151908,
      "end": 6152209
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_encode_basestring_ascii.py",
      "start": 6152209,
      "end": 6153912
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_fail.py",
      "start": 6153912,
      "end": 6156796
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_float.py",
      "start": 6156796,
      "end": 6157044
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_indent.py",
      "start": 6157044,
      "end": 6157950
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_pass1.py",
      "start": 6157950,
      "end": 6159839
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_pass2.py",
      "start": 6159839,
      "end": 6160212
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_pass3.py",
      "start": 6160212,
      "end": 6160681
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_recursion.py",
      "start": 6160681,
      "end": 6162347
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_scanstring.py",
      "start": 6162347,
      "end": 6166085
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_separators.py",
      "start": 6166085,
      "end": 6167013
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_speedups.py",
      "start": 6167013,
      "end": 6167543
    }, {
      "filename": "/python/lib/python2.6/json/tests/test_unicode.py",
      "start": 6167543,
      "end": 6169506
    }, {
      "filename": "/python/lib/python2.6/json/tool.py",
      "start": 6169506,
      "end": 6170383
    }, {
      "filename": "/python/lib/python2.6/keyword.py",
      "start": 6170383,
      "end": 6172377
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Canvas.py",
      "start": 6172377,
      "end": 6179840
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Dialog.py",
      "start": 6179840,
      "end": 6181407
    }, {
      "filename": "/python/lib/python2.6/lib-tk/FileDialog.py",
      "start": 6181407,
      "end": 6190244
    }, {
      "filename": "/python/lib/python2.6/lib-tk/FixTk.py",
      "start": 6190244,
      "end": 6193088
    }, {
      "filename": "/python/lib/python2.6/lib-tk/ScrolledText.py",
      "start": 6193088,
      "end": 6194789
    }, {
      "filename": "/python/lib/python2.6/lib-tk/SimpleDialog.py",
      "start": 6194789,
      "end": 6198517
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Tix.py",
      "start": 6198517,
      "end": 6272636
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Tkconstants.py",
      "start": 6272636,
      "end": 6274129
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Tkdnd.py",
      "start": 6274129,
      "end": 6285617
    }, {
      "filename": "/python/lib/python2.6/lib-tk/Tkinter.py",
      "start": 6285617,
      "end": 6444193
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkColorChooser.py",
      "start": 6444193,
      "end": 6445979
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkCommonDialog.py",
      "start": 6445979,
      "end": 6447397
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkFileDialog.py",
      "start": 6447397,
      "end": 6453124
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkFont.py",
      "start": 6453124,
      "end": 6459228
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkMessageBox.py",
      "start": 6459228,
      "end": 6462863
    }, {
      "filename": "/python/lib/python2.6/lib-tk/tkSimpleDialog.py",
      "start": 6462863,
      "end": 6470453
    }, {
      "filename": "/python/lib/python2.6/lib-tk/turtle.py",
      "start": 6470453,
      "end": 6609169
    }, {
      "filename": "/python/lib/python2.6/lib2to3/Grammar.txt",
      "start": 6609169,
      "end": 6615500
    }, {
      "filename": "/python/lib/python2.6/lib2to3/PatternGrammar.txt",
      "start": 6615500,
      "end": 6616293
    }, {
      "filename": "/python/lib/python2.6/lib2to3/__init__.py",
      "start": 6616293,
      "end": 6616300
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixer_base.py",
      "start": 6616300,
      "end": 6622515
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixer_util.py",
      "start": 6622515,
      "end": 6636869
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/__init__.py",
      "start": 6636869,
      "end": 6636916
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_apply.py",
      "start": 6636916,
      "end": 6638810
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_basestring.py",
      "start": 6638810,
      "end": 6639111
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_buffer.py",
      "start": 6639111,
      "end": 6639677
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_callable.py",
      "start": 6639677,
      "end": 6640629
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_dict.py",
      "start": 6640629,
      "end": 6644217
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_except.py",
      "start": 6644217,
      "end": 6647460
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_exec.py",
      "start": 6647460,
      "end": 6648445
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_execfile.py",
      "start": 6648445,
      "end": 6650419
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_filter.py",
      "start": 6650419,
      "end": 6652508
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_funcattrs.py",
      "start": 6652508,
      "end": 6653132
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_future.py",
      "start": 6653132,
      "end": 6653659
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_getcwdu.py",
      "start": 6653659,
      "end": 6654091
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_has_key.py",
      "start": 6654091,
      "end": 6657300
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_idioms.py",
      "start": 6657300,
      "end": 6661239
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_import.py",
      "start": 6661239,
      "end": 6664192
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_imports.py",
      "start": 6664192,
      "end": 6669827
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_imports2.py",
      "start": 6669827,
      "end": 6670116
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_input.py",
      "start": 6670116,
      "end": 6670808
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_intern.py",
      "start": 6670808,
      "end": 6672176
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_isinstance.py",
      "start": 6672176,
      "end": 6673770
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_itertools.py",
      "start": 6673770,
      "end": 6675253
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_itertools_imports.py",
      "start": 6675253,
      "end": 6676891
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_long.py",
      "start": 6676891,
      "end": 6677429
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_map.py",
      "start": 6677429,
      "end": 6679966
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_metaclass.py",
      "start": 6679966,
      "end": 6688179
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_methodattrs.py",
      "start": 6688179,
      "end": 6688766
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_ne.py",
      "start": 6688766,
      "end": 6689356
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_next.py",
      "start": 6689356,
      "end": 6692561
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_nonzero.py",
      "start": 6692561,
      "end": 6693139
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_numliterals.py",
      "start": 6693139,
      "end": 6693928
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_paren.py",
      "start": 6693928,
      "end": 6695141
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_print.py",
      "start": 6695141,
      "end": 6698098
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_raise.py",
      "start": 6698098,
      "end": 6700685
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_raw_input.py",
      "start": 6700685,
      "end": 6701120
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_reduce.py",
      "start": 6701120,
      "end": 6701936
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_renames.py",
      "start": 6701936,
      "end": 6704128
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_repr.py",
      "start": 6704128,
      "end": 6704722
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_set_literal.py",
      "start": 6704722,
      "end": 6706427
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_standarderror.py",
      "start": 6706427,
      "end": 6706858
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_sys_exc.py",
      "start": 6706858,
      "end": 6707888
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_throw.py",
      "start": 6707888,
      "end": 6709452
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_tuple_params.py",
      "start": 6709452,
      "end": 6714857
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_types.py",
      "start": 6714857,
      "end": 6716636
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_unicode.py",
      "start": 6716636,
      "end": 6717468
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_urllib.py",
      "start": 6717468,
      "end": 6724952
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_ws_comma.py",
      "start": 6724952,
      "end": 6726060
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_xrange.py",
      "start": 6726060,
      "end": 6728351
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_xreadlines.py",
      "start": 6728351,
      "end": 6729021
    }, {
      "filename": "/python/lib/python2.6/lib2to3/fixes/fix_zip.py",
      "start": 6729021,
      "end": 6729910
    }, {
      "filename": "/python/lib/python2.6/lib2to3/main.py",
      "start": 6729910,
      "end": 6734831
    }, {
      "filename": "/python/lib/python2.6/lib2to3/patcomp.py",
      "start": 6734831,
      "end": 6741355
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/__init__.py",
      "start": 6741355,
      "end": 6741498
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/conv.py",
      "start": 6741498,
      "end": 6751123
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/driver.py",
      "start": 6751123,
      "end": 6755932
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/grammar.py",
      "start": 6755932,
      "end": 6760879
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/literals.py",
      "start": 6760879,
      "end": 6762493
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/parse.py",
      "start": 6762493,
      "end": 6770546
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/pgen.py",
      "start": 6770546,
      "end": 6784286
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/token.py",
      "start": 6784286,
      "end": 6785530
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pgen2/tokenize.py",
      "start": 6785530,
      "end": 6801714
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pygram.py",
      "start": 6801714,
      "end": 6802488
    }, {
      "filename": "/python/lib/python2.6/lib2to3/pytree.py",
      "start": 6802488,
      "end": 6829747
    }, {
      "filename": "/python/lib/python2.6/lib2to3/refactor.py",
      "start": 6829747,
      "end": 6848841
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/__init__.py",
      "start": 6848841,
      "end": 6849514
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/README",
      "start": 6849514,
      "end": 6849918
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/bad_order.py",
      "start": 6849918,
      "end": 6850007
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/__init__.py",
      "start": 6850007,
      "end": 6850007
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/fix_explicit.py",
      "start": 6850007,
      "end": 6850130
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/fix_first.py",
      "start": 6850130,
      "end": 6850254
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/fix_last.py",
      "start": 6850254,
      "end": 6850379
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/fix_parrot.py",
      "start": 6850379,
      "end": 6850732
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/myfixes/fix_preorder.py",
      "start": 6850732,
      "end": 6850859
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/no_fixer_cls.py",
      "start": 6850859,
      "end": 6850934
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/fixers/parrot_example.py",
      "start": 6850934,
      "end": 6850957
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/infinite_recursion.py",
      "start": 6850957,
      "end": 6944028
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/py2_test_grammar.py",
      "start": 6944028,
      "end": 6974555
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/data/py3_test_grammar.py",
      "start": 6974555,
      "end": 7004416
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/pytree_idempotency.py",
      "start": 7004416,
      "end": 7006804
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/support.py",
      "start": 7006804,
      "end": 7008744
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_all_fixers.py",
      "start": 7008744,
      "end": 7009582
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_fixers.py",
      "start": 7009582,
      "end": 7114893
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_parser.py",
      "start": 7114893,
      "end": 7120335
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_pytree.py",
      "start": 7120335,
      "end": 7136163
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_refactor.py",
      "start": 7136163,
      "end": 7141426
    }, {
      "filename": "/python/lib/python2.6/lib2to3/tests/test_util.py",
      "start": 7141426,
      "end": 7160807
    }, {
      "filename": "/python/lib/python2.6/linecache.py",
      "start": 7160807,
      "end": 7164756
    }, {
      "filename": "/python/lib/python2.6/locale.py",
      "start": 7164756,
      "end": 7247350
    }, {
      "filename": "/python/lib/python2.6/logging/__init__.py",
      "start": 7247350,
      "end": 7299468
    }, {
      "filename": "/python/lib/python2.6/logging/config.py",
      "start": 7299468,
      "end": 7312797
    }, {
      "filename": "/python/lib/python2.6/logging/handlers.py",
      "start": 7312797,
      "end": 7356951
    }, {
      "filename": "/python/lib/python2.6/macpath.py",
      "start": 7356951,
      "end": 7362995
    }, {
      "filename": "/python/lib/python2.6/macurl2path.py",
      "start": 7362995,
      "end": 7366270
    }, {
      "filename": "/python/lib/python2.6/mailbox.py",
      "start": 7366270,
      "end": 7441917
    }, {
      "filename": "/python/lib/python2.6/mailcap.py",
      "start": 7441917,
      "end": 7449344
    }, {
      "filename": "/python/lib/python2.6/markupbase.py",
      "start": 7449344,
      "end": 7463694
    }, {
      "filename": "/python/lib/python2.6/md5.py",
      "start": 7463694,
      "end": 7464104
    }, {
      "filename": "/python/lib/python2.6/mhlib.py",
      "start": 7464104,
      "end": 7497538
    }, {
      "filename": "/python/lib/python2.6/mimetools.py",
      "start": 7497538,
      "end": 7504706
    }, {
      "filename": "/python/lib/python2.6/mimetypes.py",
      "start": 7504706,
      "end": 7523575
    }, {
      "filename": "/python/lib/python2.6/mimify.py",
      "start": 7523575,
      "end": 7538596
    }, {
      "filename": "/python/lib/python2.6/modulefinder.py",
      "start": 7538596,
      "end": 7562879
    }, {
      "filename": "/python/lib/python2.6/msilib/__init__.py",
      "start": 7562879,
      "end": 7579895
    }, {
      "filename": "/python/lib/python2.6/msilib/schema.py",
      "start": 7579895,
      "end": 7663621
    }, {
      "filename": "/python/lib/python2.6/msilib/sequence.py",
      "start": 7663621,
      "end": 7667669
    }, {
      "filename": "/python/lib/python2.6/msilib/text.py",
      "start": 7667669,
      "end": 7676982
    }, {
      "filename": "/python/lib/python2.6/multifile.py",
      "start": 7676982,
      "end": 7681802
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/__init__.py",
      "start": 7681802,
      "end": 7689429
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/connection.py",
      "start": 7689429,
      "end": 7701604
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/dummy/__init__.py",
      "start": 7701604,
      "end": 7704576
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/dummy/connection.py",
      "start": 7704576,
      "end": 7705925
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/forking.py",
      "start": 7705925,
      "end": 7720256
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/heap.py",
      "start": 7720256,
      "end": 7726005
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/managers.py",
      "start": 7726005,
      "end": 7760809
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/pool.py",
      "start": 7760809,
      "end": 7778508
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/process.py",
      "start": 7778508,
      "end": 7786371
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/queues.py",
      "start": 7786371,
      "end": 7797086
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/reduction.py",
      "start": 7797086,
      "end": 7802211
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/sharedctypes.py",
      "start": 7802211,
      "end": 7808356
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/synchronize.py",
      "start": 7808356,
      "end": 7817322
    }, {
      "filename": "/python/lib/python2.6/multiprocessing/util.py",
      "start": 7817322,
      "end": 7825161
    }, {
      "filename": "/python/lib/python2.6/mutex.py",
      "start": 7825161,
      "end": 7827027
    }, {
      "filename": "/python/lib/python2.6/netrc.py",
      "start": 7827027,
      "end": 7831138
    }, {
      "filename": "/python/lib/python2.6/new.py",
      "start": 7831138,
      "end": 7831844
    }, {
      "filename": "/python/lib/python2.6/nntplib.py",
      "start": 7831844,
      "end": 7853040
    }, {
      "filename": "/python/lib/python2.6/ntpath.py",
      "start": 7853040,
      "end": 7870171
    }, {
      "filename": "/python/lib/python2.6/nturl2path.py",
      "start": 7870171,
      "end": 7872410
    }, {
      "filename": "/python/lib/python2.6/numbers.py",
      "start": 7872410,
      "end": 7882681
    }, {
      "filename": "/python/lib/python2.6/opcode.py",
      "start": 7882681,
      "end": 7887929
    }, {
      "filename": "/python/lib/python2.6/optparse.py",
      "start": 7887929,
      "end": 7948347
    }, {
      "filename": "/python/lib/python2.6/os.py",
      "start": 7948347,
      "end": 7974582
    }, {
      "filename": "/python/lib/python2.6/os2emxpath.py",
      "start": 7974582,
      "end": 7979080
    }, {
      "filename": "/python/lib/python2.6/pdb.doc",
      "start": 7979080,
      "end": 7986979
    }, {
      "filename": "/python/lib/python2.6/pdb.py",
      "start": 7986979,
      "end": 8031808
    }, {
      "filename": "/python/lib/python2.6/pickle.py",
      "start": 8031808,
      "end": 8076619
    }, {
      "filename": "/python/lib/python2.6/pickletools.py",
      "start": 8076619,
      "end": 8150967
    }, {
      "filename": "/python/lib/python2.6/pipes.py",
      "start": 8150967,
      "end": 8160605
    }, {
      "filename": "/python/lib/python2.6/pkgutil.py",
      "start": 8160605,
      "end": 8180606
    }, {
      "filename": "/python/lib/python2.6/plat-aix3/IN.py",
      "start": 8180606,
      "end": 8183371
    }, {
      "filename": "/python/lib/python2.6/plat-aix3/regen",
      "start": 8183371,
      "end": 8183543
    }, {
      "filename": "/python/lib/python2.6/plat-aix4/IN.py",
      "start": 8183543,
      "end": 8187171
    }, {
      "filename": "/python/lib/python2.6/plat-aix4/regen",
      "start": 8187171,
      "end": 8187343
    }, {
      "filename": "/python/lib/python2.6/plat-atheos/IN.py",
      "start": 8187343,
      "end": 8206675
    }, {
      "filename": "/python/lib/python2.6/plat-atheos/TYPES.py",
      "start": 8206675,
      "end": 8209357
    }, {
      "filename": "/python/lib/python2.6/plat-atheos/regen",
      "start": 8209357,
      "end": 8209526
    }, {
      "filename": "/python/lib/python2.6/plat-beos5/IN.py",
      "start": 8209526,
      "end": 8217932
    }, {
      "filename": "/python/lib/python2.6/plat-beos5/regen",
      "start": 8217932,
      "end": 8218071
    }, {
      "filename": "/python/lib/python2.6/plat-darwin/IN.py",
      "start": 8218071,
      "end": 8225968
    }, {
      "filename": "/python/lib/python2.6/plat-darwin/regen",
      "start": 8225968,
      "end": 8226065
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd4/IN.py",
      "start": 8226065,
      "end": 8233842
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd4/regen",
      "start": 8233842,
      "end": 8233935
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd5/IN.py",
      "start": 8233935,
      "end": 8241712
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd5/regen",
      "start": 8241712,
      "end": 8241805
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd6/IN.py",
      "start": 8241805,
      "end": 8254221
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd6/regen",
      "start": 8254221,
      "end": 8254314
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd7/IN.py",
      "start": 8254314,
      "end": 8267270
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd7/regen",
      "start": 8267270,
      "end": 8267363
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd8/IN.py",
      "start": 8267363,
      "end": 8280319
    }, {
      "filename": "/python/lib/python2.6/plat-freebsd8/regen",
      "start": 8280319,
      "end": 8280412
    }, {
      "filename": "/python/lib/python2.6/plat-generic/regen",
      "start": 8280412,
      "end": 8280509
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/AL.py",
      "start": 8280509,
      "end": 8282102
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/CD.py",
      "start": 8282102,
      "end": 8282974
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/CL.py",
      "start": 8282974,
      "end": 8283602
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/CL_old.py",
      "start": 8283602,
      "end": 8289764
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/DEVICE.py",
      "start": 8289764,
      "end": 8294989
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/ERRNO.py",
      "start": 8294989,
      "end": 8297258
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/FILE.py",
      "start": 8297258,
      "end": 8301296
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/FL.py",
      "start": 8301296,
      "end": 8306896
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/GET.py",
      "start": 8306896,
      "end": 8307921
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/GL.py",
      "start": 8307921,
      "end": 8314282
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/GLWS.py",
      "start": 8314282,
      "end": 8314580
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/IN.py",
      "start": 8314580,
      "end": 8317677
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/IOCTL.py",
      "start": 8317677,
      "end": 8322331
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/SV.py",
      "start": 8322331,
      "end": 8325662
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/WAIT.py",
      "start": 8325662,
      "end": 8326091
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/cddb.py",
      "start": 8326091,
      "end": 8333316
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/cdplayer.py",
      "start": 8333316,
      "end": 8336452
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/flp.doc",
      "start": 8336452,
      "end": 8340744
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/flp.py",
      "start": 8340744,
      "end": 8354131
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/jpeg.py",
      "start": 8354131,
      "end": 8357806
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/panel.py",
      "start": 8357806,
      "end": 8365668
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/panelparser.py",
      "start": 8365668,
      "end": 8369066
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/readcd.doc",
      "start": 8369066,
      "end": 8373370
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/readcd.py",
      "start": 8373370,
      "end": 8381946
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/regen",
      "start": 8381946,
      "end": 8382161
    }, {
      "filename": "/python/lib/python2.6/plat-irix5/torgb.py",
      "start": 8382161,
      "end": 8385030
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/AL.py",
      "start": 8385030,
      "end": 8386623
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/CD.py",
      "start": 8386623,
      "end": 8387495
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/CL.py",
      "start": 8387495,
      "end": 8388123
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/DEVICE.py",
      "start": 8388123,
      "end": 8393348
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/ERRNO.py",
      "start": 8393348,
      "end": 8396122
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/FILE.py",
      "start": 8396122,
      "end": 8407418
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/FL.py",
      "start": 8407418,
      "end": 8413018
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/GET.py",
      "start": 8413018,
      "end": 8414043
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/GL.py",
      "start": 8414043,
      "end": 8420404
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/GLWS.py",
      "start": 8420404,
      "end": 8420702
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/IN.py",
      "start": 8420702,
      "end": 8429425
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/IOCTL.py",
      "start": 8429425,
      "end": 8434079
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/SV.py",
      "start": 8434079,
      "end": 8437410
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/WAIT.py",
      "start": 8437410,
      "end": 8442969
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/cddb.py",
      "start": 8442969,
      "end": 8450187
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/cdplayer.py",
      "start": 8450187,
      "end": 8453282
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/flp.doc",
      "start": 8453282,
      "end": 8457574
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/flp.py",
      "start": 8457574,
      "end": 8470916
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/jpeg.py",
      "start": 8470916,
      "end": 8474577
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/panel.py",
      "start": 8474577,
      "end": 8482439
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/panelparser.py",
      "start": 8482439,
      "end": 8485837
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/readcd.doc",
      "start": 8485837,
      "end": 8490141
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/readcd.py",
      "start": 8490141,
      "end": 8498717
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/regen",
      "start": 8498717,
      "end": 8498954
    }, {
      "filename": "/python/lib/python2.6/plat-irix6/torgb.py",
      "start": 8498954,
      "end": 8501823
    }, {
      "filename": "/python/lib/python2.6/plat-linux2/CDROM.py",
      "start": 8501823,
      "end": 8506858
    }, {
      "filename": "/python/lib/python2.6/plat-linux2/DLFCN.py",
      "start": 8506858,
      "end": 8508486
    }, {
      "filename": "/python/lib/python2.6/plat-linux2/IN.py",
      "start": 8508486,
      "end": 8521516
    }, {
      "filename": "/python/lib/python2.6/plat-linux2/TYPES.py",
      "start": 8521516,
      "end": 8524936
    }, {
      "filename": "/python/lib/python2.6/plat-linux2/regen",
      "start": 8524936,
      "end": 8525131
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Audio_mac.py",
      "start": 8525131,
      "end": 8528627
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/AE.py",
      "start": 8528627,
      "end": 8528645
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/AH.py",
      "start": 8528645,
      "end": 8528663
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Alias.py",
      "start": 8528663,
      "end": 8528684
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Aliases.py",
      "start": 8528684,
      "end": 8529091
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/App.py",
      "start": 8529091,
      "end": 8529110
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Appearance.py",
      "start": 8529110,
      "end": 8556378
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/AppleEvents.py",
      "start": 8556378,
      "end": 8591508
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/AppleHelp.py",
      "start": 8591508,
      "end": 8591641
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CF.py",
      "start": 8591641,
      "end": 8591659
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CG.py",
      "start": 8591659,
      "end": 8591677
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CarbonEvents.py",
      "start": 8591677,
      "end": 8609581
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CarbonEvt.py",
      "start": 8609581,
      "end": 8609606
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Cm.py",
      "start": 8609606,
      "end": 8609624
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Components.py",
      "start": 8609624,
      "end": 8611925
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/ControlAccessor.py",
      "start": 8611925,
      "end": 8613798
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Controls.py",
      "start": 8613798,
      "end": 8640599
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CoreFoundation.py",
      "start": 8640599,
      "end": 8641426
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/CoreGraphics.py",
      "start": 8641426,
      "end": 8642026
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Ctl.py",
      "start": 8642026,
      "end": 8642045
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Dialogs.py",
      "start": 8642045,
      "end": 8644201
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Dlg.py",
      "start": 8644201,
      "end": 8644220
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Drag.py",
      "start": 8644220,
      "end": 8644240
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Dragconst.py",
      "start": 8644240,
      "end": 8647324
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Events.py",
      "start": 8647324,
      "end": 8649556
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Evt.py",
      "start": 8649556,
      "end": 8649575
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/File.py",
      "start": 8649575,
      "end": 8649595
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Files.py",
      "start": 8649595,
      "end": 8661526
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Fm.py",
      "start": 8661526,
      "end": 8661544
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Folder.py",
      "start": 8661544,
      "end": 8661566
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Folders.py",
      "start": 8661566,
      "end": 8670874
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Fonts.py",
      "start": 8670874,
      "end": 8672272
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Help.py",
      "start": 8672272,
      "end": 8672292
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/IBCarbon.py",
      "start": 8672292,
      "end": 8672316
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/IBCarbonRuntime.py",
      "start": 8672316,
      "end": 8672485
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Icn.py",
      "start": 8672485,
      "end": 8672504
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Icons.py",
      "start": 8672504,
      "end": 8688788
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Launch.py",
      "start": 8688788,
      "end": 8688810
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/LaunchServices.py",
      "start": 8688810,
      "end": 8691330
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/List.py",
      "start": 8691330,
      "end": 8691350
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Lists.py",
      "start": 8691350,
      "end": 8692113
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/MacHelp.py",
      "start": 8692113,
      "end": 8694196
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/MacTextEditor.py",
      "start": 8694196,
      "end": 8702580
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/MediaDescr.py",
      "start": 8702580,
      "end": 8705659
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Menu.py",
      "start": 8705659,
      "end": 8705679
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Menus.py",
      "start": 8705679,
      "end": 8710553
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Mlte.py",
      "start": 8710553,
      "end": 8710573
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/OSA.py",
      "start": 8710573,
      "end": 8710592
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/OSAconst.py",
      "start": 8710592,
      "end": 8715191
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/QDOffscreen.py",
      "start": 8715191,
      "end": 8716457
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Qd.py",
      "start": 8716457,
      "end": 8716475
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Qdoffs.py",
      "start": 8716475,
      "end": 8716497
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Qt.py",
      "start": 8716497,
      "end": 8716636
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/QuickDraw.py",
      "start": 8716636,
      "end": 8722108
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/QuickTime.py",
      "start": 8722108,
      "end": 8851198
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Res.py",
      "start": 8851198,
      "end": 8851284
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Resources.py",
      "start": 8851284,
      "end": 8851811
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Scrap.py",
      "start": 8851811,
      "end": 8851832
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Snd.py",
      "start": 8851832,
      "end": 8851851
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Sndihooks.py",
      "start": 8851851,
      "end": 8851876
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Sound.py",
      "start": 8851876,
      "end": 8865134
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/TE.py",
      "start": 8865134,
      "end": 8865152
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/TextEdit.py",
      "start": 8865152,
      "end": 8866116
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Win.py",
      "start": 8866116,
      "end": 8866135
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/Windows.py",
      "start": 8866135,
      "end": 8874714
    }, {
      "filename": "/python/lib/python2.6/plat-mac/Carbon/__init__.py",
      "start": 8874714,
      "end": 8875007
    }, {
      "filename": "/python/lib/python2.6/plat-mac/EasyDialogs.py",
      "start": 8875007,
      "end": 8905574
    }, {
      "filename": "/python/lib/python2.6/plat-mac/FrameWork.py",
      "start": 8905574,
      "end": 8943243
    }, {
      "filename": "/python/lib/python2.6/plat-mac/MiniAEFrame.py",
      "start": 8943243,
      "end": 8949786
    }, {
      "filename": "/python/lib/python2.6/plat-mac/PixMapWrapper.py",
      "start": 8949786,
      "end": 8957919
    }, {
      "filename": "/python/lib/python2.6/plat-mac/aepack.py",
      "start": 8957919,
      "end": 8970129
    }, {
      "filename": "/python/lib/python2.6/plat-mac/aetools.py",
      "start": 8970129,
      "end": 8981716
    }, {
      "filename": "/python/lib/python2.6/plat-mac/aetypes.py",
      "start": 8981716,
      "end": 8996727
    }, {
      "filename": "/python/lib/python2.6/plat-mac/applesingle.py",
      "start": 8996727,
      "end": 9001518
    }, {
      "filename": "/python/lib/python2.6/plat-mac/appletrawmain.py",
      "start": 9001518,
      "end": 9003523
    }, {
      "filename": "/python/lib/python2.6/plat-mac/appletrunner.py",
      "start": 9003523,
      "end": 9004257
    }, {
      "filename": "/python/lib/python2.6/plat-mac/argvemulator.py",
      "start": 9004257,
      "end": 9007318
    }, {
      "filename": "/python/lib/python2.6/plat-mac/bgenlocations.py",
      "start": 9007318,
      "end": 9009408
    }, {
      "filename": "/python/lib/python2.6/plat-mac/buildtools.py",
      "start": 9009408,
      "end": 9023370
    }, {
      "filename": "/python/lib/python2.6/plat-mac/bundlebuilder.py",
      "start": 9023370,
      "end": 9056838
    }, {
      "filename": "/python/lib/python2.6/plat-mac/cfmfile.py",
      "start": 9056838,
      "end": 9062559
    }, {
      "filename": "/python/lib/python2.6/plat-mac/dialogs.rsrc",
      "start": 9062559,
      "end": 9080692
    }, {
      "filename": "/python/lib/python2.6/plat-mac/errors.rsrc",
      "start": 9080692,
      "end": 9167560
    }, {
      "filename": "/python/lib/python2.6/plat-mac/findertools.py",
      "start": 9167560,
      "end": 9198012
    }, {
      "filename": "/python/lib/python2.6/plat-mac/gensuitemodule.py",
      "start": 9198012,
      "end": 9242518
    }, {
      "filename": "/python/lib/python2.6/plat-mac/ic.py",
      "start": 9242518,
      "end": 9250420
    }, {
      "filename": "/python/lib/python2.6/plat-mac/icopen.py",
      "start": 9250420,
      "end": 9252488
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/CodeWarrior/CodeWarrior_suite.py",
      "start": 9252488,
      "end": 9275682
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/CodeWarrior/Metrowerks_Shell_Suite.py",
      "start": 9275682,
      "end": 9362752
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/CodeWarrior/Required.py",
      "start": 9362752,
      "end": 9364416
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/CodeWarrior/Standard_Suite.py",
      "start": 9364416,
      "end": 9376755
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/CodeWarrior/__init__.py",
      "start": 9376755,
      "end": 9382254
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/Microsoft_Internet_Explorer.py",
      "start": 9382254,
      "end": 9385394
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/Netscape_Suite.py",
      "start": 9385394,
      "end": 9386568
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/Required_Suite.py",
      "start": 9386568,
      "end": 9389895
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/Standard_Suite.py",
      "start": 9389895,
      "end": 9391599
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/URL_Suite.py",
      "start": 9391599,
      "end": 9392867
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/Web_Browser_Suite.py",
      "start": 9392867,
      "end": 9401077
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Explorer/__init__.py",
      "start": 9401077,
      "end": 9403342
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Containers_and_folders.py",
      "start": 9403342,
      "end": 9412920
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Enumerations.py",
      "start": 9412920,
      "end": 9416411
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Files.py",
      "start": 9416411,
      "end": 9422850
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Finder_Basics.py",
      "start": 9422850,
      "end": 9429704
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Finder_items.py",
      "start": 9429704,
      "end": 9441786
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Legacy_suite.py",
      "start": 9441786,
      "end": 9449473
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Standard_Suite.py",
      "start": 9449473,
      "end": 9461896
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Type_Definitions.py",
      "start": 9461896,
      "end": 9474214
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/Window_classes.py",
      "start": 9474214,
      "end": 9481001
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Finder/__init__.py",
      "start": 9481001,
      "end": 9489728
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/Mozilla_suite.py",
      "start": 9489728,
      "end": 9499789
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/PowerPlant.py",
      "start": 9499789,
      "end": 9502379
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/Required_suite.py",
      "start": 9502379,
      "end": 9505801
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/Standard_Suite.py",
      "start": 9505801,
      "end": 9513586
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/Standard_URL_suite.py",
      "start": 9513586,
      "end": 9515113
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/Text.py",
      "start": 9515113,
      "end": 9518233
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/WorldWideWeb_suite.py",
      "start": 9518233,
      "end": 9534339
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Netscape/__init__.py",
      "start": 9534339,
      "end": 9537502
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/AppleScript_Suite.py",
      "start": 9537502,
      "end": 9598458
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Macintosh_Connectivity_Clas.py",
      "start": 9598458,
      "end": 9609301
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/QuickDraw_Graphics_Suite.py",
      "start": 9609301,
      "end": 9621039
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/QuickDraw_Graphics_Suppleme.py",
      "start": 9621039,
      "end": 9622725
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Required_Suite.py",
      "start": 9622725,
      "end": 9623245
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Standard_Suite.py",
      "start": 9623245,
      "end": 9648290
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Table_Suite.py",
      "start": 9648290,
      "end": 9650326
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Text_Suite.py",
      "start": 9650326,
      "end": 9656271
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/Type_Names_Suite.py",
      "start": 9656271,
      "end": 9665762
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/StdSuites/__init__.py",
      "start": 9665762,
      "end": 9678616
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Disk_Folder_File_Suite.py",
      "start": 9678616,
      "end": 9691442
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Folder_Actions_Suite.py",
      "start": 9691442,
      "end": 9701630
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Hidden_Suite.py",
      "start": 9701630,
      "end": 9702883
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Login_Items_Suite.py",
      "start": 9702883,
      "end": 9704616
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Power_Suite.py",
      "start": 9704616,
      "end": 9709808
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Processes_Suite.py",
      "start": 9709808,
      "end": 9717428
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Standard_Suite.py",
      "start": 9717428,
      "end": 9736153
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/System_Events_Suite.py",
      "start": 9736153,
      "end": 9739923
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/Text_Suite.py",
      "start": 9739923,
      "end": 9745682
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/SystemEvents/__init__.py",
      "start": 9745682,
      "end": 9749619
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Terminal/Standard_Suite.py",
      "start": 9749619,
      "end": 9768334
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Terminal/Terminal_Suite.py",
      "start": 9768334,
      "end": 9777174
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Terminal/Text_Suite.py",
      "start": 9777174,
      "end": 9782923
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/Terminal/__init__.py",
      "start": 9782923,
      "end": 9785148
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/_builtinSuites/__init__.py",
      "start": 9785148,
      "end": 9785930
    }, {
      "filename": "/python/lib/python2.6/plat-mac/lib-scriptpackages/_builtinSuites/builtin_Suite.py",
      "start": 9785930,
      "end": 9790531
    }, {
      "filename": "/python/lib/python2.6/plat-mac/macerrors.py",
      "start": 9790531,
      "end": 9907192
    }, {
      "filename": "/python/lib/python2.6/plat-mac/macostools.py",
      "start": 9907192,
      "end": 9911229
    }, {
      "filename": "/python/lib/python2.6/plat-mac/macresource.py",
      "start": 9911229,
      "end": 9916387
    }, {
      "filename": "/python/lib/python2.6/plat-mac/pimp.py",
      "start": 9916387,
      "end": 9959800
    }, {
      "filename": "/python/lib/python2.6/plat-mac/terminalcommand.py",
      "start": 9959800,
      "end": 9961347
    }, {
      "filename": "/python/lib/python2.6/plat-mac/videoreader.py",
      "start": 9961347,
      "end": 9971773
    }, {
      "filename": "/python/lib/python2.6/plat-netbsd1/IN.py",
      "start": 9971773,
      "end": 9972940
    }, {
      "filename": "/python/lib/python2.6/plat-netbsd1/regen",
      "start": 9972940,
      "end": 9973033
    }, {
      "filename": "/python/lib/python2.6/plat-next3/regen",
      "start": 9973033,
      "end": 9973234
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/IN.py",
      "start": 9973234,
      "end": 9975109
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/SOCKET.py",
      "start": 9975109,
      "end": 9976913
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/_emx_link.py",
      "start": 9976913,
      "end": 9979412
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/grp.py",
      "start": 9979412,
      "end": 9984703
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/pwd.py",
      "start": 9984703,
      "end": 9991118
    }, {
      "filename": "/python/lib/python2.6/plat-os2emx/regen",
      "start": 9991118,
      "end": 9991446
    }, {
      "filename": "/python/lib/python2.6/plat-riscos/riscosenviron.py",
      "start": 9991446,
      "end": 9992818
    }, {
      "filename": "/python/lib/python2.6/plat-riscos/riscospath.py",
      "start": 9992818,
      "end": 10002814
    }, {
      "filename": "/python/lib/python2.6/plat-riscos/rourl2path.py",
      "start": 10002814,
      "end": 10005309
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/CDIO.py",
      "start": 10005309,
      "end": 10007181
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/DLFCN.py",
      "start": 10007181,
      "end": 10007803
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/IN.py",
      "start": 10007803,
      "end": 10035954
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/STROPTS.py",
      "start": 10035954,
      "end": 10072319
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/SUNAUDIODEV.py",
      "start": 10072319,
      "end": 10073897
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/TYPES.py",
      "start": 10073897,
      "end": 10079703
    }, {
      "filename": "/python/lib/python2.6/plat-sunos5/regen",
      "start": 10079703,
      "end": 10079939
    }, {
      "filename": "/python/lib/python2.6/plat-unixware7/IN.py",
      "start": 10079939,
      "end": 10096157
    }, {
      "filename": "/python/lib/python2.6/plat-unixware7/STROPTS.py",
      "start": 10096157,
      "end": 10102621
    }, {
      "filename": "/python/lib/python2.6/plat-unixware7/regen",
      "start": 10102621,
      "end": 10102812
    }, {
      "filename": "/python/lib/python2.6/platform.py",
      "start": 10102812,
      "end": 10154220
    }, {
      "filename": "/python/lib/python2.6/plistlib.py",
      "start": 10154220,
      "end": 10169340
    }, {
      "filename": "/python/lib/python2.6/popen2.py",
      "start": 10169340,
      "end": 10177756
    }, {
      "filename": "/python/lib/python2.6/poplib.py",
      "start": 10177756,
      "end": 10190144
    }, {
      "filename": "/python/lib/python2.6/posixfile.py",
      "start": 10190144,
      "end": 10198147
    }, {
      "filename": "/python/lib/python2.6/posixpath.py",
      "start": 10198147,
      "end": 10210913
    }, {
      "filename": "/python/lib/python2.6/pprint.py",
      "start": 10210913,
      "end": 10222580
    }, {
      "filename": "/python/lib/python2.6/profile.py",
      "start": 10222580,
      "end": 10246087
    }, {
      "filename": "/python/lib/python2.6/pstats.py",
      "start": 10246087,
      "end": 10272365
    }, {
      "filename": "/python/lib/python2.6/pty.py",
      "start": 10272365,
      "end": 10277234
    }, {
      "filename": "/python/lib/python2.6/py_compile.py",
      "start": 10277234,
      "end": 10282867
    }, {
      "filename": "/python/lib/python2.6/pyclbr.py",
      "start": 10282867,
      "end": 10296149
    }, {
      "filename": "/python/lib/python2.6/pydoc.py",
      "start": 10296149,
      "end": 10388366
    }, {
      "filename": "/python/lib/python2.6/pydoc_topics.py",
      "start": 10388366,
      "end": 10798702
    }, {
      "filename": "/python/lib/python2.6/quopri.py",
      "start": 10798702,
      "end": 10805671
    }, {
      "filename": "/python/lib/python2.6/random.py",
      "start": 10805671,
      "end": 10837609
    }, {
      "filename": "/python/lib/python2.6/re.py",
      "start": 10837609,
      "end": 10850575
    }, {
      "filename": "/python/lib/python2.6/repr.py",
      "start": 10850575,
      "end": 10854871
    }, {
      "filename": "/python/lib/python2.6/rexec.py",
      "start": 10854871,
      "end": 10875023
    }, {
      "filename": "/python/lib/python2.6/rfc822.py",
      "start": 10875023,
      "end": 10908318
    }, {
      "filename": "/python/lib/python2.6/rlcompleter.py",
      "start": 10908318,
      "end": 10914184
    }, {
      "filename": "/python/lib/python2.6/robotparser.py",
      "start": 10914184,
      "end": 10921108
    }, {
      "filename": "/python/lib/python2.6/runpy.py",
      "start": 10921108,
      "end": 10926521
    }, {
      "filename": "/python/lib/python2.6/sched.py",
      "start": 10926521,
      "end": 10931614
    }, {
      "filename": "/python/lib/python2.6/sets.py",
      "start": 10931614,
      "end": 10951239
    }, {
      "filename": "/python/lib/python2.6/sgmllib.py",
      "start": 10951239,
      "end": 10969123
    }, {
      "filename": "/python/lib/python2.6/sha.py",
      "start": 10969123,
      "end": 10969568
    }, {
      "filename": "/python/lib/python2.6/shelve.py",
      "start": 10969568,
      "end": 10977434
    }, {
      "filename": "/python/lib/python2.6/shlex.py",
      "start": 10977434,
      "end": 10988571
    }, {
      "filename": "/python/lib/python2.6/shutil.py",
      "start": 10988571,
      "end": 10997165
    }, {
      "filename": "/python/lib/python2.6/site-packages/README",
      "start": 10997165,
      "end": 10997284
    }, {
      "filename": "/python/lib/python2.6/site.py",
      "start": 10997284,
      "end": 11015784
    }, {
      "filename": "/python/lib/python2.6/smtpd.py",
      "start": 11015784,
      "end": 11033834
    }, {
      "filename": "/python/lib/python2.6/smtplib.py",
      "start": 11033834,
      "end": 11064189
    }, {
      "filename": "/python/lib/python2.6/sndhdr.py",
      "start": 11064189,
      "end": 11070160
    }, {
      "filename": "/python/lib/python2.6/socket.py",
      "start": 11070160,
      "end": 11088155
    }, {
      "filename": "/python/lib/python2.6/sqlite3/__init__.py",
      "start": 11088155,
      "end": 11089192
    }, {
      "filename": "/python/lib/python2.6/sqlite3/dbapi2.py",
      "start": 11089192,
      "end": 11091807
    }, {
      "filename": "/python/lib/python2.6/sqlite3/dump.py",
      "start": 11091807,
      "end": 11094157
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/__init__.py",
      "start": 11094157,
      "end": 11094157
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/dbapi.py",
      "start": 11094157,
      "end": 11120994
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/dump.py",
      "start": 11120994,
      "end": 11122733
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/factory.py",
      "start": 11122733,
      "end": 11130661
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/hooks.py",
      "start": 11130661,
      "end": 11137233
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/py25tests.py",
      "start": 11137233,
      "end": 11139981
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/regression.py",
      "start": 11139981,
      "end": 11146637
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/transactions.py",
      "start": 11146637,
      "end": 11153335
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/types.py",
      "start": 11153335,
      "end": 11167308
    }, {
      "filename": "/python/lib/python2.6/sqlite3/test/userfunctions.py",
      "start": 11167308,
      "end": 11180616
    }, {
      "filename": "/python/lib/python2.6/sre.py",
      "start": 11180616,
      "end": 11181e3
    }, {
      "filename": "/python/lib/python2.6/sre_compile.py",
      "start": 11181e3,
      "end": 11197507
    }, {
      "filename": "/python/lib/python2.6/sre_constants.py",
      "start": 11197507,
      "end": 11204644
    }, {
      "filename": "/python/lib/python2.6/sre_parse.py",
      "start": 11204644,
      "end": 11231522
    }, {
      "filename": "/python/lib/python2.6/ssl.py",
      "start": 11231522,
      "end": 11246949
    }, {
      "filename": "/python/lib/python2.6/stat.py",
      "start": 11246949,
      "end": 11248667
    }, {
      "filename": "/python/lib/python2.6/statvfs.py",
      "start": 11248667,
      "end": 11249565
    }, {
      "filename": "/python/lib/python2.6/string.py",
      "start": 11249565,
      "end": 11270160
    }, {
      "filename": "/python/lib/python2.6/stringold.py",
      "start": 11270160,
      "end": 11282609
    }, {
      "filename": "/python/lib/python2.6/stringprep.py",
      "start": 11282609,
      "end": 11296131
    }, {
      "filename": "/python/lib/python2.6/struct.py",
      "start": 11296131,
      "end": 11296185
    }, {
      "filename": "/python/lib/python2.6/subprocess.py",
      "start": 11296185,
      "end": 11341013
    }, {
      "filename": "/python/lib/python2.6/sunau.py",
      "start": 11341013,
      "end": 11357528
    }, {
      "filename": "/python/lib/python2.6/sunaudio.py",
      "start": 11357528,
      "end": 11358927
    }, {
      "filename": "/python/lib/python2.6/symbol.py",
      "start": 11358927,
      "end": 11360974
    }, {
      "filename": "/python/lib/python2.6/symtable.py",
      "start": 11360974,
      "end": 11368885
    }, {
      "filename": "/python/lib/python2.6/tabnanny.py",
      "start": 11368885,
      "end": 11380221
    }, {
      "filename": "/python/lib/python2.6/tarfile.py",
      "start": 11380221,
      "end": 11466835
    }, {
      "filename": "/python/lib/python2.6/telnetlib.py",
      "start": 11466835,
      "end": 11488643
    }, {
      "filename": "/python/lib/python2.6/tempfile.py",
      "start": 11488643,
      "end": 11506417
    }, {
      "filename": "/python/lib/python2.6/test/185test.db",
      "start": 11506417,
      "end": 11522801
    }, {
      "filename": "/python/lib/python2.6/test/README",
      "start": 11522801,
      "end": 11540979
    }, {
      "filename": "/python/lib/python2.6/test/__init__.py",
      "start": 11540979,
      "end": 11541026
    }, {
      "filename": "/python/lib/python2.6/test/audiotest.au",
      "start": 11541026,
      "end": 11564519
    }, {
      "filename": "/python/lib/python2.6/test/autotest.py",
      "start": 11564519,
      "end": 11564730
    }, {
      "filename": "/python/lib/python2.6/test/bad_coding.py",
      "start": 11564730,
      "end": 11564754
    }, {
      "filename": "/python/lib/python2.6/test/bad_coding2.py",
      "start": 11564754,
      "end": 11564783
    }, {
      "filename": "/python/lib/python2.6/test/badcert.pem",
      "start": 11564783,
      "end": 11566711
    }, {
      "filename": "/python/lib/python2.6/test/badkey.pem",
      "start": 11566711,
      "end": 11568873
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future3.py",
      "start": 11568873,
      "end": 11569045
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future4.py",
      "start": 11569045,
      "end": 11569198
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future5.py",
      "start": 11569198,
      "end": 11569382
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future6.py",
      "start": 11569382,
      "end": 11569543
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future7.py",
      "start": 11569543,
      "end": 11569739
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future8.py",
      "start": 11569739,
      "end": 11569860
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_future9.py",
      "start": 11569860,
      "end": 11570001
    }, {
      "filename": "/python/lib/python2.6/test/badsyntax_nocaret.py",
      "start": 11570001,
      "end": 11570034
    }, {
      "filename": "/python/lib/python2.6/test/buffer_tests.py",
      "start": 11570034,
      "end": 11580538
    }, {
      "filename": "/python/lib/python2.6/test/cfgparser.1",
      "start": 11580538,
      "end": 11580559
    }, {
      "filename": "/python/lib/python2.6/test/check_soundcard.vbs",
      "start": 11580559,
      "end": 11580970
    }, {
      "filename": "/python/lib/python2.6/test/cjkencodings_test.py",
      "start": 11580970,
      "end": 11647844
    }, {
      "filename": "/python/lib/python2.6/test/cmath_testcases.txt",
      "start": 11647844,
      "end": 11784139
    }, {
      "filename": "/python/lib/python2.6/test/crashers/README",
      "start": 11784139,
      "end": 11784942
    }, {
      "filename": "/python/lib/python2.6/test/crashers/bogus_code_obj.py",
      "start": 11784942,
      "end": 11785561
    }, {
      "filename": "/python/lib/python2.6/test/crashers/bogus_sre_bytecode.py",
      "start": 11785561,
      "end": 11786968
    }, {
      "filename": "/python/lib/python2.6/test/crashers/borrowed_ref_1.py",
      "start": 11786968,
      "end": 11787366
    }, {
      "filename": "/python/lib/python2.6/test/crashers/borrowed_ref_2.py",
      "start": 11787366,
      "end": 11788010
    }, {
      "filename": "/python/lib/python2.6/test/crashers/gc_inspection.py",
      "start": 11788010,
      "end": 11789100
    }, {
      "filename": "/python/lib/python2.6/test/crashers/infinite_loop_re.py",
      "start": 11789100,
      "end": 11789745
    }, {
      "filename": "/python/lib/python2.6/test/crashers/iter.py",
      "start": 11789745,
      "end": 11790662
    }, {
      "filename": "/python/lib/python2.6/test/crashers/loosing_mro_ref.py",
      "start": 11790662,
      "end": 11791741
    }, {
      "filename": "/python/lib/python2.6/test/crashers/multithreaded_close.py",
      "start": 11791741,
      "end": 11792186
    }, {
      "filename": "/python/lib/python2.6/test/crashers/mutation_inside_cyclegc.py",
      "start": 11792186,
      "end": 11792939
    }, {
      "filename": "/python/lib/python2.6/test/crashers/nasty_eq_vs_dict.py",
      "start": 11792939,
      "end": 11793985
    }, {
      "filename": "/python/lib/python2.6/test/crashers/recursion_limit_too_high.py",
      "start": 11793985,
      "end": 11794764
    }, {
      "filename": "/python/lib/python2.6/test/crashers/recursive_call.py",
      "start": 11794764,
      "end": 11795121
    }, {
      "filename": "/python/lib/python2.6/test/curses_tests.py",
      "start": 11795121,
      "end": 11796362
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/abs.decTest",
      "start": 11796362,
      "end": 11802651
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/add.decTest",
      "start": 11802651,
      "end": 11942989
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/and.decTest",
      "start": 11942989,
      "end": 11959353
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/base.decTest",
      "start": 11959353,
      "end": 12020708
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/clamp.decTest",
      "start": 12020708,
      "end": 12031717
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/class.decTest",
      "start": 12031717,
      "end": 12038093
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/compare.decTest",
      "start": 12038093,
      "end": 12067720
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/comparetotal.decTest",
      "start": 12067720,
      "end": 12102143
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/comparetotmag.decTest",
      "start": 12102143,
      "end": 12138272
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/copy.decTest",
      "start": 12138272,
      "end": 12141648
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/copyabs.decTest",
      "start": 12141648,
      "end": 12145132
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/copynegate.decTest",
      "start": 12145132,
      "end": 12148805
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/copysign.decTest",
      "start": 12148805,
      "end": 12156183
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddAbs.decTest",
      "start": 12156183,
      "end": 12161084
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddAdd.decTest",
      "start": 12161084,
      "end": 12239179
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddAnd.decTest",
      "start": 12239179,
      "end": 12257798
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddBase.decTest",
      "start": 12257798,
      "end": 12312255
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCanonical.decTest",
      "start": 12312255,
      "end": 12331163
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddClass.decTest",
      "start": 12331163,
      "end": 12335070
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCompare.decTest",
      "start": 12335070,
      "end": 12365352
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCompareSig.decTest",
      "start": 12365352,
      "end": 12393760
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCompareTotal.decTest",
      "start": 12393760,
      "end": 12424398
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCompareTotalMag.decTest",
      "start": 12424398,
      "end": 12456816
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCopy.decTest",
      "start": 12456816,
      "end": 12460437
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCopyAbs.decTest",
      "start": 12460437,
      "end": 12464166
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCopyNegate.decTest",
      "start": 12464166,
      "end": 12468048
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddCopySign.decTest",
      "start": 12468048,
      "end": 12475680
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddDivide.decTest",
      "start": 12475680,
      "end": 12523229
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddDivideInt.decTest",
      "start": 12523229,
      "end": 12542813
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddEncode.decTest",
      "start": 12542813,
      "end": 12567501
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddFMA.decTest",
      "start": 12567501,
      "end": 12669681
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddInvert.decTest",
      "start": 12669681,
      "end": 12680042
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddLogB.decTest",
      "start": 12680042,
      "end": 12686282
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMax.decTest",
      "start": 12686282,
      "end": 12698596
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMaxMag.decTest",
      "start": 12698596,
      "end": 12711339
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMin.decTest",
      "start": 12711339,
      "end": 12723308
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMinMag.decTest",
      "start": 12723308,
      "end": 12734933
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMinus.decTest",
      "start": 12734933,
      "end": 12738723
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddMultiply.decTest",
      "start": 12738723,
      "end": 12768027
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddNextMinus.decTest",
      "start": 12768027,
      "end": 12774854
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddNextPlus.decTest",
      "start": 12774854,
      "end": 12781577
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddNextToward.decTest",
      "start": 12781577,
      "end": 12806567
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddOr.decTest",
      "start": 12806567,
      "end": 12822590
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddPlus.decTest",
      "start": 12822590,
      "end": 12826336
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddQuantize.decTest",
      "start": 12826336,
      "end": 12868829
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddReduce.decTest",
      "start": 12868829,
      "end": 12876289
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddRemainder.decTest",
      "start": 12876289,
      "end": 12903276
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddRemainderNear.decTest",
      "start": 12903276,
      "end": 12933535
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddRotate.decTest",
      "start": 12933535,
      "end": 12947617
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddSameQuantum.decTest",
      "start": 12947617,
      "end": 12965158
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddScaleB.decTest",
      "start": 12965158,
      "end": 12977945
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddShift.decTest",
      "start": 12977945,
      "end": 12991356
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddSubtract.decTest",
      "start": 12991356,
      "end": 13026754
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddToIntegral.decTest",
      "start": 13026754,
      "end": 13038946
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ddXor.decTest",
      "start": 13038946,
      "end": 13056648
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/decDouble.decTest",
      "start": 13056648,
      "end": 13058857
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/decQuad.decTest",
      "start": 13058857,
      "end": 13061064
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/decSingle.decTest",
      "start": 13061064,
      "end": 13062520
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/divide.decTest",
      "start": 13062520,
      "end": 13100324
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/divideint.decTest",
      "start": 13100324,
      "end": 13120760
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqAbs.decTest",
      "start": 13120760,
      "end": 13126035
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqAdd.decTest",
      "start": 13126035,
      "end": 13215232
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqAnd.decTest",
      "start": 13215232,
      "end": 13244355
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqBase.decTest",
      "start": 13244355,
      "end": 13303310
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCanonical.decTest",
      "start": 13303310,
      "end": 13330629
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqClass.decTest",
      "start": 13330629,
      "end": 13334649
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCompare.decTest",
      "start": 13334649,
      "end": 13367771
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCompareSig.decTest",
      "start": 13367771,
      "end": 13397466
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCompareTotal.decTest",
      "start": 13397466,
      "end": 13428312
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCompareTotalMag.decTest",
      "start": 13428312,
      "end": 13460938
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCopy.decTest",
      "start": 13460938,
      "end": 13464925
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCopyAbs.decTest",
      "start": 13464925,
      "end": 13469026
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCopyNegate.decTest",
      "start": 13469026,
      "end": 13473274
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqCopySign.decTest",
      "start": 13473274,
      "end": 13481502
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqDivide.decTest",
      "start": 13481502,
      "end": 13536604
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqDivideInt.decTest",
      "start": 13536604,
      "end": 13556430
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqEncode.decTest",
      "start": 13556430,
      "end": 13587860
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqFMA.decTest",
      "start": 13587860,
      "end": 13717850
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqInvert.decTest",
      "start": 13717850,
      "end": 13733974
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqLogB.decTest",
      "start": 13733974,
      "end": 13740354
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMax.decTest",
      "start": 13740354,
      "end": 13752703
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMaxMag.decTest",
      "start": 13752703,
      "end": 13765492
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMin.decTest",
      "start": 13765492,
      "end": 13777496
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMinMag.decTest",
      "start": 13777496,
      "end": 13789145
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMinus.decTest",
      "start": 13789145,
      "end": 13793301
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqMultiply.decTest",
      "start": 13793301,
      "end": 13825794
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqNextMinus.decTest",
      "start": 13825794,
      "end": 13834445
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqNextPlus.decTest",
      "start": 13834445,
      "end": 13842972
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqNextToward.decTest",
      "start": 13842972,
      "end": 13872698
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqOr.decTest",
      "start": 13872698,
      "end": 13903315
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqPlus.decTest",
      "start": 13903315,
      "end": 13907427
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqQuantize.decTest",
      "start": 13907427,
      "end": 13950650
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqReduce.decTest",
      "start": 13950650,
      "end": 13958470
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqRemainder.decTest",
      "start": 13958470,
      "end": 13986033
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqRemainderNear.decTest",
      "start": 13986033,
      "end": 14017322
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqRotate.decTest",
      "start": 14017322,
      "end": 14038302
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqSameQuantum.decTest",
      "start": 14038302,
      "end": 14056447
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqScaleB.decTest",
      "start": 14056447,
      "end": 14072506
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqShift.decTest",
      "start": 14072506,
      "end": 14091942
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqSubtract.decTest",
      "start": 14091942,
      "end": 14133870
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqToIntegral.decTest",
      "start": 14133870,
      "end": 14146094
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dqXor.decTest",
      "start": 14146094,
      "end": 14174357
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dsBase.decTest",
      "start": 14174357,
      "end": 14223923
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/dsEncode.decTest",
      "start": 14223923,
      "end": 14239809
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/exp.decTest",
      "start": 14239809,
      "end": 14279249
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/extra.decTest",
      "start": 14279249,
      "end": 14367419
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/fma.decTest",
      "start": 14367419,
      "end": 14562744
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/inexact.decTest",
      "start": 14562744,
      "end": 14573236
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/invert.decTest",
      "start": 14573236,
      "end": 14581522
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/ln.decTest",
      "start": 14581522,
      "end": 14617047
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/log10.decTest",
      "start": 14617047,
      "end": 14649743
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/logb.decTest",
      "start": 14649743,
      "end": 14655973
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/max.decTest",
      "start": 14655973,
      "end": 14671945
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/maxmag.decTest",
      "start": 14671945,
      "end": 14689297
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/min.decTest",
      "start": 14689297,
      "end": 14704987
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/minmag.decTest",
      "start": 14704987,
      "end": 14720425
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/minus.decTest",
      "start": 14720425,
      "end": 14727850
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/multiply.decTest",
      "start": 14727850,
      "end": 14766163
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/nextminus.decTest",
      "start": 14766163,
      "end": 14773105
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/nextplus.decTest",
      "start": 14773105,
      "end": 14780028
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/nexttoward.decTest",
      "start": 14780028,
      "end": 14805252
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/or.decTest",
      "start": 14805252,
      "end": 14821109
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/plus.decTest",
      "start": 14821109,
      "end": 14828991
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/power.decTest",
      "start": 14828991,
      "end": 14923972
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/powersqrt.decTest",
      "start": 14923972,
      "end": 15082627
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/quantize.decTest",
      "start": 15082627,
      "end": 15129909
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/randomBound32.decTest",
      "start": 15129909,
      "end": 15434415
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/randoms.decTest",
      "start": 15434415,
      "end": 15725488
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/reduce.decTest",
      "start": 15725488,
      "end": 15734807
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/remainder.decTest",
      "start": 15734807,
      "end": 15761931
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/remainderNear.decTest",
      "start": 15761931,
      "end": 15786949
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/rescale.decTest",
      "start": 15786949,
      "end": 15822206
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/rotate.decTest",
      "start": 15822206,
      "end": 15834094
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/rounding.decTest",
      "start": 15834094,
      "end": 15897866
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/samequantum.decTest",
      "start": 15897866,
      "end": 15914068
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/scaleb.decTest",
      "start": 15914068,
      "end": 15923698
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/shift.decTest",
      "start": 15923698,
      "end": 15935370
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/squareroot.decTest",
      "start": 15935370,
      "end": 16127554
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/subtract.decTest",
      "start": 16127554,
      "end": 16171859
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/testall.decTest",
      "start": 16171859,
      "end": 16174590
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/tointegral.decTest",
      "start": 16174590,
      "end": 16183454
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/tointegralx.decTest",
      "start": 16183454,
      "end": 16195314
    }, {
      "filename": "/python/lib/python2.6/test/decimaltestdata/xor.decTest",
      "start": 16195314,
      "end": 16211643
    }, {
      "filename": "/python/lib/python2.6/test/doctest_aliases.py",
      "start": 16211643,
      "end": 16211886
    }, {
      "filename": "/python/lib/python2.6/test/double_const.py",
      "start": 16211886,
      "end": 16213103
    }, {
      "filename": "/python/lib/python2.6/test/empty.vbs",
      "start": 16213103,
      "end": 16213173
    }, {
      "filename": "/python/lib/python2.6/test/exception_hierarchy.txt",
      "start": 16213173,
      "end": 16214657
    }, {
      "filename": "/python/lib/python2.6/test/floating_points.txt",
      "start": 16214657,
      "end": 16230680
    }, {
      "filename": "/python/lib/python2.6/test/fork_wait.py",
      "start": 16230680,
      "end": 16232895
    }, {
      "filename": "/python/lib/python2.6/test/greyrgb.uue",
      "start": 16232895,
      "end": 16328636
    }, {
      "filename": "/python/lib/python2.6/test/https_svn_python_org_root.pem",
      "start": 16328636,
      "end": 16330241
    }, {
      "filename": "/python/lib/python2.6/test/ieee754.txt",
      "start": 16330241,
      "end": 16333514
    }, {
      "filename": "/python/lib/python2.6/test/infinite_reload.py",
      "start": 16333514,
      "end": 16333823
    }, {
      "filename": "/python/lib/python2.6/test/inspect_fodder.py",
      "start": 16333823,
      "end": 16334663
    }, {
      "filename": "/python/lib/python2.6/test/inspect_fodder2.py",
      "start": 16334663,
      "end": 16335942
    }, {
      "filename": "/python/lib/python2.6/test/keycert.pem",
      "start": 16335942,
      "end": 16337814
    }, {
      "filename": "/python/lib/python2.6/test/leakers/README.txt",
      "start": 16337814,
      "end": 16338904
    }, {
      "filename": "/python/lib/python2.6/test/leakers/__init__.py",
      "start": 16338904,
      "end": 16338904
    }, {
      "filename": "/python/lib/python2.6/test/leakers/test_ctypes.py",
      "start": 16338904,
      "end": 16339311
    }, {
      "filename": "/python/lib/python2.6/test/leakers/test_gestalt.py",
      "start": 16339311,
      "end": 16339586
    }, {
      "filename": "/python/lib/python2.6/test/leakers/test_selftype.py",
      "start": 16339586,
      "end": 16339879
    }, {
      "filename": "/python/lib/python2.6/test/list_tests.py",
      "start": 16339879,
      "end": 16356158
    }, {
      "filename": "/python/lib/python2.6/test/mapping_tests.py",
      "start": 16356158,
      "end": 16378553
    }, {
      "filename": "/python/lib/python2.6/test/nullcert.pem",
      "start": 16378553,
      "end": 16378553
    }, {
      "filename": "/python/lib/python2.6/test/outstanding_bugs.py",
      "start": 16378553,
      "end": 16378984
    }, {
      "filename": "/python/lib/python2.6/test/pickletester.py",
      "start": 16378984,
      "end": 16411488
    }, {
      "filename": "/python/lib/python2.6/test/profilee.py",
      "start": 16411488,
      "end": 16414529
    }, {
      "filename": "/python/lib/python2.6/test/pyclbr_input.py",
      "start": 16414529,
      "end": 16415177
    }, {
      "filename": "/python/lib/python2.6/test/pydoc_mod.py",
      "start": 16415177,
      "end": 16415616
    }, {
      "filename": "/python/lib/python2.6/test/pydocfodder.py",
      "start": 16415616,
      "end": 16421945
    }, {
      "filename": "/python/lib/python2.6/test/pystone.py",
      "start": 16421945,
      "end": 16429312
    }, {
      "filename": "/python/lib/python2.6/test/randv2_32.pck",
      "start": 16429312,
      "end": 16436829
    }, {
      "filename": "/python/lib/python2.6/test/randv2_64.pck",
      "start": 16436829,
      "end": 16444194
    }, {
      "filename": "/python/lib/python2.6/test/randv3.pck",
      "start": 16444194,
      "end": 16452198
    }, {
      "filename": "/python/lib/python2.6/test/re_tests.py",
      "start": 16452198,
      "end": 16484054
    }, {
      "filename": "/python/lib/python2.6/test/regex_tests.py",
      "start": 16484054,
      "end": 16493135
    }, {
      "filename": "/python/lib/python2.6/test/regrtest.py",
      "start": 16493135,
      "end": 16530921
    }, {
      "filename": "/python/lib/python2.6/test/relimport.py",
      "start": 16530921,
      "end": 16530948
    }, {
      "filename": "/python/lib/python2.6/test/reperf.py",
      "start": 16530948,
      "end": 16531462
    }, {
      "filename": "/python/lib/python2.6/test/sample_doctest.py",
      "start": 16531462,
      "end": 16532499
    }, {
      "filename": "/python/lib/python2.6/test/seq_tests.py",
      "start": 16532499,
      "end": 16546161
    }, {
      "filename": "/python/lib/python2.6/test/sgml_input.html",
      "start": 16546161,
      "end": 16554455
    }, {
      "filename": "/python/lib/python2.6/test/sortperf.py",
      "start": 16554455,
      "end": 16559201
    }, {
      "filename": "/python/lib/python2.6/test/ssl_cert.pem",
      "start": 16559201,
      "end": 16560015
    }, {
      "filename": "/python/lib/python2.6/test/ssl_key.pem",
      "start": 16560015,
      "end": 16560512
    }, {
      "filename": "/python/lib/python2.6/test/string_tests.py",
      "start": 16560512,
      "end": 16620154
    }, {
      "filename": "/python/lib/python2.6/test/svn_python_org_https_cert.pem",
      "start": 16620154,
      "end": 16622037
    }, {
      "filename": "/python/lib/python2.6/test/test.xml",
      "start": 16622037,
      "end": 16623402
    }, {
      "filename": "/python/lib/python2.6/test/test.xml.out",
      "start": 16623402,
      "end": 16624788
    }, {
      "filename": "/python/lib/python2.6/test/test_MimeWriter.py",
      "start": 16624788,
      "end": 16632457
    }, {
      "filename": "/python/lib/python2.6/test/test_SimpleHTTPServer.py",
      "start": 16632457,
      "end": 16633807
    }, {
      "filename": "/python/lib/python2.6/test/test_StringIO.py",
      "start": 16633807,
      "end": 16638091
    }, {
      "filename": "/python/lib/python2.6/test/test___all__.py",
      "start": 16638091,
      "end": 16644176
    }, {
      "filename": "/python/lib/python2.6/test/test___future__.py",
      "start": 16644176,
      "end": 16646589
    }, {
      "filename": "/python/lib/python2.6/test/test__locale.py",
      "start": 16646589,
      "end": 16652020
    }, {
      "filename": "/python/lib/python2.6/test/test_abc.py",
      "start": 16652020,
      "end": 16659288
    }, {
      "filename": "/python/lib/python2.6/test/test_abstract_numbers.py",
      "start": 16659288,
      "end": 16661006
    }, {
      "filename": "/python/lib/python2.6/test/test_aepack.py",
      "start": 16661006,
      "end": 16663401
    }, {
      "filename": "/python/lib/python2.6/test/test_al.py",
      "start": 16663401,
      "end": 16664176
    }, {
      "filename": "/python/lib/python2.6/test/test_anydbm.py",
      "start": 16664176,
      "end": 16666391
    }, {
      "filename": "/python/lib/python2.6/test/test_applesingle.py",
      "start": 16666391,
      "end": 16668162
    }, {
      "filename": "/python/lib/python2.6/test/test_array.py",
      "start": 16668162,
      "end": 16702787
    }, {
      "filename": "/python/lib/python2.6/test/test_ast.py",
      "start": 16702787,
      "end": 16716527
    }, {
      "filename": "/python/lib/python2.6/test/test_asynchat.py",
      "start": 16716527,
      "end": 16724753
    }, {
      "filename": "/python/lib/python2.6/test/test_asyncore.py",
      "start": 16724753,
      "end": 16737768
    }, {
      "filename": "/python/lib/python2.6/test/test_atexit.py",
      "start": 16737768,
      "end": 16739912
    }, {
      "filename": "/python/lib/python2.6/test/test_audioop.py",
      "start": 16739912,
      "end": 16745745
    }, {
      "filename": "/python/lib/python2.6/test/test_augassign.py",
      "start": 16745745,
      "end": 16753713
    }, {
      "filename": "/python/lib/python2.6/test/test_base64.py",
      "start": 16753713,
      "end": 16761908
    }, {
      "filename": "/python/lib/python2.6/test/test_bastion.py",
      "start": 16761908,
      "end": 16761946
    }, {
      "filename": "/python/lib/python2.6/test/test_bigaddrspace.py",
      "start": 16761946,
      "end": 16763250
    }, {
      "filename": "/python/lib/python2.6/test/test_bigmem.py",
      "start": 16763250,
      "end": 16801468
    }, {
      "filename": "/python/lib/python2.6/test/test_binascii.py",
      "start": 16801468,
      "end": 16807875
    }, {
      "filename": "/python/lib/python2.6/test/test_binhex.py",
      "start": 16807875,
      "end": 16808902
    }, {
      "filename": "/python/lib/python2.6/test/test_binop.py",
      "start": 16808902,
      "end": 16819585
    }, {
      "filename": "/python/lib/python2.6/test/test_bisect.py",
      "start": 16819585,
      "end": 16832628
    }, {
      "filename": "/python/lib/python2.6/test/test_bool.py",
      "start": 16832628,
      "end": 16845876
    }, {
      "filename": "/python/lib/python2.6/test/test_bsddb.py",
      "start": 16845876,
      "end": 16857394
    }, {
      "filename": "/python/lib/python2.6/test/test_bsddb185.py",
      "start": 16857394,
      "end": 16858652
    }, {
      "filename": "/python/lib/python2.6/test/test_bsddb3.py",
      "start": 16858652,
      "end": 16861309
    }, {
      "filename": "/python/lib/python2.6/test/test_buffer.py",
      "start": 16861309,
      "end": 16862098
    }, {
      "filename": "/python/lib/python2.6/test/test_bufio.py",
      "start": 16862098,
      "end": 16864533
    }, {
      "filename": "/python/lib/python2.6/test/test_builtin.py",
      "start": 16864533,
      "end": 16919358
    }, {
      "filename": "/python/lib/python2.6/test/test_bytes.py",
      "start": 16919358,
      "end": 16958852
    }, {
      "filename": "/python/lib/python2.6/test/test_bz2.py",
      "start": 16958852,
      "end": 16973971
    }, {
      "filename": "/python/lib/python2.6/test/test_calendar.py",
      "start": 16973971,
      "end": 16999601
    }, {
      "filename": "/python/lib/python2.6/test/test_call.py",
      "start": 16999601,
      "end": 17002725
    }, {
      "filename": "/python/lib/python2.6/test/test_capi.py",
      "start": 17002725,
      "end": 17004243
    }, {
      "filename": "/python/lib/python2.6/test/test_cd.py",
      "start": 17004243,
      "end": 17005146
    }, {
      "filename": "/python/lib/python2.6/test/test_cfgparser.py",
      "start": 17005146,
      "end": 17023766
    }, {
      "filename": "/python/lib/python2.6/test/test_cgi.py",
      "start": 17023766,
      "end": 17037504
    }, {
      "filename": "/python/lib/python2.6/test/test_charmapcodec.py",
      "start": 17037504,
      "end": 17039361
    }, {
      "filename": "/python/lib/python2.6/test/test_cl.py",
      "start": 17039361,
      "end": 17043333
    }, {
      "filename": "/python/lib/python2.6/test/test_class.py",
      "start": 17043333,
      "end": 17060855
    }, {
      "filename": "/python/lib/python2.6/test/test_cmath.py",
      "start": 17060855,
      "end": 17079629
    }, {
      "filename": "/python/lib/python2.6/test/test_cmd.py",
      "start": 17079629,
      "end": 17084210
    }, {
      "filename": "/python/lib/python2.6/test/test_cmd_line.py",
      "start": 17084210,
      "end": 17088009
    }, {
      "filename": "/python/lib/python2.6/test/test_cmd_line_script.py",
      "start": 17088009,
      "end": 17096439
    }, {
      "filename": "/python/lib/python2.6/test/test_code.py",
      "start": 17096439,
      "end": 17098395
    }, {
      "filename": "/python/lib/python2.6/test/test_codeccallbacks.py",
      "start": 17098395,
      "end": 17129539
    }, {
      "filename": "/python/lib/python2.6/test/test_codecencodings_cn.py",
      "start": 17129539,
      "end": 17131593
    }, {
      "filename": "/python/lib/python2.6/test/test_codecencodings_hk.py",
      "start": 17131593,
      "end": 17132401
    }, {
      "filename": "/python/lib/python2.6/test/test_codecencodings_jp.py",
      "start": 17132401,
      "end": 17136339
    }, {
      "filename": "/python/lib/python2.6/test/test_codecencodings_kr.py",
      "start": 17136339,
      "end": 17139089
    }, {
      "filename": "/python/lib/python2.6/test/test_codecencodings_tw.py",
      "start": 17139089,
      "end": 17139877
    }, {
      "filename": "/python/lib/python2.6/test/test_codecmaps_cn.py",
      "start": 17139877,
      "end": 17140859
    }, {
      "filename": "/python/lib/python2.6/test/test_codecmaps_hk.py",
      "start": 17140859,
      "end": 17141411
    }, {
      "filename": "/python/lib/python2.6/test/test_codecmaps_jp.py",
      "start": 17141411,
      "end": 17143401
    }, {
      "filename": "/python/lib/python2.6/test/test_codecmaps_kr.py",
      "start": 17143401,
      "end": 17144823
    }, {
      "filename": "/python/lib/python2.6/test/test_codecmaps_tw.py",
      "start": 17144823,
      "end": 17145680
    }, {
      "filename": "/python/lib/python2.6/test/test_codecs.py",
      "start": 17145680,
      "end": 17198047
    }, {
      "filename": "/python/lib/python2.6/test/test_codeop.py",
      "start": 17198047,
      "end": 17203347
    }, {
      "filename": "/python/lib/python2.6/test/test_coding.py",
      "start": 17203347,
      "end": 17204129
    }, {
      "filename": "/python/lib/python2.6/test/test_coercion.py",
      "start": 17204129,
      "end": 17215399
    }, {
      "filename": "/python/lib/python2.6/test/test_collections.py",
      "start": 17215399,
      "end": 17234204
    }, {
      "filename": "/python/lib/python2.6/test/test_colorsys.py",
      "start": 17234204,
      "end": 17237048
    }, {
      "filename": "/python/lib/python2.6/test/test_commands.py",
      "start": 17237048,
      "end": 17239378
    }, {
      "filename": "/python/lib/python2.6/test/test_compare.py",
      "start": 17239378,
      "end": 17240866
    }, {
      "filename": "/python/lib/python2.6/test/test_compile.py",
      "start": 17240866,
      "end": 17257790
    }, {
      "filename": "/python/lib/python2.6/test/test_compiler.py",
      "start": 17257790,
      "end": 17266479
    }, {
      "filename": "/python/lib/python2.6/test/test_complex.py",
      "start": 17266479,
      "end": 17281819
    }, {
      "filename": "/python/lib/python2.6/test/test_complex_args.py",
      "start": 17281819,
      "end": 17284563
    }, {
      "filename": "/python/lib/python2.6/test/test_contains.py",
      "start": 17284563,
      "end": 17287756
    }, {
      "filename": "/python/lib/python2.6/test/test_contextlib.py",
      "start": 17287756,
      "end": 17296776
    }, {
      "filename": "/python/lib/python2.6/test/test_cookie.py",
      "start": 17296776,
      "end": 17299755
    }, {
      "filename": "/python/lib/python2.6/test/test_cookielib.py",
      "start": 17299755,
      "end": 17371114
    }, {
      "filename": "/python/lib/python2.6/test/test_copy.py",
      "start": 17371114,
      "end": 17389027
    }, {
      "filename": "/python/lib/python2.6/test/test_copy_reg.py",
      "start": 17389027,
      "end": 17393287
    }, {
      "filename": "/python/lib/python2.6/test/test_cpickle.py",
      "start": 17393287,
      "end": 17396821
    }, {
      "filename": "/python/lib/python2.6/test/test_cprofile.py",
      "start": 17396821,
      "end": 17403849
    }, {
      "filename": "/python/lib/python2.6/test/test_crypt.py",
      "start": 17403849,
      "end": 17404201
    }, {
      "filename": "/python/lib/python2.6/test/test_csv.py",
      "start": 17404201,
      "end": 17443142
    }, {
      "filename": "/python/lib/python2.6/test/test_ctypes.py",
      "start": 17443142,
      "end": 17443470
    }, {
      "filename": "/python/lib/python2.6/test/test_curses.py",
      "start": 17443470,
      "end": 17452052
    }, {
      "filename": "/python/lib/python2.6/test/test_datetime.py",
      "start": 17452052,
      "end": 17586047
    }, {
      "filename": "/python/lib/python2.6/test/test_dbm.py",
      "start": 17586047,
      "end": 17587287
    }, {
      "filename": "/python/lib/python2.6/test/test_decimal.py",
      "start": 17587287,
      "end": 17638896
    }, {
      "filename": "/python/lib/python2.6/test/test_decorators.py",
      "start": 17638896,
      "end": 17648745
    }, {
      "filename": "/python/lib/python2.6/test/test_defaultdict.py",
      "start": 17648745,
      "end": 17654277
    }, {
      "filename": "/python/lib/python2.6/test/test_deque.py",
      "start": 17654277,
      "end": 17676033
    }, {
      "filename": "/python/lib/python2.6/test/test_descr.py",
      "start": 17676033,
      "end": 17823056
    }, {
      "filename": "/python/lib/python2.6/test/test_descrtut.py",
      "start": 17823056,
      "end": 17835105
    }, {
      "filename": "/python/lib/python2.6/test/test_dict.py",
      "start": 17835105,
      "end": 17852756
    }, {
      "filename": "/python/lib/python2.6/test/test_difflib.py",
      "start": 17852756,
      "end": 17858037
    }, {
      "filename": "/python/lib/python2.6/test/test_difflib_expect.html",
      "start": 17858037,
      "end": 17961320
    }, {
      "filename": "/python/lib/python2.6/test/test_dircache.py",
      "start": 17961320,
      "end": 17963732
    }, {
      "filename": "/python/lib/python2.6/test/test_dis.py",
      "start": 17963732,
      "end": 17968517
    }, {
      "filename": "/python/lib/python2.6/test/test_distutils.py",
      "start": 17968517,
      "end": 17968869
    }, {
      "filename": "/python/lib/python2.6/test/test_dl.py",
      "start": 17968869,
      "end": 17969837
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest.py",
      "start": 17969837,
      "end": 18046208
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest.txt",
      "start": 18046208,
      "end": 18046504
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest2.py",
      "start": 18046504,
      "end": 18048773
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest2.txt",
      "start": 18048773,
      "end": 18049165
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest3.txt",
      "start": 18049165,
      "end": 18049246
    }, {
      "filename": "/python/lib/python2.6/test/test_doctest4.txt",
      "start": 18049246,
      "end": 18049560
    }, {
      "filename": "/python/lib/python2.6/test/test_docxmlrpc.py",
      "start": 18049560,
      "end": 18056201
    }, {
      "filename": "/python/lib/python2.6/test/test_dumbdbm.py",
      "start": 18056201,
      "end": 18061040
    }, {
      "filename": "/python/lib/python2.6/test/test_dummy_thread.py",
      "start": 18061040,
      "end": 18068232
    }, {
      "filename": "/python/lib/python2.6/test/test_dummy_threading.py",
      "start": 18068232,
      "end": 18070072
    }, {
      "filename": "/python/lib/python2.6/test/test_email.py",
      "start": 18070072,
      "end": 18070372
    }, {
      "filename": "/python/lib/python2.6/test/test_email_codecs.py",
      "start": 18070372,
      "end": 18070834
    }, {
      "filename": "/python/lib/python2.6/test/test_email_renamed.py",
      "start": 18070834,
      "end": 18071142
    }, {
      "filename": "/python/lib/python2.6/test/test_enumerate.py",
      "start": 18071142,
      "end": 18077913
    }, {
      "filename": "/python/lib/python2.6/test/test_eof.py",
      "start": 18077913,
      "end": 18078807
    }, {
      "filename": "/python/lib/python2.6/test/test_epoll.py",
      "start": 18078807,
      "end": 18085076
    }, {
      "filename": "/python/lib/python2.6/test/test_errno.py",
      "start": 18085076,
      "end": 18086254
    }, {
      "filename": "/python/lib/python2.6/test/test_exception_variations.py",
      "start": 18086254,
      "end": 18090295
    }, {
      "filename": "/python/lib/python2.6/test/test_exceptions.py",
      "start": 18090295,
      "end": 18105545
    }, {
      "filename": "/python/lib/python2.6/test/test_extcall.py",
      "start": 18105545,
      "end": 18111808
    }, {
      "filename": "/python/lib/python2.6/test/test_fcntl.py",
      "start": 18111808,
      "end": 18114499
    }, {
      "filename": "/python/lib/python2.6/test/test_file.py",
      "start": 18114499,
      "end": 18133928
    }, {
      "filename": "/python/lib/python2.6/test/test_filecmp.py",
      "start": 18133928,
      "end": 18139317
    }, {
      "filename": "/python/lib/python2.6/test/test_fileinput.py",
      "start": 18139317,
      "end": 18147259
    }, {
      "filename": "/python/lib/python2.6/test/test_fileio.py",
      "start": 18147259,
      "end": 18156283
    }, {
      "filename": "/python/lib/python2.6/test/test_float.py",
      "start": 18156283,
      "end": 18189606
    }, {
      "filename": "/python/lib/python2.6/test/test_fnmatch.py",
      "start": 18189606,
      "end": 18190887
    }, {
      "filename": "/python/lib/python2.6/test/test_fork1.py",
      "start": 18190887,
      "end": 18191790
    }, {
      "filename": "/python/lib/python2.6/test/test_format.py",
      "start": 18191790,
      "end": 18205356
    }, {
      "filename": "/python/lib/python2.6/test/test_fpformat.py",
      "start": 18205356,
      "end": 18207672
    }, {
      "filename": "/python/lib/python2.6/test/test_fractions.py",
      "start": 18207672,
      "end": 18224045
    }, {
      "filename": "/python/lib/python2.6/test/test_frozen.py",
      "start": 18224045,
      "end": 18225389
    }, {
      "filename": "/python/lib/python2.6/test/test_ftplib.py",
      "start": 18225389,
      "end": 18240955
    }, {
      "filename": "/python/lib/python2.6/test/test_funcattrs.py",
      "start": 18240955,
      "end": 18252358
    }, {
      "filename": "/python/lib/python2.6/test/test_functools.py",
      "start": 18252358,
      "end": 18263798
    }, {
      "filename": "/python/lib/python2.6/test/test_future.py",
      "start": 18263798,
      "end": 18267663
    }, {
      "filename": "/python/lib/python2.6/test/test_future1.py",
      "start": 18267663,
      "end": 18267892
    }, {
      "filename": "/python/lib/python2.6/test/test_future2.py",
      "start": 18267892,
      "end": 18268043
    }, {
      "filename": "/python/lib/python2.6/test/test_future3.py",
      "start": 18268043,
      "end": 18268619
    }, {
      "filename": "/python/lib/python2.6/test/test_future4.py",
      "start": 18268619,
      "end": 18270132
    }, {
      "filename": "/python/lib/python2.6/test/test_future5.py",
      "start": 18270132,
      "end": 18270681
    }, {
      "filename": "/python/lib/python2.6/test/test_future_builtins.py",
      "start": 18270681,
      "end": 18272029
    }, {
      "filename": "/python/lib/python2.6/test/test_gc.py",
      "start": 18272029,
      "end": 18291144
    }, {
      "filename": "/python/lib/python2.6/test/test_gdbm.py",
      "start": 18291144,
      "end": 18293645
    }, {
      "filename": "/python/lib/python2.6/test/test_generators.py",
      "start": 18293645,
      "end": 18343947
    }, {
      "filename": "/python/lib/python2.6/test/test_genericpath.py",
      "start": 18343947,
      "end": 18349838
    }, {
      "filename": "/python/lib/python2.6/test/test_genexps.py",
      "start": 18349838,
      "end": 18357113
    }, {
      "filename": "/python/lib/python2.6/test/test_getargs.py",
      "start": 18357113,
      "end": 18358113
    }, {
      "filename": "/python/lib/python2.6/test/test_getargs2.py",
      "start": 18358113,
      "end": 18369708
    }, {
      "filename": "/python/lib/python2.6/test/test_getopt.py",
      "start": 18369708,
      "end": 18376263
    }, {
      "filename": "/python/lib/python2.6/test/test_gettext.py",
      "start": 18376263,
      "end": 18393799
    }, {
      "filename": "/python/lib/python2.6/test/test_gl.py",
      "start": 18393799,
      "end": 18400486
    }, {
      "filename": "/python/lib/python2.6/test/test_glob.py",
      "start": 18400486,
      "end": 18404617
    }, {
      "filename": "/python/lib/python2.6/test/test_global.py",
      "start": 18404617,
      "end": 18405572
    }, {
      "filename": "/python/lib/python2.6/test/test_grammar.py",
      "start": 18405572,
      "end": 18436051
    }, {
      "filename": "/python/lib/python2.6/test/test_grp.py",
      "start": 18436051,
      "end": 18439057
    }, {
      "filename": "/python/lib/python2.6/test/test_gzip.py",
      "start": 18439057,
      "end": 18443507
    }, {
      "filename": "/python/lib/python2.6/test/test_hash.py",
      "start": 18443507,
      "end": 18448138
    }, {
      "filename": "/python/lib/python2.6/test/test_hashlib.py",
      "start": 18448138,
      "end": 18455332
    }, {
      "filename": "/python/lib/python2.6/test/test_heapq.py",
      "start": 18455332,
      "end": 18468527
    }, {
      "filename": "/python/lib/python2.6/test/test_hmac.py",
      "start": 18468527,
      "end": 18481596
    }, {
      "filename": "/python/lib/python2.6/test/test_hotshot.py",
      "start": 18481596,
      "end": 18485955
    }, {
      "filename": "/python/lib/python2.6/test/test_htmllib.py",
      "start": 18485955,
      "end": 18487942
    }, {
      "filename": "/python/lib/python2.6/test/test_htmlparser.py",
      "start": 18487942,
      "end": 18498603
    }, {
      "filename": "/python/lib/python2.6/test/test_httplib.py",
      "start": 18498603,
      "end": 18508706
    }, {
      "filename": "/python/lib/python2.6/test/test_httpservers.py",
      "start": 18508706,
      "end": 18520320
    }, {
      "filename": "/python/lib/python2.6/test/test_imageop.py",
      "start": 18520320,
      "end": 18527179
    }, {
      "filename": "/python/lib/python2.6/test/test_imaplib.py",
      "start": 18527179,
      "end": 18527855
    }, {
      "filename": "/python/lib/python2.6/test/test_imgfile.py",
      "start": 18527855,
      "end": 18532165
    }, {
      "filename": "/python/lib/python2.6/test/test_imp.py",
      "start": 18532165,
      "end": 18533899
    }, {
      "filename": "/python/lib/python2.6/test/test_import.py",
      "start": 18533899,
      "end": 18548172
    }, {
      "filename": "/python/lib/python2.6/test/test_importhooks.py",
      "start": 18548172,
      "end": 18556502
    }, {
      "filename": "/python/lib/python2.6/test/test_index.py",
      "start": 18556502,
      "end": 18563384
    }, {
      "filename": "/python/lib/python2.6/test/test_inspect.py",
      "start": 18563384,
      "end": 18583140
    }, {
      "filename": "/python/lib/python2.6/test/test_int.py",
      "start": 18583140,
      "end": 18596045
    }, {
      "filename": "/python/lib/python2.6/test/test_int_literal.py",
      "start": 18596045,
      "end": 18605295
    }, {
      "filename": "/python/lib/python2.6/test/test_io.py",
      "start": 18605295,
      "end": 18653574
    }, {
      "filename": "/python/lib/python2.6/test/test_ioctl.py",
      "start": 18653574,
      "end": 18655827
    }, {
      "filename": "/python/lib/python2.6/test/test_isinstance.py",
      "start": 18655827,
      "end": 18665633
    }, {
      "filename": "/python/lib/python2.6/test/test_iter.py",
      "start": 18665633,
      "end": 18693636
    }, {
      "filename": "/python/lib/python2.6/test/test_iterlen.py",
      "start": 18693636,
      "end": 18701782
    }, {
      "filename": "/python/lib/python2.6/test/test_itertools.py",
      "start": 18701782,
      "end": 18756917
    }, {
      "filename": "/python/lib/python2.6/test/test_json.py",
      "start": 18756917,
      "end": 18757244
    }, {
      "filename": "/python/lib/python2.6/test/test_kqueue.py",
      "start": 18757244,
      "end": 18763218
    }, {
      "filename": "/python/lib/python2.6/test/test_largefile.py",
      "start": 18763218,
      "end": 18769844
    }, {
      "filename": "/python/lib/python2.6/test/test_lib2to3.py",
      "start": 18769844,
      "end": 18770351
    }, {
      "filename": "/python/lib/python2.6/test/test_linuxaudiodev.py",
      "start": 18770351,
      "end": 18773493
    }, {
      "filename": "/python/lib/python2.6/test/test_list.py",
      "start": 18773493,
      "end": 18776123
    }, {
      "filename": "/python/lib/python2.6/test/test_locale.py",
      "start": 18776123,
      "end": 18788986
    }, {
      "filename": "/python/lib/python2.6/test/test_logging.py",
      "start": 18788986,
      "end": 18818204
    }, {
      "filename": "/python/lib/python2.6/test/test_long.py",
      "start": 18818204,
      "end": 18848442
    }, {
      "filename": "/python/lib/python2.6/test/test_long_future.py",
      "start": 18848442,
      "end": 18850646
    }, {
      "filename": "/python/lib/python2.6/test/test_longexp.py",
      "start": 18850646,
      "end": 18850964
    }, {
      "filename": "/python/lib/python2.6/test/test_macos.py",
      "start": 18850964,
      "end": 18851968
    }, {
      "filename": "/python/lib/python2.6/test/test_macostools.py",
      "start": 18851968,
      "end": 18854960
    }, {
      "filename": "/python/lib/python2.6/test/test_macpath.py",
      "start": 18854960,
      "end": 18857150
    }, {
      "filename": "/python/lib/python2.6/test/test_mailbox.py",
      "start": 18857150,
      "end": 18935787
    }, {
      "filename": "/python/lib/python2.6/test/test_marshal.py",
      "start": 18935787,
      "end": 18945959
    }, {
      "filename": "/python/lib/python2.6/test/test_math.py",
      "start": 18945959,
      "end": 18984764
    }, {
      "filename": "/python/lib/python2.6/test/test_md5.py",
      "start": 18984764,
      "end": 18986554
    }, {
      "filename": "/python/lib/python2.6/test/test_memoryio.py",
      "start": 18986554,
      "end": 19000867
    }, {
      "filename": "/python/lib/python2.6/test/test_mhlib.py",
      "start": 19000867,
      "end": 19012012
    }, {
      "filename": "/python/lib/python2.6/test/test_mimetools.py",
      "start": 19012012,
      "end": 19013792
    }, {
      "filename": "/python/lib/python2.6/test/test_mimetypes.py",
      "start": 19013792,
      "end": 19016373
    }, {
      "filename": "/python/lib/python2.6/test/test_minidom.py",
      "start": 19016373,
      "end": 19069555
    }, {
      "filename": "/python/lib/python2.6/test/test_mmap.py",
      "start": 19069555,
      "end": 19089328
    }, {
      "filename": "/python/lib/python2.6/test/test_module.py",
      "start": 19089328,
      "end": 19091413
    }, {
      "filename": "/python/lib/python2.6/test/test_modulefinder.py",
      "start": 19091413,
      "end": 19099341
    }, {
      "filename": "/python/lib/python2.6/test/test_multibytecodec.py",
      "start": 19099341,
      "end": 19109105
    }, {
      "filename": "/python/lib/python2.6/test/test_multibytecodec_support.py",
      "start": 19109105,
      "end": 19121711
    }, {
      "filename": "/python/lib/python2.6/test/test_multifile.py",
      "start": 19121711,
      "end": 19123361
    }, {
      "filename": "/python/lib/python2.6/test/test_multiprocessing.py",
      "start": 19123361,
      "end": 19178562
    }, {
      "filename": "/python/lib/python2.6/test/test_mutants.py",
      "start": 19178562,
      "end": 19187060
    }, {
      "filename": "/python/lib/python2.6/test/test_mutex.py",
      "start": 19187060,
      "end": 19188046
    }, {
      "filename": "/python/lib/python2.6/test/test_netrc.py",
      "start": 19188046,
      "end": 19189162
    }, {
      "filename": "/python/lib/python2.6/test/test_new.py",
      "start": 19189162,
      "end": 19195211
    }, {
      "filename": "/python/lib/python2.6/test/test_nis.py",
      "start": 19195211,
      "end": 19196528
    }, {
      "filename": "/python/lib/python2.6/test/test_normalization.py",
      "start": 19196528,
      "end": 19199691
    }, {
      "filename": "/python/lib/python2.6/test/test_ntpath.py",
      "start": 19199691,
      "end": 19207950
    }, {
      "filename": "/python/lib/python2.6/test/test_old_mailbox.py",
      "start": 19207950,
      "end": 19212568
    }, {
      "filename": "/python/lib/python2.6/test/test_opcodes.py",
      "start": 19212568,
      "end": 19215159
    }, {
      "filename": "/python/lib/python2.6/test/test_openpty.py",
      "start": 19215159,
      "end": 19215764
    }, {
      "filename": "/python/lib/python2.6/test/test_operator.py",
      "start": 19215764,
      "end": 19237237
    }, {
      "filename": "/python/lib/python2.6/test/test_optparse.py",
      "start": 19237237,
      "end": 19299515
    }, {
      "filename": "/python/lib/python2.6/test/test_os.py",
      "start": 19299515,
      "end": 19323486
    }, {
      "filename": "/python/lib/python2.6/test/test_ossaudiodev.py",
      "start": 19323486,
      "end": 19329466
    }, {
      "filename": "/python/lib/python2.6/test/test_parser.py",
      "start": 19329466,
      "end": 19347029
    }, {
      "filename": "/python/lib/python2.6/test/test_peepholer.py",
      "start": 19347029,
      "end": 19355153
    }, {
      "filename": "/python/lib/python2.6/test/test_pep247.py",
      "start": 19355153,
      "end": 19357186
    }, {
      "filename": "/python/lib/python2.6/test/test_pep263.py",
      "start": 19357186,
      "end": 19357969
    }, {
      "filename": "/python/lib/python2.6/test/test_pep277.py",
      "start": 19357969,
      "end": 19362092
    }, {
      "filename": "/python/lib/python2.6/test/test_pep292.py",
      "start": 19362092,
      "end": 19369813
    }, {
      "filename": "/python/lib/python2.6/test/test_pep352.py",
      "start": 19369813,
      "end": 19379468
    }, {
      "filename": "/python/lib/python2.6/test/test_pickle.py",
      "start": 19379468,
      "end": 19381243
    }, {
      "filename": "/python/lib/python2.6/test/test_pickletools.py",
      "start": 19381243,
      "end": 19381854
    }, {
      "filename": "/python/lib/python2.6/test/test_pipes.py",
      "start": 19381854,
      "end": 19388464
    }, {
      "filename": "/python/lib/python2.6/test/test_pkg.py",
      "start": 19388464,
      "end": 19397535
    }, {
      "filename": "/python/lib/python2.6/test/test_pkgimport.py",
      "start": 19397535,
      "end": 19400414
    }, {
      "filename": "/python/lib/python2.6/test/test_pkgutil.py",
      "start": 19400414,
      "end": 19404542
    }, {
      "filename": "/python/lib/python2.6/test/test_platform.py",
      "start": 19404542,
      "end": 19408461
    }, {
      "filename": "/python/lib/python2.6/test/test_plistlib.py",
      "start": 19408461,
      "end": 19415214
    }, {
      "filename": "/python/lib/python2.6/test/test_poll.py",
      "start": 19415214,
      "end": 19419763
    }, {
      "filename": "/python/lib/python2.6/test/test_popen.py",
      "start": 19419763,
      "end": 19421206
    }, {
      "filename": "/python/lib/python2.6/test/test_popen2.py",
      "start": 19421206,
      "end": 19424357
    }, {
      "filename": "/python/lib/python2.6/test/test_poplib.py",
      "start": 19424357,
      "end": 19426223
    }, {
      "filename": "/python/lib/python2.6/test/test_posix.py",
      "start": 19426223,
      "end": 19436025
    }, {
      "filename": "/python/lib/python2.6/test/test_posixpath.py",
      "start": 19436025,
      "end": 19456003
    }, {
      "filename": "/python/lib/python2.6/test/test_pow.py",
      "start": 19456003,
      "end": 19460647
    }, {
      "filename": "/python/lib/python2.6/test/test_pprint.py",
      "start": 19460647,
      "end": 19485207
    }, {
      "filename": "/python/lib/python2.6/test/test_print.py",
      "start": 19485207,
      "end": 19489074
    }, {
      "filename": "/python/lib/python2.6/test/test_profile.py",
      "start": 19489074,
      "end": 19496295
    }, {
      "filename": "/python/lib/python2.6/test/test_profilehooks.py",
      "start": 19496295,
      "end": 19507600
    }, {
      "filename": "/python/lib/python2.6/test/test_property.py",
      "start": 19507600,
      "end": 19510140
    }, {
      "filename": "/python/lib/python2.6/test/test_pstats.py",
      "start": 19510140,
      "end": 19510827
    }, {
      "filename": "/python/lib/python2.6/test/test_pty.py",
      "start": 19510827,
      "end": 19518264
    }, {
      "filename": "/python/lib/python2.6/test/test_pwd.py",
      "start": 19518264,
      "end": 19521616
    }, {
      "filename": "/python/lib/python2.6/test/test_py3kwarn.py",
      "start": 19521616,
      "end": 19538501
    }, {
      "filename": "/python/lib/python2.6/test/test_pyclbr.py",
      "start": 19538501,
      "end": 19546018
    }, {
      "filename": "/python/lib/python2.6/test/test_pydoc.py",
      "start": 19546018,
      "end": 19555681
    }, {
      "filename": "/python/lib/python2.6/test/test_pyexpat.py",
      "start": 19555681,
      "end": 19577598
    }, {
      "filename": "/python/lib/python2.6/test/test_queue.py",
      "start": 19577598,
      "end": 19589372
    }, {
      "filename": "/python/lib/python2.6/test/test_quopri.py",
      "start": 19589372,
      "end": 19596737
    }, {
      "filename": "/python/lib/python2.6/test/test_random.py",
      "start": 19596737,
      "end": 19618856
    }, {
      "filename": "/python/lib/python2.6/test/test_re.py",
      "start": 19618856,
      "end": 19656111
    }, {
      "filename": "/python/lib/python2.6/test/test_repr.py",
      "start": 19656111,
      "end": 19668447
    }, {
      "filename": "/python/lib/python2.6/test/test_resource.py",
      "start": 19668447,
      "end": 19672876
    }, {
      "filename": "/python/lib/python2.6/test/test_rfc822.py",
      "start": 19672876,
      "end": 19682086
    }, {
      "filename": "/python/lib/python2.6/test/test_richcmp.py",
      "start": 19682086,
      "end": 19693348
    }, {
      "filename": "/python/lib/python2.6/test/test_robotparser.py",
      "start": 19693348,
      "end": 19698268
    }, {
      "filename": "/python/lib/python2.6/test/test_runpy.py",
      "start": 19698268,
      "end": 19708220
    }, {
      "filename": "/python/lib/python2.6/test/test_sax.py",
      "start": 19708220,
      "end": 19732369
    }, {
      "filename": "/python/lib/python2.6/test/test_scope.py",
      "start": 19732369,
      "end": 19747771
    }, {
      "filename": "/python/lib/python2.6/test/test_scriptpackages.py",
      "start": 19747771,
      "end": 19749100
    }, {
      "filename": "/python/lib/python2.6/test/test_select.py",
      "start": 19749100,
      "end": 19750811
    }, {
      "filename": "/python/lib/python2.6/test/test_set.py",
      "start": 19750811,
      "end": 19811219
    }, {
      "filename": "/python/lib/python2.6/test/test_sets.py",
      "start": 19811219,
      "end": 19839092
    }, {
      "filename": "/python/lib/python2.6/test/test_sgmllib.py",
      "start": 19839092,
      "end": 19855086
    }, {
      "filename": "/python/lib/python2.6/test/test_sha.py",
      "start": 19855086,
      "end": 19856780
    }, {
      "filename": "/python/lib/python2.6/test/test_shelve.py",
      "start": 19856780,
      "end": 19860948
    }, {
      "filename": "/python/lib/python2.6/test/test_shlex.py",
      "start": 19860948,
      "end": 19866248
    }, {
      "filename": "/python/lib/python2.6/test/test_shutil.py",
      "start": 19866248,
      "end": 19880162
    }, {
      "filename": "/python/lib/python2.6/test/test_signal.py",
      "start": 19880162,
      "end": 19893893
    }, {
      "filename": "/python/lib/python2.6/test/test_site.py",
      "start": 19893893,
      "end": 19903676
    }, {
      "filename": "/python/lib/python2.6/test/test_slice.py",
      "start": 19903676,
      "end": 19908034
    }, {
      "filename": "/python/lib/python2.6/test/test_smtplib.py",
      "start": 19908034,
      "end": 19921862
    }, {
      "filename": "/python/lib/python2.6/test/test_socket.py",
      "start": 19921862,
      "end": 19963712
    }, {
      "filename": "/python/lib/python2.6/test/test_socketserver.py",
      "start": 19963712,
      "end": 19972467
    }, {
      "filename": "/python/lib/python2.6/test/test_softspace.py",
      "start": 19972467,
      "end": 19973107
    }, {
      "filename": "/python/lib/python2.6/test/test_sort.py",
      "start": 19973107,
      "end": 19982412
    }, {
      "filename": "/python/lib/python2.6/test/test_sqlite.py",
      "start": 19982412,
      "end": 19983010
    }, {
      "filename": "/python/lib/python2.6/test/test_ssl.py",
      "start": 19983010,
      "end": 20033244
    }, {
      "filename": "/python/lib/python2.6/test/test_startfile.py",
      "start": 20033244,
      "end": 20034445
    }, {
      "filename": "/python/lib/python2.6/test/test_str.py",
      "start": 20034445,
      "end": 20049559
    }, {
      "filename": "/python/lib/python2.6/test/test_strftime.py",
      "start": 20049559,
      "end": 20056526
    }, {
      "filename": "/python/lib/python2.6/test/test_string.py",
      "start": 20056526,
      "end": 20065457
    }, {
      "filename": "/python/lib/python2.6/test/test_stringprep.py",
      "start": 20065457,
      "end": 20068612
    }, {
      "filename": "/python/lib/python2.6/test/test_strop.py",
      "start": 20068612,
      "end": 20074871
    }, {
      "filename": "/python/lib/python2.6/test/test_strptime.py",
      "start": 20074871,
      "end": 20100896
    }, {
      "filename": "/python/lib/python2.6/test/test_struct.py",
      "start": 20100896,
      "end": 20125275
    }, {
      "filename": "/python/lib/python2.6/test/test_structmembers.py",
      "start": 20125275,
      "end": 20128648
    }, {
      "filename": "/python/lib/python2.6/test/test_structseq.py",
      "start": 20128648,
      "end": 20132317
    }, {
      "filename": "/python/lib/python2.6/test/test_subprocess.py",
      "start": 20132317,
      "end": 20162457
    }, {
      "filename": "/python/lib/python2.6/test/test_sunaudiodev.py",
      "start": 20162457,
      "end": 20163135
    }, {
      "filename": "/python/lib/python2.6/test/test_sundry.py",
      "start": 20163135,
      "end": 20166329
    }, {
      "filename": "/python/lib/python2.6/test/test_support.py",
      "start": 20166329,
      "end": 20195889
    }, {
      "filename": "/python/lib/python2.6/test/test_symtable.py",
      "start": 20195889,
      "end": 20202957
    }, {
      "filename": "/python/lib/python2.6/test/test_syntax.py",
      "start": 20202957,
      "end": 20220731
    }, {
      "filename": "/python/lib/python2.6/test/test_sys.py",
      "start": 20220731,
      "end": 20245627
    }, {
      "filename": "/python/lib/python2.6/test/test_tarfile.py",
      "start": 20245627,
      "end": 20286819
    }, {
      "filename": "/python/lib/python2.6/test/test_tcl.py",
      "start": 20286819,
      "end": 20291464
    }, {
      "filename": "/python/lib/python2.6/test/test_telnetlib.py",
      "start": 20291464,
      "end": 20293626
    }, {
      "filename": "/python/lib/python2.6/test/test_tempfile.py",
      "start": 20293626,
      "end": 20319899
    }, {
      "filename": "/python/lib/python2.6/test/test_textwrap.py",
      "start": 20319899,
      "end": 20343119
    }, {
      "filename": "/python/lib/python2.6/test/test_thread.py",
      "start": 20343119,
      "end": 20348453
    }, {
      "filename": "/python/lib/python2.6/test/test_threaded_import.py",
      "start": 20348453,
      "end": 20350988
    }, {
      "filename": "/python/lib/python2.6/test/test_threadedtempfile.py",
      "start": 20350988,
      "end": 20353224
    }, {
      "filename": "/python/lib/python2.6/test/test_threading.py",
      "start": 20353224,
      "end": 20369823
    }, {
      "filename": "/python/lib/python2.6/test/test_threading_local.py",
      "start": 20369823,
      "end": 20372479
    }, {
      "filename": "/python/lib/python2.6/test/test_threadsignals.py",
      "start": 20372479,
      "end": 20375415
    }, {
      "filename": "/python/lib/python2.6/test/test_time.py",
      "start": 20375415,
      "end": 20384756
    }, {
      "filename": "/python/lib/python2.6/test/test_timeout.py",
      "start": 20384756,
      "end": 20391470
    }, {
      "filename": "/python/lib/python2.6/test/test_tokenize.py",
      "start": 20391470,
      "end": 20412892
    }, {
      "filename": "/python/lib/python2.6/test/test_trace.py",
      "start": 20412892,
      "end": 20435193
    }, {
      "filename": "/python/lib/python2.6/test/test_traceback.py",
      "start": 20435193,
      "end": 20441630
    }, {
      "filename": "/python/lib/python2.6/test/test_transformer.py",
      "start": 20441630,
      "end": 20442658
    }, {
      "filename": "/python/lib/python2.6/test/test_tuple.py",
      "start": 20442658,
      "end": 20445682
    }, {
      "filename": "/python/lib/python2.6/test/test_typechecks.py",
      "start": 20445682,
      "end": 20448760
    }, {
      "filename": "/python/lib/python2.6/test/test_types.py",
      "start": 20448760,
      "end": 20473838
    }, {
      "filename": "/python/lib/python2.6/test/test_ucn.py",
      "start": 20473838,
      "end": 20478937
    }, {
      "filename": "/python/lib/python2.6/test/test_unary.py",
      "start": 20478937,
      "end": 20480739
    }, {
      "filename": "/python/lib/python2.6/test/test_undocumented_details.py",
      "start": 20480739,
      "end": 20481876
    }, {
      "filename": "/python/lib/python2.6/test/test_unicode.py",
      "start": 20481876,
      "end": 20531076
    }, {
      "filename": "/python/lib/python2.6/test/test_unicode_file.py",
      "start": 20531076,
      "end": 20539632
    }, {
      "filename": "/python/lib/python2.6/test/test_unicodedata.py",
      "start": 20539632,
      "end": 20549689
    }, {
      "filename": "/python/lib/python2.6/test/test_unittest.py",
      "start": 20549689,
      "end": 20634787
    }, {
      "filename": "/python/lib/python2.6/test/test_univnewlines.py",
      "start": 20634787,
      "end": 20638498
    }, {
      "filename": "/python/lib/python2.6/test/test_unpack.py",
      "start": 20638498,
      "end": 20641054
    }, {
      "filename": "/python/lib/python2.6/test/test_urllib.py",
      "start": 20641054,
      "end": 20668342
    }, {
      "filename": "/python/lib/python2.6/test/test_urllib2.py",
      "start": 20668342,
      "end": 20713893
    }, {
      "filename": "/python/lib/python2.6/test/test_urllib2_localnet.py",
      "start": 20713893,
      "end": 20730835
    }, {
      "filename": "/python/lib/python2.6/test/test_urllib2net.py",
      "start": 20730835,
      "end": 20740131
    }, {
      "filename": "/python/lib/python2.6/test/test_urllibnet.py",
      "start": 20740131,
      "end": 20747139
    }, {
      "filename": "/python/lib/python2.6/test/test_urlparse.py",
      "start": 20747139,
      "end": 20763679
    }, {
      "filename": "/python/lib/python2.6/test/test_userdict.py",
      "start": 20763679,
      "end": 20774245
    }, {
      "filename": "/python/lib/python2.6/test/test_userlist.py",
      "start": 20774245,
      "end": 20776012
    }, {
      "filename": "/python/lib/python2.6/test/test_userstring.py",
      "start": 20776012,
      "end": 20780679
    }, {
      "filename": "/python/lib/python2.6/test/test_uu.py",
      "start": 20780679,
      "end": 20785995
    }, {
      "filename": "/python/lib/python2.6/test/test_uuid.py",
      "start": 20785995,
      "end": 20806772
    }, {
      "filename": "/python/lib/python2.6/test/test_wait3.py",
      "start": 20806772,
      "end": 20807819
    }, {
      "filename": "/python/lib/python2.6/test/test_wait4.py",
      "start": 20807819,
      "end": 20808871
    }, {
      "filename": "/python/lib/python2.6/test/test_warnings.py",
      "start": 20808871,
      "end": 20835959
    }, {
      "filename": "/python/lib/python2.6/test/test_wave.py",
      "start": 20835959,
      "end": 20837110
    }, {
      "filename": "/python/lib/python2.6/test/test_weakref.py",
      "start": 20837110,
      "end": 20878164
    }, {
      "filename": "/python/lib/python2.6/test/test_whichdb.py",
      "start": 20878164,
      "end": 20879810
    }, {
      "filename": "/python/lib/python2.6/test/test_winreg.py",
      "start": 20879810,
      "end": 20887046
    }, {
      "filename": "/python/lib/python2.6/test/test_winsound.py",
      "start": 20887046,
      "end": 20895056
    }, {
      "filename": "/python/lib/python2.6/test/test_with.py",
      "start": 20895056,
      "end": 20918771
    }, {
      "filename": "/python/lib/python2.6/test/test_wsgiref.py",
      "start": 20918771,
      "end": 20936581
    }, {
      "filename": "/python/lib/python2.6/test/test_xdrlib.py",
      "start": 20936581,
      "end": 20938098
    }, {
      "filename": "/python/lib/python2.6/test/test_xml_etree.py",
      "start": 20938098,
      "end": 20947904
    }, {
      "filename": "/python/lib/python2.6/test/test_xml_etree_c.py",
      "start": 20947904,
      "end": 20953845
    }, {
      "filename": "/python/lib/python2.6/test/test_xmllib.py",
      "start": 20953845,
      "end": 20955206
    }, {
      "filename": "/python/lib/python2.6/test/test_xmlrpc.py",
      "start": 20955206,
      "end": 20983073
    }, {
      "filename": "/python/lib/python2.6/test/test_xpickle.py",
      "start": 20983073,
      "end": 20984100
    }, {
      "filename": "/python/lib/python2.6/test/test_xrange.py",
      "start": 20984100,
      "end": 20986612
    }, {
      "filename": "/python/lib/python2.6/test/test_zipfile.py",
      "start": 20986612,
      "end": 21027089
    }, {
      "filename": "/python/lib/python2.6/test/test_zipfile64.py",
      "start": 21027089,
      "end": 21031510
    }, {
      "filename": "/python/lib/python2.6/test/test_zipimport.py",
      "start": 21031510,
      "end": 21048888
    }, {
      "filename": "/python/lib/python2.6/test/test_zipimport_support.py",
      "start": 21048888,
      "end": 21058840
    }, {
      "filename": "/python/lib/python2.6/test/test_zlib.py",
      "start": 21058840,
      "end": 21075947
    }, {
      "filename": "/python/lib/python2.6/test/testall.py",
      "start": 21075947,
      "end": 21076221
    }, {
      "filename": "/python/lib/python2.6/test/testcodec.py",
      "start": 21076221,
      "end": 21077268
    }, {
      "filename": "/python/lib/python2.6/test/testimg.uue",
      "start": 21077268,
      "end": 21149630
    }, {
      "filename": "/python/lib/python2.6/test/testimgr.uue",
      "start": 21149630,
      "end": 21221996
    }, {
      "filename": "/python/lib/python2.6/test/testrgb.uue",
      "start": 21221996,
      "end": 21282033
    }, {
      "filename": "/python/lib/python2.6/test/testtar.tar",
      "start": 21282033,
      "end": 21554417
    }, {
      "filename": "/python/lib/python2.6/test/tf_inherit_check.py",
      "start": 21554417,
      "end": 21554998
    }, {
      "filename": "/python/lib/python2.6/test/threaded_import_hangers.py",
      "start": 21554998,
      "end": 21556408
    }, {
      "filename": "/python/lib/python2.6/test/time_hashlib.py",
      "start": 21556408,
      "end": 21559264
    }, {
      "filename": "/python/lib/python2.6/test/tokenize_tests.txt",
      "start": 21559264,
      "end": 21561708
    }, {
      "filename": "/python/lib/python2.6/test/warning_tests.py",
      "start": 21561708,
      "end": 21561948
    }, {
      "filename": "/python/lib/python2.6/test/wrongcert.pem",
      "start": 21561948,
      "end": 21563828
    }, {
      "filename": "/python/lib/python2.6/test/xmltests.py",
      "start": 21563828,
      "end": 21564325
    }, {
      "filename": "/python/lib/python2.6/test/zipdir.zip",
      "start": 21564325,
      "end": 21564699
    }, {
      "filename": "/python/lib/python2.6/textwrap.py",
      "start": 21564699,
      "end": 21581588
    }, {
      "filename": "/python/lib/python2.6/this.py",
      "start": 21581588,
      "end": 21582590
    }, {
      "filename": "/python/lib/python2.6/threading.py",
      "start": 21582590,
      "end": 21614089
    }, {
      "filename": "/python/lib/python2.6/timeit.py",
      "start": 21614089,
      "end": 21626038
    }, {
      "filename": "/python/lib/python2.6/toaiff.py",
      "start": 21626038,
      "end": 21629180
    }, {
      "filename": "/python/lib/python2.6/token.py",
      "start": 21629180,
      "end": 21632124
    }, {
      "filename": "/python/lib/python2.6/tokenize.py",
      "start": 21632124,
      "end": 21648450
    }, {
      "filename": "/python/lib/python2.6/trace.py",
      "start": 21648450,
      "end": 21678339
    }, {
      "filename": "/python/lib/python2.6/traceback.py",
      "start": 21678339,
      "end": 21689386
    }, {
      "filename": "/python/lib/python2.6/tty.py",
      "start": 21689386,
      "end": 21690265
    }, {
      "filename": "/python/lib/python2.6/types.py",
      "start": 21690265,
      "end": 21692588
    }, {
      "filename": "/python/lib/python2.6/unittest.py",
      "start": 21692588,
      "end": 21723695
    }, {
      "filename": "/python/lib/python2.6/urllib.py",
      "start": 21723695,
      "end": 21788539
    }, {
      "filename": "/python/lib/python2.6/urllib2.py",
      "start": 21788539,
      "end": 21836756
    }, {
      "filename": "/python/lib/python2.6/urlparse.py",
      "start": 21836756,
      "end": 21851193
    }, {
      "filename": "/python/lib/python2.6/user.py",
      "start": 21851193,
      "end": 21852820
    }, {
      "filename": "/python/lib/python2.6/uu.py",
      "start": 21852820,
      "end": 21858759
    }, {
      "filename": "/python/lib/python2.6/uuid.py",
      "start": 21858759,
      "end": 21879090
    }, {
      "filename": "/python/lib/python2.6/warnings.py",
      "start": 21879090,
      "end": 21893263
    }, {
      "filename": "/python/lib/python2.6/wave.py",
      "start": 21893263,
      "end": 21911193
    }, {
      "filename": "/python/lib/python2.6/weakref.py",
      "start": 21911193,
      "end": 21921280
    }, {
      "filename": "/python/lib/python2.6/webbrowser.py",
      "start": 21921280,
      "end": 21942270
    }, {
      "filename": "/python/lib/python2.6/whichdb.py",
      "start": 21942270,
      "end": 21945623
    }, {
      "filename": "/python/lib/python2.6/wsgiref.egg-info",
      "start": 21945623,
      "end": 21945810
    }, {
      "filename": "/python/lib/python2.6/wsgiref/__init__.py",
      "start": 21945810,
      "end": 21946396
    }, {
      "filename": "/python/lib/python2.6/wsgiref/handlers.py",
      "start": 21946396,
      "end": 21962033
    }, {
      "filename": "/python/lib/python2.6/wsgiref/headers.py",
      "start": 21962033,
      "end": 21967949
    }, {
      "filename": "/python/lib/python2.6/wsgiref/simple_server.py",
      "start": 21967949,
      "end": 21972743
    }, {
      "filename": "/python/lib/python2.6/wsgiref/util.py",
      "start": 21972743,
      "end": 21978348
    }, {
      "filename": "/python/lib/python2.6/wsgiref/validate.py",
      "start": 21978348,
      "end": 21993085
    }, {
      "filename": "/python/lib/python2.6/xdrlib.py",
      "start": 21993085,
      "end": 21998598
    }, {
      "filename": "/python/lib/python2.6/xml/__init__.py",
      "start": 21998598,
      "end": 21999767
    }, {
      "filename": "/python/lib/python2.6/xml/dom/NodeFilter.py",
      "start": 21999767,
      "end": 22000704
    }, {
      "filename": "/python/lib/python2.6/xml/dom/__init__.py",
      "start": 22000704,
      "end": 22004702
    }, {
      "filename": "/python/lib/python2.6/xml/dom/domreg.py",
      "start": 22004702,
      "end": 22008186
    }, {
      "filename": "/python/lib/python2.6/xml/dom/expatbuilder.py",
      "start": 22008186,
      "end": 22044571
    }, {
      "filename": "/python/lib/python2.6/xml/dom/minicompat.py",
      "start": 22044571,
      "end": 22047900
    }, {
      "filename": "/python/lib/python2.6/xml/dom/minidom.py",
      "start": 22047900,
      "end": 22114034
    }, {
      "filename": "/python/lib/python2.6/xml/dom/pulldom.py",
      "start": 22114034,
      "end": 22126008
    }, {
      "filename": "/python/lib/python2.6/xml/dom/xmlbuilder.py",
      "start": 22126008,
      "end": 22138357
    }, {
      "filename": "/python/lib/python2.6/xml/etree/ElementInclude.py",
      "start": 22138357,
      "end": 22143395
    }, {
      "filename": "/python/lib/python2.6/xml/etree/ElementPath.py",
      "start": 22143395,
      "end": 22149461
    }, {
      "filename": "/python/lib/python2.6/xml/etree/ElementTree.py",
      "start": 22149461,
      "end": 22190517
    }, {
      "filename": "/python/lib/python2.6/xml/etree/__init__.py",
      "start": 22190517,
      "end": 22192121
    }, {
      "filename": "/python/lib/python2.6/xml/etree/cElementTree.py",
      "start": 22192121,
      "end": 22192183
    }, {
      "filename": "/python/lib/python2.6/xml/parsers/__init__.py",
      "start": 22192183,
      "end": 22192350
    }, {
      "filename": "/python/lib/python2.6/xml/parsers/expat.py",
      "start": 22192350,
      "end": 22192464
    }, {
      "filename": "/python/lib/python2.6/xml/sax/__init__.py",
      "start": 22192464,
      "end": 22196051
    }, {
      "filename": "/python/lib/python2.6/xml/sax/_exceptions.py",
      "start": 22196051,
      "end": 22200836
    }, {
      "filename": "/python/lib/python2.6/xml/sax/expatreader.py",
      "start": 22200836,
      "end": 22215344
    }, {
      "filename": "/python/lib/python2.6/xml/sax/handler.py",
      "start": 22215344,
      "end": 22229312
    }, {
      "filename": "/python/lib/python2.6/xml/sax/saxutils.py",
      "start": 22229312,
      "end": 22238761
    }, {
      "filename": "/python/lib/python2.6/xml/sax/xmlreader.py",
      "start": 22238761,
      "end": 22251399
    }, {
      "filename": "/python/lib/python2.6/xmllib.py",
      "start": 22251399,
      "end": 22286247
    }, {
      "filename": "/python/lib/python2.6/xmlrpclib.py",
      "start": 22286247,
      "end": 22334022
    }, {
      "filename": "/python/lib/python2.6/zipfile.py",
      "start": 22334022,
      "end": 22386878
    } ],
    "remote_package_size": 22386878
  });
})();

// end include: /var/folders/pm/461ntwb12b7bbqcjw1s6t0kw0000gn/T/tmps1vyon66.js
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
  throw toThrow;
};

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require("fs");
  var nodePath = require("path");
  scriptDirectory = __dirname + "/";
  // include: node_shell_read.js
  readBinary = filename => {
    // We need to re-wrap `file://` strings to URLs.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename);
    return ret;
  };
  readAsync = async (filename, binary = true) => {
    // See the comment in the `readBinary` function.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
    return ret;
  };
  // end include: node_shell_read.js
  if (!Module["thisProgram"] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, "/");
  }
  arguments_ = process.argv.slice(2);
  if (typeof module != "undefined") {
    module["exports"] = Module;
  }
  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };
} else // Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != "undefined" && document.currentScript) {
    // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.startsWith("blob:")) {
    scriptDirectory = "";
  } else {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
  }
  {
    // include: web_or_worker_shell_read.js
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
      };
    }
    readAsync = async url => {
      // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
      // See https://github.com/github/fetch/pull/92#issuecomment-140665932
      // Cordova or Electron apps are typically loaded from a file:// url.
      // So use XHR on webview if URL is a file URL.
      if (isFileURI(url)) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              // file URLs can return 0
              resolve(xhr.response);
              return;
            }
            reject(xhr.status);
          };
          xhr.onerror = reject;
          xhr.send(null);
        });
      }
      var response = await fetch(url, {
        credentials: "same-origin"
      });
      if (response.ok) {
        return response.arrayBuffer();
      }
      throw new Error(response.status + " : " + response.url);
    };
  }
} else // end include: web_or_worker_shell_read.js
{}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);

// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.
if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===
// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
var wasmBinary = Module["wasmBinary"];

// end include: base64Utils.js
// Wasm globals
var wasmMemory;

//========================================
// Runtime essentials
//========================================
// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */ function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implementation here for now.
    abort(text);
  }
}

// Memory management
var /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64;

// include: runtime_shared.js
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module["HEAP8"] = HEAP8 = new Int8Array(b);
  Module["HEAP16"] = HEAP16 = new Int16Array(b);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
  Module["HEAP32"] = HEAP32 = new Int32Array(b);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
}

// end include: runtime_shared.js
// include: runtime_stack_check.js
// end include: runtime_stack_check.js
var __ATPRERUN__ = [];

// functions called before the runtime is initialized
var __ATINIT__ = [];

// functions called during startup
var __ATMAIN__ = [];

// functions called during shutdown
var __ATPOSTRUN__ = [];

// functions called after the main() is called
var runtimeInitialized = false;

function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;
  if (!Module["noFSInit"] && !FS.initialized) FS.init();
  FS.ignorePermissions = false;
  TTY.init();
  PIPEFS.root = FS.mount(PIPEFS, {}, null);
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;

var dependenciesFulfilled = null;

// overridden to take different actions when all run dependencies are fulfilled
function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  Module["monitorRunDependencies"]?.(runDependencies);
}

function removeRunDependency(id) {
  runDependencies--;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (runDependencies == 0) {
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}

/** @param {string|number=} what */ function abort(what) {
  Module["onAbort"]?.(what);
  what = "Aborted(" + what + ")";
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);
  ABORT = true;
  what += ". Build with -sASSERTIONS for more info.";
  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.
  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

// end include: URIUtils.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
function findWasmBinary() {
  var f = "player.wasm";
  if (!isDataURI(f)) {
    return locateFile(f);
  }
  return f;
}

var wasmBinaryFile;

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {}
  }
  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);
    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
  !isFileURI(binaryFile) && // Avoid instantiateStreaming() on Node.js environment for now, as while
  // Node.js v18.1.0 implements it, it does not have a full fetch()
  // implementation yet.
  // Reference:
  //   https://github.com/emscripten-core/emscripten/pull/16917
  !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
    try {
      var response = fetch(binaryFile, {
        credentials: "same-origin"
      });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err("falling back to ArrayBuffer instantiation");
    }
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  // prepare imports
  return {
    "a": wasmImports
  };
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    wasmMemory = wasmExports["we"];
    updateMemoryViews();
    wasmTable = wasmExports["ye"];
    addOnInit(wasmExports["xe"]);
    removeRunDependency("wasm-instantiate");
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency("wasm-instantiate");
  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result["instance"]);
  }
  var info = getWasmImports();
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module["instantiateWasm"]) {
    try {
      return Module["instantiateWasm"](info, receiveInstance);
    } catch (e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
      return false;
    }
  }
  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  receiveInstantiationResult(result);
  return result;
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;

var tempI64;

// include: runtime_debug.js
// end include: runtime_debug.js
// === Body ===
var ASM_CONSTS = {
  993960: () => {
    Module.originalEngineStarted = true;
  },
  994001: $0 => {
    if (Module.onGameExit) Module.onGameExit($0);
  },
  994051: () => {
    if (Module.onGameExit) Module.onGameExit(1);
  },
  994100: $0 => {
    if (Module.onReforgedStatus) Module.onReforgedStatus(UTF8ToString($0));
  },
  994176: $0 => {
    Module.canvas.style.cursor = $0 == 1 ? "none" : ($0 == 2 ? "wait" : "default");
  }
};

// end include: preamble.js
class ExitStatus {
  name="ExitStatus";
  constructor(status) {
    this.message = `Program terminated with exit(${status})`;
    this.status = status;
  }
}

var callRuntimeCallbacks = callbacks => {
  while (callbacks.length > 0) {
    // Pass the module as the first argument.
    callbacks.shift()(Module);
  }
};

var noExitRuntime = Module["noExitRuntime"] || true;

var stackRestore = val => __emscripten_stack_restore(val);

var stackSave = () => _emscripten_stack_get_current();

var PATH = {
  isAbs: path => path.charAt(0) === "/",
  splitPath: filename => {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (;up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: path => {
    var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
    // Normalize the path
    path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: path => {
    var result = PATH.splitPath(path), root = result[0], dir = result[1];
    if (!root && !dir) {
      // No dirname whatsoever
      return ".";
    }
    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: path => {
    // EMSCRIPTEN return '/'' for '/', not an empty string
    if (path === "/") return "/";
    path = PATH.normalize(path);
    path = path.replace(/\/$/, "");
    var lastSlash = path.lastIndexOf("/");
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  join: (...paths) => PATH.normalize(paths.join("/")),
  join2: (l, r) => PATH.normalize(l + "/" + r)
};

var handleException = e => {
  // Certain exception types we do not treat as errors since they are used for
  // internal control flow.
  // 1. ExitStatus, which is thrown by exit()
  // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
  //    that wish to return to JS event loop.
  if (e instanceof ExitStatus || e == "unwind") {
    return EXITSTATUS;
  }
  quit_(1, e);
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var _proc_exit = code => {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    Module["onExit"]?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};

/** @suppress {duplicate } */ /** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  _proc_exit(status);
};

var _exit = exitJS;

var maybeExit = () => {
  if (!keepRuntimeAlive()) {
    try {
      _exit(EXITSTATUS);
    } catch (e) {
      handleException(e);
    }
  }
};

var callUserCallback = func => {
  if (ABORT) {
    return;
  }
  try {
    func();
    maybeExit();
  } catch (e) {
    handleException(e);
  }
};

/** @param {number=} timeout */ var safeSetTimeout = (func, timeout) => setTimeout(() => {
  callUserCallback(func);
}, timeout);

var warnOnce = text => {
  warnOnce.shown ||= {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
    err(text);
  }
};

var preloadPlugins = Module["preloadPlugins"] || [];

var Browser = {
  useWebGL: false,
  isFullscreen: false,
  pointerLock: false,
  moduleContextCreatedCallbacks: [],
  workers: [],
  preloadedImages: {},
  preloadedAudios: {},
  init() {
    if (Browser.initted) return;
    Browser.initted = true;
    // Support for plugins that can process preloaded files. You can add more of these to
    // your app by creating and appending to preloadPlugins.
    // Each plugin is asked if it can handle a file based on the file's name. If it can,
    // it is given the file's raw data. When it is done, it calls a callback with the file's
    // (possibly modified) data. For example, a plugin might decompress a file, or it
    // might create some side data structure for use later (like an Image element, etc.).
    var imagePlugin = {};
    imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
      return !Module["noImageDecoding"] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name);
    };
    imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
      var b = new Blob([ byteArray ], {
        type: Browser.getMimetype(name)
      });
      if (b.size !== byteArray.length) {
        // Safari bug #118630
        // Safari's Blob can only take an ArrayBuffer
        b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
          type: Browser.getMimetype(name)
        });
      }
      var url = URL.createObjectURL(b);
      var img = new Image;
      img.onload = () => {
        var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement("canvas"));
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        Browser.preloadedImages[name] = canvas;
        URL.revokeObjectURL(url);
        onload?.(byteArray);
      };
      img.onerror = event => {
        err(`Image ${url} could not be decoded`);
        onerror?.();
      };
      img.src = url;
    };
    preloadPlugins.push(imagePlugin);
    var audioPlugin = {};
    audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
      return !Module["noAudioDecoding"] && name.substr(-4) in {
        ".ogg": 1,
        ".wav": 1,
        ".mp3": 1
      };
    };
    audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
      var done = false;
      function finish(audio) {
        if (done) return;
        done = true;
        Browser.preloadedAudios[name] = audio;
        onload?.(byteArray);
      }
      var b = new Blob([ byteArray ], {
        type: Browser.getMimetype(name)
      });
      var url = URL.createObjectURL(b);
      // XXX we never revoke this!
      var audio = new Audio;
      audio.addEventListener("canplaythrough", () => finish(audio), false);
      // use addEventListener due to chromium bug 124926
      audio.onerror = function audio_onerror(event) {
        if (done) return;
        err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
        function encode64(data) {
          var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          var PAD = "=";
          var ret = "";
          var leftchar = 0;
          var leftbits = 0;
          for (var i = 0; i < data.length; i++) {
            leftchar = (leftchar << 8) | data[i];
            leftbits += 8;
            while (leftbits >= 6) {
              var curr = (leftchar >> (leftbits - 6)) & 63;
              leftbits -= 6;
              ret += BASE[curr];
            }
          }
          if (leftbits == 2) {
            ret += BASE[(leftchar & 3) << 4];
            ret += PAD + PAD;
          } else if (leftbits == 4) {
            ret += BASE[(leftchar & 15) << 2];
            ret += PAD;
          }
          return ret;
        }
        audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
        finish(audio);
      };
      // we don't wait for confirmation this worked - but it's worth trying
      audio.src = url;
      // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
      safeSetTimeout(() => {
        finish(audio);
      }, // try to use it even though it is not necessarily ready to play
      1e4);
    };
    preloadPlugins.push(audioPlugin);
    // Canvas event setup
    function pointerLockChange() {
      Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
    }
    var canvas = Module["canvas"];
    if (canvas) {
      // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
      // Module['forcedAspectRatio'] = 4 / 3;
      canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (() => {});
      canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (() => {});
      // no-op if function does not exist
      canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
      document.addEventListener("pointerlockchange", pointerLockChange, false);
      document.addEventListener("mozpointerlockchange", pointerLockChange, false);
      document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
      document.addEventListener("mspointerlockchange", pointerLockChange, false);
      if (Module["elementPointerLock"]) {
        canvas.addEventListener("click", ev => {
          if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
            Module["canvas"].requestPointerLock();
            ev.preventDefault();
          }
        }, false);
      }
    }
  },
  createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
    if (useWebGL && Module["ctx"] && canvas == Module["canvas"]) return Module["ctx"];
    // no need to recreate GL context if it's already been created for this canvas.
    var ctx;
    var contextHandle;
    if (useWebGL) {
      // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
      var contextAttributes = {
        antialias: false,
        alpha: false,
        majorVersion: 1
      };
      if (webGLContextAttributes) {
        for (var attribute in webGLContextAttributes) {
          contextAttributes[attribute] = webGLContextAttributes[attribute];
        }
      }
      // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
      // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
      // Browser.createContext() should not even be emitted.
      if (typeof GL != "undefined") {
        contextHandle = GL.createContext(canvas, contextAttributes);
        if (contextHandle) {
          ctx = GL.getContext(contextHandle).GLctx;
        }
      }
    } else {
      ctx = canvas.getContext("2d");
    }
    if (!ctx) return null;
    if (setInModule) {
      Module["ctx"] = ctx;
      if (useWebGL) GL.makeContextCurrent(contextHandle);
      Browser.useWebGL = useWebGL;
      Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
      Browser.init();
    }
    return ctx;
  },
  fullscreenHandlersInstalled: false,
  lockPointer: undefined,
  resizeCanvas: undefined,
  requestFullscreen(lockPointer, resizeCanvas) {
    Browser.lockPointer = lockPointer;
    Browser.resizeCanvas = resizeCanvas;
    if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
    if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
    var canvas = Module["canvas"];
    function fullscreenChange() {
      Browser.isFullscreen = false;
      var canvasContainer = canvas.parentNode;
      if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
        canvas.exitFullscreen = Browser.exitFullscreen;
        if (Browser.lockPointer) canvas.requestPointerLock();
        Browser.isFullscreen = true;
        if (Browser.resizeCanvas) {
          Browser.setFullscreenCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      } else {
        // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
        canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
        canvasContainer.parentNode.removeChild(canvasContainer);
        if (Browser.resizeCanvas) {
          Browser.setWindowedCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      }
      Module["onFullScreen"]?.(Browser.isFullscreen);
      Module["onFullscreen"]?.(Browser.isFullscreen);
    }
    if (!Browser.fullscreenHandlersInstalled) {
      Browser.fullscreenHandlersInstalled = true;
      document.addEventListener("fullscreenchange", fullscreenChange, false);
      document.addEventListener("mozfullscreenchange", fullscreenChange, false);
      document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
      document.addEventListener("MSFullscreenChange", fullscreenChange, false);
    }
    // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
    var canvasContainer = document.createElement("div");
    canvas.parentNode.insertBefore(canvasContainer, canvas);
    canvasContainer.appendChild(canvas);
    // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
    canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
    canvasContainer.requestFullscreen();
  },
  exitFullscreen() {
    // This is workaround for chrome. Trying to exit from fullscreen
    // not in fullscreen state will cause "TypeError: Document not active"
    // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
    if (!Browser.isFullscreen) {
      return false;
    }
    var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => {});
    CFS.apply(document, []);
    return true;
  },
  safeSetTimeout(func, timeout) {
    // Legacy function, this is used by the SDL2 port so we need to keep it
    // around at least until that is updated.
    // See https://github.com/libsdl-org/SDL/pull/6304
    return safeSetTimeout(func, timeout);
  },
  getMimetype(name) {
    return {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "bmp": "image/bmp",
      "ogg": "audio/ogg",
      "wav": "audio/wav",
      "mp3": "audio/mpeg"
    }[name.substr(name.lastIndexOf(".") + 1)];
  },
  getUserMedia(func) {
    window.getUserMedia ||= navigator["getUserMedia"] || navigator["mozGetUserMedia"];
    window.getUserMedia(func);
  },
  getMovementX(event) {
    return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
  },
  getMovementY(event) {
    return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
  },
  getMouseWheelDelta(event) {
    var delta = 0;
    switch (event.type) {
     case "DOMMouseScroll":
      // 3 lines make up a step
      delta = event.detail / 3;
      break;

     case "mousewheel":
      // 120 units make up a step
      delta = event.wheelDelta / 120;
      break;

     case "wheel":
      delta = event.deltaY;
      switch (event.deltaMode) {
       case 0:
        // DOM_DELTA_PIXEL: 100 pixels make up a step
        delta /= 100;
        break;

       case 1:
        // DOM_DELTA_LINE: 3 lines make up a step
        delta /= 3;
        break;

       case 2:
        // DOM_DELTA_PAGE: A page makes up 80 steps
        delta *= 80;
        break;

       default:
        throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
      }
      break;

     default:
      throw "unrecognized mouse wheel event: " + event.type;
    }
    return delta;
  },
  mouseX: 0,
  mouseY: 0,
  mouseMovementX: 0,
  mouseMovementY: 0,
  touches: {},
  lastTouches: {},
  calculateMouseCoords(pageX, pageY) {
    // Calculate the movement based on the changes
    // in the coordinates.
    var rect = Module["canvas"].getBoundingClientRect();
    var cw = Module["canvas"].width;
    var ch = Module["canvas"].height;
    // Neither .scrollX or .pageXOffset are defined in a spec, but
    // we prefer .scrollX because it is currently in a spec draft.
    // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
    var scrollX = ((typeof window.scrollX != "undefined") ? window.scrollX : window.pageXOffset);
    var scrollY = ((typeof window.scrollY != "undefined") ? window.scrollY : window.pageYOffset);
    var adjustedX = pageX - (scrollX + rect.left);
    var adjustedY = pageY - (scrollY + rect.top);
    // the canvas might be CSS-scaled compared to its backbuffer;
    // SDL-using content will want mouse coordinates in terms
    // of backbuffer units.
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    return {
      x: adjustedX,
      y: adjustedY
    };
  },
  setMouseCoords(pageX, pageY) {
    const {x, y} = Browser.calculateMouseCoords(pageX, pageY);
    Browser.mouseMovementX = x - Browser.mouseX;
    Browser.mouseMovementY = y - Browser.mouseY;
    Browser.mouseX = x;
    Browser.mouseY = y;
  },
  calculateMouseEvent(event) {
    // event should be mousemove, mousedown or mouseup
    if (Browser.pointerLock) {
      // When the pointer is locked, calculate the coordinates
      // based on the movement of the mouse.
      // Workaround for Firefox bug 764498
      if (event.type != "mousemove" && ("mozMovementX" in event)) {
        Browser.mouseMovementX = Browser.mouseMovementY = 0;
      } else {
        Browser.mouseMovementX = Browser.getMovementX(event);
        Browser.mouseMovementY = Browser.getMovementY(event);
      }
      // add the mouse delta to the current absolute mouse position
      Browser.mouseX += Browser.mouseMovementX;
      Browser.mouseY += Browser.mouseMovementY;
    } else {
      if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
        var touch = event.touch;
        if (touch === undefined) {
          return;
        }
        // the "touch" property is only defined in SDL
        var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
        if (event.type === "touchstart") {
          Browser.lastTouches[touch.identifier] = coords;
          Browser.touches[touch.identifier] = coords;
        } else if (event.type === "touchend" || event.type === "touchmove") {
          var last = Browser.touches[touch.identifier];
          last ||= coords;
          Browser.lastTouches[touch.identifier] = last;
          Browser.touches[touch.identifier] = coords;
        }
        return;
      }
      Browser.setMouseCoords(event.pageX, event.pageY);
    }
  },
  resizeListeners: [],
  updateResizeListeners() {
    var canvas = Module["canvas"];
    Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height));
  },
  setCanvasSize(width, height, noUpdates) {
    var canvas = Module["canvas"];
    Browser.updateCanvasDimensions(canvas, width, height);
    if (!noUpdates) Browser.updateResizeListeners();
  },
  windowedWidth: 0,
  windowedHeight: 0,
  setFullscreenCanvasSize() {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = HEAPU32[((SDL.screen) >> 2)];
      flags = flags | 8388608;
      // set SDL_FULLSCREEN flag
      HEAP32[((SDL.screen) >> 2)] = flags;
    }
    Browser.updateCanvasDimensions(Module["canvas"]);
    Browser.updateResizeListeners();
  },
  setWindowedCanvasSize() {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = HEAPU32[((SDL.screen) >> 2)];
      flags = flags & ~8388608;
      // clear SDL_FULLSCREEN flag
      HEAP32[((SDL.screen) >> 2)] = flags;
    }
    Browser.updateCanvasDimensions(Module["canvas"]);
    Browser.updateResizeListeners();
  },
  updateCanvasDimensions(canvas, wNative, hNative) {
    if (wNative && hNative) {
      canvas.widthNative = wNative;
      canvas.heightNative = hNative;
    } else {
      wNative = canvas.widthNative;
      hNative = canvas.heightNative;
    }
    var w = wNative;
    var h = hNative;
    if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
      if (w / h < Module["forcedAspectRatio"]) {
        w = Math.round(h * Module["forcedAspectRatio"]);
      } else {
        h = Math.round(w / Module["forcedAspectRatio"]);
      }
    }
    if (((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode) && (typeof screen != "undefined")) {
      var factor = Math.min(screen.width / w, screen.height / h);
      w = Math.round(w * factor);
      h = Math.round(h * factor);
    }
    if (Browser.resizeCanvas) {
      if (canvas.width != w) canvas.width = w;
      if (canvas.height != h) canvas.height = h;
      if (typeof canvas.style != "undefined") {
        canvas.style.removeProperty("width");
        canvas.style.removeProperty("height");
      }
    } else {
      if (canvas.width != wNative) canvas.width = wNative;
      if (canvas.height != hNative) canvas.height = hNative;
      if (typeof canvas.style != "undefined") {
        if (w != wNative || h != hNative) {
          canvas.style.setProperty("width", w + "px", "important");
          canvas.style.setProperty("height", h + "px", "important");
        } else {
          canvas.style.removeProperty("width");
          canvas.style.removeProperty("height");
        }
      }
    }
  }
};

var _SDL_GetTicks = () => (Date.now() - SDL.startTime) | 0;

var _SDL_LockSurface = surf => {
  var surfData = SDL.surfaces[surf];
  surfData.locked++;
  if (surfData.locked > 1) return 0;
  if (!surfData.buffer) {
    surfData.buffer = _malloc(surfData.width * surfData.height * 4);
    HEAPU32[(((surf) + (20)) >> 2)] = surfData.buffer;
  }
  // Mark in C/C++-accessible SDL structure
  // SDL_Surface has the following fields: Uint32 flags, SDL_PixelFormat *format; int w, h; Uint16 pitch; void *pixels; ...
  // So we have fields all of the same size, and 5 of them before us.
  // TODO: Use macros like in library.js
  HEAPU32[(((surf) + (20)) >> 2)] = surfData.buffer;
  if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
  if (SDL.defaults.discardOnLock) {
    if (!surfData.image) {
      surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height);
    }
    if (!SDL.defaults.opaqueFrontBuffer) return;
  } else {
    surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
  }
  // Emulate desktop behavior and kill alpha values on the locked surface. (very costly!) Set SDL.defaults.opaqueFrontBuffer = false
  // if you don't want this.
  if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
    var data = surfData.image.data;
    var num = data.length;
    for (var i = 0; i < num / 4; i++) {
      data[i * 4 + 3] = 255;
    }
  }
  // opacity, as canvases blend alpha
  if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
    // Copy pixel data to somewhere accessible to 'C/C++'
    if (surfData.isFlagSet(2097152)) {
      // If this is needed then
      // we should compact the data from 32bpp to 8bpp index.
      // I think best way to implement this is use
      // additional colorMap hash (color->index).
      // Something like this:
      // var size = surfData.width * surfData.height;
      // var data = '';
      // for (var i = 0; i<size; i++) {
      //   var color = SDL.translateRGBAToColor(
      //     surfData.image.data[i*4   ],
      //     surfData.image.data[i*4 +1],
      //     surfData.image.data[i*4 +2],
      //     255);
      //   var index = surfData.colorMap[color];
      //   HEAP8[(surfData.buffer)+(i)] = index;
      // }
      throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + (new Error).stack;
    } else {
      HEAPU8.set(surfData.image.data, surfData.buffer);
    }
  }
  return 0;
};

var _emscripten_set_main_loop_timing = (mode, value) => {
  MainLoop.timingMode = mode;
  MainLoop.timingValue = value;
  if (!MainLoop.func) {
    return 1;
  }
  // Return non-zero on failure, can't set timing mode when there is no main loop.
  if (!MainLoop.running) {
    MainLoop.running = true;
  }
  if (mode == 0) {
    MainLoop.scheduler = function MainLoop_scheduler_setTimeout() {
      var timeUntilNextTick = Math.max(0, MainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
      setTimeout(MainLoop.runner, timeUntilNextTick);
    };
    // doing this each time means that on exception, we stop
    MainLoop.method = "timeout";
  } else if (mode == 1) {
    MainLoop.scheduler = function MainLoop_scheduler_rAF() {
      MainLoop.requestAnimationFrame(MainLoop.runner);
    };
    MainLoop.method = "rAF";
  } else if (mode == 2) {
    if (typeof MainLoop.setImmediate == "undefined") {
      if (typeof setImmediate == "undefined") {
        // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
        var setImmediates = [];
        var emscriptenMainLoopMessageId = "setimmediate";
        /** @param {Event} event */ var MainLoop_setImmediate_messageHandler = event => {
          // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
          // so check for both cases.
          if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
            event.stopPropagation();
            setImmediates.shift()();
          }
        };
        addEventListener("message", MainLoop_setImmediate_messageHandler, true);
        MainLoop.setImmediate = /** @type{function(function(): ?, ...?): number} */ (func => {
          setImmediates.push(func);
          if (ENVIRONMENT_IS_WORKER) {
            Module["setImmediates"] ??= [];
            Module["setImmediates"].push(func);
            postMessage({
              target: emscriptenMainLoopMessageId
            });
          } else // In --proxy-to-worker, route the message via proxyClient.js
          postMessage(emscriptenMainLoopMessageId, "*");
        });
      } else {
        MainLoop.setImmediate = setImmediate;
      }
    }
    MainLoop.scheduler = function MainLoop_scheduler_setImmediate() {
      MainLoop.setImmediate(MainLoop.runner);
    };
    MainLoop.method = "immediate";
  }
  return 0;
};

var _emscripten_get_now = () => performance.now();

/**
     * @param {number=} arg
     * @param {boolean=} noSetTiming
     */ var setMainLoop = (iterFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
  MainLoop.func = iterFunc;
  MainLoop.arg = arg;
  var thisMainLoopId = MainLoop.currentlyRunningMainloop;
  function checkIsRunning() {
    if (thisMainLoopId < MainLoop.currentlyRunningMainloop) {
      maybeExit();
      return false;
    }
    return true;
  }
  // We create the loop runner here but it is not actually running until
  // _emscripten_set_main_loop_timing is called (which might happen a
  // later time).  This member signifies that the current runner has not
  // yet been started so that we can call runtimeKeepalivePush when it
  // gets it timing set for the first time.
  MainLoop.running = false;
  MainLoop.runner = function MainLoop_runner() {
    if (ABORT) return;
    if (MainLoop.queue.length > 0) {
      var start = Date.now();
      var blocker = MainLoop.queue.shift();
      blocker.func(blocker.arg);
      if (MainLoop.remainingBlockers) {
        var remaining = MainLoop.remainingBlockers;
        var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
        if (blocker.counted) {
          MainLoop.remainingBlockers = next;
        } else {
          // not counted, but move the progress along a tiny bit
          next = next + .5;
          // do not steal all the next one's progress
          MainLoop.remainingBlockers = (8 * remaining + next) / 9;
        }
      }
      MainLoop.updateStatus();
      // catches pause/resume main loop from blocker execution
      if (!checkIsRunning()) return;
      setTimeout(MainLoop.runner, 0);
      return;
    }
    // catch pauses from non-main loop sources
    if (!checkIsRunning()) return;
    // Implement very basic swap interval control
    MainLoop.currentFrameNumber = MainLoop.currentFrameNumber + 1 | 0;
    if (MainLoop.timingMode == 1 && MainLoop.timingValue > 1 && MainLoop.currentFrameNumber % MainLoop.timingValue != 0) {
      // Not the scheduled time to render this frame - skip.
      MainLoop.scheduler();
      return;
    } else if (MainLoop.timingMode == 0) {
      MainLoop.tickStartTime = _emscripten_get_now();
    }
    MainLoop.runIter(iterFunc);
    // catch pauses from the main loop itself
    if (!checkIsRunning()) return;
    MainLoop.scheduler();
  };
  if (!noSetTiming) {
    if (fps && fps > 0) {
      _emscripten_set_main_loop_timing(0, 1e3 / fps);
    } else {
      // Do rAF by rendering each frame (no decimating)
      _emscripten_set_main_loop_timing(1, 1);
    }
    MainLoop.scheduler();
  }
  if (simulateInfiniteLoop) {
    throw "unwind";
  }
};

var MainLoop = {
  running: false,
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  preMainLoop: [],
  postMainLoop: [],
  pause() {
    MainLoop.scheduler = null;
    // Incrementing this signals the previous main loop that it's now become old, and it must return.
    MainLoop.currentlyRunningMainloop++;
  },
  resume() {
    MainLoop.currentlyRunningMainloop++;
    var timingMode = MainLoop.timingMode;
    var timingValue = MainLoop.timingValue;
    var func = MainLoop.func;
    MainLoop.func = null;
    // do not set timing and call scheduler, we will do it on the next lines
    setMainLoop(func, 0, false, MainLoop.arg, true);
    _emscripten_set_main_loop_timing(timingMode, timingValue);
    MainLoop.scheduler();
  },
  updateStatus() {
    if (Module["setStatus"]) {
      var message = Module["statusMessage"] || "Please wait...";
      var remaining = MainLoop.remainingBlockers ?? 0;
      var expected = MainLoop.expectedBlockers ?? 0;
      if (remaining) {
        if (remaining < expected) {
          Module["setStatus"](`{message} ({expected - remaining}/{expected})`);
        } else {
          Module["setStatus"](message);
        }
      } else {
        Module["setStatus"]("");
      }
    }
  },
  init() {
    Module["preMainLoop"] && MainLoop.preMainLoop.push(Module["preMainLoop"]);
    Module["postMainLoop"] && MainLoop.postMainLoop.push(Module["postMainLoop"]);
  },
  runIter(func) {
    if (ABORT) return;
    for (var pre of MainLoop.preMainLoop) {
      if (pre() === false) {
        return;
      }
    }
    // |return false| skips a frame
    callUserCallback(func);
    for (var post of MainLoop.postMainLoop) {
      post();
    }
  },
  nextRAF: 0,
  fakeRequestAnimationFrame(func) {
    // try to keep 60fps between calls to here
    var now = Date.now();
    if (MainLoop.nextRAF === 0) {
      MainLoop.nextRAF = now + 1e3 / 60;
    } else {
      while (now + 2 >= MainLoop.nextRAF) {
        // fudge a little, to avoid timer jitter causing us to do lots of delay:0
        MainLoop.nextRAF += 1e3 / 60;
      }
    }
    var delay = Math.max(MainLoop.nextRAF - now, 0);
    setTimeout(func, delay);
  },
  requestAnimationFrame(func) {
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(func);
      return;
    }
    var RAF = MainLoop.fakeRequestAnimationFrame;
    RAF(func);
  }
};

var lengthBytesUTF8 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i);
    // possibly a lead surrogate
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
  // undefined and false each don't write out any bytes.
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
    // and https://www.ietf.org/rfc/rfc2279.txt
    // and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i);
    // possibly a lead surrogate
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
};

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

var SDL = {
  defaults: {
    width: 320,
    height: 200,
    copyOnLock: true,
    discardOnLock: false,
    opaqueFrontBuffer: true
  },
  version: null,
  surfaces: {},
  canvasPool: [],
  events: [],
  fonts: [ null ],
  audios: [ null ],
  rwops: [ null ],
  music: {
    audio: null,
    volume: 1
  },
  mixerFrequency: 22050,
  mixerFormat: 32784,
  mixerNumChannels: 2,
  mixerChunkSize: 1024,
  channelMinimumNumber: 0,
  GL: false,
  glAttributes: {
    0: 3,
    1: 3,
    2: 2,
    3: 0,
    4: 0,
    5: 1,
    6: 16,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 1,
    16: 0,
    17: 0,
    18: 0
  },
  keyboardState: null,
  keyboardMap: {},
  canRequestFullscreen: false,
  isRequestingFullscreen: false,
  textInput: false,
  unicode: false,
  ttfContext: null,
  audio: null,
  startTime: null,
  initFlags: 0,
  buttonState: 0,
  modState: 0,
  DOMButtons: [ 0, 0, 0 ],
  DOMEventToSDLEvent: {},
  TOUCH_DEFAULT_ID: 0,
  eventHandler: null,
  eventHandlerContext: null,
  eventHandlerTemp: 0,
  keyCodes: {
    16: 1249,
    17: 1248,
    18: 1250,
    20: 1081,
    33: 1099,
    34: 1102,
    35: 1101,
    36: 1098,
    37: 1104,
    38: 1106,
    39: 1103,
    40: 1105,
    44: 316,
    45: 1097,
    46: 127,
    91: 1251,
    93: 1125,
    96: 1122,
    97: 1113,
    98: 1114,
    99: 1115,
    100: 1116,
    101: 1117,
    102: 1118,
    103: 1119,
    104: 1120,
    105: 1121,
    106: 1109,
    107: 1111,
    109: 1110,
    110: 1123,
    111: 1108,
    112: 1082,
    113: 1083,
    114: 1084,
    115: 1085,
    116: 1086,
    117: 1087,
    118: 1088,
    119: 1089,
    120: 1090,
    121: 1091,
    122: 1092,
    123: 1093,
    124: 1128,
    125: 1129,
    126: 1130,
    127: 1131,
    128: 1132,
    129: 1133,
    130: 1134,
    131: 1135,
    132: 1136,
    133: 1137,
    134: 1138,
    135: 1139,
    144: 1107,
    160: 94,
    161: 33,
    162: 34,
    163: 35,
    164: 36,
    165: 37,
    166: 38,
    167: 95,
    168: 40,
    169: 41,
    170: 42,
    171: 43,
    172: 124,
    173: 45,
    174: 123,
    175: 125,
    176: 126,
    181: 127,
    182: 129,
    183: 128,
    188: 44,
    190: 46,
    191: 47,
    192: 96,
    219: 91,
    220: 92,
    221: 93,
    222: 39,
    224: 1251
  },
  scanCodes: {
    8: 42,
    9: 43,
    13: 40,
    27: 41,
    32: 44,
    35: 204,
    39: 53,
    44: 54,
    46: 55,
    47: 56,
    48: 39,
    49: 30,
    50: 31,
    51: 32,
    52: 33,
    53: 34,
    54: 35,
    55: 36,
    56: 37,
    57: 38,
    58: 203,
    59: 51,
    61: 46,
    91: 47,
    92: 49,
    93: 48,
    96: 52,
    97: 4,
    98: 5,
    99: 6,
    100: 7,
    101: 8,
    102: 9,
    103: 10,
    104: 11,
    105: 12,
    106: 13,
    107: 14,
    108: 15,
    109: 16,
    110: 17,
    111: 18,
    112: 19,
    113: 20,
    114: 21,
    115: 22,
    116: 23,
    117: 24,
    118: 25,
    119: 26,
    120: 27,
    121: 28,
    122: 29,
    127: 76,
    305: 224,
    308: 226,
    316: 70
  },
  loadRect(rect) {
    return {
      x: HEAP32[((rect) >> 2)],
      y: HEAP32[(((rect) + (4)) >> 2)],
      w: HEAP32[(((rect) + (8)) >> 2)],
      h: HEAP32[(((rect) + (12)) >> 2)]
    };
  },
  updateRect(rect, r) {
    HEAP32[((rect) >> 2)] = r.x;
    HEAP32[(((rect) + (4)) >> 2)] = r.y;
    HEAP32[(((rect) + (8)) >> 2)] = r.w;
    HEAP32[(((rect) + (12)) >> 2)] = r.h;
  },
  intersectionOfRects(first, second) {
    var leftX = Math.max(first.x, second.x);
    var leftY = Math.max(first.y, second.y);
    var rightX = Math.min(first.x + first.w, second.x + second.w);
    var rightY = Math.min(first.y + first.h, second.y + second.h);
    return {
      x: leftX,
      y: leftY,
      w: Math.max(leftX, rightX) - leftX,
      h: Math.max(leftY, rightY) - leftY
    };
  },
  checkPixelFormat(fmt) {},
  loadColorToCSSRGB(color) {
    var rgba = HEAP32[((color) >> 2)];
    return "rgb(" + (rgba & 255) + "," + ((rgba >> 8) & 255) + "," + ((rgba >> 16) & 255) + ")";
  },
  loadColorToCSSRGBA(color) {
    var rgba = HEAP32[((color) >> 2)];
    return "rgba(" + (rgba & 255) + "," + ((rgba >> 8) & 255) + "," + ((rgba >> 16) & 255) + "," + (((rgba >> 24) & 255) / 255) + ")";
  },
  translateColorToCSSRGBA: rgba => "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")",
  translateRGBAToCSSRGBA: (r, g, b, a) => "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")",
  translateRGBAToColor: (r, g, b, a) => r | g << 8 | b << 16 | a << 24,
  makeSurface(width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
    var is_SDL_HWSURFACE = flags & 134217729;
    var is_SDL_HWPALETTE = flags & 2097152;
    var is_SDL_OPENGL = flags & 67108864;
    var surf = _malloc(60);
    var pixelFormat = _malloc(44);
    // surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
    var bpp = is_SDL_HWPALETTE ? 1 : 4;
    var buffer = 0;
    // preemptively initialize this for software surfaces,
    // otherwise it will be lazily initialized inside of SDL_LockSurface
    if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
      buffer = _malloc(width * height * 4);
    }
    HEAP32[((surf) >> 2)] = flags;
    HEAPU32[(((surf) + (4)) >> 2)] = pixelFormat;
    HEAP32[(((surf) + (8)) >> 2)] = width;
    HEAP32[(((surf) + (12)) >> 2)] = height;
    HEAP32[(((surf) + (16)) >> 2)] = width * bpp;
    // assuming RGBA or indexed for now,
    // since that is what ImageData gives us in browsers
    HEAPU32[(((surf) + (20)) >> 2)] = buffer;
    HEAP32[(((surf) + (36)) >> 2)] = 0;
    HEAP32[(((surf) + (40)) >> 2)] = 0;
    HEAP32[(((surf) + (44)) >> 2)] = Module["canvas"].width;
    HEAP32[(((surf) + (48)) >> 2)] = Module["canvas"].height;
    HEAP32[(((surf) + (56)) >> 2)] = 1;
    HEAP32[((pixelFormat) >> 2)] = -2042224636;
    HEAP32[(((pixelFormat) + (4)) >> 2)] = 0;
    // TODO
    HEAP8[(pixelFormat) + (8)] = bpp * 8;
    HEAP8[(pixelFormat) + (9)] = bpp;
    HEAP32[(((pixelFormat) + (12)) >> 2)] = rmask || 255;
    HEAP32[(((pixelFormat) + (16)) >> 2)] = gmask || 65280;
    HEAP32[(((pixelFormat) + (20)) >> 2)] = bmask || 16711680;
    HEAP32[(((pixelFormat) + (24)) >> 2)] = amask || 4278190080;
    // Decide if we want to use WebGL or not
    SDL.GL = SDL.GL || is_SDL_OPENGL;
    var canvas;
    if (!usePageCanvas) {
      if (SDL.canvasPool.length > 0) {
        canvas = SDL.canvasPool.pop();
      } else {
        canvas = document.createElement("canvas");
      }
      canvas.width = width;
      canvas.height = height;
    } else {
      canvas = Module["canvas"];
    }
    var webGLContextAttributes = {
      antialias: ((SDL.glAttributes[13] != 0) && (SDL.glAttributes[14] > 1)),
      depth: (SDL.glAttributes[6] > 0),
      stencil: (SDL.glAttributes[7] > 0),
      alpha: (SDL.glAttributes[3] > 0)
    };
    var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
    SDL.surfaces[surf] = {
      width,
      height,
      canvas,
      ctx,
      surf,
      buffer,
      pixelFormat,
      alpha: 255,
      flags,
      locked: 0,
      usePageCanvas,
      source,
      isFlagSet: flag => flags & flag
    };
    return surf;
  },
  copyIndexedColorData(surfData, rX, rY, rW, rH) {
    // HWPALETTE works with palette
    // set by SDL_SetColors
    if (!surfData.colors) {
      return;
    }
    var fullWidth = Module["canvas"].width;
    var fullHeight = Module["canvas"].height;
    var startX = rX || 0;
    var startY = rY || 0;
    var endX = (rW || (fullWidth - startX)) + startX;
    var endY = (rH || (fullHeight - startY)) + startY;
    var buffer = surfData.buffer;
    if (!surfData.image.data32) {
      surfData.image.data32 = new Uint32Array(surfData.image.data.buffer);
    }
    var data32 = surfData.image.data32;
    var colors32 = surfData.colors32;
    for (var y = startY; y < endY; ++y) {
      var base = y * fullWidth;
      for (var x = startX; x < endX; ++x) {
        data32[base + x] = colors32[HEAPU8[(buffer) + (base + x)]];
      }
    }
  },
  freeSurface(surf) {
    var refcountPointer = surf + 56;
    var refcount = HEAP32[((refcountPointer) >> 2)];
    if (refcount > 1) {
      HEAP32[((refcountPointer) >> 2)] = refcount - 1;
      return;
    }
    var info = SDL.surfaces[surf];
    if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
    if (info.buffer) _free(info.buffer);
    _free(info.pixelFormat);
    _free(surf);
    SDL.surfaces[surf] = null;
    if (surf === SDL.screen) {
      SDL.screen = null;
    }
  },
  blitSurface(src, srcrect, dst, dstrect, scale) {
    var srcData = SDL.surfaces[src];
    var dstData = SDL.surfaces[dst];
    var sr, dr;
    if (srcrect) {
      sr = SDL.loadRect(srcrect);
    } else {
      sr = {
        x: 0,
        y: 0,
        w: srcData.width,
        h: srcData.height
      };
    }
    if (dstrect) {
      dr = SDL.loadRect(dstrect);
    } else {
      dr = {
        x: 0,
        y: 0,
        w: srcData.width,
        h: srcData.height
      };
    }
    if (dstData.clipRect) {
      var widthScale = (!scale || sr.w === 0) ? 1 : sr.w / dr.w;
      var heightScale = (!scale || sr.h === 0) ? 1 : sr.h / dr.h;
      dr = SDL.intersectionOfRects(dstData.clipRect, dr);
      sr.w = dr.w * widthScale;
      sr.h = dr.h * heightScale;
      if (dstrect) {
        SDL.updateRect(dstrect, dr);
      }
    }
    var blitw, blith;
    if (scale) {
      blitw = dr.w;
      blith = dr.h;
    } else {
      blitw = sr.w;
      blith = sr.h;
    }
    if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
      return 0;
    }
    var oldAlpha = dstData.ctx.globalAlpha;
    dstData.ctx.globalAlpha = srcData.alpha / 255;
    dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
    dstData.ctx.globalAlpha = oldAlpha;
    if (dst != SDL.screen) {
      // XXX As in IMG_Load, for compatibility we write out |pixels|
      warnOnce("WARNING: copying canvas data to memory for compatibility");
      _SDL_LockSurface(dst);
      dstData.locked--;
    }
    // The surface is not actually locked in this hack
    return 0;
  },
  downFingers: {},
  savedKeydown: null,
  receiveEvent(event) {
    function unpressAllPressedKeys() {
      // Un-press all pressed keys: TODO
      for (var keyCode of Object.values(SDL.keyboardMap)) {
        SDL.events.push({
          type: "keyup",
          keyCode
        });
      }
    }
    switch (event.type) {
     case "touchstart":
     case "touchmove":
      {
        event.preventDefault();
        var touches = [];
        // Clear out any touchstart events that we've already processed
        if (event.type === "touchstart") {
          for (var i = 0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            if (SDL.downFingers[touch.identifier] != true) {
              SDL.downFingers[touch.identifier] = true;
              touches.push(touch);
            }
          }
        } else {
          touches = event.touches;
        }
        var firstTouch = touches[0];
        if (firstTouch) {
          if (event.type == "touchstart") {
            SDL.DOMButtons[0] = 1;
          }
          var mouseEventType;
          switch (event.type) {
           case "touchstart":
            mouseEventType = "mousedown";
            break;

           case "touchmove":
            mouseEventType = "mousemove";
            break;
          }
          var mouseEvent = {
            type: mouseEventType,
            button: 0,
            pageX: firstTouch.clientX,
            pageY: firstTouch.clientY
          };
          SDL.events.push(mouseEvent);
        }
        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          SDL.events.push({
            type: event.type,
            touch
          });
        }
        break;
      }

     case "touchend":
      {
        event.preventDefault();
        // Remove the entry in the SDL.downFingers hash
        // because the finger is no longer down.
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];
          if (SDL.downFingers[touch.identifier] === true) {
            delete SDL.downFingers[touch.identifier];
          }
        }
        var mouseEvent = {
          type: "mouseup",
          button: 0,
          pageX: event.changedTouches[0].clientX,
          pageY: event.changedTouches[0].clientY
        };
        SDL.DOMButtons[0] = 0;
        SDL.events.push(mouseEvent);
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];
          SDL.events.push({
            type: "touchend",
            touch
          });
        }
        break;
      }

     case "DOMMouseScroll":
     case "mousewheel":
     case "wheel":
      // Flip the wheel direction to translate from browser wheel direction
      // (+:down) to SDL direction (+:up)
      var delta = -Browser.getMouseWheelDelta(event);
      // Quantize to integer so that minimum scroll is at least +/- 1.
      delta = (delta == 0) ? 0 : (delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1));
      // Simulate old-style SDL events representing mouse wheel input as buttons
      // Subtract one since JS->C marshalling is defined to add one back.
      var button = (delta > 0 ? 4 : 5) - 1;
      SDL.events.push({
        type: "mousedown",
        button,
        pageX: event.pageX,
        pageY: event.pageY
      });
      SDL.events.push({
        type: "mouseup",
        button,
        pageX: event.pageX,
        pageY: event.pageY
      });
      // Pass a delta motion event.
      SDL.events.push({
        type: "wheel",
        deltaX: 0,
        deltaY: delta
      });
      // If we don't prevent this, then 'wheel' event will be sent again by
      // the browser as 'DOMMouseScroll' and we will receive this same event
      // the second time.
      event.preventDefault();
      break;

     case "mousemove":
      if (SDL.DOMButtons[0] === 1) {
        SDL.events.push({
          type: "touchmove",
          touch: {
            identifier: 0,
            deviceID: -1,
            pageX: event.pageX,
            pageY: event.pageY
          }
        });
      }
      if (Browser.pointerLock) {
        // workaround for firefox bug 750111
        if ("mozMovementX" in event) {
          event["movementX"] = event["mozMovementX"];
          event["movementY"] = event["mozMovementY"];
        }
        // workaround for Firefox bug 782777
        if (event["movementX"] == 0 && event["movementY"] == 0) {
          // ignore a mousemove event if it doesn't contain any movement info
          // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
          event.preventDefault();
          return;
        }
      }

     // fall through
      case "keydown":
     case "keyup":
     case "keypress":
     case "mousedown":
     case "mouseup":
      // If we preventDefault on keydown events, the subsequent keypress events
      // won't fire. However, it's fine (and in some cases necessary) to
      // preventDefault for keys that don't generate a character. Otherwise,
      // preventDefault is the right thing to do in general.
      if (event.type !== "keydown" || (!SDL.unicode && !SDL.textInput) || (event.key == "Backspace" || event.key == "Tab")) {
        event.preventDefault();
      }
      if (event.type == "mousedown") {
        SDL.DOMButtons[event.button] = 1;
        SDL.events.push({
          type: "touchstart",
          touch: {
            identifier: 0,
            deviceID: -1,
            pageX: event.pageX,
            pageY: event.pageY
          }
        });
      } else if (event.type == "mouseup") {
        // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
        // since we add a mouseup in that case
        if (!SDL.DOMButtons[event.button]) {
          return;
        }
        SDL.events.push({
          type: "touchend",
          touch: {
            identifier: 0,
            deviceID: -1,
            pageX: event.pageX,
            pageY: event.pageY
          }
        });
        SDL.DOMButtons[event.button] = 0;
      }
      // We can only request fullscreen as the result of user input.
      // Due to this limitation, we toggle a boolean on keydown which
      // SDL_WM_ToggleFullScreen will check and subsequently set another
      // flag indicating for us to request fullscreen on the following
      // keyup. This isn't perfect, but it enables SDL_WM_ToggleFullScreen
      // to work as the result of a keypress (which is an extremely
      // common use case).
      if (event.type === "keydown" || event.type === "mousedown") {
        SDL.canRequestFullscreen = true;
      } else if (event.type === "keyup" || event.type === "mouseup") {
        if (SDL.isRequestingFullscreen) {
          Module["requestFullscreen"](/*lockPointer=*/ true, /*resizeCanvas=*/ true);
          SDL.isRequestingFullscreen = false;
        }
        SDL.canRequestFullscreen = false;
      }
      // SDL expects a unicode character to be passed to its keydown events.
      // Unfortunately, the browser APIs only provide a charCode property on
      // keypress events, so we must backfill in keydown events with their
      // subsequent keypress event's charCode.
      if (event.type === "keypress" && SDL.savedKeydown) {
        // charCode is read-only
        SDL.savedKeydown.keypressCharCode = event.charCode;
        SDL.savedKeydown = null;
      } else if (event.type === "keydown") {
        SDL.savedKeydown = event;
      }
      // Don't push keypress events unless SDL_StartTextInput has been called.
      if (event.type !== "keypress" || SDL.textInput) {
        SDL.events.push(event);
      }
      break;

     case "mouseout":
      // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
      for (var i = 0; i < 3; i++) {
        if (SDL.DOMButtons[i]) {
          SDL.events.push({
            type: "mouseup",
            button: i,
            pageX: event.pageX,
            pageY: event.pageY
          });
          SDL.DOMButtons[i] = 0;
        }
      }
      event.preventDefault();
      break;

     case "focus":
      SDL.events.push(event);
      event.preventDefault();
      break;

     case "blur":
      SDL.events.push(event);
      unpressAllPressedKeys();
      event.preventDefault();
      break;

     case "visibilitychange":
      SDL.events.push({
        type: "visibilitychange",
        visible: !document.hidden
      });
      unpressAllPressedKeys();
      event.preventDefault();
      break;

     case "unload":
      if (MainLoop.runner) {
        SDL.events.push(event);
        // Force-run a main event loop, since otherwise this event will never be caught!
        MainLoop.runner();
      }
      return;

     case "resize":
      SDL.events.push(event);
      // manually triggered resize event doesn't have a preventDefault member
      if (event.preventDefault) {
        event.preventDefault();
      }
      break;
    }
    if (SDL.events.length >= 1e4) {
      err("SDL event queue full, dropping events");
      SDL.events = SDL.events.slice(0, 1e4);
    }
    // If we have a handler installed, this will push the events to the app
    // instead of the app polling for them.
    SDL.flushEventsToHandler();
    return;
  },
  lookupKeyCodeForEvent(event) {
    var code = event.keyCode;
    if (code >= 65 && code <= 90) {
      // ASCII A-Z
      code += 32;
    } else // make lowercase for SDL
    {
      // Look up DOM code in the keyCodes table with fallback for ASCII codes
      // which can match between DOM codes and SDL keycodes (allows keyCodes
      // to be smaller).
      code = SDL.keyCodes[code] || (code < 128 ? code : 0);
      // If this is one of the modifier keys (224 | 1<<10 - 227 | 1<<10), and the event specifies that it is
      // a right key, add 4 to get the right key SDL key code.
      if (event.location === 2 && /*KeyboardEvent.DOM_KEY_LOCATION_RIGHT*/ code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
        code += 4;
      }
    }
    return code;
  },
  handleEvent(event) {
    if (event.handled) return;
    event.handled = true;
    switch (event.type) {
     case "touchstart":
     case "touchend":
     case "touchmove":
      {
        Browser.calculateMouseEvent(event);
        break;
      }

     case "keydown":
     case "keyup":
      {
        var down = event.type === "keydown";
        var code = SDL.lookupKeyCodeForEvent(event);
        // Ignore key events that we don't (yet) map to SDL keys
        if (!code) return;
        // Assigning a boolean to HEAP8, that's alright but Closure would like to warn about it.
        // TODO(https://github.com/emscripten-core/emscripten/issues/16311):
        // This is kind of ugly hack.  Perhaps we can find a better way?
        /** @suppress{checkTypes} */ HEAP8[(SDL.keyboardState) + (code)] = down;
        // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
        SDL.modState = (HEAP8[(SDL.keyboardState) + (1248)] ? 64 : 0) | (HEAP8[(SDL.keyboardState) + (1249)] ? 1 : 0) | (HEAP8[(SDL.keyboardState) + (1250)] ? 256 : 0) | (HEAP8[(SDL.keyboardState) + (1252)] ? 128 : 0) | (HEAP8[(SDL.keyboardState) + (1253)] ? 2 : 0) | (HEAP8[(SDL.keyboardState) + (1254)] ? 512 : 0);
        if (down) {
          SDL.keyboardMap[code] = event.keyCode;
        } else // save the DOM input, which we can use to unpress it during blur
        {
          delete SDL.keyboardMap[code];
        }
        break;
      }

     case "mousedown":
     case "mouseup":
      if (event.type == "mousedown") {
        // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
        // and DOM buttons are 0-2, so this means that the below formula is
        // correct.
        SDL.buttonState |= 1 << event.button;
      } else if (event.type == "mouseup") {
        SDL.buttonState &= ~(1 << event.button);
      }

     // fall through
      case "mousemove":
      {
        Browser.calculateMouseEvent(event);
        break;
      }
    }
  },
  flushEventsToHandler() {
    if (!SDL.eventHandler) return;
    while (SDL.pollEvent(SDL.eventHandlerTemp)) {
      ((a1, a2) => dynCall_iii(SDL.eventHandler, a1, a2))(SDL.eventHandlerContext, SDL.eventHandlerTemp);
    }
  },
  pollEvent(ptr) {
    if (SDL.initFlags & 512 && SDL.joystickEventState) {
      // If SDL_INIT_JOYSTICK was supplied AND the joystick system is configured
      // to automatically query for events, query for joystick events.
      SDL.queryJoysticks();
    }
    if (ptr) {
      while (SDL.events.length > 0) {
        if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1;
      }
      return 0;
    }
    // XXX: somewhat risky in that we do not check if the event is real or not
    // (makeCEvent returns false) if no pointer supplied
    return SDL.events.length > 0;
  },
  makeCEvent(event, ptr) {
    if (typeof event == "number") {
      // This is a pointer to a copy of a native C event that was SDL_PushEvent'ed
      _memcpy(ptr, event, 28);
      _free(event);
      // the copy is no longer needed
      return;
    }
    SDL.handleEvent(event);
    switch (event.type) {
     case "keydown":
     case "keyup":
      {
        var down = event.type === "keydown";
        var key = SDL.lookupKeyCodeForEvent(event);
        // Ignore key events that we don't (yet) map to SDL keys
        if (!key) return false;
        var scan;
        if (key >= 1024) {
          scan = key - 1024;
        } else {
          scan = SDL.scanCodes[key] || key;
        }
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr) + (8)] = down ? 1 : 0;
        HEAP8[(ptr) + (9)] = 0;
        // TODO
        HEAP32[(((ptr) + (12)) >> 2)] = scan;
        HEAP32[(((ptr) + (16)) >> 2)] = key;
        HEAP16[(((ptr) + (20)) >> 1)] = SDL.modState;
        // some non-character keys (e.g. backspace and tab) won't have keypressCharCode set, fill in with the keyCode.
        HEAP32[(((ptr) + (24)) >> 2)] = event.keypressCharCode || key;
        break;
      }

     case "keypress":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        // Not filling in windowID for now
        var cStr = intArrayFromString(String.fromCharCode(event.charCode));
        for (var i = 0; i < cStr.length; ++i) {
          HEAP8[(ptr) + (8 + i)] = cStr[i];
        }
        break;
      }

     case "mousedown":
     case "mouseup":
     case "mousemove":
      {
        if (event.type != "mousemove") {
          var down = event.type === "mousedown";
          HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
          HEAP32[(((ptr) + (4)) >> 2)] = 0;
          HEAP32[(((ptr) + (8)) >> 2)] = 0;
          HEAP32[(((ptr) + (12)) >> 2)] = 0;
          HEAP8[(ptr) + (16)] = event.button + 1;
          // DOM buttons are 0-2, SDL 1-3
          HEAP8[(ptr) + (17)] = down ? 1 : 0;
          HEAP32[(((ptr) + (20)) >> 2)] = Browser.mouseX;
          HEAP32[(((ptr) + (24)) >> 2)] = Browser.mouseY;
        } else {
          HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
          HEAP32[(((ptr) + (4)) >> 2)] = 0;
          HEAP32[(((ptr) + (8)) >> 2)] = 0;
          HEAP32[(((ptr) + (12)) >> 2)] = 0;
          HEAP32[(((ptr) + (16)) >> 2)] = SDL.buttonState;
          HEAP32[(((ptr) + (20)) >> 2)] = Browser.mouseX;
          HEAP32[(((ptr) + (24)) >> 2)] = Browser.mouseY;
          HEAP32[(((ptr) + (28)) >> 2)] = Browser.mouseMovementX;
          HEAP32[(((ptr) + (32)) >> 2)] = Browser.mouseMovementY;
        }
        break;
      }

     case "wheel":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (16)) >> 2)] = event.deltaX;
        HEAP32[(((ptr) + (20)) >> 2)] = event.deltaY;
        break;
      }

     case "touchstart":
     case "touchend":
     case "touchmove":
      {
        var touch = event.touch;
        if (!Browser.touches[touch.identifier]) break;
        var w = Module["canvas"].width;
        var h = Module["canvas"].height;
        var x = Browser.touches[touch.identifier].x / w;
        var y = Browser.touches[touch.identifier].y / h;
        var lx = Browser.lastTouches[touch.identifier].x / w;
        var ly = Browser.lastTouches[touch.identifier].y / h;
        var dx = x - lx;
        var dy = y - ly;
        if (touch["deviceID"] === undefined) touch.deviceID = SDL.TOUCH_DEFAULT_ID;
        if (dx === 0 && dy === 0 && event.type === "touchmove") return false;
        // don't send these if nothing happened
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (4)) >> 2)] = _SDL_GetTicks();
        (tempI64 = [ touch.deviceID >>> 0, (tempDouble = touch.deviceID, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
        HEAP32[(((ptr) + (8)) >> 2)] = tempI64[0], HEAP32[(((ptr) + (12)) >> 2)] = tempI64[1]);
        (tempI64 = [ touch.identifier >>> 0, (tempDouble = touch.identifier, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
        HEAP32[(((ptr) + (16)) >> 2)] = tempI64[0], HEAP32[(((ptr) + (20)) >> 2)] = tempI64[1]);
        HEAPF32[(((ptr) + (24)) >> 2)] = x;
        HEAPF32[(((ptr) + (28)) >> 2)] = y;
        HEAPF32[(((ptr) + (32)) >> 2)] = dx;
        HEAPF32[(((ptr) + (36)) >> 2)] = dy;
        if (touch.force !== undefined) {
          HEAPF32[(((ptr) + (40)) >> 2)] = touch.force;
        } else {
          // No pressure data, send a digital 0/1 pressure.
          HEAPF32[(((ptr) + (40)) >> 2)] = event.type == "touchend" ? 0 : 1;
        }
        break;
      }

     case "unload":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        break;
      }

     case "resize":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (4)) >> 2)] = event.w;
        HEAP32[(((ptr) + (8)) >> 2)] = event.h;
        break;
      }

     case "joystick_button_up":
     case "joystick_button_down":
      {
        var state = event.type === "joystick_button_up" ? 0 : 1;
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr) + (4)] = event.index;
        HEAP8[(ptr) + (5)] = event.button;
        HEAP8[(ptr) + (6)] = state;
        break;
      }

     case "joystick_axis_motion":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr) + (4)] = event.index;
        HEAP8[(ptr) + (5)] = event.axis;
        HEAP32[(((ptr) + (8)) >> 2)] = SDL.joystickAxisValueConversion(event.value);
        break;
      }

     case "focus":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (4)) >> 2)] = 0;
        HEAP8[(ptr) + (8)] = 12;
        break;
      }

     case "blur":
      {
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (4)) >> 2)] = 0;
        HEAP8[(ptr) + (8)] = 13;
        break;
      }

     case "visibilitychange":
      {
        var visibilityEventID = event.visible ? 1 : 2;
        HEAP32[((ptr) >> 2)] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(((ptr) + (4)) >> 2)] = 0;
        HEAP8[(ptr) + (8)] = visibilityEventID;
        break;
      }

     default:
      throw "Unhandled SDL event: " + event.type;
    }
  },
  makeFontString(height, fontName) {
    if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
      // https://developer.mozilla.org/ru/docs/Web/CSS/font-family
      // Font family names containing whitespace should be quoted.
      // BTW, quote all font names is easier than searching spaces
      fontName = '"' + fontName + '"';
    }
    return height + "px " + fontName + ", serif";
  },
  estimateTextWidth(fontData, text) {
    var h = fontData.size;
    var fontString = SDL.makeFontString(h, fontData.name);
    var tempCtx = SDL.ttfContext;
    tempCtx.font = fontString;
    var ret = tempCtx.measureText(text).width | 0;
    return ret;
  },
  allocateChannels(num) {
    // called from Mix_AllocateChannels and init
    if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
    SDL.numChannels = num;
    SDL.channels = [];
    for (var i = 0; i < num; i++) {
      SDL.channels[i] = {
        audio: null,
        volume: 1
      };
    }
  },
  setGetVolume(info, volume) {
    if (!info) return 0;
    var ret = info.volume * 128;
    // MIX_MAX_VOLUME
    if (volume != -1) {
      info.volume = Math.min(Math.max(volume, 0), 128) / 128;
      if (info.audio) {
        try {
          info.audio.volume = info.volume;
          // For <audio> element
          if (info.audio.webAudioGainNode) info.audio.webAudioGainNode["gain"]["value"] = info.volume;
        } // For WebAudio playback
        catch (e) {
          err(`setGetVolume failed to set audio volume: ${e}`);
        }
      }
    }
    return ret;
  },
  setPannerPosition(info, x, y, z) {
    info?.audio?.webAudioPannerNode?.["setPosition"](x, y, z);
  },
  playWebAudio(audio) {
    if (!audio) return;
    if (audio.webAudioNode) return;
    // This instance is already playing, don't start again.
    if (!SDL.webAudioAvailable()) return;
    try {
      var webAudio = audio.resource.webAudio;
      audio.paused = false;
      if (!webAudio.decodedBuffer) {
        if (webAudio.onDecodeComplete === undefined) {
          abort("Cannot play back audio object that was not loaded");
        }
        webAudio.onDecodeComplete.push(() => {
          if (!audio.paused) SDL.playWebAudio(audio);
        });
        return;
      }
      audio.webAudioNode = SDL.audioContext["createBufferSource"]();
      audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
      audio.webAudioNode["loop"] = audio.loop;
      audio.webAudioNode["onended"] = audio["onended"];
      // For <media> element compatibility, route the onended signal to the instance.
      audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
      // avoid Chrome bug
      // If posz = 0, the sound will come from only the right.
      // By posz = -0.5 (slightly ahead), the sound will come from right and left correctly.
      audio.webAudioPannerNode["setPosition"](0, 0, -.5);
      audio.webAudioPannerNode["panningModel"] = "equalpower";
      // Add an intermediate gain node to control volume.
      audio.webAudioGainNode = SDL.audioContext["createGain"]();
      audio.webAudioGainNode["gain"]["value"] = audio.volume;
      audio.webAudioNode["connect"](audio.webAudioPannerNode);
      audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
      audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
      audio.webAudioNode["start"](0, audio.currentPosition);
      audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition;
    } catch (e) {
      err(`playWebAudio failed: ${e}`);
    }
  },
  pauseWebAudio(audio) {
    if (!audio) return;
    if (audio.webAudioNode) {
      try {
        // Remember where we left off, so that if/when we resume, we can
        // restart the playback at a proper place.
        audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
        // Important: When we reach here, the audio playback is stopped by the
        // user. But when calling .stop() below, the Web Audio graph will send
        // the onended signal, but we don't want to process that, since
        // pausing should not clear/destroy the audio channel.
        audio.webAudioNode["onended"] = undefined;
        audio.webAudioNode.stop(0);
        // 0 is a default parameter, but WebKit is confused by it #3861
        audio.webAudioNode = undefined;
      } catch (e) {
        err(`pauseWebAudio failed: ${e}`);
      }
    }
    audio.paused = true;
  },
  openAudioContext() {
    // Initialize Web Audio API if we haven't done so yet. Note: Only
    // initialize Web Audio context ever once on the web page, since
    // initializing multiple times fails on Chrome saying 'audio resources
    // have been exhausted'.
    if (!SDL.audioContext) {
      if (typeof AudioContext != "undefined") {
        SDL.audioContext = new AudioContext;
      } else if (typeof webkitAudioContext != "undefined") {
        SDL.audioContext = new webkitAudioContext;
      }
    }
  },
  webAudioAvailable: () => !!SDL.audioContext,
  fillWebAudioBufferFromHeap(heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
    // The input audio data is interleaved across the channels, i.e. [L, R, L,
    // R, L, R, ...] and is either 8-bit, 16-bit or float as supported by the
    // SDL API. The output audio wave data for Web Audio API must be in planar
    // buffers of [-1,1]-normalized Float32 data, so perform a buffer
    // conversion for the data.
    var audio = SDL.audio;
    var numChannels = audio.channels;
    for (var c = 0; c < numChannels; ++c) {
      var channelData = dstAudioBuffer["getChannelData"](c);
      if (channelData.length != sizeSamplesPerChannel) {
        throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!";
      }
      if (audio.format == 32784) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          channelData[j] = (HEAP16[(((heapPtr) + ((j * numChannels + c) * 2)) >> 1)]) / 32768;
        }
      } else if (audio.format == 8) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          var v = (HEAP8[(heapPtr) + (j * numChannels + c)]);
          channelData[j] = ((v >= 0) ? v - 128 : v + 128) / 128;
        }
      } else if (audio.format == 33056) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          channelData[j] = (HEAPF32[(((heapPtr) + ((j * numChannels + c) * 4)) >> 2)]);
        }
      } else {
        throw "Invalid SDL audio format " + audio.format + "!";
      }
    }
  },
  joystickEventState: 1,
  lastJoystickState: {},
  joystickNamePool: {},
  recordJoystickState(joystick, state) {
    // Standardize button state.
    var buttons = new Array(state.buttons.length);
    for (var i = 0; i < state.buttons.length; i++) {
      buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
    }
    SDL.lastJoystickState[joystick] = {
      buttons,
      axes: state.axes.slice(0),
      timestamp: state.timestamp,
      index: state.index,
      id: state.id
    };
  },
  getJoystickButtonState(button) {
    if (typeof button == "object") {
      // Current gamepad API editor's draft (Firefox Nightly)
      // https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#idl-def-GamepadButton
      return button["pressed"];
    }
    // Current gamepad API working draft (Firefox / Chrome Stable)
    // http://www.w3.org/TR/2012/WD-gamepad-20120529/#gamepad-interface
    return button > 0;
  },
  queryJoysticks() {
    for (var joystick in SDL.lastJoystickState) {
      var state = SDL.getGamepad(joystick - 1);
      var prevState = SDL.lastJoystickState[joystick];
      // If joystick was removed, state returns null.
      if (typeof state == "undefined") return;
      if (state === null) return;
      // Check only if the timestamp has differed.
      // NOTE: Timestamp is not available in Firefox.
      // NOTE: Timestamp is currently not properly set for the GearVR controller
      //       on Samsung Internet: it is always zero.
      if (typeof state.timestamp != "number" || state.timestamp != prevState.timestamp || !state.timestamp) {
        var i;
        for (i = 0; i < state.buttons.length; i++) {
          var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
          // NOTE: The previous state already has a boolean representation of
          //       its button, so no need to standardize its button state here.
          if (buttonState !== prevState.buttons[i]) {
            // Insert button-press event.
            SDL.events.push({
              type: buttonState ? "joystick_button_down" : "joystick_button_up",
              joystick,
              index: joystick - 1,
              button: i
            });
          }
        }
        for (i = 0; i < state.axes.length; i++) {
          if (state.axes[i] !== prevState.axes[i]) {
            // Insert axes-change event.
            SDL.events.push({
              type: "joystick_axis_motion",
              joystick,
              index: joystick - 1,
              axis: i,
              value: state.axes[i]
            });
          }
        }
        SDL.recordJoystickState(joystick, state);
      }
    }
  },
  joystickAxisValueConversion(value) {
    // Make sure value is properly clamped
    value = Math.min(1, Math.max(value, -1));
    // Ensures that 0 is 0, 1 is 32767, and -1 is 32768.
    return Math.ceil(((value + 1) * 32767.5) - 32768);
  },
  getGamepads() {
    var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
    if (fcn !== undefined) {
      // The function must be applied on the navigator object.
      return fcn.apply(navigator);
    }
    return [];
  },
  getGamepad(deviceIndex) {
    var gamepads = SDL.getGamepads();
    if (gamepads.length > deviceIndex && deviceIndex >= 0) {
      return gamepads[deviceIndex];
    }
    return null;
  }
};

var _SDL_InitSubSystem = flags => 0;

var _SDL_JoystickClose = joystick => {
  delete SDL.lastJoystickState[joystick];
};

var _SDL_JoystickEventState = state => {
  if (state < 0) {
    // SDL_QUERY: Return current state.
    return SDL.joystickEventState;
  }
  return SDL.joystickEventState = state;
};

var _SDL_JoystickGetButton = (joystick, button) => {
  var gamepad = SDL.getGamepad(joystick - 1);
  if (gamepad && gamepad.buttons.length > button) {
    return SDL.getJoystickButtonState(gamepad.buttons[button]) ? 1 : 0;
  }
  return 0;
};

var _SDL_JoystickNumAxes = joystick => {
  var gamepad = SDL.getGamepad(joystick - 1);
  if (gamepad) {
    return gamepad.axes.length;
  }
  return 0;
};

var _SDL_JoystickNumButtons = joystick => {
  var gamepad = SDL.getGamepad(joystick - 1);
  if (gamepad) {
    return gamepad.buttons.length;
  }
  return 0;
};

var _SDL_JoystickNumHats = joystick => 0;

var _SDL_JoystickOpen = deviceIndex => {
  var gamepad = SDL.getGamepad(deviceIndex);
  if (gamepad) {
    // Use this as a unique 'pointer' for this joystick.
    var joystick = deviceIndex + 1;
    SDL.recordJoystickState(joystick, gamepad);
    return joystick;
  }
  return 0;
};

var _SDL_JoystickOpened = deviceIndex => SDL.lastJoystickState.hasOwnProperty(deviceIndex + 1) ? 1 : 0;

var _SDL_NumJoysticks = () => {
  var count = 0;
  var gamepads = SDL.getGamepads();
  // The length is not the number of gamepads; check which ones are defined.
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] !== undefined) count++;
  }
  return count;
};

var _SDL_PollEvent = ptr => SDL.pollEvent(ptr);

var _SDL_QuitSubSystem = flags => out("SDL_QuitSubSystem called (and ignored)");

var ___call_sighandler = (fp, sig) => (a1 => dynCall_vi(fp, a1))(sig);

class ExceptionInfo {
  // excPtr - Thrown object pointer to wrap. Metadata pointer is calculated from it.
  constructor(excPtr) {
    this.excPtr = excPtr;
    this.ptr = excPtr - 24;
  }
  set_type(type) {
    HEAPU32[(((this.ptr) + (4)) >> 2)] = type;
  }
  get_type() {
    return HEAPU32[(((this.ptr) + (4)) >> 2)];
  }
  set_destructor(destructor) {
    HEAPU32[(((this.ptr) + (8)) >> 2)] = destructor;
  }
  get_destructor() {
    return HEAPU32[(((this.ptr) + (8)) >> 2)];
  }
  set_caught(caught) {
    caught = caught ? 1 : 0;
    HEAP8[(this.ptr) + (12)] = caught;
  }
  get_caught() {
    return HEAP8[(this.ptr) + (12)] != 0;
  }
  set_rethrown(rethrown) {
    rethrown = rethrown ? 1 : 0;
    HEAP8[(this.ptr) + (13)] = rethrown;
  }
  get_rethrown() {
    return HEAP8[(this.ptr) + (13)] != 0;
  }
  // Initialize native structure fields. Should be called once after allocated.
  init(type, destructor) {
    this.set_adjusted_ptr(0);
    this.set_type(type);
    this.set_destructor(destructor);
  }
  set_adjusted_ptr(adjustedPtr) {
    HEAPU32[(((this.ptr) + (16)) >> 2)] = adjustedPtr;
  }
  get_adjusted_ptr() {
    return HEAPU32[(((this.ptr) + (16)) >> 2)];
  }
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

var ___cxa_throw = (ptr, type, destructor) => {
  var info = new ExceptionInfo(ptr);
  // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  throw exceptionLast;
};

var initRandomFill = () => {
  if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
    // for modern web browsers
    return view => crypto.getRandomValues(view);
  } else if (ENVIRONMENT_IS_NODE) {
    // for nodejs with or without crypto support included
    try {
      var crypto_module = require("crypto");
      var randomFillSync = crypto_module["randomFillSync"];
      if (randomFillSync) {
        // nodejs with LTS crypto support
        return view => crypto_module["randomFillSync"](view);
      }
      // very old nodejs with the original crypto API
      var randomBytes = crypto_module["randomBytes"];
      return view => (view.set(randomBytes(view.byteLength)), // Return the original view to match modern native implementations.
      view);
    } catch (e) {}
  }
  // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
  abort("initRandomDevice");
};

var randomFill = view => (randomFill = initRandomFill())(view);

var PATH_FS = {
  resolve: (...args) => {
    var resolvedPath = "", resolvedAbsolute = false;
    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? args[i] : FS.cwd();
      // Skip empty and invalid entries
      if (typeof path != "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return "";
      }
      // an invalid portion invalidates the whole thing
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).substr(1);
    to = PATH_FS.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (;start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (;end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  }
};

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number=} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.  Also, use the length info to avoid running tiny
  // strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation,
  // so that undefined/NaN means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = "";
  // If building with TextDecoder, we have already computed the string length
  // above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};

var FS_stdin_getChar_buffer = [];

var FS_stdin_getChar = () => {
  if (!FS_stdin_getChar_buffer.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
      // we will read data by chunks of BUFSIZE
      var BUFSIZE = 256;
      var buf = Buffer.alloc(BUFSIZE);
      var bytesRead = 0;
      // For some reason we must suppress a closure warning here, even though
      // fd definitely exists on process.stdin, and is even the proper way to
      // get the fd of stdin,
      // https://github.com/nodejs/help/issues/2136#issuecomment-523649904
      // This started to happen after moving this logic out of library_tty.js,
      // so it is related to the surrounding code in some unclear manner.
      /** @suppress {missingProperties} */ var fd = process.stdin.fd;
      try {
        bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
      } catch (e) {
        // Cross-platform differences: on Windows, reading EOF throws an
        // exception, but on other OSes, reading EOF returns 0. Uniformize
        // behavior by treating the EOF exception to return 0.
        if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
      }
      if (bytesRead > 0) {
        result = buf.slice(0, bytesRead).toString("utf-8");
      }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
      // Browser.
      result = window.prompt("Input: ");
      // returns null on cancel
      if (result !== null) {
        result += "\n";
      }
    } else {}
    if (!result) {
      return null;
    }
    FS_stdin_getChar_buffer = intArrayFromString(result, true);
  }
  return FS_stdin_getChar_buffer.shift();
};

var TTY = {
  ttys: [],
  init() {},
  // https://github.com/emscripten-core/emscripten/pull/1555
  // if (ENVIRONMENT_IS_NODE) {
  //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
  //   // device, it always assumes it's a TTY device. because of this, we're forcing
  //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
  //   // with text files until FS.init can be refactored.
  //   process.stdin.setEncoding('utf8');
  // }
  shutdown() {},
  // https://github.com/emscripten-core/emscripten/pull/1555
  // if (ENVIRONMENT_IS_NODE) {
  //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
  //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
  //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
  //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
  //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
  //   process.stdin.pause();
  // }
  register(dev, ops) {
    TTY.ttys[dev] = {
      input: [],
      output: [],
      ops
    };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close(stream) {
      // flush any pending line data
      stream.tty.ops.fsync(stream.tty);
    },
    fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    },
    read(stream, buffer, offset, length, pos) {
      /* ignored */ if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.atime = Date.now();
      }
      return bytesRead;
    },
    write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.mtime = stream.node.ctime = Date.now();
      }
      return i;
    }
  },
  default_tty_ops: {
    get_char(tty) {
      return FS_stdin_getChar();
    },
    put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    // val == 0 would cut text output off in the middle.
    fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    },
    ioctl_tcgets(tty) {
      // typical setting
      return {
        c_iflag: 25856,
        c_oflag: 5,
        c_cflag: 191,
        c_lflag: 35387,
        c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
      };
    },
    ioctl_tcsets(tty, optional_actions, data) {
      // currently just ignore
      return 0;
    },
    ioctl_tiocgwinsz(tty) {
      return [ 24, 80 ];
    }
  },
  default_tty1_ops: {
    put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    }
  }
};

var zeroMemory = (address, size) => {
  HEAPU8.fill(0, address, address + size);
};

var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;

var mmapAlloc = size => {
  size = alignMemory(size, 65536);
  var ptr = _emscripten_builtin_memalign(65536, size);
  if (ptr) zeroMemory(ptr, size);
  return ptr;
};

var MEMFS = {
  ops_table: null,
  mount(mount) {
    return MEMFS.createNode(null, "/", 16895, 0);
  },
  createNode(parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      // no supported
      throw new FS.ErrnoError(63);
    }
    MEMFS.ops_table ||= {
      dir: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          lookup: MEMFS.node_ops.lookup,
          mknod: MEMFS.node_ops.mknod,
          rename: MEMFS.node_ops.rename,
          unlink: MEMFS.node_ops.unlink,
          rmdir: MEMFS.node_ops.rmdir,
          readdir: MEMFS.node_ops.readdir,
          symlink: MEMFS.node_ops.symlink
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek
        }
      },
      file: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek,
          read: MEMFS.stream_ops.read,
          write: MEMFS.stream_ops.write,
          allocate: MEMFS.stream_ops.allocate,
          mmap: MEMFS.stream_ops.mmap,
          msync: MEMFS.stream_ops.msync
        }
      },
      link: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          readlink: MEMFS.node_ops.readlink
        },
        stream: {}
      },
      chrdev: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: FS.chrdev_stream_ops
      }
    };
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
      // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
      // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
      // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.atime = node.mtime = node.ctime = Date.now();
    // add the new node to the parent
    if (parent) {
      parent.contents[name] = node;
      parent.atime = parent.mtime = parent.ctime = node.atime;
    }
    return node;
  },
  getFileDataAsTypedArray(node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
    // Make sure to not return excess unused bytes.
    return new Uint8Array(node.contents);
  },
  expandFileStorage(node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return;
    // No need to expand, the storage was already large enough.
    // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
    // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
    // avoid overshooting the allocation cap by a very large margin.
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
    // At minimum allocate 256b for each file when expanding.
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity);
    // Allocate new storage.
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  },
  // Copy old data over to the new storage.
  resizeFileStorage(node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      // Fully decommit when requesting a resize to zero.
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize);
      // Allocate new storage.
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
      }
      // Copy old data over to the new storage.
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr(node) {
      var attr = {};
      // device numbers reuse inode numbers.
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.atime);
      attr.mtime = new Date(node.mtime);
      attr.ctime = new Date(node.ctime);
      // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
      //       but this is not required by the standard.
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr(node, attr) {
      for (const key of [ "mode", "atime", "mtime", "ctime" ]) {
        if (attr[key]) {
          node[key] = attr[key];
        }
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup(parent, name) {
      throw MEMFS.doesNotExistError;
    },
    mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename(old_node, new_dir, new_name) {
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (new_node) {
        if (FS.isDir(old_node.mode)) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
        FS.hashRemoveNode(new_node);
      }
      // do the internal rewiring
      delete old_node.parent.contents[old_node.name];
      new_dir.contents[new_name] = old_node;
      old_node.name = new_name;
      new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
    },
    unlink(parent, name) {
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    readdir(node) {
      return [ ".", "..", ...Object.keys(node.contents) ];
    },
    symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    }
  },
  stream_ops: {
    read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        // non-trivial, and typed array
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write(stream, buffer, offset, length, position, canOwn) {
      // If the buffer is located in main memory (HEAP), and if
      // memory can grow, we can't hold on to references of the
      // memory buffer, as they may get invalidated. That means we
      // need to do copy its contents.
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.mtime = node.ctime = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        // This write is from a typed array to a typed array?
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          // Writing to an already allocated and used subrange of the file?
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        // Use typed array write which is available.
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    allocate(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      // Only make a new copy when MAP_PRIVATE is specified.
      if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
        // We can't emulate MAP_SHARED when the file is not backed by the
        // buffer we're mapping to (e.g. the HEAP buffer).
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          // Try to avoid unnecessary slices.
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          HEAP8.set(contents, ptr);
        }
      }
      return {
        ptr,
        allocated
      };
    },
    msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      // should we check if bytesWritten and length are the same?
      return 0;
    }
  }
};

var asyncLoad = async url => {
  var arrayBuffer = await readAsync(url);
  return new Uint8Array(arrayBuffer);
};

var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
  FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
};

var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
  // Ensure plugins are ready.
  if (typeof Browser != "undefined") Browser.init();
  var handled = false;
  preloadPlugins.forEach(plugin => {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
      plugin["handle"](byteArray, fullname, finish, onerror);
      handled = true;
    }
  });
  return handled;
};

var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
  // TODO we should allow people to just pass in a complete filename instead
  // of parent and name being that we just join them anyways
  var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency(`cp ${fullname}`);
  // might have several active requests for the same fullname
  function processData(byteArray) {
    function finish(byteArray) {
      preFinish?.();
      if (!dontCreateFile) {
        FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
      }
      onload?.();
      removeRunDependency(dep);
    }
    if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
      onerror?.();
      removeRunDependency(dep);
    })) {
      return;
    }
    finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
    asyncLoad(url).then(processData, onerror);
  } else {
    processData(url);
  }
};

var FS_modeStringToFlags = str => {
  var flagModes = {
    "r": 0,
    "r+": 2,
    "w": 512 | 64 | 1,
    "w+": 512 | 64 | 2,
    "a": 1024 | 64 | 1,
    "a+": 1024 | 64 | 2
  };
  var flags = flagModes[str];
  if (typeof flags == "undefined") {
    throw new Error(`Unknown file open mode: ${str}`);
  }
  return flags;
};

var FS_getMode = (canRead, canWrite) => {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
};

var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  ErrnoError: class {
    name="ErrnoError";
    // We set the `name` property to be able to identify `FS.ErrnoError`
    // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
    // - when using PROXYFS, an error can come from an underlying FS
    // as different FS objects have their own FS.ErrnoError each,
    // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
    // we'll use the reliable test `err.name == "ErrnoError"` instead
    constructor(errno) {
      this.errno = errno;
    }
  },
  filesystems: null,
  syncFSRequests: 0,
  readFiles: {},
  FSStream: class {
    shared={};
    get object() {
      return this.node;
    }
    set object(val) {
      this.node = val;
    }
    get isRead() {
      return (this.flags & 2097155) !== 1;
    }
    get isWrite() {
      return (this.flags & 2097155) !== 0;
    }
    get isAppend() {
      return (this.flags & 1024);
    }
    get flags() {
      return this.shared.flags;
    }
    set flags(val) {
      this.shared.flags = val;
    }
    get position() {
      return this.shared.position;
    }
    set position(val) {
      this.shared.position = val;
    }
  },
  FSNode: class {
    node_ops={};
    stream_ops={};
    readMode=292 | 73;
    writeMode=146;
    mounted=null;
    constructor(parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      // root node sets parent to itself
      this.parent = parent;
      this.mount = parent.mount;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.rdev = rdev;
      this.atime = this.mtime = this.ctime = Date.now();
    }
    get read() {
      return (this.mode & this.readMode) === this.readMode;
    }
    set read(val) {
      val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
    }
    get write() {
      return (this.mode & this.writeMode) === this.writeMode;
    }
    set write(val) {
      val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
    }
    get isFolder() {
      return FS.isDir(this.mode);
    }
    get isDevice() {
      return FS.isChrdev(this.mode);
    }
  },
  lookupPath(path, opts = {}) {
    if (!path) return {
      path: "",
      node: null
    };
    opts.follow_mount ??= true;
    if (!PATH.isAbs(path)) {
      path = FS.cwd() + "/" + path;
    }
    // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
    linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
      // split the absolute path
      var parts = path.split("/").filter(p => !!p && (p !== "."));
      // start at the root
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = (i === parts.length - 1);
        if (islast && opts.parent) {
          // stop resolving
          break;
        }
        if (parts[i] === "..") {
          current_path = PATH.dirname(current_path);
          current = current.parent;
          continue;
        }
        current_path = PATH.join2(current_path, parts[i]);
        try {
          current = FS.lookupNode(current, parts[i]);
        } catch (e) {
          // if noent_okay is true, suppress a ENOENT in the last component
          // and return an object with an undefined node. This is needed for
          // resolving symlinks in the path when creating a file.
          if ((e?.errno === 44) && islast && opts.noent_okay) {
            return {
              path: current_path
            };
          }
          throw e;
        }
        // jump to the mount's root node if this is a mountpoint
        if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
          current = current.mounted.root;
        }
        // by default, lookupPath will not follow a symlink if it is the final path component.
        // setting opts.follow = true will override this behavior.
        if (FS.isLink(current.mode) && (!islast || opts.follow)) {
          if (!current.node_ops.readlink) {
            throw new FS.ErrnoError(52);
          }
          var link = current.node_ops.readlink(current);
          if (!PATH.isAbs(link)) {
            link = PATH.dirname(current_path) + "/" + link;
          }
          path = link + "/" + parts.slice(i + 1).join("/");
          continue linkloop;
        }
      }
      return {
        path: current_path,
        node: current
      };
    }
    throw new FS.ErrnoError(32);
  },
  getPath(node) {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
      }
      path = path ? `${node.name}/${path}` : node.name;
      node = node.parent;
    }
  },
  hashName(parentid, name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode(parent, name) {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    // if we failed to find it in the cache, call into the VFS
    return FS.lookup(parent, name);
  },
  createNode(parent, name, mode, rdev) {
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode(node) {
    FS.hashRemoveNode(node);
  },
  isRoot(node) {
    return node === node.parent;
  },
  isMountpoint(node) {
    return !!node.mounted;
  },
  isFile(mode) {
    return (mode & 61440) === 32768;
  },
  isDir(mode) {
    return (mode & 61440) === 16384;
  },
  isLink(mode) {
    return (mode & 61440) === 40960;
  },
  isChrdev(mode) {
    return (mode & 61440) === 8192;
  },
  isBlkdev(mode) {
    return (mode & 61440) === 24576;
  },
  isFIFO(mode) {
    return (mode & 61440) === 4096;
  },
  isSocket(mode) {
    return (mode & 49152) === 49152;
  },
  flagsToPermissionString(flag) {
    var perms = [ "r", "w", "rw" ][flag & 3];
    if ((flag & 512)) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions(node, perms) {
    if (FS.ignorePermissions) {
      return 0;
    }
    // return 0 if any user, group or owner bits are set.
    if (perms.includes("r") && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes("w") && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes("x") && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup(dir) {
    if (!FS.isDir(dir.mode)) return 54;
    var errCode = FS.nodePermissions(dir, "x");
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate(dir, name) {
    if (!FS.isDir(dir.mode)) {
      return 54;
    }
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete(dir, name, isdir) {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, "wx");
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen(node, flags) {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== "r" || // opening for write
      (flags & 512)) {
        // TODO: check for O_SEARCH? (== search for dir only)
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd() {
    for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStreamChecked(fd) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    return stream;
  },
  getStream: fd => FS.streams[fd],
  createStream(stream, fd = -1) {
    // clone it, so we can return an instance of FSStream
    stream = Object.assign(new FS.FSStream, stream);
    if (fd == -1) {
      fd = FS.nextfd();
    }
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream(fd) {
    FS.streams[fd] = null;
  },
  dupStream(origStream, fd = -1) {
    var stream = FS.createStream(origStream, fd);
    stream.stream_ops?.dup?.(stream);
    return stream;
  },
  chrdev_stream_ops: {
    open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      // override node's stream ops with the device's
      stream.stream_ops = device.stream_ops;
      // forward the open call
      stream.stream_ops.open?.(stream);
    },
    llseek() {
      throw new FS.ErrnoError(70);
    }
  },
  major: dev => ((dev) >> 8),
  minor: dev => ((dev) & 255),
  makedev: (ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
    FS.devices[dev] = {
      stream_ops: ops
    };
  },
  getDevice: dev => FS.devices[dev],
  getMounts(mount) {
    var mounts = [];
    var check = [ mount ];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push(...m.mounts);
    }
    return mounts;
  },
  syncfs(populate, callback) {
    if (typeof populate == "function") {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    // sync all mounts
    mounts.forEach(mount => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount(type, opts, mountpoint) {
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, {
        follow_mount: false
      });
      mountpoint = lookup.path;
      // use the absolute path
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = {
      type,
      opts,
      mountpoint,
      mounts: []
    };
    // create a root node for the fs
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      // set as a mountpoint
      node.mounted = mount;
      // add the new mount to the current mount's children
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount(mountpoint) {
    var lookup = FS.lookupPath(mountpoint, {
      follow_mount: false
    });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    // destroy the nodes for this mount, and all its child mounts
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach(hash => {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    // no longer a mountpoint
    node.mounted = null;
    // remove this mount from the child mounts
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup(parent, name) {
    return parent.node_ops.lookup(parent, name);
  },
  mknod(path, mode, dev) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === "." || name === "..") {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  statfs(path) {
    // NOTE: None of the defaults here are true. We're just returning safe and
    //       sane values.
    var rtn = {
      bsize: 4096,
      frsize: 4096,
      blocks: 1e6,
      bfree: 5e5,
      bavail: 5e5,
      files: FS.nextInode,
      ffree: FS.nextInode - 1,
      fsid: 42,
      flags: 2,
      namelen: 255
    };
    var parent = FS.lookupPath(path, {
      follow: true
    }).node;
    if (parent?.node_ops.statfs) {
      Object.assign(rtn, parent.node_ops.statfs(parent.mount.opts.root));
    }
    return rtn;
  },
  create(path, mode = 438) {
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir(path, mode = 511) {
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree(path, mode) {
    var dirs = path.split("/");
    var d = "";
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += "/" + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev(path, mode, dev) {
    if (typeof dev == "undefined") {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink(oldpath, newpath) {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename(old_path, new_path) {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    // parents must exist
    var lookup, old_dir, new_dir;
    // let the errors from non existent directories percolate up
    lookup = FS.lookupPath(old_path, {
      parent: true
    });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, {
      parent: true
    });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    // need to be part of the same mount
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    // source must exist
    var old_node = FS.lookupNode(old_dir, old_name);
    // old path should not be an ancestor of the new path
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(28);
    }
    // new path should not be an ancestor of the old path
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(55);
    }
    // see if the new path already exists
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    // early out if nothing needs to change
    if (old_node === new_node) {
      return;
    }
    // we'll need to delete the old entry
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    // need delete permissions if we'll be overwriting.
    // need create permissions if new doesn't already exist.
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    // if we are going to change the parent, check write permissions
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // remove the node from the lookup hash
    FS.hashRemoveNode(old_node);
    // do the underlying fs rename
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
      // update old node (we do this here to avoid each backend
      // needing to)
      old_node.parent = new_dir;
    } catch (e) {
      throw e;
    } finally {
      // add the node back to the hash (in case node_ops.rename
      // changed its name)
      FS.hashAddNode(old_node);
    }
  },
  rmdir(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54);
    }
    return node.node_ops.readdir(node);
  },
  unlink(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      // According to POSIX, we should map EISDIR to EPERM, but
      // we instead do what Linux does (and we must, as we use
      // the musl linux libc).
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink(path) {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return link.node_ops.readlink(link);
  },
  stat(path, dontFollow) {
    var lookup = FS.lookupPath(path, {
      follow: !dontFollow
    });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63);
    }
    return node.node_ops.getattr(node);
  },
  lstat(path) {
    return FS.stat(path, true);
  },
  chmod(path, mode, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      ctime: Date.now()
    });
  },
  lchmod(path, mode) {
    FS.chmod(path, mode, true);
  },
  fchmod(fd, mode) {
    var stream = FS.getStreamChecked(fd);
    FS.chmod(stream.node, mode);
  },
  chown(path, uid, gid, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      timestamp: Date.now()
    });
  },
  // we ignore the uid / gid for now
  lchown(path, uid, gid) {
    FS.chown(path, uid, gid, true);
  },
  fchown(fd, uid, gid) {
    var stream = FS.getStreamChecked(fd);
    FS.chown(stream.node, uid, gid);
  },
  truncate(path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: true
      });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, "w");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    node.node_ops.setattr(node, {
      size: len,
      timestamp: Date.now()
    });
  },
  ftruncate(fd, len) {
    var stream = FS.getStreamChecked(fd);
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.truncate(stream.node, len);
  },
  utime(path, atime, mtime) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    node.node_ops.setattr(node, {
      atime,
      mtime
    });
  },
  open(path, flags, mode = 438) {
    if (path === "") {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
    if ((flags & 64)) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path == "object") {
      node = path;
    } else {
      // noent_okay makes it so that if the final component of the path
      // doesn't exist, lookupPath returns `node: undefined`. `path` will be
      // updated to point to the target of all symlinks.
      var lookup = FS.lookupPath(path, {
        follow: !(flags & 131072),
        noent_okay: true
      });
      node = lookup.node;
      path = lookup.path;
    }
    // perhaps we need to create the node
    var created = false;
    if ((flags & 64)) {
      if (node) {
        // if O_CREAT and O_EXCL are set, error out if the node already exists
        if ((flags & 128)) {
          throw new FS.ErrnoError(20);
        }
      } else {
        // node doesn't exist, try to create it
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    // can't truncate a device
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    // if asked only for a directory, then this must be one
    if ((flags & 65536) && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    // check permissions, if this is not a file we just created now (it is ok to
    // create and write to a file with read-only permissions; it is read-only
    // for later use)
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // do truncation if necessary
    if ((flags & 512) && !created) {
      FS.truncate(node, 0);
    }
    // we've already handled these, don't pass down to the underlying vfs
    flags &= ~(128 | 512 | 131072);
    // register the stream with the filesystem
    var stream = FS.createStream({
      node,
      path: FS.getPath(node),
      // we want the absolute path to the node
      flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      // used by the file family libc calls (fopen, fwrite, ferror, etc.)
      ungotten: [],
      error: false
    });
    // call the new stream's open function
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module["logReadFiles"] && !(flags & 1)) {
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close(stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    // free readdir state
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed(stream) {
    return stream.fd === null;
  },
  llseek(stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read(stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write(stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      // seek to the end before writing in append mode
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  allocate(stream, offset, length) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap(stream, length, position, prot, flags) {
    // User requests writing to file (prot & PROT_WRITE != 0).
    // Checking if we have permissions to write to the file unless
    // MAP_PRIVATE flag is set. According to POSIX spec it is possible
    // to write to file opened in read-only mode with MAP_PRIVATE flag,
    // as all modifications will be visible only in the memory of
    // the current process.
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    if (!length) {
      throw new FS.ErrnoError(28);
    }
    return stream.stream_ops.mmap(stream, length, position, prot, flags);
  },
  msync(stream, buffer, offset, length, mmapFlags) {
    if (!stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  ioctl(stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile(path, opts = {}) {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      throw new Error(`Invalid encoding type "${opts.encoding}"`);
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      ret = UTF8ArrayToString(buf);
    } else if (opts.encoding === "binary") {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile(path, data, opts = {}) {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data == "string") {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error("Unsupported data type");
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, "x");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories() {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices() {
    // create /dev
    FS.mkdir("/dev");
    // setup /dev/null
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
      llseek: () => 0
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    // setup /dev/tty and /dev/tty1
    // stderr needs to print output using err() rather than out()
    // so we register a second tty just for it.
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    // setup /dev/[u]random
    // use a buffer to avoid overhead of individual crypto calls per byte
    var randomBuffer = new Uint8Array(1024), randomLeft = 0;
    var randomByte = () => {
      if (randomLeft === 0) {
        randomLeft = randomFill(randomBuffer).byteLength;
      }
      return randomBuffer[--randomLeft];
    };
    FS.createDevice("/dev", "random", randomByte);
    FS.createDevice("/dev", "urandom", randomByte);
    // we're not going to emulate the actual shm device,
    // just create the tmp dirs that reside in it commonly
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories() {
    // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
    // name of the stream for fd 6 (see test_unistd_ttyname)
    FS.mkdir("/proc");
    var proc_self = FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount({
      mount() {
        var node = FS.createNode(proc_self, "fd", 16895, 73);
        node.stream_ops = {
          llseek: MEMFS.stream_ops.llseek
        };
        node.node_ops = {
          lookup(parent, name) {
            var fd = +name;
            var stream = FS.getStreamChecked(fd);
            var ret = {
              parent: null,
              mount: {
                mountpoint: "fake"
              },
              node_ops: {
                readlink: () => stream.path
              },
              id: fd + 1
            };
            ret.parent = ret;
            // make it look like a simple root node
            return ret;
          },
          readdir() {
            return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString());
          }
        };
        return node;
      }
    }, {}, "/proc/self/fd");
  },
  createStandardStreams(input, output, error) {
    // TODO deprecate the old functionality of a single
    // input / output callback and that utilizes FS.createDevice
    // and instead require a unique set of stream ops
    // by default, we symlink the standard streams to the
    // default tty devices. however, if the standard streams
    // have been overwritten we create a unique device for
    // them instead.
    if (input) {
      FS.createDevice("/dev", "stdin", input);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (output) {
      FS.createDevice("/dev", "stdout", null, output);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (error) {
      FS.createDevice("/dev", "stderr", null, error);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }
    // open default streams for the stdin, stdout and stderr devices
    var stdin = FS.open("/dev/stdin", 0);
    var stdout = FS.open("/dev/stdout", 1);
    var stderr = FS.open("/dev/stderr", 1);
  },
  staticInit() {
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, "/");
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = {
      "MEMFS": MEMFS
    };
  },
  init(input, output, error) {
    FS.initialized = true;
    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    input ??= Module["stdin"];
    output ??= Module["stdout"];
    error ??= Module["stderr"];
    FS.createStandardStreams(input, output, error);
  },
  quit() {
    FS.initialized = false;
    // force-flush all streams, so we get musl std streams printed out
    // close all of our streams
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  findObject(path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (!ret.exists) {
      return null;
    }
    return ret.object;
  },
  analyzePath(path, dontResolveLastLink) {
    // operate from within the context of the symlink's target
    try {
      var lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    };
    try {
      var lookup = FS.lookupPath(path, {
        parent: true
      });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath(parent, path, canRead, canWrite) {
    parent = typeof parent == "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {}
      // ignore EEXIST
      parent = current;
    }
    return current;
  },
  createFile(parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
    var path = name;
    if (parent) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS_getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data == "string") {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
        data = arr;
      }
      // make sure we can write to the file
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
  },
  createDevice(parent, name, input, output) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(!!input, !!output);
    FS.createDevice.major ??= 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    // Create a fake device that a set of stream ops to emulate
    // the old behavior.
    FS.registerDevice(dev, {
      open(stream) {
        stream.seekable = false;
      },
      close(stream) {
        // flush any pending line data
        if (output?.buffer?.length) {
          output(10);
        }
      },
      read(stream, buffer, offset, length, pos) {
        /* ignored */ var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.atime = Date.now();
        }
        return bytesRead;
      },
      write(stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.mtime = stream.node.ctime = Date.now();
        }
        return i;
      }
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile(obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest != "undefined") {
      throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      // Command-line.
      try {
        obj.contents = readBinary(obj.url);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    }
  },
  createLazyFile(parent, name, url, canRead, canWrite) {
    // Lazy chunked Uint8Array (implements get and length from Uint8Array).
    // Actual getting is abstracted away for eventual reuse.
    class LazyUint8Array {
      lengthKnown=false;
      chunks=[];
      // Loaded chunks. Index is the chunk number
      get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = (idx / this.chunkSize) | 0;
        return this.getter(chunkNum)[chunkOffset];
      }
      setDataGetter(getter) {
        this.getter = getter;
      }
      cacheLength() {
        // Find length
        var xhr = new XMLHttpRequest;
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        // Chunk size in bytes
        if (!hasByteServing) chunkSize = datalength;
        // Function to get a range from the remote URL.
        var doXHR = (from, to) => {
          if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
          if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, false);
          if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
          // Some hints to the browser that we want binary data.
          xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(/** @type{Array<number>} */ (xhr.response || []));
          }
          return intArrayFromString(xhr.responseText || "", true);
        };
        var lazyArray = this;
        lazyArray.setDataGetter(chunkNum => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          // including this byte
          end = Math.min(end, datalength - 1);
          // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
          chunkSize = datalength = 1;
          // this will force getter(0)/doXHR do download the whole file
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      }
      get length() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._length;
      }
      get chunkSize() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._chunkSize;
      }
    }
    if (typeof XMLHttpRequest != "undefined") {
      if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      var lazyArray = new LazyUint8Array;
      var properties = {
        isDevice: false,
        contents: lazyArray
      };
    } else {
      var properties = {
        isDevice: false,
        url
      };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    // This is a total hack, but I want to get this lazy file code out of the
    // core of MEMFS. If we want to keep this lazy file concept I feel it should
    // be its own thin LAZYFS proxying calls to MEMFS.
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    // Add a function that defers querying the file size until it is asked the first time.
    Object.defineProperties(node, {
      usedBytes: {
        get: function() {
          return this.contents.length;
        }
      }
    });
    // override each stream op with one that tries to force load the lazy file first
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach(key => {
      var fn = node.stream_ops[key];
      stream_ops[key] = (...args) => {
        FS.forceLoadFile(node);
        return fn(...args);
      };
    });
    function writeChunks(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        // normal array
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          // LazyUint8Array from sync binary XHR
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    }
    // use a custom read function
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      return writeChunks(stream, buffer, offset, length, position);
    };
    // use a custom mmap function
    stream_ops.mmap = (stream, length, position, prot, flags) => {
      FS.forceLoadFile(node);
      var ptr = mmapAlloc(length);
      if (!ptr) {
        throw new FS.ErrnoError(48);
      }
      writeChunks(stream, HEAP8, ptr, length, position);
      return {
        ptr,
        allocated: true
      };
    };
    node.stream_ops = stream_ops;
    return node;
  }
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";

var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  calculateAt(dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    // relative path
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = SYSCALLS.getStreamFromFD(dirfd);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return dir + "/" + path;
  },
  doStat(func, path, buf) {
    var stat = func(path);
    HEAP32[((buf) >> 2)] = stat.dev;
    HEAP32[(((buf) + (4)) >> 2)] = stat.mode;
    HEAPU32[(((buf) + (8)) >> 2)] = stat.nlink;
    HEAP32[(((buf) + (12)) >> 2)] = stat.uid;
    HEAP32[(((buf) + (16)) >> 2)] = stat.gid;
    HEAP32[(((buf) + (20)) >> 2)] = stat.rdev;
    (tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((buf) + (24)) >> 2)] = tempI64[0], HEAP32[(((buf) + (28)) >> 2)] = tempI64[1]);
    HEAP32[(((buf) + (32)) >> 2)] = 4096;
    HEAP32[(((buf) + (36)) >> 2)] = stat.blocks;
    var atime = stat.atime.getTime();
    var mtime = stat.mtime.getTime();
    var ctime = stat.ctime.getTime();
    (tempI64 = [ Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), 
    (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((buf) + (40)) >> 2)] = tempI64[0], HEAP32[(((buf) + (44)) >> 2)] = tempI64[1]);
    HEAPU32[(((buf) + (48)) >> 2)] = (atime % 1e3) * 1e3 * 1e3;
    (tempI64 = [ Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), 
    (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((buf) + (56)) >> 2)] = tempI64[0], HEAP32[(((buf) + (60)) >> 2)] = tempI64[1]);
    HEAPU32[(((buf) + (64)) >> 2)] = (mtime % 1e3) * 1e3 * 1e3;
    (tempI64 = [ Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), 
    (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((buf) + (72)) >> 2)] = tempI64[0], HEAP32[(((buf) + (76)) >> 2)] = tempI64[1]);
    HEAPU32[(((buf) + (80)) >> 2)] = (ctime % 1e3) * 1e3 * 1e3;
    (tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((buf) + (88)) >> 2)] = tempI64[0], HEAP32[(((buf) + (92)) >> 2)] = tempI64[1]);
    return 0;
  },
  doMsync(addr, stream, len, flags, offset) {
    if (!FS.isFile(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (flags & 2) {
      // MAP_PRIVATE calls need not to be synced back to underlying fs
      return 0;
    }
    var buffer = HEAPU8.slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  getStreamFromFD(fd) {
    var stream = FS.getStreamChecked(fd);
    return stream;
  },
  varargs: undefined,
  getStr(ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  }
};

var ___syscall__newselect = function(nfds, readfds, writefds, exceptfds, timeout) {
  try {
    // readfds are supported,
    // writefds checks socket open status
    // exceptfds are supported, although on web, such exceptional conditions never arise in web sockets
    //                          and so the exceptfds list will always return empty.
    // timeout is supported, although on SOCKFS and PIPEFS these are ignored and always treated as 0 - fully async
    var total = 0;
    var srcReadLow = (readfds ? HEAP32[((readfds) >> 2)] : 0), srcReadHigh = (readfds ? HEAP32[(((readfds) + (4)) >> 2)] : 0);
    var srcWriteLow = (writefds ? HEAP32[((writefds) >> 2)] : 0), srcWriteHigh = (writefds ? HEAP32[(((writefds) + (4)) >> 2)] : 0);
    var srcExceptLow = (exceptfds ? HEAP32[((exceptfds) >> 2)] : 0), srcExceptHigh = (exceptfds ? HEAP32[(((exceptfds) + (4)) >> 2)] : 0);
    var dstReadLow = 0, dstReadHigh = 0;
    var dstWriteLow = 0, dstWriteHigh = 0;
    var dstExceptLow = 0, dstExceptHigh = 0;
    var allLow = (readfds ? HEAP32[((readfds) >> 2)] : 0) | (writefds ? HEAP32[((writefds) >> 2)] : 0) | (exceptfds ? HEAP32[((exceptfds) >> 2)] : 0);
    var allHigh = (readfds ? HEAP32[(((readfds) + (4)) >> 2)] : 0) | (writefds ? HEAP32[(((writefds) + (4)) >> 2)] : 0) | (exceptfds ? HEAP32[(((exceptfds) + (4)) >> 2)] : 0);
    var check = (fd, low, high, val) => fd < 32 ? (low & val) : (high & val);
    for (var fd = 0; fd < nfds; fd++) {
      var mask = 1 << (fd % 32);
      if (!(check(fd, allLow, allHigh, mask))) {
        continue;
      }
      // index isn't in the set
      var stream = SYSCALLS.getStreamFromFD(fd);
      var flags = SYSCALLS.DEFAULT_POLLMASK;
      if (stream.stream_ops.poll) {
        var timeoutInMillis = -1;
        if (timeout) {
          // select(2) is declared to accept "struct timeval { time_t tv_sec; suseconds_t tv_usec; }".
          // However, musl passes the two values to the syscall as an array of long values.
          // Note that sizeof(time_t) != sizeof(long) in wasm32. The former is 8, while the latter is 4.
          // This means using "C_STRUCTS.timeval.tv_usec" leads to a wrong offset.
          // So, instead, we use POINTER_SIZE.
          var tv_sec = (readfds ? HEAP32[((timeout) >> 2)] : 0), tv_usec = (readfds ? HEAP32[(((timeout) + (4)) >> 2)] : 0);
          timeoutInMillis = (tv_sec + tv_usec / 1e6) * 1e3;
        }
        flags = stream.stream_ops.poll(stream, timeoutInMillis);
      }
      if ((flags & 1) && check(fd, srcReadLow, srcReadHigh, mask)) {
        fd < 32 ? (dstReadLow = dstReadLow | mask) : (dstReadHigh = dstReadHigh | mask);
        total++;
      }
      if ((flags & 4) && check(fd, srcWriteLow, srcWriteHigh, mask)) {
        fd < 32 ? (dstWriteLow = dstWriteLow | mask) : (dstWriteHigh = dstWriteHigh | mask);
        total++;
      }
      if ((flags & 2) && check(fd, srcExceptLow, srcExceptHigh, mask)) {
        fd < 32 ? (dstExceptLow = dstExceptLow | mask) : (dstExceptHigh = dstExceptHigh | mask);
        total++;
      }
    }
    if (readfds) {
      HEAP32[((readfds) >> 2)] = dstReadLow;
      HEAP32[(((readfds) + (4)) >> 2)] = dstReadHigh;
    }
    if (writefds) {
      HEAP32[((writefds) >> 2)] = dstWriteLow;
      HEAP32[(((writefds) + (4)) >> 2)] = dstWriteHigh;
    }
    if (exceptfds) {
      HEAP32[((exceptfds) >> 2)] = dstExceptLow;
      HEAP32[(((exceptfds) + (4)) >> 2)] = dstExceptHigh;
    }
    return total;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
};

function ___syscall_chdir(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.chdir(path);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_chmod(path, mode) {
  try {
    path = SYSCALLS.getStr(path);
    FS.chmod(path, mode);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_dup(fd) {
  try {
    var old = SYSCALLS.getStreamFromFD(fd);
    return FS.dupStream(old).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_dup3(fd, newfd, flags) {
  try {
    var old = SYSCALLS.getStreamFromFD(fd);
    if (old.fd === newfd) return -28;
    // Check newfd is within range of valid open file descriptors.
    if (newfd < 0 || newfd >= FS.MAX_OPEN_FDS) return -8;
    var existing = FS.getStream(newfd);
    if (existing) FS.close(existing);
    return FS.dupStream(old, newfd).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_faccessat(dirfd, path, amode, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (amode & ~7) {
      // need a valid mode
      return -28;
    }
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    if (!node) {
      return -44;
    }
    var perms = "";
    if (amode & 4) perms += "r";
    if (amode & 2) perms += "w";
    if (amode & 1) perms += "x";
    if (perms && /* otherwise, they've just passed F_OK */ FS.nodePermissions(node, perms)) {
      return -2;
    }
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fchdir(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.chdir(stream.path);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fchmod(fd, mode) {
  try {
    FS.fchmod(fd, mode);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fchmodat2(dirfd, path, mode, flags) {
  try {
    var nofollow = flags & 256;
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    FS.chmod(path, mode, nofollow);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fchown32(fd, owner, group) {
  try {
    FS.fchown(fd, owner, group);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fchownat(dirfd, path, owner, group, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    flags = flags & (~256);
    path = SYSCALLS.calculateAt(dirfd, path);
    (nofollow ? FS.lchown : FS.chown)(path, owner, group);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

/** @suppress {duplicate } */ var syscallGetVarargI = () => {
  // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
  var ret = HEAP32[((+SYSCALLS.varargs) >> 2)];
  SYSCALLS.varargs += 4;
  return ret;
};

var syscallGetVarargP = syscallGetVarargI;

function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
     case 0:
      {
        var arg = syscallGetVarargI();
        if (arg < 0) {
          return -28;
        }
        while (FS.streams[arg]) {
          arg++;
        }
        var newStream;
        newStream = FS.dupStream(stream, arg);
        return newStream.fd;
      }

     case 1:
     case 2:
      return 0;

     // FD_CLOEXEC makes no sense for a single process.
      case 3:
      return stream.flags;

     case 4:
      {
        var arg = syscallGetVarargI();
        stream.flags |= arg;
        return 0;
      }

     case 12:
      {
        var arg = syscallGetVarargP();
        var offset = 0;
        // We're always unlocked.
        HEAP16[(((arg) + (offset)) >> 1)] = 2;
        return 0;
      }

     case 13:
     case 14:
      return 0;
    }
    // Pretend that the locking is successful.
    return -28;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fdatasync(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return 0;
  } // we can't do anything synchronously; the in-memory FS is already synced to
  catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fstat64(fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_statfs64(path, size, buf) {
  try {
    var stats = FS.statfs(SYSCALLS.getStr(path));
    HEAP32[(((buf) + (4)) >> 2)] = stats.bsize;
    HEAP32[(((buf) + (40)) >> 2)] = stats.bsize;
    HEAP32[(((buf) + (8)) >> 2)] = stats.blocks;
    HEAP32[(((buf) + (12)) >> 2)] = stats.bfree;
    HEAP32[(((buf) + (16)) >> 2)] = stats.bavail;
    HEAP32[(((buf) + (20)) >> 2)] = stats.files;
    HEAP32[(((buf) + (24)) >> 2)] = stats.ffree;
    HEAP32[(((buf) + (28)) >> 2)] = stats.fsid;
    HEAP32[(((buf) + (44)) >> 2)] = stats.flags;
    // ST_NOSUID
    HEAP32[(((buf) + (36)) >> 2)] = stats.namelen;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fstatfs64(fd, size, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return ___syscall_statfs64(0, size, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var convertI32PairToI53Checked = (lo, hi) => ((hi + 2097152) >>> 0 < 4194305 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;

function ___syscall_ftruncate64(fd, length_low, length_high) {
  var length = convertI32PairToI53Checked(length_low, length_high);
  try {
    if (isNaN(length)) return 61;
    FS.ftruncate(fd, length);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);

function ___syscall_getcwd(buf, size) {
  try {
    if (size === 0) return -28;
    var cwd = FS.cwd();
    var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
    if (size < cwdLengthInBytes) return -68;
    stringToUTF8(cwd, buf, size);
    return cwdLengthInBytes;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_getdents64(fd, dirp, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    stream.getdents ||= FS.readdir(stream.path);
    var struct_size = 280;
    var pos = 0;
    var off = FS.llseek(stream, 0, 1);
    var startIdx = Math.floor(off / struct_size);
    var endIdx = Math.min(stream.getdents.length, startIdx + Math.floor(count / struct_size));
    for (var idx = startIdx; idx < endIdx; idx++) {
      var id;
      var type;
      var name = stream.getdents[idx];
      if (name === ".") {
        id = stream.node.id;
        type = 4;
      } else // DT_DIR
      if (name === "..") {
        var lookup = FS.lookupPath(stream.path, {
          parent: true
        });
        id = lookup.node.id;
        type = 4;
      } else // DT_DIR
      {
        var child;
        try {
          child = FS.lookupNode(stream.node, name);
        } catch (e) {
          // If the entry is not a directory, file, or symlink, nodefs
          // lookupNode will raise EINVAL. Skip these and continue.
          if (e?.errno === 28) {
            continue;
          }
          throw e;
        }
        id = child.id;
        type = FS.isChrdev(child.mode) ? 2 : // DT_CHR, character device.
        FS.isDir(child.mode) ? 4 : // DT_DIR, directory.
        FS.isLink(child.mode) ? 10 : // DT_LNK, symbolic link.
        8;
      }
      // DT_REG, regular file.
      (tempI64 = [ id >>> 0, (tempDouble = id, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
      HEAP32[((dirp + pos) >> 2)] = tempI64[0], HEAP32[(((dirp + pos) + (4)) >> 2)] = tempI64[1]);
      (tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, 
      (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
      HEAP32[(((dirp + pos) + (8)) >> 2)] = tempI64[0], HEAP32[(((dirp + pos) + (12)) >> 2)] = tempI64[1]);
      HEAP16[(((dirp + pos) + (16)) >> 1)] = 280;
      HEAP8[(dirp + pos) + (18)] = type;
      stringToUTF8(name, dirp + pos + 19, 256);
      pos += struct_size;
    }
    FS.llseek(stream, idx * struct_size, 0);
    return pos;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
     case 21509:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     case 21505:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcgets) {
          var termios = stream.tty.ops.ioctl_tcgets(stream);
          var argp = syscallGetVarargP();
          HEAP32[((argp) >> 2)] = termios.c_iflag || 0;
          HEAP32[(((argp) + (4)) >> 2)] = termios.c_oflag || 0;
          HEAP32[(((argp) + (8)) >> 2)] = termios.c_cflag || 0;
          HEAP32[(((argp) + (12)) >> 2)] = termios.c_lflag || 0;
          for (var i = 0; i < 32; i++) {
            HEAP8[(argp + i) + (17)] = termios.c_cc[i] || 0;
          }
          return 0;
        }
        return 0;
      }

     case 21510:
     case 21511:
     case 21512:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     // no-op, not actually adjusting terminal settings
      case 21506:
     case 21507:
     case 21508:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcsets) {
          var argp = syscallGetVarargP();
          var c_iflag = HEAP32[((argp) >> 2)];
          var c_oflag = HEAP32[(((argp) + (4)) >> 2)];
          var c_cflag = HEAP32[(((argp) + (8)) >> 2)];
          var c_lflag = HEAP32[(((argp) + (12)) >> 2)];
          var c_cc = [];
          for (var i = 0; i < 32; i++) {
            c_cc.push(HEAP8[(argp + i) + (17)]);
          }
          return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
            c_iflag,
            c_oflag,
            c_cflag,
            c_lflag,
            c_cc
          });
        }
        return 0;
      }

     // no-op, not actually adjusting terminal settings
      case 21519:
      {
        if (!stream.tty) return -59;
        var argp = syscallGetVarargP();
        HEAP32[((argp) >> 2)] = 0;
        return 0;
      }

     case 21520:
      {
        if (!stream.tty) return -59;
        return -28;
      }

     // not supported
      case 21531:
      {
        var argp = syscallGetVarargP();
        return FS.ioctl(stream, op, argp);
      }

     case 21523:
      {
        // TODO: in theory we should write to the winsize struct that gets
        // passed in, but for now musl doesn't read anything on it
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tiocgwinsz) {
          var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
          var argp = syscallGetVarargP();
          HEAP16[((argp) >> 1)] = winsize[0];
          HEAP16[(((argp) + (2)) >> 1)] = winsize[1];
        }
        return 0;
      }

     case 21524:
      {
        // TODO: technically, this ioctl call should change the window size.
        // but, since emscripten doesn't have any concept of a terminal window
        // yet, we'll just silently throw it away as we do TIOCGWINSZ
        if (!stream.tty) return -59;
        return 0;
      }

     case 21515:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     default:
      return -28;
    }
  } // not supported
  catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.lstat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_mkdirat(dirfd, path, mode) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    FS.mkdir(path, mode, 0);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_mknodat(dirfd, path, mode, dev) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    // we don't want this in the JS API as it uses mknod to create all nodes.
    switch (mode & 61440) {
     case 32768:
     case 8192:
     case 24576:
     case 4096:
     case 49152:
      break;

     default:
      return -28;
    }
    FS.mknod(path, mode, dev);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_newfstatat(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    var allowEmpty = flags & 4096;
    flags = flags & (~6400);
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? syscallGetVarargI() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var PIPEFS = {
  BUCKET_BUFFER_SIZE: 8192,
  mount(mount) {
    // Do not pollute the real root directory or its child nodes with pipes
    // Looks like it is OK to create another pseudo-root node not linked to the FS.root hierarchy this way
    return FS.createNode(null, "/", 16384 | 511, 0);
  },
  createPipe() {
    var pipe = {
      buckets: [],
      // refcnt 2 because pipe has a read end and a write end. We need to be
      // able to read from the read end after write end is closed.
      refcnt: 2
    };
    pipe.buckets.push({
      buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
      offset: 0,
      roffset: 0
    });
    var rName = PIPEFS.nextname();
    var wName = PIPEFS.nextname();
    var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
    var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
    rNode.pipe = pipe;
    wNode.pipe = pipe;
    var readableStream = FS.createStream({
      path: rName,
      node: rNode,
      flags: 0,
      seekable: false,
      stream_ops: PIPEFS.stream_ops
    });
    rNode.stream = readableStream;
    var writableStream = FS.createStream({
      path: wName,
      node: wNode,
      flags: 1,
      seekable: false,
      stream_ops: PIPEFS.stream_ops
    });
    wNode.stream = writableStream;
    return {
      readable_fd: readableStream.fd,
      writable_fd: writableStream.fd
    };
  },
  stream_ops: {
    poll(stream) {
      var pipe = stream.node.pipe;
      if ((stream.flags & 2097155) === 1) {
        return (256 | 4);
      }
      if (pipe.buckets.length > 0) {
        for (var i = 0; i < pipe.buckets.length; i++) {
          var bucket = pipe.buckets[i];
          if (bucket.offset - bucket.roffset > 0) {
            return (64 | 1);
          }
        }
      }
      return 0;
    },
    ioctl(stream, request, varargs) {
      return 28;
    },
    fsync(stream) {
      return 28;
    },
    read(stream, buffer, offset, length, position) {
      /* ignored */ var pipe = stream.node.pipe;
      var currentLength = 0;
      for (var i = 0; i < pipe.buckets.length; i++) {
        var bucket = pipe.buckets[i];
        currentLength += bucket.offset - bucket.roffset;
      }
      var data = buffer.subarray(offset, offset + length);
      if (length <= 0) {
        return 0;
      }
      if (currentLength == 0) {
        // Behave as if the read end is always non-blocking
        throw new FS.ErrnoError(6);
      }
      var toRead = Math.min(currentLength, length);
      var totalRead = toRead;
      var toRemove = 0;
      for (var i = 0; i < pipe.buckets.length; i++) {
        var currBucket = pipe.buckets[i];
        var bucketSize = currBucket.offset - currBucket.roffset;
        if (toRead <= bucketSize) {
          var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
          if (toRead < bucketSize) {
            tmpSlice = tmpSlice.subarray(0, toRead);
            currBucket.roffset += toRead;
          } else {
            toRemove++;
          }
          data.set(tmpSlice);
          break;
        } else {
          var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
          data.set(tmpSlice);
          data = data.subarray(tmpSlice.byteLength);
          toRead -= tmpSlice.byteLength;
          toRemove++;
        }
      }
      if (toRemove && toRemove == pipe.buckets.length) {
        // Do not generate excessive garbage in use cases such as
        // write several bytes, read everything, write several bytes, read everything...
        toRemove--;
        pipe.buckets[toRemove].offset = 0;
        pipe.buckets[toRemove].roffset = 0;
      }
      pipe.buckets.splice(0, toRemove);
      return totalRead;
    },
    write(stream, buffer, offset, length, position) {
      /* ignored */ var pipe = stream.node.pipe;
      var data = buffer.subarray(offset, offset + length);
      var dataLen = data.byteLength;
      if (dataLen <= 0) {
        return 0;
      }
      var currBucket = null;
      if (pipe.buckets.length == 0) {
        currBucket = {
          buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
          offset: 0,
          roffset: 0
        };
        pipe.buckets.push(currBucket);
      } else {
        currBucket = pipe.buckets[pipe.buckets.length - 1];
      }
      assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
      var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
      if (freeBytesInCurrBuffer >= dataLen) {
        currBucket.buffer.set(data, currBucket.offset);
        currBucket.offset += dataLen;
        return dataLen;
      } else if (freeBytesInCurrBuffer > 0) {
        currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
        currBucket.offset += freeBytesInCurrBuffer;
        data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
      }
      var numBuckets = (data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE) | 0;
      var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
      for (var i = 0; i < numBuckets; i++) {
        var newBucket = {
          buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
          offset: PIPEFS.BUCKET_BUFFER_SIZE,
          roffset: 0
        };
        pipe.buckets.push(newBucket);
        newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
        data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
      }
      if (remElements > 0) {
        var newBucket = {
          buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
          offset: data.byteLength,
          roffset: 0
        };
        pipe.buckets.push(newBucket);
        newBucket.buffer.set(data);
      }
      return dataLen;
    },
    close(stream) {
      var pipe = stream.node.pipe;
      pipe.refcnt--;
      if (pipe.refcnt === 0) {
        pipe.buckets = null;
      }
    }
  },
  nextname() {
    if (!PIPEFS.nextname.current) {
      PIPEFS.nextname.current = 0;
    }
    return "pipe[" + (PIPEFS.nextname.current++) + "]";
  }
};

function ___syscall_pipe(fdPtr) {
  try {
    if (fdPtr == 0) {
      throw new FS.ErrnoError(21);
    }
    var res = PIPEFS.createPipe();
    HEAP32[((fdPtr) >> 2)] = res.readable_fd;
    HEAP32[(((fdPtr) + (4)) >> 2)] = res.writable_fd;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (bufsize <= 0) return -28;
    var ret = FS.readlink(path);
    var len = Math.min(bufsize, lengthBytesUTF8(ret));
    var endChar = HEAP8[buf + len];
    stringToUTF8(ret, buf, bufsize + 1);
    // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
    // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
    HEAP8[buf + len] = endChar;
    return len;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
  try {
    oldpath = SYSCALLS.getStr(oldpath);
    newpath = SYSCALLS.getStr(newpath);
    oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
    newpath = SYSCALLS.calculateAt(newdirfd, newpath);
    FS.rename(oldpath, newpath);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_rmdir(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.rmdir(path);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_symlinkat(target, dirfd, linkpath) {
  try {
    target = SYSCALLS.getStr(target);
    linkpath = SYSCALLS.getStr(linkpath);
    linkpath = SYSCALLS.calculateAt(dirfd, linkpath);
    FS.symlink(target, linkpath);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_unlinkat(dirfd, path, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (flags === 0) {
      FS.unlink(path);
    } else if (flags === 512) {
      FS.rmdir(path);
    } else {
      abort("Invalid flags passed to unlinkat");
    }
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var readI53FromI64 = ptr => HEAPU32[((ptr) >> 2)] + HEAP32[(((ptr) + (4)) >> 2)] * 4294967296;

function ___syscall_utimensat(dirfd, path, times, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path, true);
    var now = Date.now(), atime, mtime;
    if (!times) {
      atime = now;
      mtime = now;
    } else {
      var seconds = readI53FromI64(times);
      var nanoseconds = HEAP32[(((times) + (8)) >> 2)];
      if (nanoseconds == 1073741823) {
        atime = now;
      } else if (nanoseconds == 1073741822) {
        atime = null;
      } else {
        atime = (seconds * 1e3) + (nanoseconds / (1e3 * 1e3));
      }
      times += 16;
      seconds = readI53FromI64(times);
      nanoseconds = HEAP32[(((times) + (8)) >> 2)];
      if (nanoseconds == 1073741823) {
        mtime = now;
      } else if (nanoseconds == 1073741822) {
        mtime = null;
      } else {
        mtime = (seconds * 1e3) + (nanoseconds / (1e3 * 1e3));
      }
    }
    // null here means UTIME_OMIT was passed. If both were set to UTIME_OMIT then
    // we can skip the call completely.
    if ((mtime ?? atime) !== null) {
      FS.utime(path, atime, mtime);
    }
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var __abort_js = () => abort("");

var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);

var __emscripten_runtime_keepalive_clear = () => {
  noExitRuntime = false;
  runtimeKeepaliveCounter = 0;
};

var __emscripten_system = command => {
  if (ENVIRONMENT_IS_NODE) {
    if (!command) return 1;
    // shell is available
    var cmdstr = UTF8ToString(command);
    if (!cmdstr.length) return 0;
    // this is what glibc seems to do (shell works test?)
    var cp = require("child_process");
    var ret = cp.spawnSync(cmdstr, [], {
      shell: true,
      stdio: "inherit"
    });
    var _W_EXITCODE = (ret, sig) => ((ret) << 8 | (sig));
    // this really only can happen if process is killed by signal
    if (ret.status === null) {
      // sadly node doesn't expose such function
      var signalToNumber = sig => {
        // implement only the most common ones, and fallback to SIGINT
        switch (sig) {
         case "SIGHUP":
          return 1;

         case "SIGQUIT":
          return 3;

         case "SIGFPE":
          return 8;

         case "SIGKILL":
          return 9;

         case "SIGALRM":
          return 14;

         case "SIGTERM":
          return 15;

         default:
          return 2;
        }
      };
      return _W_EXITCODE(0, signalToNumber(ret.signal));
    }
    return _W_EXITCODE(ret.status, 0);
  }
  // int system(const char *command);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
  // Can't call external programs.
  if (!command) return 0;
  // no shell available
  return -52;
};

var __emscripten_throw_longjmp = () => {
  throw Infinity;
};

function __gmtime_js(time_low, time_high, tmPtr) {
  var time = convertI32PairToI53Checked(time_low, time_high);
  var date = new Date(time * 1e3);
  HEAP32[((tmPtr) >> 2)] = date.getUTCSeconds();
  HEAP32[(((tmPtr) + (4)) >> 2)] = date.getUTCMinutes();
  HEAP32[(((tmPtr) + (8)) >> 2)] = date.getUTCHours();
  HEAP32[(((tmPtr) + (12)) >> 2)] = date.getUTCDate();
  HEAP32[(((tmPtr) + (16)) >> 2)] = date.getUTCMonth();
  HEAP32[(((tmPtr) + (20)) >> 2)] = date.getUTCFullYear() - 1900;
  HEAP32[(((tmPtr) + (24)) >> 2)] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  HEAP32[(((tmPtr) + (28)) >> 2)] = yday;
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

var ydayFromDate = date => {
  var leap = isLeapYear(date.getFullYear());
  var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
  var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
  // -1 since it's days since Jan 1
  return yday;
};

function __localtime_js(time_low, time_high, tmPtr) {
  var time = convertI32PairToI53Checked(time_low, time_high);
  var date = new Date(time * 1e3);
  HEAP32[((tmPtr) >> 2)] = date.getSeconds();
  HEAP32[(((tmPtr) + (4)) >> 2)] = date.getMinutes();
  HEAP32[(((tmPtr) + (8)) >> 2)] = date.getHours();
  HEAP32[(((tmPtr) + (12)) >> 2)] = date.getDate();
  HEAP32[(((tmPtr) + (16)) >> 2)] = date.getMonth();
  HEAP32[(((tmPtr) + (20)) >> 2)] = date.getFullYear() - 1900;
  HEAP32[(((tmPtr) + (24)) >> 2)] = date.getDay();
  var yday = ydayFromDate(date) | 0;
  HEAP32[(((tmPtr) + (28)) >> 2)] = yday;
  HEAP32[(((tmPtr) + (36)) >> 2)] = -(date.getTimezoneOffset() * 60);
  // Attention: DST is in December in South, and some regions don't have DST at all.
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  HEAP32[(((tmPtr) + (32)) >> 2)] = dst;
}

/** @suppress {duplicate } */ var setTempRet0 = val => __emscripten_tempret_set(val);

var __mktime_js = function(tmPtr) {
  var ret = (() => {
    var date = new Date(HEAP32[(((tmPtr) + (20)) >> 2)] + 1900, HEAP32[(((tmPtr) + (16)) >> 2)], HEAP32[(((tmPtr) + (12)) >> 2)], HEAP32[(((tmPtr) + (8)) >> 2)], HEAP32[(((tmPtr) + (4)) >> 2)], HEAP32[((tmPtr) >> 2)], 0);
    // There's an ambiguous hour when the time goes back; the tm_isdst field is
    // used to disambiguate it.  Date() basically guesses, so we fix it up if it
    // guessed wrong, or fill in tm_isdst with the guess if it's -1.
    var dst = HEAP32[(((tmPtr) + (32)) >> 2)];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    // DST is in December in South
    if (dst < 0) {
      // Attention: some regions don't have DST at all.
      HEAP32[(((tmPtr) + (32)) >> 2)] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
    } else if ((dst > 0) != (dstOffset == guessedOffset)) {
      var nonDstOffset = Math.max(winterOffset, summerOffset);
      var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
      // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.
      date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    }
    HEAP32[(((tmPtr) + (24)) >> 2)] = date.getDay();
    var yday = ydayFromDate(date) | 0;
    HEAP32[(((tmPtr) + (28)) >> 2)] = yday;
    // To match expected behavior, update fields from date
    HEAP32[((tmPtr) >> 2)] = date.getSeconds();
    HEAP32[(((tmPtr) + (4)) >> 2)] = date.getMinutes();
    HEAP32[(((tmPtr) + (8)) >> 2)] = date.getHours();
    HEAP32[(((tmPtr) + (12)) >> 2)] = date.getDate();
    HEAP32[(((tmPtr) + (16)) >> 2)] = date.getMonth();
    HEAP32[(((tmPtr) + (20)) >> 2)] = date.getYear();
    var timeMs = date.getTime();
    if (isNaN(timeMs)) {
      return -1;
    }
    // Return time in microseconds
    return timeMs / 1e3;
  })();
  return (setTempRet0((tempDouble = ret, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0)), 
  ret >>> 0);
};

function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  try {
    if (isNaN(offset)) return 61;
    var stream = SYSCALLS.getStreamFromFD(fd);
    var res = FS.mmap(stream, len, offset, prot, flags);
    var ptr = res.ptr;
    HEAP32[((allocated) >> 2)] = res.allocated;
    HEAPU32[((addr) >> 2)] = ptr;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    if (prot & 2) {
      SYSCALLS.doMsync(addr, stream, len, flags, offset);
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var __tzset_js = (timezone, daylight, std_name, dst_name) => {
  // TODO: Use (malleable) environment variables instead of system settings.
  var currentYear = (new Date).getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  // Local standard timezone offset. Local standard time is not adjusted for
  // daylight savings.  This code uses the fact that getTimezoneOffset returns
  // a greater value during Standard Time versus Daylight Saving Time (DST).
  // Thus it determines the expected output during Standard Time, and it
  // compares whether the output of the given date the same (Standard) or less
  // (DST).
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  // timezone is specified as seconds west of UTC ("The external variable
  // `timezone` shall be set to the difference, in seconds, between
  // Coordinated Universal Time (UTC) and local standard time."), the same
  // as returned by stdTimezoneOffset.
  // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
  HEAPU32[((timezone) >> 2)] = stdTimezoneOffset * 60;
  HEAP32[((daylight) >> 2)] = Number(winterOffset != summerOffset);
  var extractZone = timezoneOffset => {
    // Why inverse sign?
    // Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
    var sign = timezoneOffset >= 0 ? "-" : "+";
    var absOffset = Math.abs(timezoneOffset);
    var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
    var minutes = String(absOffset % 60).padStart(2, "0");
    return `UTC${sign}${hours}${minutes}`;
  };
  var winterName = extractZone(winterOffset);
  var summerName = extractZone(summerOffset);
  if (summerOffset < winterOffset) {
    // Northern hemisphere
    stringToUTF8(winterName, std_name, 17);
    stringToUTF8(summerName, dst_name, 17);
  } else {
    stringToUTF8(winterName, dst_name, 17);
    stringToUTF8(summerName, std_name, 17);
  }
};

var AL = {
  QUEUE_INTERVAL: 25,
  QUEUE_LOOKAHEAD: .1,
  DEVICE_NAME: "Emscripten OpenAL",
  CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
  ALC_EXTENSIONS: {
    ALC_SOFT_pause_device: true,
    ALC_SOFT_HRTF: true
  },
  AL_EXTENSIONS: {
    AL_EXT_float32: true,
    AL_SOFT_loop_points: true,
    AL_SOFT_source_length: true,
    AL_EXT_source_distance_model: true,
    AL_SOFT_source_spatialize: true
  },
  _alcErr: 0,
  alcErr: 0,
  deviceRefCounts: {},
  alcStringCache: {},
  paused: false,
  stringCache: {},
  contexts: {},
  currentCtx: null,
  buffers: {
    0: {
      id: 0,
      refCount: 0,
      audioBuf: null,
      frequency: 0,
      bytesPerSample: 2,
      channels: 1,
      length: 0
    }
  },
  paramArray: [],
  _nextId: 1,
  newId: () => AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++,
  freeIds: [],
  scheduleContextAudio: ctx => {
    // If we are animating using the requestAnimationFrame method, then the main loop does not run when in the background.
    // To give a perfect glitch-free audio stop when switching from foreground to background, we need to avoid updating
    // audio altogether when in the background, so detect that case and kill audio buffer streaming if so.
    if (MainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
      return;
    }
    for (var i in ctx.sources) {
      AL.scheduleSourceAudio(ctx.sources[i]);
    }
  },
  scheduleSourceAudio: (src, lookahead) => {
    // See comment on scheduleContextAudio above.
    if (MainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
      return;
    }
    if (src.state !== 4114) {
      return;
    }
    var currentTime = AL.updateSourceTime(src);
    var startTime = src.bufStartTime;
    var startOffset = src.bufOffset;
    var bufCursor = src.bufsProcessed;
    // Advance past any audio that is already scheduled
    for (var i = 0; i < src.audioQueue.length; i++) {
      var audioSrc = src.audioQueue[i];
      startTime = audioSrc._startTime + audioSrc._duration;
      startOffset = 0;
      bufCursor += audioSrc._skipCount + 1;
    }
    if (!lookahead) {
      lookahead = AL.QUEUE_LOOKAHEAD;
    }
    var lookaheadTime = currentTime + lookahead;
    var skipCount = 0;
    while (startTime < lookaheadTime) {
      if (bufCursor >= src.bufQueue.length) {
        if (src.looping) {
          bufCursor %= src.bufQueue.length;
        } else {
          break;
        }
      }
      var buf = src.bufQueue[bufCursor % src.bufQueue.length];
      // If the buffer contains no data, skip it
      if (buf.length === 0) {
        skipCount++;
        // If we've gone through the whole queue and everything is 0 length, just give up
        if (skipCount === src.bufQueue.length) {
          break;
        }
      } else {
        var audioSrc = src.context.audioCtx.createBufferSource();
        audioSrc.buffer = buf.audioBuf;
        audioSrc.playbackRate.value = src.playbackRate;
        if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
          audioSrc.loopStart = buf.audioBuf._loopStart;
          audioSrc.loopEnd = buf.audioBuf._loopEnd;
        }
        var duration = 0;
        // If the source is a looping static buffer, use native looping for gapless playback
        if (src.type === 4136 && src.looping) {
          duration = Number.POSITIVE_INFINITY;
          audioSrc.loop = true;
          if (buf.audioBuf._loopStart) {
            audioSrc.loopStart = buf.audioBuf._loopStart;
          }
          if (buf.audioBuf._loopEnd) {
            audioSrc.loopEnd = buf.audioBuf._loopEnd;
          }
        } else {
          duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
        }
        audioSrc._startOffset = startOffset;
        audioSrc._duration = duration;
        audioSrc._skipCount = skipCount;
        skipCount = 0;
        audioSrc.connect(src.gain);
        if (typeof audioSrc.start != "undefined") {
          // Sample the current time as late as possible to mitigate drift
          startTime = Math.max(startTime, src.context.audioCtx.currentTime);
          audioSrc.start(startTime, startOffset);
        } else if (typeof audioSrc.noteOn != "undefined") {
          startTime = Math.max(startTime, src.context.audioCtx.currentTime);
          audioSrc.noteOn(startTime);
        }
        audioSrc._startTime = startTime;
        src.audioQueue.push(audioSrc);
        startTime += duration;
      }
      startOffset = 0;
      bufCursor++;
    }
  },
  updateSourceTime: src => {
    var currentTime = src.context.audioCtx.currentTime;
    if (src.state !== 4114) {
      return currentTime;
    }
    // if the start time is unset, determine it based on the current offset.
    // This will be the case when a source is resumed after being paused, and
    // allows us to pretend that the source actually started playing some time
    // in the past such that it would just now have reached the stored offset.
    if (!isFinite(src.bufStartTime)) {
      src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
      src.bufOffset = 0;
    }
    var nextStartTime = 0;
    while (src.audioQueue.length) {
      var audioSrc = src.audioQueue[0];
      src.bufsProcessed += audioSrc._skipCount;
      nextStartTime = audioSrc._startTime + audioSrc._duration;
      // n.b. audioSrc._duration already factors in playbackRate, so no divide by src.playbackRate on it.
      if (currentTime < nextStartTime) {
        break;
      }
      src.audioQueue.shift();
      src.bufStartTime = nextStartTime;
      src.bufOffset = 0;
      src.bufsProcessed++;
    }
    if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
      // The source has played its entire queue and is non-looping, so just mark it as stopped.
      AL.setSourceState(src, 4116);
    } else if (src.type === 4136 && src.looping) {
      // If the source is a looping static buffer, determine the buffer offset based on the loop points
      var buf = src.bufQueue[0];
      if (buf.length === 0) {
        src.bufOffset = 0;
      } else {
        var delta = (currentTime - src.bufStartTime) * src.playbackRate;
        var loopStart = buf.audioBuf._loopStart || 0;
        var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
        if (loopEnd <= loopStart) {
          loopEnd = buf.audioBuf.duration;
        }
        if (delta < loopEnd) {
          src.bufOffset = delta;
        } else {
          src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
        }
      }
    } else if (src.audioQueue[0]) {
      // The source is still actively playing, so we just need to calculate where we are in the current buffer
      // so it can be remembered if the source gets paused.
      src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
    } else {
      // The source hasn't finished yet, but there is no scheduled audio left for it. This can be because
      // the source has just been started/resumed, or due to an underrun caused by a long blocking operation.
      // We need to determine what state we would be in by this point in time so that when we next schedule
      // audio playback, it will be just as if no underrun occurred.
      if (src.type !== 4136 && src.looping) {
        // if the source is a looping buffer queue, let's first calculate the queue duration, so we can
        // quickly fast forward past any full loops of the queue and only worry about the remainder.
        var srcDuration = AL.sourceDuration(src) / src.playbackRate;
        if (srcDuration > 0) {
          src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
        }
      }
      // Since we've already skipped any full-queue loops if there were any, we just need to find
      // out where in the queue the remaining time puts us, which won't require stepping through the
      // entire queue more than once.
      for (var i = 0; i < src.bufQueue.length; i++) {
        if (src.bufsProcessed >= src.bufQueue.length) {
          if (src.looping) {
            src.bufsProcessed %= src.bufQueue.length;
          } else {
            AL.setSourceState(src, 4116);
            break;
          }
        }
        var buf = src.bufQueue[src.bufsProcessed];
        if (buf.length > 0) {
          nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
          if (currentTime < nextStartTime) {
            src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
            break;
          }
          src.bufStartTime = nextStartTime;
        }
        src.bufOffset = 0;
        src.bufsProcessed++;
      }
    }
    return currentTime;
  },
  cancelPendingSourceAudio: src => {
    AL.updateSourceTime(src);
    for (var i = 1; i < src.audioQueue.length; i++) {
      var audioSrc = src.audioQueue[i];
      audioSrc.stop();
    }
    if (src.audioQueue.length > 1) {
      src.audioQueue.length = 1;
    }
  },
  stopSourceAudio: src => {
    for (var i = 0; i < src.audioQueue.length; i++) {
      src.audioQueue[i].stop();
    }
    src.audioQueue.length = 0;
  },
  setSourceState: (src, state) => {
    if (state === 4114) {
      if (src.state === 4114 || src.state == 4116) {
        src.bufsProcessed = 0;
        src.bufOffset = 0;
      } else {}
      AL.stopSourceAudio(src);
      src.state = 4114;
      src.bufStartTime = Number.NEGATIVE_INFINITY;
      AL.scheduleSourceAudio(src);
    } else if (state === 4115) {
      if (src.state === 4114) {
        // Store off the current offset to restore with on resume.
        AL.updateSourceTime(src);
        AL.stopSourceAudio(src);
        src.state = 4115;
      }
    } else if (state === 4116) {
      if (src.state !== 4113) {
        src.state = 4116;
        src.bufsProcessed = src.bufQueue.length;
        src.bufStartTime = Number.NEGATIVE_INFINITY;
        src.bufOffset = 0;
        AL.stopSourceAudio(src);
      }
    } else if (state === 4113) {
      if (src.state !== 4113) {
        src.state = 4113;
        src.bufsProcessed = 0;
        src.bufStartTime = Number.NEGATIVE_INFINITY;
        src.bufOffset = 0;
        AL.stopSourceAudio(src);
      }
    }
  },
  initSourcePanner: src => {
    if (src.type === 4144) /* AL_UNDETERMINED */ {
      return;
    }
    // Find the first non-zero buffer in the queue to determine the proper format
    var templateBuf = AL.buffers[0];
    for (var i = 0; i < src.bufQueue.length; i++) {
      if (src.bufQueue[i].id !== 0) {
        templateBuf = src.bufQueue[i];
        break;
      }
    }
    // Create a panner if AL_SOURCE_SPATIALIZE_SOFT is set to true, or alternatively if it's set to auto and the source is mono
    if (src.spatialize === 1 || (src.spatialize === 2 && /* AL_AUTO_SOFT */ templateBuf.channels === 1)) {
      if (src.panner) {
        return;
      }
      src.panner = src.context.audioCtx.createPanner();
      AL.updateSourceGlobal(src);
      AL.updateSourceSpace(src);
      src.panner.connect(src.context.gain);
      src.gain.disconnect();
      src.gain.connect(src.panner);
    } else {
      if (!src.panner) {
        return;
      }
      src.panner.disconnect();
      src.gain.disconnect();
      src.gain.connect(src.context.gain);
      src.panner = null;
    }
  },
  updateContextGlobal: ctx => {
    for (var i in ctx.sources) {
      AL.updateSourceGlobal(ctx.sources[i]);
    }
  },
  updateSourceGlobal: src => {
    var panner = src.panner;
    if (!panner) {
      return;
    }
    panner.refDistance = src.refDistance;
    panner.maxDistance = src.maxDistance;
    panner.rolloffFactor = src.rolloffFactor;
    panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
    // Use the source's distance model if AL_SOURCE_DISTANCE_MODEL is enabled
    var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
    switch (distanceModel) {
     case 0:
      panner.distanceModel = "inverse";
      panner.refDistance = 340282e33;
      /* FLT_MAX */ break;

     case 53249:
     /* AL_INVERSE_DISTANCE */ case 53250:
      /* AL_INVERSE_DISTANCE_CLAMPED */ panner.distanceModel = "inverse";
      break;

     case 53251:
     /* AL_LINEAR_DISTANCE */ case 53252:
      /* AL_LINEAR_DISTANCE_CLAMPED */ panner.distanceModel = "linear";
      break;

     case 53253:
     /* AL_EXPONENT_DISTANCE */ case 53254:
      /* AL_EXPONENT_DISTANCE_CLAMPED */ panner.distanceModel = "exponential";
      break;
    }
  },
  updateListenerSpace: ctx => {
    var listener = ctx.audioCtx.listener;
    if (listener.positionX) {
      listener.positionX.value = ctx.listener.position[0];
      listener.positionY.value = ctx.listener.position[1];
      listener.positionZ.value = ctx.listener.position[2];
    } else {
      listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
    }
    if (listener.forwardX) {
      listener.forwardX.value = ctx.listener.direction[0];
      listener.forwardY.value = ctx.listener.direction[1];
      listener.forwardZ.value = ctx.listener.direction[2];
      listener.upX.value = ctx.listener.up[0];
      listener.upY.value = ctx.listener.up[1];
      listener.upZ.value = ctx.listener.up[2];
    } else {
      listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
    }
    // Update sources that are relative to the listener
    for (var i in ctx.sources) {
      AL.updateSourceSpace(ctx.sources[i]);
    }
  },
  updateSourceSpace: src => {
    if (!src.panner) {
      return;
    }
    var panner = src.panner;
    var posX = src.position[0];
    var posY = src.position[1];
    var posZ = src.position[2];
    var dirX = src.direction[0];
    var dirY = src.direction[1];
    var dirZ = src.direction[2];
    var listener = src.context.listener;
    var lPosX = listener.position[0];
    var lPosY = listener.position[1];
    var lPosZ = listener.position[2];
    // WebAudio does spatialization in world-space coordinates, meaning both the buffer sources and
    // the listener position are in the same absolute coordinate system relative to a fixed origin.
    // By default, OpenAL works this way as well, but it also provides a "listener relative" mode, where
    // a buffer source's coordinate are interpreted not in absolute world space, but as being relative
    // to the listener object itself, so as the listener moves the source appears to move with it
    // with no update required. Since web audio does not support this mode, we must transform the source
    // coordinates from listener-relative space to absolute world space.
    // We do this via affine transformation matrices applied to the source position and source direction.
    // A change-of-basis converts from listener-space displacements to world-space displacements,
    // which must be done for both the source position and direction. Lastly, the source position must be
    // added to the listener position to get the final source position, since the source position represents
    // a displacement from the listener.
    if (src.relative) {
      // Negate the listener direction since forward is -Z.
      var lBackX = -listener.direction[0];
      var lBackY = -listener.direction[1];
      var lBackZ = -listener.direction[2];
      var lUpX = listener.up[0];
      var lUpY = listener.up[1];
      var lUpZ = listener.up[2];
      var inverseMagnitude = (x, y, z) => {
        var length = Math.sqrt(x * x + y * y + z * z);
        if (length < Number.EPSILON) {
          return 0;
        }
        return 1 / length;
      };
      // Normalize the Back vector
      var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
      lBackX *= invMag;
      lBackY *= invMag;
      lBackZ *= invMag;
      // ...and the Up vector
      invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
      lUpX *= invMag;
      lUpY *= invMag;
      lUpZ *= invMag;
      // Calculate the Right vector as the cross product of the Up and Back vectors
      var lRightX = (lUpY * lBackZ - lUpZ * lBackY);
      var lRightY = (lUpZ * lBackX - lUpX * lBackZ);
      var lRightZ = (lUpX * lBackY - lUpY * lBackX);
      // Back and Up might not be exactly perpendicular, so the cross product also needs normalization
      invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
      lRightX *= invMag;
      lRightY *= invMag;
      lRightZ *= invMag;
      // Recompute Up from the now orthonormal Right and Back vectors so we have a fully orthonormal basis
      lUpX = (lBackY * lRightZ - lBackZ * lRightY);
      lUpY = (lBackZ * lRightX - lBackX * lRightZ);
      lUpZ = (lBackX * lRightY - lBackY * lRightX);
      var oldX = dirX;
      var oldY = dirY;
      var oldZ = dirZ;
      // Use our 3 vectors to apply a change-of-basis matrix to the source direction
      dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
      dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
      dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
      oldX = posX;
      oldY = posY;
      oldZ = posZ;
      // ...and to the source position
      posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
      posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
      posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
      // The change-of-basis corrects the orientation, but the origin is still the listener.
      // Translate the source position by the listener position to finish.
      posX += lPosX;
      posY += lPosY;
      posZ += lPosZ;
    }
    if (panner.positionX) {
      // Assigning to panner.positionX/Y/Z unnecessarily seems to cause performance issues
      // See https://github.com/emscripten-core/emscripten/issues/15847
      if (posX != panner.positionX.value) panner.positionX.value = posX;
      if (posY != panner.positionY.value) panner.positionY.value = posY;
      if (posZ != panner.positionZ.value) panner.positionZ.value = posZ;
    } else {
      panner.setPosition(posX, posY, posZ);
    }
    if (panner.orientationX) {
      // Assigning to panner.orientation/Y/Z unnecessarily seems to cause performance issues
      // See https://github.com/emscripten-core/emscripten/issues/15847
      if (dirX != panner.orientationX.value) panner.orientationX.value = dirX;
      if (dirY != panner.orientationY.value) panner.orientationY.value = dirY;
      if (dirZ != panner.orientationZ.value) panner.orientationZ.value = dirZ;
    } else {
      panner.setOrientation(dirX, dirY, dirZ);
    }
    var oldShift = src.dopplerShift;
    var velX = src.velocity[0];
    var velY = src.velocity[1];
    var velZ = src.velocity[2];
    var lVelX = listener.velocity[0];
    var lVelY = listener.velocity[1];
    var lVelZ = listener.velocity[2];
    if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
      src.dopplerShift = 1;
    } else {
      // Doppler algorithm from 1.1 spec
      var speedOfSound = src.context.speedOfSound;
      var dopplerFactor = src.context.dopplerFactor;
      var slX = lPosX - posX;
      var slY = lPosY - posY;
      var slZ = lPosZ - posZ;
      var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
      var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
      var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
      vls = Math.min(vls, speedOfSound / dopplerFactor);
      vss = Math.min(vss, speedOfSound / dopplerFactor);
      src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
    }
    if (src.dopplerShift !== oldShift) {
      AL.updateSourceRate(src);
    }
  },
  updateSourceRate: src => {
    if (src.state === 4114) {
      // clear scheduled buffers
      AL.cancelPendingSourceAudio(src);
      var audioSrc = src.audioQueue[0];
      if (!audioSrc) {
        return;
      }
      // It is possible that AL.scheduleContextAudio() has not yet fed the next buffer, if so, skip.
      var duration;
      if (src.type === 4136 && src.looping) {
        duration = Number.POSITIVE_INFINITY;
      } else {
        // audioSrc._duration is expressed after factoring in playbackRate, so when changing playback rate, need
        // to recompute/rescale the rate to the new playback speed.
        duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
      }
      audioSrc._duration = duration;
      audioSrc.playbackRate.value = src.playbackRate;
      // reschedule buffers with the new playbackRate
      AL.scheduleSourceAudio(src);
    }
  },
  sourceDuration: src => {
    var length = 0;
    for (var i = 0; i < src.bufQueue.length; i++) {
      var audioBuf = src.bufQueue[i].audioBuf;
      length += audioBuf ? audioBuf.duration : 0;
    }
    return length;
  },
  sourceTell: src => {
    AL.updateSourceTime(src);
    var offset = 0;
    for (var i = 0; i < src.bufsProcessed; i++) {
      if (src.bufQueue[i].audioBuf) {
        offset += src.bufQueue[i].audioBuf.duration;
      }
    }
    offset += src.bufOffset;
    return offset;
  },
  sourceSeek: (src, offset) => {
    var playing = src.state == 4114;
    if (playing) {
      AL.setSourceState(src, 4113);
    }
    if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
      src.bufsProcessed = 0;
      while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
        offset -= src.bufQueue[src.bufsProcessed].audioBuf.duration;
        src.bufsProcessed++;
      }
      src.bufOffset = offset;
    }
    if (playing) {
      AL.setSourceState(src, 4114);
    }
  },
  getGlobalParam: (funcname, param) => {
    if (!AL.currentCtx) {
      return null;
    }
    switch (param) {
     case 49152:
      return AL.currentCtx.dopplerFactor;

     case 49155:
      return AL.currentCtx.speedOfSound;

     case 53248:
      return AL.currentCtx.distanceModel;

     default:
      AL.currentCtx.err = 40962;
      return null;
    }
  },
  setGlobalParam: (funcname, param, value) => {
    if (!AL.currentCtx) {
      return;
    }
    switch (param) {
     case 49152:
      if (!Number.isFinite(value) || value < 0) {
        // Strictly negative values are disallowed
        AL.currentCtx.err = 40963;
        return;
      }
      AL.currentCtx.dopplerFactor = value;
      AL.updateListenerSpace(AL.currentCtx);
      break;

     case 49155:
      if (!Number.isFinite(value) || value <= 0) {
        // Negative or zero values are disallowed
        AL.currentCtx.err = 40963;
        return;
      }
      AL.currentCtx.speedOfSound = value;
      AL.updateListenerSpace(AL.currentCtx);
      break;

     case 53248:
      switch (value) {
       case 0:
       case 53249:
       /* AL_INVERSE_DISTANCE */ case 53250:
       /* AL_INVERSE_DISTANCE_CLAMPED */ case 53251:
       /* AL_LINEAR_DISTANCE */ case 53252:
       /* AL_LINEAR_DISTANCE_CLAMPED */ case 53253:
       /* AL_EXPONENT_DISTANCE */ case 53254:
        /* AL_EXPONENT_DISTANCE_CLAMPED */ AL.currentCtx.distanceModel = value;
        AL.updateContextGlobal(AL.currentCtx);
        break;

       default:
        AL.currentCtx.err = 40963;
        return;
      }
      break;

     default:
      AL.currentCtx.err = 40962;
      return;
    }
  },
  getListenerParam: (funcname, param) => {
    if (!AL.currentCtx) {
      return null;
    }
    switch (param) {
     case 4100:
      return AL.currentCtx.listener.position;

     case 4102:
      return AL.currentCtx.listener.velocity;

     case 4111:
      return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);

     case 4106:
      return AL.currentCtx.gain.gain.value;

     default:
      AL.currentCtx.err = 40962;
      return null;
    }
  },
  setListenerParam: (funcname, param, value) => {
    if (!AL.currentCtx) {
      return;
    }
    if (value === null) {
      AL.currentCtx.err = 40962;
      return;
    }
    var listener = AL.currentCtx.listener;
    switch (param) {
     case 4100:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
        AL.currentCtx.err = 40963;
        return;
      }
      listener.position[0] = value[0];
      listener.position[1] = value[1];
      listener.position[2] = value[2];
      AL.updateListenerSpace(AL.currentCtx);
      break;

     case 4102:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
        AL.currentCtx.err = 40963;
        return;
      }
      listener.velocity[0] = value[0];
      listener.velocity[1] = value[1];
      listener.velocity[2] = value[2];
      AL.updateListenerSpace(AL.currentCtx);
      break;

     case 4106:
      if (!Number.isFinite(value) || value < 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      AL.currentCtx.gain.gain.value = value;
      break;

     case 4111:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
        AL.currentCtx.err = 40963;
        return;
      }
      listener.direction[0] = value[0];
      listener.direction[1] = value[1];
      listener.direction[2] = value[2];
      listener.up[0] = value[3];
      listener.up[1] = value[4];
      listener.up[2] = value[5];
      AL.updateListenerSpace(AL.currentCtx);
      break;

     default:
      AL.currentCtx.err = 40962;
      return;
    }
  },
  getBufferParam: (funcname, bufferId, param) => {
    if (!AL.currentCtx) {
      return;
    }
    var buf = AL.buffers[bufferId];
    if (!buf || bufferId === 0) {
      AL.currentCtx.err = 40961;
      return;
    }
    switch (param) {
     case 8193:
      /* AL_FREQUENCY */ return buf.frequency;

     case 8194:
      /* AL_BITS */ return buf.bytesPerSample * 8;

     case 8195:
      /* AL_CHANNELS */ return buf.channels;

     case 8196:
      /* AL_SIZE */ return buf.length * buf.bytesPerSample * buf.channels;

     case 8213:
      /* AL_LOOP_POINTS_SOFT */ if (buf.length === 0) {
        return [ 0, 0 ];
      }
      return [ (buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency ];

     default:
      AL.currentCtx.err = 40962;
      return null;
    }
  },
  setBufferParam: (funcname, bufferId, param, value) => {
    if (!AL.currentCtx) {
      return;
    }
    var buf = AL.buffers[bufferId];
    if (!buf || bufferId === 0) {
      AL.currentCtx.err = 40961;
      return;
    }
    if (value === null) {
      AL.currentCtx.err = 40962;
      return;
    }
    switch (param) {
     case 8196:
      /* AL_SIZE */ if (value !== 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      // Per the spec, setting AL_SIZE to 0 is a legal NOP.
      break;

     case 8213:
      /* AL_LOOP_POINTS_SOFT */ if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
        AL.currentCtx.err = 40963;
        return;
      }
      if (buf.refCount > 0) {
        AL.currentCtx.err = 40964;
        return;
      }
      if (buf.audioBuf) {
        buf.audioBuf._loopStart = value[0] / buf.frequency;
        buf.audioBuf._loopEnd = value[1] / buf.frequency;
      }
      break;

     default:
      AL.currentCtx.err = 40962;
      return;
    }
  },
  getSourceParam: (funcname, sourceId, param) => {
    if (!AL.currentCtx) {
      return null;
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
      AL.currentCtx.err = 40961;
      return null;
    }
    switch (param) {
     case 514:
      /* AL_SOURCE_RELATIVE */ return src.relative;

     case 4097:
      /* AL_CONE_INNER_ANGLE */ return src.coneInnerAngle;

     case 4098:
      /* AL_CONE_OUTER_ANGLE */ return src.coneOuterAngle;

     case 4099:
      /* AL_PITCH */ return src.pitch;

     case 4100:
      return src.position;

     case 4101:
      return src.direction;

     case 4102:
      return src.velocity;

     case 4103:
      /* AL_LOOPING */ return src.looping;

     case 4105:
      /* AL_BUFFER */ if (src.type === 4136) {
        return src.bufQueue[0].id;
      }
      return 0;

     case 4106:
      return src.gain.gain.value;

     case 4109:
      /* AL_MIN_GAIN */ return src.minGain;

     case 4110:
      /* AL_MAX_GAIN */ return src.maxGain;

     case 4112:
      /* AL_SOURCE_STATE */ return src.state;

     case 4117:
      /* AL_BUFFERS_QUEUED */ if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
        return 0;
      }
      return src.bufQueue.length;

     case 4118:
      /* AL_BUFFERS_PROCESSED */ if ((src.bufQueue.length === 1 && src.bufQueue[0].id === 0) || src.looping) {
        return 0;
      }
      return src.bufsProcessed;

     case 4128:
      /* AL_REFERENCE_DISTANCE */ return src.refDistance;

     case 4129:
      /* AL_ROLLOFF_FACTOR */ return src.rolloffFactor;

     case 4130:
      /* AL_CONE_OUTER_GAIN */ return src.coneOuterGain;

     case 4131:
      /* AL_MAX_DISTANCE */ return src.maxDistance;

     case 4132:
      /* AL_SEC_OFFSET */ return AL.sourceTell(src);

     case 4133:
      /* AL_SAMPLE_OFFSET */ var offset = AL.sourceTell(src);
      if (offset > 0) {
        offset *= src.bufQueue[0].frequency;
      }
      return offset;

     case 4134:
      /* AL_BYTE_OFFSET */ var offset = AL.sourceTell(src);
      if (offset > 0) {
        offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
      }
      return offset;

     case 4135:
      /* AL_SOURCE_TYPE */ return src.type;

     case 4628:
      /* AL_SOURCE_SPATIALIZE_SOFT */ return src.spatialize;

     case 8201:
      /* AL_BYTE_LENGTH_SOFT */ var length = 0;
      var bytesPerFrame = 0;
      for (var i = 0; i < src.bufQueue.length; i++) {
        length += src.bufQueue[i].length;
        if (src.bufQueue[i].id !== 0) {
          bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
        }
      }
      return length * bytesPerFrame;

     case 8202:
      /* AL_SAMPLE_LENGTH_SOFT */ var length = 0;
      for (var i = 0; i < src.bufQueue.length; i++) {
        length += src.bufQueue[i].length;
      }
      return length;

     case 8203:
      /* AL_SEC_LENGTH_SOFT */ return AL.sourceDuration(src);

     case 53248:
      return src.distanceModel;

     default:
      AL.currentCtx.err = 40962;
      return null;
    }
  },
  setSourceParam: (funcname, sourceId, param, value) => {
    if (!AL.currentCtx) {
      return;
    }
    var src = AL.currentCtx.sources[sourceId];
    if (!src) {
      AL.currentCtx.err = 40961;
      return;
    }
    if (value === null) {
      AL.currentCtx.err = 40962;
      return;
    }
    switch (param) {
     case 514:
      /* AL_SOURCE_RELATIVE */ if (value === 1) {
        src.relative = true;
        AL.updateSourceSpace(src);
      } else if (value === 0) {
        src.relative = false;
        AL.updateSourceSpace(src);
      } else {
        AL.currentCtx.err = 40963;
        return;
      }
      break;

     case 4097:
      /* AL_CONE_INNER_ANGLE */ if (!Number.isFinite(value)) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.coneInnerAngle = value;
      if (src.panner) {
        src.panner.coneInnerAngle = value % 360;
      }
      break;

     case 4098:
      /* AL_CONE_OUTER_ANGLE */ if (!Number.isFinite(value)) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.coneOuterAngle = value;
      if (src.panner) {
        src.panner.coneOuterAngle = value % 360;
      }
      break;

     case 4099:
      /* AL_PITCH */ if (!Number.isFinite(value) || value <= 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      if (src.pitch === value) {
        break;
      }
      src.pitch = value;
      AL.updateSourceRate(src);
      break;

     case 4100:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.position[0] = value[0];
      src.position[1] = value[1];
      src.position[2] = value[2];
      AL.updateSourceSpace(src);
      break;

     case 4101:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.direction[0] = value[0];
      src.direction[1] = value[1];
      src.direction[2] = value[2];
      AL.updateSourceSpace(src);
      break;

     case 4102:
      if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.velocity[0] = value[0];
      src.velocity[1] = value[1];
      src.velocity[2] = value[2];
      AL.updateSourceSpace(src);
      break;

     case 4103:
      /* AL_LOOPING */ if (value === 1) {
        src.looping = true;
        AL.updateSourceTime(src);
        if (src.type === 4136 && src.audioQueue.length > 0) {
          var audioSrc = src.audioQueue[0];
          audioSrc.loop = true;
          audioSrc._duration = Number.POSITIVE_INFINITY;
        }
      } else if (value === 0) {
        src.looping = false;
        var currentTime = AL.updateSourceTime(src);
        if (src.type === 4136 && src.audioQueue.length > 0) {
          var audioSrc = src.audioQueue[0];
          audioSrc.loop = false;
          audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
          audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
        }
      } else {
        AL.currentCtx.err = 40963;
        return;
      }
      break;

     case 4105:
      /* AL_BUFFER */ if (src.state === 4114 || src.state === 4115) {
        AL.currentCtx.err = 40964;
        return;
      }
      if (value === 0) {
        for (var i in src.bufQueue) {
          src.bufQueue[i].refCount--;
        }
        src.bufQueue.length = 1;
        src.bufQueue[0] = AL.buffers[0];
        src.bufsProcessed = 0;
        src.type = 4144;
      } else /* AL_UNDETERMINED */ {
        var buf = AL.buffers[value];
        if (!buf) {
          AL.currentCtx.err = 40963;
          return;
        }
        for (var i in src.bufQueue) {
          src.bufQueue[i].refCount--;
        }
        src.bufQueue.length = 0;
        buf.refCount++;
        src.bufQueue = [ buf ];
        src.bufsProcessed = 0;
        src.type = 4136;
      }
      AL.initSourcePanner(src);
      AL.scheduleSourceAudio(src);
      break;

     case 4106:
      if (!Number.isFinite(value) || value < 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.gain.gain.value = value;
      break;

     case 4109:
      /* AL_MIN_GAIN */ if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.minGain = value;
      break;

     case 4110:
      /* AL_MAX_GAIN */ if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.maxGain = value;
      break;

     case 4128:
      /* AL_REFERENCE_DISTANCE */ if (!Number.isFinite(value) || value < 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.refDistance = value;
      if (src.panner) {
        src.panner.refDistance = value;
      }
      break;

     case 4129:
      /* AL_ROLLOFF_FACTOR */ if (!Number.isFinite(value) || value < 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.rolloffFactor = value;
      if (src.panner) {
        src.panner.rolloffFactor = value;
      }
      break;

     case 4130:
      /* AL_CONE_OUTER_GAIN */ if (!Number.isFinite(value) || value < 0 || value > 1) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.coneOuterGain = value;
      if (src.panner) {
        src.panner.coneOuterGain = value;
      }
      break;

     case 4131:
      /* AL_MAX_DISTANCE */ if (!Number.isFinite(value) || value < 0) {
        AL.currentCtx.err = 40963;
        return;
      }
      src.maxDistance = value;
      if (src.panner) {
        src.panner.maxDistance = value;
      }
      break;

     case 4132:
      /* AL_SEC_OFFSET */ if (value < 0 || value > AL.sourceDuration(src)) {
        AL.currentCtx.err = 40963;
        return;
      }
      AL.sourceSeek(src, value);
      break;

     case 4133:
      /* AL_SAMPLE_OFFSET */ var srcLen = AL.sourceDuration(src);
      if (srcLen > 0) {
        var frequency;
        for (var bufId in src.bufQueue) {
          if (bufId) {
            frequency = src.bufQueue[bufId].frequency;
            break;
          }
        }
        value /= frequency;
      }
      if (value < 0 || value > srcLen) {
        AL.currentCtx.err = 40963;
        return;
      }
      AL.sourceSeek(src, value);
      break;

     case 4134:
      /* AL_BYTE_OFFSET */ var srcLen = AL.sourceDuration(src);
      if (srcLen > 0) {
        var bytesPerSec;
        for (var bufId in src.bufQueue) {
          if (bufId) {
            var buf = src.bufQueue[bufId];
            bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
            break;
          }
        }
        value /= bytesPerSec;
      }
      if (value < 0 || value > srcLen) {
        AL.currentCtx.err = 40963;
        return;
      }
      AL.sourceSeek(src, value);
      break;

     case 4628:
      /* AL_SOURCE_SPATIALIZE_SOFT */ if (value !== 0 && value !== 1 && value !== 2) /* AL_AUTO_SOFT */ {
        AL.currentCtx.err = 40963;
        return;
      }
      src.spatialize = value;
      AL.initSourcePanner(src);
      break;

     case 8201:
     /* AL_BYTE_LENGTH_SOFT */ case 8202:
     /* AL_SAMPLE_LENGTH_SOFT */ case 8203:
      /* AL_SEC_LENGTH_SOFT */ AL.currentCtx.err = 40964;
      break;

     case 53248:
      switch (value) {
       case 0:
       case 53249:
       /* AL_INVERSE_DISTANCE */ case 53250:
       /* AL_INVERSE_DISTANCE_CLAMPED */ case 53251:
       /* AL_LINEAR_DISTANCE */ case 53252:
       /* AL_LINEAR_DISTANCE_CLAMPED */ case 53253:
       /* AL_EXPONENT_DISTANCE */ case 53254:
        /* AL_EXPONENT_DISTANCE_CLAMPED */ src.distanceModel = value;
        if (AL.currentCtx.sourceDistanceModel) {
          AL.updateContextGlobal(AL.currentCtx);
        }
        break;

       default:
        AL.currentCtx.err = 40963;
        return;
      }
      break;

     default:
      AL.currentCtx.err = 40962;
      return;
    }
  },
  captures: {},
  sharedCaptureAudioCtx: null,
  requireValidCaptureDevice: (deviceId, funcname) => {
    if (deviceId === 0) {
      AL.alcErr = 40961;
      return null;
    }
    var c = AL.captures[deviceId];
    if (!c) {
      AL.alcErr = 40961;
      return null;
    }
    var err = c.mediaStreamError;
    if (err) {
      AL.alcErr = 40961;
      return null;
    }
    return c;
  }
};

var _alBufferData = (bufferId, format, pData, size, freq) => {
  if (!AL.currentCtx) {
    return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf) {
    AL.currentCtx.err = 40963;
    return;
  }
  if (freq <= 0) {
    AL.currentCtx.err = 40963;
    return;
  }
  var audioBuf = null;
  try {
    switch (format) {
     case 4352:
      /* AL_FORMAT_MONO8 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
        var channel0 = audioBuf.getChannelData(0);
        for (var i = 0; i < size; ++i) {
          channel0[i] = HEAPU8[pData++] * .0078125 - /* 1/128 */ 1;
        }
      }
      buf.bytesPerSample = 1;
      buf.channels = 1;
      buf.length = size;
      break;

     case 4353:
      /* AL_FORMAT_MONO16 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
        var channel0 = audioBuf.getChannelData(0);
        pData >>= 1;
        for (var i = 0; i < size >> 1; ++i) {
          channel0[i] = HEAP16[pData++] * 30517578125e-15;
        }
      }
      buf.bytesPerSample = 2;
      buf.channels = 1;
      buf.length = size >> 1;
      break;

     case 4354:
      /* AL_FORMAT_STEREO8 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
        var channel0 = audioBuf.getChannelData(0);
        var channel1 = audioBuf.getChannelData(1);
        for (var i = 0; i < size >> 1; ++i) {
          channel0[i] = HEAPU8[pData++] * .0078125 - /* 1/128 */ 1;
          channel1[i] = HEAPU8[pData++] * .0078125 - /* 1/128 */ 1;
        }
      }
      buf.bytesPerSample = 1;
      buf.channels = 2;
      buf.length = size >> 1;
      break;

     case 4355:
      /* AL_FORMAT_STEREO16 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
        var channel0 = audioBuf.getChannelData(0);
        var channel1 = audioBuf.getChannelData(1);
        pData >>= 1;
        for (var i = 0; i < size >> 2; ++i) {
          channel0[i] = HEAP16[pData++] * 30517578125e-15;
          /* 1/32768 */ channel1[i] = HEAP16[pData++] * 30517578125e-15;
        }
      }
      buf.bytesPerSample = 2;
      buf.channels = 2;
      buf.length = size >> 2;
      break;

     case 65552:
      /* AL_FORMAT_MONO_FLOAT32 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
        var channel0 = audioBuf.getChannelData(0);
        pData >>= 2;
        for (var i = 0; i < size >> 2; ++i) {
          channel0[i] = HEAPF32[pData++];
        }
      }
      buf.bytesPerSample = 4;
      buf.channels = 1;
      buf.length = size >> 2;
      break;

     case 65553:
      /* AL_FORMAT_STEREO_FLOAT32 */ if (size > 0) {
        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
        var channel0 = audioBuf.getChannelData(0);
        var channel1 = audioBuf.getChannelData(1);
        pData >>= 2;
        for (var i = 0; i < size >> 3; ++i) {
          channel0[i] = HEAPF32[pData++];
          channel1[i] = HEAPF32[pData++];
        }
      }
      buf.bytesPerSample = 4;
      buf.channels = 2;
      buf.length = size >> 3;
      break;

     default:
      AL.currentCtx.err = 40963;
      return;
    }
    buf.frequency = freq;
    buf.audioBuf = audioBuf;
  } catch (e) {
    AL.currentCtx.err = 40963;
    return;
  }
};

var _alDeleteBuffers = (count, pBufferIds) => {
  if (!AL.currentCtx) {
    return;
  }
  for (var i = 0; i < count; ++i) {
    var bufId = HEAP32[(((pBufferIds) + (i * 4)) >> 2)];
    /// Deleting the zero buffer is a legal NOP, so ignore it
    if (bufId === 0) {
      continue;
    }
    // Make sure the buffer index is valid.
    if (!AL.buffers[bufId]) {
      AL.currentCtx.err = 40961;
      return;
    }
    // Make sure the buffer is no longer in use.
    if (AL.buffers[bufId].refCount) {
      AL.currentCtx.err = 40964;
      return;
    }
  }
  for (var i = 0; i < count; ++i) {
    var bufId = HEAP32[(((pBufferIds) + (i * 4)) >> 2)];
    if (bufId === 0) {
      continue;
    }
    AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
    delete AL.buffers[bufId];
    AL.freeIds.push(bufId);
  }
};

var _alSourcei = (sourceId, param, value) => {
  switch (param) {
   case 514:
   /* AL_SOURCE_RELATIVE */ case 4097:
   /* AL_CONE_INNER_ANGLE */ case 4098:
   /* AL_CONE_OUTER_ANGLE */ case 4103:
   /* AL_LOOPING */ case 4105:
   /* AL_BUFFER */ case 4128:
   /* AL_REFERENCE_DISTANCE */ case 4129:
   /* AL_ROLLOFF_FACTOR */ case 4131:
   /* AL_MAX_DISTANCE */ case 4132:
   /* AL_SEC_OFFSET */ case 4133:
   /* AL_SAMPLE_OFFSET */ case 4134:
   /* AL_BYTE_OFFSET */ case 4628:
   /* AL_SOURCE_SPATIALIZE_SOFT */ case 8201:
   /* AL_BYTE_LENGTH_SOFT */ case 8202:
   /* AL_SAMPLE_LENGTH_SOFT */ case 53248:
    AL.setSourceParam("alSourcei", sourceId, param, value);
    break;

   default:
    AL.setSourceParam("alSourcei", sourceId, param, null);
    break;
  }
};

var _alDeleteSources = (count, pSourceIds) => {
  if (!AL.currentCtx) {
    return;
  }
  for (var i = 0; i < count; ++i) {
    var srcId = HEAP32[(((pSourceIds) + (i * 4)) >> 2)];
    if (!AL.currentCtx.sources[srcId]) {
      AL.currentCtx.err = 40961;
      return;
    }
  }
  for (var i = 0; i < count; ++i) {
    var srcId = HEAP32[(((pSourceIds) + (i * 4)) >> 2)];
    AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
    _alSourcei(srcId, 4105, /* AL_BUFFER */ 0);
    delete AL.currentCtx.sources[srcId];
    AL.freeIds.push(srcId);
  }
};

var _alDopplerFactor = value => {
  AL.setGlobalParam("alDopplerFactor", 49152, value);
};

var _alDopplerVelocity = value => {
  warnOnce("alDopplerVelocity() is deprecated, and only kept for compatibility with OpenAL 1.0. Use alSpeedOfSound() instead.");
  if (!AL.currentCtx) {
    return;
  }
  if (value <= 0) {
    // Negative or zero values are disallowed
    AL.currentCtx.err = 40963;
    return;
  }
};

var _alGenBuffers = (count, pBufferIds) => {
  if (!AL.currentCtx) {
    return;
  }
  for (var i = 0; i < count; ++i) {
    var buf = {
      deviceId: AL.currentCtx.deviceId,
      id: AL.newId(),
      refCount: 0,
      audioBuf: null,
      frequency: 0,
      bytesPerSample: 2,
      channels: 1,
      length: 0
    };
    AL.deviceRefCounts[buf.deviceId]++;
    AL.buffers[buf.id] = buf;
    HEAP32[(((pBufferIds) + (i * 4)) >> 2)] = buf.id;
  }
};

var _alGenSources = (count, pSourceIds) => {
  if (!AL.currentCtx) {
    return;
  }
  for (var i = 0; i < count; ++i) {
    var gain = AL.currentCtx.audioCtx.createGain();
    gain.connect(AL.currentCtx.gain);
    var src = {
      context: AL.currentCtx,
      id: AL.newId(),
      type: 4144,
      /* AL_UNDETERMINED */ state: 4113,
      bufQueue: [ AL.buffers[0] ],
      audioQueue: [],
      looping: false,
      pitch: 1,
      dopplerShift: 1,
      gain,
      minGain: 0,
      maxGain: 1,
      panner: null,
      bufsProcessed: 0,
      bufStartTime: Number.NEGATIVE_INFINITY,
      bufOffset: 0,
      relative: false,
      refDistance: 1,
      maxDistance: 340282e33,
      /* FLT_MAX */ rolloffFactor: 1,
      position: [ 0, 0, 0 ],
      velocity: [ 0, 0, 0 ],
      direction: [ 0, 0, 0 ],
      coneOuterGain: 0,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      distanceModel: 53250,
      /* AL_INVERSE_DISTANCE_CLAMPED */ spatialize: 2,
      /* AL_AUTO_SOFT */ get playbackRate() {
        return this.pitch * this.dopplerShift;
      }
    };
    AL.currentCtx.sources[src.id] = src;
    HEAP32[(((pSourceIds) + (i * 4)) >> 2)] = src.id;
  }
};

var _alGetError = () => {
  if (!AL.currentCtx) {
    return 40964;
  }
  // Reset error on get.
  var err = AL.currentCtx.err;
  AL.currentCtx.err = 0;
  return err;
};

var _alGetSourceiv = (sourceId, param, pValues) => {
  var val = AL.getSourceParam("alGetSourceiv", sourceId, param);
  if (val === null) {
    return;
  }
  if (!pValues) {
    AL.currentCtx.err = 40963;
    return;
  }
  switch (param) {
   case 514:
   /* AL_SOURCE_RELATIVE */ case 4097:
   /* AL_CONE_INNER_ANGLE */ case 4098:
   /* AL_CONE_OUTER_ANGLE */ case 4103:
   /* AL_LOOPING */ case 4105:
   /* AL_BUFFER */ case 4112:
   /* AL_SOURCE_STATE */ case 4117:
   /* AL_BUFFERS_QUEUED */ case 4118:
   /* AL_BUFFERS_PROCESSED */ case 4128:
   /* AL_REFERENCE_DISTANCE */ case 4129:
   /* AL_ROLLOFF_FACTOR */ case 4131:
   /* AL_MAX_DISTANCE */ case 4132:
   /* AL_SEC_OFFSET */ case 4133:
   /* AL_SAMPLE_OFFSET */ case 4134:
   /* AL_BYTE_OFFSET */ case 4135:
   /* AL_SOURCE_TYPE */ case 4628:
   /* AL_SOURCE_SPATIALIZE_SOFT */ case 8201:
   /* AL_BYTE_LENGTH_SOFT */ case 8202:
   /* AL_SAMPLE_LENGTH_SOFT */ case 53248:
    HEAP32[((pValues) >> 2)] = val;
    break;

   case 4100:
   case 4101:
   case 4102:
    HEAP32[((pValues) >> 2)] = val[0];
    HEAP32[(((pValues) + (4)) >> 2)] = val[1];
    HEAP32[(((pValues) + (8)) >> 2)] = val[2];
    break;

   default:
    AL.currentCtx.err = 40962;
    return;
  }
};

var _alIsBuffer = bufferId => {
  if (!AL.currentCtx) {
    return false;
  }
  if (bufferId > AL.buffers.length) {
    return false;
  }
  if (!AL.buffers[bufferId]) {
    return false;
  }
  return true;
};

var _alListenerf = (param, value) => {
  switch (param) {
   case 4106:
    AL.setListenerParam("alListenerf", param, value);
    break;

   default:
    AL.setListenerParam("alListenerf", param, null);
    break;
  }
};

var _alListenerfv = (param, pValues) => {
  if (!AL.currentCtx) {
    return;
  }
  if (!pValues) {
    AL.currentCtx.err = 40963;
    return;
  }
  switch (param) {
   case 4100:
   case 4102:
    AL.paramArray[0] = HEAPF32[((pValues) >> 2)];
    AL.paramArray[1] = HEAPF32[(((pValues) + (4)) >> 2)];
    AL.paramArray[2] = HEAPF32[(((pValues) + (8)) >> 2)];
    AL.setListenerParam("alListenerfv", param, AL.paramArray);
    break;

   case 4111:
    AL.paramArray[0] = HEAPF32[((pValues) >> 2)];
    AL.paramArray[1] = HEAPF32[(((pValues) + (4)) >> 2)];
    AL.paramArray[2] = HEAPF32[(((pValues) + (8)) >> 2)];
    AL.paramArray[3] = HEAPF32[(((pValues) + (12)) >> 2)];
    AL.paramArray[4] = HEAPF32[(((pValues) + (16)) >> 2)];
    AL.paramArray[5] = HEAPF32[(((pValues) + (20)) >> 2)];
    AL.setListenerParam("alListenerfv", param, AL.paramArray);
    break;

   default:
    AL.setListenerParam("alListenerfv", param, null);
    break;
  }
};

var _alSourcePause = sourceId => {
  if (!AL.currentCtx) {
    return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
    AL.currentCtx.err = 40961;
    return;
  }
  AL.setSourceState(src, 4115);
};

var _alSourcePlay = sourceId => {
  if (!AL.currentCtx) {
    return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
    AL.currentCtx.err = 40961;
    return;
  }
  AL.setSourceState(src, 4114);
};

var _alSourceStop = sourceId => {
  if (!AL.currentCtx) {
    return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
    AL.currentCtx.err = 40961;
    return;
  }
  AL.setSourceState(src, 4116);
};

var _alSourceStopv = (count, pSourceIds) => {
  if (!AL.currentCtx) {
    return;
  }
  if (!pSourceIds) {
    AL.currentCtx.err = 40963;
  }
  for (var i = 0; i < count; ++i) {
    if (!AL.currentCtx.sources[HEAP32[(((pSourceIds) + (i * 4)) >> 2)]]) {
      AL.currentCtx.err = 40961;
      return;
    }
  }
  for (var i = 0; i < count; ++i) {
    var srcId = HEAP32[(((pSourceIds) + (i * 4)) >> 2)];
    AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
  }
};

var _alSourcef = (sourceId, param, value) => {
  switch (param) {
   case 4097:
   /* AL_CONE_INNER_ANGLE */ case 4098:
   /* AL_CONE_OUTER_ANGLE */ case 4099:
   /* AL_PITCH */ case 4106:
   case 4109:
   /* AL_MIN_GAIN */ case 4110:
   /* AL_MAX_GAIN */ case 4128:
   /* AL_REFERENCE_DISTANCE */ case 4129:
   /* AL_ROLLOFF_FACTOR */ case 4130:
   /* AL_CONE_OUTER_GAIN */ case 4131:
   /* AL_MAX_DISTANCE */ case 4132:
   /* AL_SEC_OFFSET */ case 4133:
   /* AL_SAMPLE_OFFSET */ case 4134:
   /* AL_BYTE_OFFSET */ case 8203:
    /* AL_SEC_LENGTH_SOFT */ AL.setSourceParam("alSourcef", sourceId, param, value);
    break;

   default:
    AL.setSourceParam("alSourcef", sourceId, param, null);
    break;
  }
};

var _alSourcefv = (sourceId, param, pValues) => {
  if (!AL.currentCtx) {
    return;
  }
  if (!pValues) {
    AL.currentCtx.err = 40963;
    return;
  }
  switch (param) {
   case 4097:
   /* AL_CONE_INNER_ANGLE */ case 4098:
   /* AL_CONE_OUTER_ANGLE */ case 4099:
   /* AL_PITCH */ case 4106:
   case 4109:
   /* AL_MIN_GAIN */ case 4110:
   /* AL_MAX_GAIN */ case 4128:
   /* AL_REFERENCE_DISTANCE */ case 4129:
   /* AL_ROLLOFF_FACTOR */ case 4130:
   /* AL_CONE_OUTER_GAIN */ case 4131:
   /* AL_MAX_DISTANCE */ case 4132:
   /* AL_SEC_OFFSET */ case 4133:
   /* AL_SAMPLE_OFFSET */ case 4134:
   /* AL_BYTE_OFFSET */ case 8203:
    /* AL_SEC_LENGTH_SOFT */ var val = HEAPF32[((pValues) >> 2)];
    AL.setSourceParam("alSourcefv", sourceId, param, val);
    break;

   case 4100:
   case 4101:
   case 4102:
    AL.paramArray[0] = HEAPF32[((pValues) >> 2)];
    AL.paramArray[1] = HEAPF32[(((pValues) + (4)) >> 2)];
    AL.paramArray[2] = HEAPF32[(((pValues) + (8)) >> 2)];
    AL.setSourceParam("alSourcefv", sourceId, param, AL.paramArray);
    break;

   default:
    AL.setSourceParam("alSourcefv", sourceId, param, null);
    break;
  }
};

var _alcCloseDevice = deviceId => {
  if (!(deviceId in AL.deviceRefCounts) || AL.deviceRefCounts[deviceId] > 0) {
    return 0;
  }
  delete AL.deviceRefCounts[deviceId];
  AL.freeIds.push(deviceId);
  return 1;
};

var listenOnce = (object, event, func) => object.addEventListener(event, func, {
  "once": true
});

/** @param {Object=} elements */ var autoResumeAudioContext = (ctx, elements) => {
  if (!elements) {
    elements = [ document, document.getElementById("canvas") ];
  }
  [ "keydown", "mousedown", "touchstart" ].forEach(event => {
    elements.forEach(element => {
      if (element) {
        listenOnce(element, event, () => {
          if (ctx.state === "suspended") ctx.resume();
        });
      }
    });
  });
};

var _alcCreateContext = (deviceId, pAttrList) => {
  if (!(deviceId in AL.deviceRefCounts)) {
    AL.alcErr = 40961;
    /* ALC_INVALID_DEVICE */ return 0;
  }
  var options = null;
  var attrs = [];
  var hrtf = null;
  pAttrList >>= 2;
  if (pAttrList) {
    var attr = 0;
    var val = 0;
    while (true) {
      attr = HEAP32[pAttrList++];
      attrs.push(attr);
      if (attr === 0) {
        break;
      }
      val = HEAP32[pAttrList++];
      attrs.push(val);
      switch (attr) {
       case 4103:
        /* ALC_FREQUENCY */ if (!options) {
          options = {};
        }
        options.sampleRate = val;
        break;

       case 4112:
       // fallthrough
        case 4113:
        // Do nothing; these hints are satisfied by default
        break;

       case 6546:
        /* ALC_HRTF_SOFT */ switch (val) {
         case 0:
          hrtf = false;
          break;

         case 1:
          hrtf = true;
          break;

         case 2:
          /* ALC_DONT_CARE_SOFT */ break;

         default:
          AL.alcErr = 40964;
          return 0;
        }
        break;

       case 6550:
        /* ALC_HRTF_ID_SOFT */ if (val !== 0) {
          AL.alcErr = 40964;
          return 0;
        }
        break;

       default:
        AL.alcErr = 40964;
        /* ALC_INVALID_VALUE */ return 0;
      }
    }
  }
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var ac = null;
  try {
    // Only try to pass options if there are any, for compat with browsers that don't support this
    if (options) {
      ac = new AudioContext(options);
    } else {
      ac = new AudioContext;
    }
  } catch (e) {
    if (e.name === "NotSupportedError") {
      AL.alcErr = 40964;
    } else /* ALC_INVALID_VALUE */ {
      AL.alcErr = 40961;
    }
    /* ALC_INVALID_DEVICE */ return 0;
  }
  autoResumeAudioContext(ac);
  // Old Web Audio API (e.g. Safari 6.0.5) had an inconsistently named createGainNode function.
  if (typeof ac.createGain == "undefined") {
    ac.createGain = ac.createGainNode;
  }
  var gain = ac.createGain();
  gain.connect(ac.destination);
  var ctx = {
    deviceId,
    id: AL.newId(),
    attrs,
    audioCtx: ac,
    listener: {
      position: [ 0, 0, 0 ],
      velocity: [ 0, 0, 0 ],
      direction: [ 0, 0, 0 ],
      up: [ 0, 0, 0 ]
    },
    sources: [],
    interval: setInterval(() => AL.scheduleContextAudio(ctx), AL.QUEUE_INTERVAL),
    gain,
    distanceModel: 53250,
    /* AL_INVERSE_DISTANCE_CLAMPED */ speedOfSound: 343.3,
    dopplerFactor: 1,
    sourceDistanceModel: false,
    hrtf: hrtf || false,
    _err: 0,
    get err() {
      return this._err;
    },
    set err(val) {
      // Errors should not be overwritten by later errors until they are cleared by a query.
      if (this._err === 0 || val === 0) {
        this._err = val;
      }
    }
  };
  AL.deviceRefCounts[deviceId]++;
  AL.contexts[ctx.id] = ctx;
  if (hrtf !== null) {
    // Apply hrtf attrib to all contexts for this device
    for (var ctxId in AL.contexts) {
      var c = AL.contexts[ctxId];
      if (c.deviceId === deviceId) {
        c.hrtf = hrtf;
        AL.updateContextGlobal(c);
      }
    }
  }
  return ctx.id;
};

var _alcDestroyContext = contextId => {
  var ctx = AL.contexts[contextId];
  if (AL.currentCtx === ctx) {
    AL.alcErr = 40962;
    /* ALC_INVALID_CONTEXT */ return;
  }
  // Stop playback, etc
  if (AL.contexts[contextId].interval) {
    clearInterval(AL.contexts[contextId].interval);
  }
  AL.deviceRefCounts[ctx.deviceId]--;
  delete AL.contexts[contextId];
  AL.freeIds.push(contextId);
};

var _alcGetError = deviceId => {
  var err = AL.alcErr;
  AL.alcErr = 0;
  return err;
};

var _alcMakeContextCurrent = contextId => {
  if (contextId === 0) {
    AL.currentCtx = null;
  } else {
    AL.currentCtx = AL.contexts[contextId];
  }
  return 1;
};

var _alcOpenDevice = pDeviceName => {
  if (pDeviceName) {
    var name = UTF8ToString(pDeviceName);
    if (name !== AL.DEVICE_NAME) {
      return 0;
    }
  }
  if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
    var deviceId = AL.newId();
    AL.deviceRefCounts[deviceId] = 0;
    return deviceId;
  }
  return 0;
};

var _emscripten_date_now = () => Date.now();

var nowIsMonotonic = 1;

var checkWasiClock = clock_id => clock_id >= 0 && clock_id <= 3;

function _clock_time_get(clk_id, ignored_precision_low, ignored_precision_high, ptime) {
  var ignored_precision = convertI32PairToI53Checked(ignored_precision_low, ignored_precision_high);
  if (!checkWasiClock(clk_id)) {
    return 28;
  }
  var now;
  // all wasi clocks but realtime are monotonic
  if (clk_id === 0) {
    now = _emscripten_date_now();
  } else if (nowIsMonotonic) {
    now = _emscripten_get_now();
  } else {
    return 52;
  }
  // "now" is in ms, and wasi times are in ns.
  var nsec = Math.round(now * 1e3 * 1e3);
  (tempI64 = [ nsec >>> 0, (tempDouble = nsec, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  HEAP32[((ptime) >> 2)] = tempI64[0], HEAP32[(((ptime) + (4)) >> 2)] = tempI64[1]);
  return 0;
}

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
  readEmAsmArgsArray.length = 0;
  var ch;
  // Most arguments are i32s, so shift the buffer pointer so it is a plain
  // index into HEAP32.
  while (ch = HEAPU8[sigPtr++]) {
    // Floats are always passed as doubles, so all types except for 'i'
    // are 8 bytes and require alignment.
    var wide = (ch != 105);
    wide &= (ch != 112);
    buf += wide && (buf % 8) ? 4 : 0;
    readEmAsmArgsArray.push(// Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
    ch == 112 ? HEAPU32[((buf) >> 2)] : ch == 105 ? HEAP32[((buf) >> 2)] : HEAPF64[((buf) >> 3)]);
    buf += wide ? 8 : 4;
  }
  return readEmAsmArgsArray;
};

var runEmAsmFunction = (code, sigPtr, argbuf) => {
  var args = readEmAsmArgs(sigPtr, argbuf);
  return ASM_CONSTS[code](...args);
};

var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);

var _emscripten_cancel_main_loop = () => {
  MainLoop.pause();
  MainLoop.func = null;
};

var _emscripten_force_exit = status => {
  __emscripten_runtime_keepalive_clear();
  _exit(status);
};

var JSEvents = {
  memcpy(target, src, size) {
    HEAP8.set(HEAP8.subarray(src, src + size), target);
  },
  removeAllEventListeners() {
    while (JSEvents.eventHandlers.length) {
      JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
    }
    JSEvents.deferredCalls = [];
  },
  inEventHandler: 0,
  deferredCalls: [],
  deferCall(targetFunction, precedence, argsList) {
    function arraysHaveEqualContent(arrA, arrB) {
      if (arrA.length != arrB.length) return false;
      for (var i in arrA) {
        if (arrA[i] != arrB[i]) return false;
      }
      return true;
    }
    // Test if the given call was already queued, and if so, don't add it again.
    for (var call of JSEvents.deferredCalls) {
      if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
        return;
      }
    }
    JSEvents.deferredCalls.push({
      targetFunction,
      precedence,
      argsList
    });
    JSEvents.deferredCalls.sort((x, y) => x.precedence < y.precedence);
  },
  removeDeferredCalls(targetFunction) {
    JSEvents.deferredCalls = JSEvents.deferredCalls.filter(call => call.targetFunction != targetFunction);
  },
  canPerformEventHandlerRequests() {
    if (navigator.userActivation) {
      // Verify against transient activation status from UserActivation API
      // whether it is possible to perform a request here without needing to defer. See
      // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation#transient_activation
      // and https://caniuse.com/mdn-api_useractivation
      // At the time of writing, Firefox does not support this API: https://bugzilla.mozilla.org/show_bug.cgi?id=1791079
      return navigator.userActivation.isActive;
    }
    return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
  },
  runDeferredCalls() {
    if (!JSEvents.canPerformEventHandlerRequests()) {
      return;
    }
    var deferredCalls = JSEvents.deferredCalls;
    JSEvents.deferredCalls = [];
    for (var call of deferredCalls) {
      call.targetFunction(...call.argsList);
    }
  },
  eventHandlers: [],
  removeAllHandlersOnTarget: (target, eventTypeString) => {
    for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
      if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
        JSEvents._removeHandler(i--);
      }
    }
  },
  _removeHandler(i) {
    var h = JSEvents.eventHandlers[i];
    h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
    JSEvents.eventHandlers.splice(i, 1);
  },
  registerOrRemoveHandler(eventHandler) {
    if (!eventHandler.target) {
      return -4;
    }
    if (eventHandler.callbackfunc) {
      eventHandler.eventListenerFunc = function(event) {
        // Increment nesting count for the event handler.
        ++JSEvents.inEventHandler;
        JSEvents.currentEventHandler = eventHandler;
        // Process any old deferred calls the user has placed.
        JSEvents.runDeferredCalls();
        // Process the actual event, calls back to user C code handler.
        eventHandler.handlerFunc(event);
        // Process any new deferred calls that were placed right now from this event handler.
        JSEvents.runDeferredCalls();
        // Out of event handler - restore nesting count.
        --JSEvents.inEventHandler;
      };
      eventHandler.target.addEventListener(eventHandler.eventTypeString, eventHandler.eventListenerFunc, eventHandler.useCapture);
      JSEvents.eventHandlers.push(eventHandler);
    } else {
      for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
        if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
          JSEvents._removeHandler(i--);
        }
      }
    }
    return 0;
  },
  getNodeNameForTarget(target) {
    if (!target) return "";
    if (target == window) return "#window";
    if (target == screen) return "#screen";
    return target?.nodeName || "";
  },
  fullscreenEnabled() {
    return document.fullscreenEnabled || // Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitFullscreenEnabled.
    // TODO: If Safari at some point ships with unprefixed version, update the version check above.
    document.webkitFullscreenEnabled;
  }
};

var maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;

/** @type {Object} */ var specialHTMLTargets = [ 0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0 ];

/** @suppress {duplicate } */ var findEventTarget = target => {
  target = maybeCStringToJsString(target);
  var domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : null);
  return domElement;
};

var findCanvasEventTarget = findEventTarget;

var _emscripten_get_canvas_element_size = (target, width, height) => {
  var canvas = findCanvasEventTarget(target);
  if (!canvas) return -4;
  HEAP32[((width) >> 2)] = canvas.width;
  HEAP32[((height) >> 2)] = canvas.height;
};

var getBoundingClientRect = e => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {
  "left": 0,
  "top": 0
};

var _emscripten_get_element_css_size = (target, width, height) => {
  target = findEventTarget(target);
  if (!target) return -4;
  var rect = getBoundingClientRect(target);
  HEAPF64[((width) >> 3)] = rect.width;
  HEAPF64[((height) >> 3)] = rect.height;
  return 0;
};

var getHeapMax = () => // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
// for any code that deals with heap sizes, which would require special
// casing all heap size related code to treat 0 specially.
2147483648;

var _emscripten_get_heap_max = () => getHeapMax();

var GLctx;

var webgl_enable_ANGLE_instanced_arrays = ctx => {
  // Extension available in WebGL 1 from Firefox 26 and Google Chrome 30 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  // Because this extension is a core function in WebGL 2, assign the extension entry points in place of
  // where the core functions will reside in WebGL 2. This way the calling code can call these without
  // having to dynamically branch depending if running against WebGL 1 or WebGL 2.
  if (ext) {
    ctx["vertexAttribDivisor"] = (index, divisor) => ext["vertexAttribDivisorANGLE"](index, divisor);
    ctx["drawArraysInstanced"] = (mode, first, count, primcount) => ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
    ctx["drawElementsInstanced"] = (mode, count, type, indices, primcount) => ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    return 1;
  }
};

var webgl_enable_OES_vertex_array_object = ctx => {
  // Extension available in WebGL 1 from Firefox 25 and WebKit 536.28/desktop Safari 6.0.3 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext) {
    ctx["createVertexArray"] = () => ext["createVertexArrayOES"]();
    ctx["deleteVertexArray"] = vao => ext["deleteVertexArrayOES"](vao);
    ctx["bindVertexArray"] = vao => ext["bindVertexArrayOES"](vao);
    ctx["isVertexArray"] = vao => ext["isVertexArrayOES"](vao);
    return 1;
  }
};

var webgl_enable_WEBGL_draw_buffers = ctx => {
  // Extension available in WebGL 1 from Firefox 28 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext) {
    ctx["drawBuffers"] = (n, bufs) => ext["drawBuffersWEBGL"](n, bufs);
    return 1;
  }
};

var webgl_enable_EXT_polygon_offset_clamp = ctx => !!(ctx.extPolygonOffsetClamp = ctx.getExtension("EXT_polygon_offset_clamp"));

var webgl_enable_EXT_clip_control = ctx => !!(ctx.extClipControl = ctx.getExtension("EXT_clip_control"));

var webgl_enable_WEBGL_polygon_mode = ctx => !!(ctx.webglPolygonMode = ctx.getExtension("WEBGL_polygon_mode"));

var webgl_enable_WEBGL_multi_draw = ctx => // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
!!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var getEmscriptenSupportedExtensions = ctx => {
  // Restrict the list of advertised extensions to those that we actually
  // support.
  var supportedExtensions = [ // WebGL 1 extensions
  "ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", // WebGL 1 and WebGL 2 extensions
  "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode" ];
  // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
  return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext));
};

var registerPreMainLoop = f => {
  // Does nothing unless $MainLoop is included/used.
  typeof MainLoop != "undefined" && MainLoop.preMainLoop.push(f);
};

var GL = {
  counter: 1,
  buffers: [],
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  byteSizeByTypeRoot: 5120,
  byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
  stringCache: {},
  unpackAlignment: 4,
  unpackRowLength: 0,
  recordError: errorCode => {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: table => {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    return ret;
  },
  genObject: (n, buffers, createFunction, objectTable) => {
    for (var i = 0; i < n; i++) {
      var buffer = GLctx[createFunction]();
      var id = buffer && GL.getNewId(objectTable);
      if (buffer) {
        buffer.name = id;
        objectTable[id] = buffer;
      } else {
        GL.recordError(1282);
      }
      HEAP32[(((buffers) + (i * 4)) >> 2)] = id;
    }
  },
  MAX_TEMP_BUFFER_SIZE: 2097152,
  numTempVertexBuffersPerSize: 64,
  log2ceilLookup: i => 32 - Math.clz32(i === 0 ? 0 : i - 1),
  generateTempBuffers: (quads, context) => {
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    context.tempVertexBufferCounters1 = [];
    context.tempVertexBufferCounters2 = [];
    context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
    context.tempVertexBuffers1 = [];
    context.tempVertexBuffers2 = [];
    context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
    context.tempIndexBuffers = [];
    context.tempIndexBuffers.length = largestIndex + 1;
    for (var i = 0; i <= largestIndex; ++i) {
      context.tempIndexBuffers[i] = null;
      // Created on-demand
      context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
      var ringbufferLength = GL.numTempVertexBuffersPerSize;
      context.tempVertexBuffers1[i] = [];
      context.tempVertexBuffers2[i] = [];
      var ringbuffer1 = context.tempVertexBuffers1[i];
      var ringbuffer2 = context.tempVertexBuffers2[i];
      ringbuffer1.length = ringbuffer2.length = ringbufferLength;
      for (var j = 0; j < ringbufferLength; ++j) {
        ringbuffer1[j] = ringbuffer2[j] = null;
      }
    }
    if (quads) {
      // GL_QUAD indexes can be precalculated
      context.tempQuadIndexBuffer = GLctx.createBuffer();
      context.GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ context.tempQuadIndexBuffer);
      var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
      var quadIndexes = new Uint16Array(numIndexes);
      var i = 0, v = 0;
      while (1) {
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 1;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 3;
        if (i >= numIndexes) break;
        v += 4;
      }
      context.GLctx.bufferData(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ quadIndexes, 35044);
      /*GL_STATIC_DRAW*/ context.GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ null);
    }
  },
  getTempVertexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
    var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
    GL.currentContext.tempVertexBufferCounters1[idx] = (GL.currentContext.tempVertexBufferCounters1[idx] + 1) & (GL.numTempVertexBuffersPerSize - 1);
    var vbo = ringbuffer[nextFreeBufferIndex];
    if (vbo) {
      return vbo;
    }
    var prevVBO = GLctx.getParameter(34964);
    /*GL_ARRAY_BUFFER_BINDING*/ ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
    GLctx.bindBuffer(34962, /*GL_ARRAY_BUFFER*/ ringbuffer[nextFreeBufferIndex]);
    GLctx.bufferData(34962, /*GL_ARRAY_BUFFER*/ 1 << idx, 35048);
    /*GL_DYNAMIC_DRAW*/ GLctx.bindBuffer(34962, /*GL_ARRAY_BUFFER*/ prevVBO);
    return ringbuffer[nextFreeBufferIndex];
  },
  getTempIndexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ibo = GL.currentContext.tempIndexBuffers[idx];
    if (ibo) {
      return ibo;
    }
    var prevIBO = GLctx.getParameter(34965);
    /*ELEMENT_ARRAY_BUFFER_BINDING*/ GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
    GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ GL.currentContext.tempIndexBuffers[idx]);
    GLctx.bufferData(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ 1 << idx, 35048);
    /*GL_DYNAMIC_DRAW*/ GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ prevIBO);
    return GL.currentContext.tempIndexBuffers[idx];
  },
  newRenderingFrameStarted: () => {
    if (!GL.currentContext) {
      return;
    }
    var vb = GL.currentContext.tempVertexBuffers1;
    GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
    GL.currentContext.tempVertexBuffers2 = vb;
    vb = GL.currentContext.tempVertexBufferCounters1;
    GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
    GL.currentContext.tempVertexBufferCounters2 = vb;
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    for (var i = 0; i <= largestIndex; ++i) {
      GL.currentContext.tempVertexBufferCounters1[i] = 0;
    }
  },
  getSource: (shader, count, string, length) => {
    var source = "";
    for (var i = 0; i < count; ++i) {
      var len = length ? HEAPU32[(((length) + (i * 4)) >> 2)] : undefined;
      source += UTF8ToString(HEAPU32[(((string) + (i * 4)) >> 2)], len);
    }
    return source;
  },
  calcBufLength: (size, type, stride, count) => {
    if (stride > 0) {
      return count * stride;
    }
    // XXXvlad this is not exactly correct I don't think
    var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
    return size * typeSize * count;
  },
  usedTempBuffers: [],
  preDrawHandleClientVertexAttribBindings: count => {
    GL.resetBufferBinding = false;
    // TODO: initial pass to detect ranges we need to upload, might not need
    // an upload per attrib
    for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
      var cb = GL.currentContext.clientBuffers[i];
      if (!cb.clientside || !cb.enabled) continue;
      GL.resetBufferBinding = true;
      var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
      var buf = GL.getTempVertexBuffer(size);
      GLctx.bindBuffer(34962, /*GL_ARRAY_BUFFER*/ buf);
      GLctx.bufferSubData(34962, 0, HEAPU8.subarray(cb.ptr, cb.ptr + size));
      cb.vertexAttribPointerAdaptor.call(GLctx, i, cb.size, cb.type, cb.normalized, cb.stride, 0);
    }
  },
  postDrawHandleClientVertexAttribBindings: () => {
    if (GL.resetBufferBinding) {
      GLctx.bindBuffer(34962, /*GL_ARRAY_BUFFER*/ GL.buffers[GLctx.currentArrayBufferBinding]);
    }
  },
  createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
    // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL
    // context on a canvas, calling .getContext() will always return that
    // context independent of which 'webgl' or 'webgl2'
    // context version was passed. See:
    //   https://bugs.webkit.org/show_bug.cgi?id=222758
    // and:
    //   https://github.com/emscripten-core/emscripten/issues/13295.
    // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari
    // version field in above check.
    if (!canvas.getContextSafariWebGL2Fixed) {
      canvas.getContextSafariWebGL2Fixed = canvas.getContext;
      /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
        var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
        return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
      }
      canvas.getContext = fixedGetContext;
    }
    var ctx = (canvas.getContext("webgl", webGLContextAttributes));
    // https://caniuse.com/#feat=webgl
    if (!ctx) return 0;
    var handle = GL.registerContext(ctx, webGLContextAttributes);
    return handle;
  },
  registerContext: (ctx, webGLContextAttributes) => {
    // without pthreads a context is just an integer ID
    var handle = GL.getNewId(GL.contexts);
    var context = {
      handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx
    };
    // Store the created context object so that we can access the context
    // given a canvas without having to pass the parameters again.
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
      GL.initExtensions(context);
    }
    context.maxVertexAttribs = context.GLctx.getParameter(34921);
    /*GL_MAX_VERTEX_ATTRIBS*/ context.clientBuffers = [];
    for (var i = 0; i < context.maxVertexAttribs; i++) {
      context.clientBuffers[i] = {
        enabled: false,
        clientside: false,
        size: 0,
        type: 0,
        normalized: 0,
        stride: 0,
        ptr: 0,
        vertexAttribPointerAdaptor: null
      };
    }
    GL.generateTempBuffers(false, context);
    return handle;
  },
  makeContextCurrent: contextHandle => {
    // Active Emscripten GL layer context object.
    GL.currentContext = GL.contexts[contextHandle];
    // Active WebGL context object.
    Module["ctx"] = GLctx = GL.currentContext?.GLctx;
    return !(contextHandle && !GLctx);
  },
  getContext: contextHandle => GL.contexts[contextHandle],
  deleteContext: contextHandle => {
    if (GL.currentContext === GL.contexts[contextHandle]) {
      GL.currentContext = null;
    }
    if (typeof JSEvents == "object") {
      // Release all JS event handlers on the DOM element that the GL context is
      // associated with since the context is now deleted.
      JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
    }
    // Make sure the canvas object no longer refers to the context object so
    // there are no GC surprises.
    if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
    }
    GL.contexts[contextHandle] = null;
  },
  initExtensions: context => {
    // If this function is called without a specific context object, init the
    // extensions of the currently active context.
    context ||= GL.currentContext;
    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;
    var GLctx = context.GLctx;
    // Detect the presence of a few extensions manually, ction GL interop
    // layer itself will need to know if they exist.
    // Extensions that are available in both WebGL 1 and WebGL 2
    webgl_enable_WEBGL_multi_draw(GLctx);
    webgl_enable_EXT_polygon_offset_clamp(GLctx);
    webgl_enable_EXT_clip_control(GLctx);
    webgl_enable_WEBGL_polygon_mode(GLctx);
    // Extensions that are only available in WebGL 1 (the calls will be no-ops
    // if called on a WebGL 2 context active)
    webgl_enable_ANGLE_instanced_arrays(GLctx);
    webgl_enable_OES_vertex_array_object(GLctx);
    webgl_enable_WEBGL_draw_buffers(GLctx);
    {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
    }
    getEmscriptenSupportedExtensions(GLctx).forEach(ext => {
      // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders
      // are not enabled by default.
      if (!ext.includes("lose_context") && !ext.includes("debug")) {
        // Call .getExtension() to enable that extension permanently.
        GLctx.getExtension(ext);
      }
    });
  }
};

/** @suppress {duplicate } */ var _glActiveTexture = x0 => GLctx.activeTexture(x0);

var _emscripten_glActiveTexture = _glActiveTexture;

/** @suppress {duplicate } */ var _glAttachShader = (program, shader) => {
  GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glAttachShader = _glAttachShader;

/** @suppress {duplicate } */ var _glBeginQueryEXT = (target, id) => {
  GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id]);
};

var _emscripten_glBeginQueryEXT = _glBeginQueryEXT;

/** @suppress {duplicate } */ var _glBindAttribLocation = (program, index, name) => {
  GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
};

var _emscripten_glBindAttribLocation = _glBindAttribLocation;

/** @suppress {duplicate } */ var _glBindBuffer = (target, buffer) => {
  if (target == 34962) /*GL_ARRAY_BUFFER*/ {
    GLctx.currentArrayBufferBinding = buffer;
  } else if (target == 34963) /*GL_ELEMENT_ARRAY_BUFFER*/ {
    GLctx.currentElementArrayBufferBinding = buffer;
  }
  GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _emscripten_glBindBuffer = _glBindBuffer;

/** @suppress {duplicate } */ var _glBindFramebuffer = (target, framebuffer) => {
  GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
};

var _emscripten_glBindFramebuffer = _glBindFramebuffer;

/** @suppress {duplicate } */ var _glBindRenderbuffer = (target, renderbuffer) => {
  GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glBindRenderbuffer = _glBindRenderbuffer;

/** @suppress {duplicate } */ var _glBindTexture = (target, texture) => {
  GLctx.bindTexture(target, GL.textures[texture]);
};

var _emscripten_glBindTexture = _glBindTexture;

/** @suppress {duplicate } */ var _glBindVertexArray = vao => {
  GLctx.bindVertexArray(GL.vaos[vao]);
  var ibo = GLctx.getParameter(34965);
  /*ELEMENT_ARRAY_BUFFER_BINDING*/ GLctx.currentElementArrayBufferBinding = ibo ? (ibo.name | 0) : 0;
};

/** @suppress {duplicate } */ var _glBindVertexArrayOES = _glBindVertexArray;

var _emscripten_glBindVertexArrayOES = _glBindVertexArrayOES;

/** @suppress {duplicate } */ var _glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);

var _emscripten_glBlendColor = _glBlendColor;

/** @suppress {duplicate } */ var _glBlendEquation = x0 => GLctx.blendEquation(x0);

var _emscripten_glBlendEquation = _glBlendEquation;

/** @suppress {duplicate } */ var _glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);

var _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate;

/** @suppress {duplicate } */ var _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);

var _emscripten_glBlendFunc = _glBlendFunc;

/** @suppress {duplicate } */ var _glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);

var _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate;

/** @suppress {duplicate } */ var _glBufferData = (target, size, data, usage) => {
  // N.b. here first form specifies a heap subarray, second form an integer
  // size, so the ?: code here is polymorphic. It is advised to avoid
  // randomly mixing both uses in calling code, to avoid any potential JS
  // engine JIT issues.
  GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
};

var _emscripten_glBufferData = _glBufferData;

/** @suppress {duplicate } */ var _glBufferSubData = (target, offset, size, data) => {
  GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
};

var _emscripten_glBufferSubData = _glBufferSubData;

/** @suppress {duplicate } */ var _glCheckFramebufferStatus = x0 => GLctx.checkFramebufferStatus(x0);

var _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus;

/** @suppress {duplicate } */ var _glClear = x0 => GLctx.clear(x0);

var _emscripten_glClear = _glClear;

/** @suppress {duplicate } */ var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

var _emscripten_glClearColor = _glClearColor;

/** @suppress {duplicate } */ var _glClearDepthf = x0 => GLctx.clearDepth(x0);

var _emscripten_glClearDepthf = _glClearDepthf;

/** @suppress {duplicate } */ var _glClearStencil = x0 => GLctx.clearStencil(x0);

var _emscripten_glClearStencil = _glClearStencil;

/** @suppress {duplicate } */ var _glClipControlEXT = (origin, depth) => {
  GLctx.extClipControl["clipControlEXT"](origin, depth);
};

var _emscripten_glClipControlEXT = _glClipControlEXT;

/** @suppress {duplicate } */ var _glColorMask = (red, green, blue, alpha) => {
  GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _emscripten_glColorMask = _glColorMask;

/** @suppress {duplicate } */ var _glCompileShader = shader => {
  GLctx.compileShader(GL.shaders[shader]);
};

var _emscripten_glCompileShader = _glCompileShader;

/** @suppress {duplicate } */ var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
  // `data` may be null here, which means "allocate uniniitalized space but
  // don't upload" in GLES parlance, but `compressedTexImage2D` requires the
  // final data parameter, so we simply pass a heap view starting at zero
  // effectively uploading whatever happens to be near address zero.  See
  // https://github.com/emscripten-core/emscripten/issues/19300.
  GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, HEAPU8.subarray((data), data + imageSize));
};

var _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D;

/** @suppress {duplicate } */ var _glCompressedTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, imageSize, data) => {
  GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, HEAPU8.subarray((data), data + imageSize));
};

var _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D;

/** @suppress {duplicate } */ var _glCopyTexImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);

var _emscripten_glCopyTexImage2D = _glCopyTexImage2D;

/** @suppress {duplicate } */ var _glCopyTexSubImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);

var _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D;

/** @suppress {duplicate } */ var _glCreateProgram = () => {
  var id = GL.getNewId(GL.programs);
  var program = GLctx.createProgram();
  // Store additional information needed for each shader program:
  program.name = id;
  // Lazy cache results of
  // glGetProgramiv(GL_ACTIVE_UNIFORM_MAX_LENGTH/GL_ACTIVE_ATTRIBUTE_MAX_LENGTH/GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH)
  program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
  program.uniformIdCounter = 1;
  GL.programs[id] = program;
  return id;
};

var _emscripten_glCreateProgram = _glCreateProgram;

/** @suppress {duplicate } */ var _glCreateShader = shaderType => {
  var id = GL.getNewId(GL.shaders);
  GL.shaders[id] = GLctx.createShader(shaderType);
  return id;
};

var _emscripten_glCreateShader = _glCreateShader;

/** @suppress {duplicate } */ var _glCullFace = x0 => GLctx.cullFace(x0);

var _emscripten_glCullFace = _glCullFace;

/** @suppress {duplicate } */ var _glDeleteBuffers = (n, buffers) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((buffers) + (i * 4)) >> 2)];
    var buffer = GL.buffers[id];
    // From spec: "glDeleteBuffers silently ignores 0's and names that do not
    // correspond to existing buffer objects."
    if (!buffer) continue;
    GLctx.deleteBuffer(buffer);
    buffer.name = 0;
    GL.buffers[id] = null;
    if (id == GLctx.currentArrayBufferBinding) GLctx.currentArrayBufferBinding = 0;
    if (id == GLctx.currentElementArrayBufferBinding) GLctx.currentElementArrayBufferBinding = 0;
  }
};

var _emscripten_glDeleteBuffers = _glDeleteBuffers;

/** @suppress {duplicate } */ var _glDeleteFramebuffers = (n, framebuffers) => {
  for (var i = 0; i < n; ++i) {
    var id = HEAP32[(((framebuffers) + (i * 4)) >> 2)];
    var framebuffer = GL.framebuffers[id];
    if (!framebuffer) continue;
    // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
    GLctx.deleteFramebuffer(framebuffer);
    framebuffer.name = 0;
    GL.framebuffers[id] = null;
  }
};

var _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers;

/** @suppress {duplicate } */ var _glDeleteProgram = id => {
  if (!id) return;
  var program = GL.programs[id];
  if (!program) {
    // glDeleteProgram actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  GLctx.deleteProgram(program);
  program.name = 0;
  GL.programs[id] = null;
};

var _emscripten_glDeleteProgram = _glDeleteProgram;

/** @suppress {duplicate } */ var _glDeleteQueriesEXT = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((ids) + (i * 4)) >> 2)];
    var query = GL.queries[id];
    if (!query) continue;
    // GL spec: "unused names in ids are ignored, as is the name zero."
    GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
    GL.queries[id] = null;
  }
};

var _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT;

/** @suppress {duplicate } */ var _glDeleteRenderbuffers = (n, renderbuffers) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((renderbuffers) + (i * 4)) >> 2)];
    var renderbuffer = GL.renderbuffers[id];
    if (!renderbuffer) continue;
    // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
    GLctx.deleteRenderbuffer(renderbuffer);
    renderbuffer.name = 0;
    GL.renderbuffers[id] = null;
  }
};

var _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers;

/** @suppress {duplicate } */ var _glDeleteShader = id => {
  if (!id) return;
  var shader = GL.shaders[id];
  if (!shader) {
    // glDeleteShader actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  GLctx.deleteShader(shader);
  GL.shaders[id] = null;
};

var _emscripten_glDeleteShader = _glDeleteShader;

/** @suppress {duplicate } */ var _glDeleteTextures = (n, textures) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((textures) + (i * 4)) >> 2)];
    var texture = GL.textures[id];
    // GL spec: "glDeleteTextures silently ignores 0s and names that do not
    // correspond to existing textures".
    if (!texture) continue;
    GLctx.deleteTexture(texture);
    texture.name = 0;
    GL.textures[id] = null;
  }
};

var _emscripten_glDeleteTextures = _glDeleteTextures;

/** @suppress {duplicate } */ var _glDeleteVertexArrays = (n, vaos) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((vaos) + (i * 4)) >> 2)];
    GLctx.deleteVertexArray(GL.vaos[id]);
    GL.vaos[id] = null;
  }
};

/** @suppress {duplicate } */ var _glDeleteVertexArraysOES = _glDeleteVertexArrays;

var _emscripten_glDeleteVertexArraysOES = _glDeleteVertexArraysOES;

/** @suppress {duplicate } */ var _glDepthFunc = x0 => GLctx.depthFunc(x0);

var _emscripten_glDepthFunc = _glDepthFunc;

/** @suppress {duplicate } */ var _glDepthMask = flag => {
  GLctx.depthMask(!!flag);
};

var _emscripten_glDepthMask = _glDepthMask;

/** @suppress {duplicate } */ var _glDepthRangef = (x0, x1) => GLctx.depthRange(x0, x1);

var _emscripten_glDepthRangef = _glDepthRangef;

/** @suppress {duplicate } */ var _glDetachShader = (program, shader) => {
  GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glDetachShader = _glDetachShader;

/** @suppress {duplicate } */ var _glDisable = x0 => GLctx.disable(x0);

var _emscripten_glDisable = _glDisable;

/** @suppress {duplicate } */ var _glDisableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = false;
  GLctx.disableVertexAttribArray(index);
};

var _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray;

/** @suppress {duplicate } */ var _glDrawArrays = (mode, first, count) => {
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(first + count);
  GLctx.drawArrays(mode, first, count);
  GL.postDrawHandleClientVertexAttribBindings();
};

var _emscripten_glDrawArrays = _glDrawArrays;

/** @suppress {duplicate } */ var _glDrawArraysInstanced = (mode, first, count, primcount) => {
  GLctx.drawArraysInstanced(mode, first, count, primcount);
};

/** @suppress {duplicate } */ var _glDrawArraysInstancedANGLE = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedANGLE = _glDrawArraysInstancedANGLE;

var tempFixedLengthArray = [];

/** @suppress {duplicate } */ var _glDrawBuffers = (n, bufs) => {
  var bufArray = tempFixedLengthArray[n];
  for (var i = 0; i < n; i++) {
    bufArray[i] = HEAP32[(((bufs) + (i * 4)) >> 2)];
  }
  GLctx.drawBuffers(bufArray);
};

/** @suppress {duplicate } */ var _glDrawBuffersWEBGL = _glDrawBuffers;

var _emscripten_glDrawBuffersWEBGL = _glDrawBuffersWEBGL;

/** @suppress {duplicate } */ var _glDrawElements = (mode, count, type, indices) => {
  var buf;
  var vertexes = 0;
  if (!GLctx.currentElementArrayBufferBinding) {
    var size = GL.calcBufLength(1, type, 0, count);
    buf = GL.getTempIndexBuffer(size);
    GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ buf);
    GLctx.bufferSubData(34963, 0, HEAPU8.subarray(indices, indices + size));
    // Calculating vertex count if shader's attribute data is on client side
    if (count > 0) {
      for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
        var cb = GL.currentContext.clientBuffers[i];
        if (cb.clientside && cb.enabled) {
          let arrayClass;
          switch (type) {
           case 5121:
            /* GL_UNSIGNED_BYTE */ arrayClass = Uint8Array;
            break;

           case 5123:
            /* GL_UNSIGNED_SHORT */ arrayClass = Uint16Array;
            break;

           default:
            GL.recordError(1282);
            return;
          }
          vertexes = new arrayClass(HEAPU8.buffer, indices, count).reduce((max, current) => Math.max(max, current)) + 1;
          break;
        }
      }
    }
    // the index is now 0
    indices = 0;
  }
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(vertexes);
  GLctx.drawElements(mode, count, type, indices);
  GL.postDrawHandleClientVertexAttribBindings(count);
  if (!GLctx.currentElementArrayBufferBinding) {
    GLctx.bindBuffer(34963, /*GL_ELEMENT_ARRAY_BUFFER*/ null);
  }
};

var _emscripten_glDrawElements = _glDrawElements;

/** @suppress {duplicate } */ var _glDrawElementsInstanced = (mode, count, type, indices, primcount) => {
  GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
};

/** @suppress {duplicate } */ var _glDrawElementsInstancedANGLE = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedANGLE = _glDrawElementsInstancedANGLE;

/** @suppress {duplicate } */ var _glEnable = x0 => GLctx.enable(x0);

var _emscripten_glEnable = _glEnable;

/** @suppress {duplicate } */ var _glEnableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = true;
  GLctx.enableVertexAttribArray(index);
};

var _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray;

/** @suppress {duplicate } */ var _glEndQueryEXT = target => {
  GLctx.disjointTimerQueryExt["endQueryEXT"](target);
};

var _emscripten_glEndQueryEXT = _glEndQueryEXT;

/** @suppress {duplicate } */ var _glFinish = () => GLctx.finish();

var _emscripten_glFinish = _glFinish;

/** @suppress {duplicate } */ var _glFlush = () => GLctx.flush();

var _emscripten_glFlush = _glFlush;

/** @suppress {duplicate } */ var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
  GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer;

/** @suppress {duplicate } */ var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
  GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
};

var _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D;

/** @suppress {duplicate } */ var _glFrontFace = x0 => GLctx.frontFace(x0);

var _emscripten_glFrontFace = _glFrontFace;

/** @suppress {duplicate } */ var _glGenBuffers = (n, buffers) => {
  GL.genObject(n, buffers, "createBuffer", GL.buffers);
};

var _emscripten_glGenBuffers = _glGenBuffers;

/** @suppress {duplicate } */ var _glGenFramebuffers = (n, ids) => {
  GL.genObject(n, ids, "createFramebuffer", GL.framebuffers);
};

var _emscripten_glGenFramebuffers = _glGenFramebuffers;

/** @suppress {duplicate } */ var _glGenQueriesEXT = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
    if (!query) {
      GL.recordError(1282);
      /* GL_INVALID_OPERATION */ while (i < n) HEAP32[(((ids) + (i++ * 4)) >> 2)] = 0;
      return;
    }
    var id = GL.getNewId(GL.queries);
    query.name = id;
    GL.queries[id] = query;
    HEAP32[(((ids) + (i * 4)) >> 2)] = id;
  }
};

var _emscripten_glGenQueriesEXT = _glGenQueriesEXT;

/** @suppress {duplicate } */ var _glGenRenderbuffers = (n, renderbuffers) => {
  GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
};

var _emscripten_glGenRenderbuffers = _glGenRenderbuffers;

/** @suppress {duplicate } */ var _glGenTextures = (n, textures) => {
  GL.genObject(n, textures, "createTexture", GL.textures);
};

var _emscripten_glGenTextures = _glGenTextures;

/** @suppress {duplicate } */ var _glGenVertexArrays = (n, arrays) => {
  GL.genObject(n, arrays, "createVertexArray", GL.vaos);
};

/** @suppress {duplicate } */ var _glGenVertexArraysOES = _glGenVertexArrays;

var _emscripten_glGenVertexArraysOES = _glGenVertexArraysOES;

/** @suppress {duplicate } */ var _glGenerateMipmap = x0 => GLctx.generateMipmap(x0);

var _emscripten_glGenerateMipmap = _glGenerateMipmap;

var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
  program = GL.programs[program];
  var info = GLctx[funcName](program, index);
  if (info) {
    // If an error occurs, nothing will be written to length, size and type and name.
    var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
    if (length) HEAP32[((length) >> 2)] = numBytesWrittenExclNull;
    if (size) HEAP32[((size) >> 2)] = info.size;
    if (type) HEAP32[((type) >> 2)] = info.type;
  }
};

/** @suppress {duplicate } */ var _glGetActiveAttrib = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);

var _emscripten_glGetActiveAttrib = _glGetActiveAttrib;

/** @suppress {duplicate } */ var _glGetActiveUniform = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);

var _emscripten_glGetActiveUniform = _glGetActiveUniform;

/** @suppress {duplicate } */ var _glGetAttachedShaders = (program, maxCount, count, shaders) => {
  var result = GLctx.getAttachedShaders(GL.programs[program]);
  var len = result.length;
  if (len > maxCount) {
    len = maxCount;
  }
  HEAP32[((count) >> 2)] = len;
  for (var i = 0; i < len; ++i) {
    var id = GL.shaders.indexOf(result[i]);
    HEAP32[(((shaders) + (i * 4)) >> 2)] = id;
  }
};

var _emscripten_glGetAttachedShaders = _glGetAttachedShaders;

/** @suppress {duplicate } */ var _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));

var _emscripten_glGetAttribLocation = _glGetAttribLocation;

var writeI53ToI64 = (ptr, num) => {
  HEAPU32[((ptr) >> 2)] = num;
  var lower = HEAPU32[((ptr) >> 2)];
  HEAPU32[(((ptr) + (4)) >> 2)] = (num - lower) / 4294967296;
};

var emscriptenWebGLGet = (name_, p, type) => {
  // Guard against user passing a null pointer.
  // Note that GLES2 spec does not say anything about how passing a null
  // pointer should be treated.  Testing on desktop core GL 3, the application
  // crashes on glGetIntegerv to a null pointer, but better to report an error
  // instead of doing anything random.
  if (!p) {
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  var ret = undefined;
  switch (name_) {
   // Handle a few trivial GLES values
    case 36346:
    // GL_SHADER_COMPILER
    ret = 1;
    break;

   case 36344:
    // GL_SHADER_BINARY_FORMATS
    if (type != 0 && type != 1) {
      GL.recordError(1280);
    }
    // Do not write anything to the out pointer, since no binary formats are
    // supported.
    return;

   case 36345:
    // GL_NUM_SHADER_BINARY_FORMATS
    ret = 0;
    break;

   case 34466:
    // GL_NUM_COMPRESSED_TEXTURE_FORMATS
    // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete
    // since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be
    // queried for length), so implement it ourselves to allow C++ GLES2
    // code get the length.
    var formats = GLctx.getParameter(34467);
    /*GL_COMPRESSED_TEXTURE_FORMATS*/ ret = formats ? formats.length : 0;
    break;
  }
  if (ret === undefined) {
    var result = GLctx.getParameter(name_);
    switch (typeof result) {
     case "number":
      ret = result;
      break;

     case "boolean":
      ret = result ? 1 : 0;
      break;

     case "string":
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;

     case "object":
      if (result === null) {
        // null is a valid result for some (e.g., which buffer is bound -
        // perhaps nothing is bound), but otherwise can mean an invalid
        // name_, which we need to report as an error
        switch (name_) {
         case 34964:
         // ARRAY_BUFFER_BINDING
          case 35725:
         // CURRENT_PROGRAM
          case 34965:
         // ELEMENT_ARRAY_BUFFER_BINDING
          case 36006:
         // FRAMEBUFFER_BINDING or DRAW_FRAMEBUFFER_BINDING
          case 36007:
         // RENDERBUFFER_BINDING
          case 32873:
         // TEXTURE_BINDING_2D
          case 34229:
         // WebGL 2 GL_VERTEX_ARRAY_BINDING, or WebGL 1 extension OES_vertex_array_object GL_VERTEX_ARRAY_BINDING_OES
          case 34068:
          {
            // TEXTURE_BINDING_CUBE_MAP
            ret = 0;
            break;
          }

         default:
          {
            GL.recordError(1280);
            // GL_INVALID_ENUM
            return;
          }
        }
      } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
        for (var i = 0; i < result.length; ++i) {
          switch (type) {
           case 0:
            HEAP32[(((p) + (i * 4)) >> 2)] = result[i];
            break;

           case 2:
            HEAPF32[(((p) + (i * 4)) >> 2)] = result[i];
            break;

           case 4:
            HEAP8[(p) + (i)] = result[i] ? 1 : 0;
            break;
          }
        }
        return;
      } else {
        try {
          ret = result.name | 0;
        } catch (e) {
          GL.recordError(1280);
          // GL_INVALID_ENUM
          err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
          return;
        }
      }
      break;

     default:
      GL.recordError(1280);
      // GL_INVALID_ENUM
      err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof (result)}!`);
      return;
    }
  }
  switch (type) {
   case 1:
    writeI53ToI64(p, ret);
    break;

   case 0:
    HEAP32[((p) >> 2)] = ret;
    break;

   case 2:
    HEAPF32[((p) >> 2)] = ret;
    break;

   case 4:
    HEAP8[p] = ret ? 1 : 0;
    break;
  }
};

/** @suppress {duplicate } */ var _glGetBooleanv = (name_, p) => emscriptenWebGLGet(name_, p, 4);

var _emscripten_glGetBooleanv = _glGetBooleanv;

/** @suppress {duplicate } */ var _glGetBufferParameteriv = (target, value, data) => {
  if (!data) {
    // GLES2 specification does not specify how to behave if data is a null
    // pointer. Since calling this function does not make sense if data ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  HEAP32[((data) >> 2)] = GLctx.getBufferParameter(target, value);
};

var _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv;

/** @suppress {duplicate } */ var _glGetError = () => {
  var error = GLctx.getError() || GL.lastError;
  GL.lastError = 0;
  /*GL_NO_ERROR*/ return error;
};

var _emscripten_glGetError = _glGetError;

/** @suppress {duplicate } */ var _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);

var _emscripten_glGetFloatv = _glGetFloatv;

/** @suppress {duplicate } */ var _glGetFramebufferAttachmentParameteriv = (target, attachment, pname, params) => {
  var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
  if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
    result = result.name | 0;
  }
  HEAP32[((params) >> 2)] = result;
};

var _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv;

/** @suppress {duplicate } */ var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);

var _emscripten_glGetIntegerv = _glGetIntegerv;

/** @suppress {duplicate } */ var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog;

/** @suppress {duplicate } */ var _glGetProgramiv = (program, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  if (program >= GL.counter) {
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  program = GL.programs[program];
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getProgramInfoLog(program);
    if (log === null) log = "(unknown error)";
    HEAP32[((p) >> 2)] = log.length + 1;
  } else if (pname == 35719) /* GL_ACTIVE_UNIFORM_MAX_LENGTH */ {
    if (!program.maxUniformLength) {
      var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
      /*GL_ACTIVE_UNIFORMS*/ for (var i = 0; i < numActiveUniforms; ++i) {
        program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
      }
    }
    HEAP32[((p) >> 2)] = program.maxUniformLength;
  } else if (pname == 35722) /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */ {
    if (!program.maxAttributeLength) {
      var numActiveAttributes = GLctx.getProgramParameter(program, 35721);
      /*GL_ACTIVE_ATTRIBUTES*/ for (var i = 0; i < numActiveAttributes; ++i) {
        program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
      }
    }
    HEAP32[((p) >> 2)] = program.maxAttributeLength;
  } else if (pname == 35381) /* GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH */ {
    if (!program.maxUniformBlockNameLength) {
      var numActiveUniformBlocks = GLctx.getProgramParameter(program, 35382);
      /*GL_ACTIVE_UNIFORM_BLOCKS*/ for (var i = 0; i < numActiveUniformBlocks; ++i) {
        program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
      }
    }
    HEAP32[((p) >> 2)] = program.maxUniformBlockNameLength;
  } else {
    HEAP32[((p) >> 2)] = GLctx.getProgramParameter(program, pname);
  }
};

var _emscripten_glGetProgramiv = _glGetProgramiv;

/** @suppress {duplicate } */ var _glGetQueryObjecti64vEXT = (id, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  var query = GL.queries[id];
  var param;
  {
    param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
  }
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  writeI53ToI64(params, ret);
};

var _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectivEXT = (id, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  var query = GL.queries[id];
  var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  HEAP32[((params) >> 2)] = ret;
};

var _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT;

var _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT;

var _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT;

/** @suppress {duplicate } */ var _glGetQueryivEXT = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  HEAP32[((params) >> 2)] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
};

var _emscripten_glGetQueryivEXT = _glGetQueryivEXT;

/** @suppress {duplicate } */ var _glGetRenderbufferParameteriv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if params == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  HEAP32[((params) >> 2)] = GLctx.getRenderbufferParameter(target, pname);
};

var _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv;

/** @suppress {duplicate } */ var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog;

/** @suppress {duplicate } */ var _glGetShaderPrecisionFormat = (shaderType, precisionType, range, precision) => {
  var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
  HEAP32[((range) >> 2)] = result.rangeMin;
  HEAP32[(((range) + (4)) >> 2)] = result.rangeMax;
  HEAP32[((precision) >> 2)] = result.precision;
};

var _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat;

/** @suppress {duplicate } */ var _glGetShaderSource = (shader, bufSize, length, source) => {
  var result = GLctx.getShaderSource(GL.shaders[shader]);
  if (!result) return;
  // If an error occurs, nothing will be written to length or source.
  var numBytesWrittenExclNull = (bufSize > 0 && source) ? stringToUTF8(result, source, bufSize) : 0;
  if (length) HEAP32[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderSource = _glGetShaderSource;

/** @suppress {duplicate } */ var _glGetShaderiv = (shader, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    // The GLES2 specification says that if the shader has an empty info log,
    // a value of 0 is returned. Otherwise the log has a null char appended.
    // (An empty string is falsey, so we can just check that instead of
    // looking at log.length.)
    var logLength = log ? log.length + 1 : 0;
    HEAP32[((p) >> 2)] = logLength;
  } else if (pname == 35720) {
    // GL_SHADER_SOURCE_LENGTH
    var source = GLctx.getShaderSource(GL.shaders[shader]);
    // source may be a null, or the empty string, both of which are falsey
    // values that we report a 0 length for.
    var sourceLength = source ? source.length + 1 : 0;
    HEAP32[((p) >> 2)] = sourceLength;
  } else {
    HEAP32[((p) >> 2)] = GLctx.getShaderParameter(GL.shaders[shader], pname);
  }
};

var _emscripten_glGetShaderiv = _glGetShaderiv;

var stringToNewUTF8 = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8(str, ret, size);
  return ret;
};

var webglGetExtensions = () => {
  var exts = getEmscriptenSupportedExtensions(GLctx);
  exts = exts.concat(exts.map(e => "GL_" + e));
  return exts;
};

/** @suppress {duplicate } */ var _glGetString = name_ => {
  var ret = GL.stringCache[name_];
  if (!ret) {
    switch (name_) {
     case 7939:
      /* GL_EXTENSIONS */ ret = stringToNewUTF8(webglGetExtensions().join(" "));
      break;

     case 7936:
     /* GL_VENDOR */ case 7937:
     /* GL_RENDERER */ case 37445:
     /* UNMASKED_VENDOR_WEBGL */ case 37446:
      /* UNMASKED_RENDERER_WEBGL */ var s = GLctx.getParameter(name_);
      if (!s) {
        GL.recordError(1280);
      }
      ret = s ? stringToNewUTF8(s) : 0;
      break;

     case 7938:
      /* GL_VERSION */ var webGLVersion = GLctx.getParameter(7938);
      // return GLES version string corresponding to the version of the WebGL context
      var glVersion = `OpenGL ES 2.0 (${webGLVersion})`;
      ret = stringToNewUTF8(glVersion);
      break;

     case 35724:
      /* GL_SHADING_LANGUAGE_VERSION */ var glslVersion = GLctx.getParameter(35724);
      // extract the version number 'N.M' from the string 'WebGL GLSL ES N.M ...'
      var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
      var ver_num = glslVersion.match(ver_re);
      if (ver_num !== null) {
        if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
        // ensure minor version has 2 digits
        glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`;
      }
      ret = stringToNewUTF8(glslVersion);
      break;

     default:
      GL.recordError(1280);
    }
    // fall through
    GL.stringCache[name_] = ret;
  }
  return ret;
};

var _emscripten_glGetString = _glGetString;

/** @suppress {duplicate } */ var _glGetTexParameterfv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  HEAPF32[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameterfv = _glGetTexParameterfv;

/** @suppress {duplicate } */ var _glGetTexParameteriv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  HEAP32[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameteriv = _glGetTexParameteriv;

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
  var uniformLocsById = program.uniformLocsById, // Maps GLuint -> WebGLUniformLocation
  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, // Maps name -> [uniform array length, GLuint]
  i, j;
  // On the first time invocation of glGetUniformLocation on this shader program:
  // initialize cache data structures and discover which uniforms are arrays.
  if (!uniformLocsById) {
    // maps GLint integer locations to WebGLUniformLocations
    program.uniformLocsById = uniformLocsById = {};
    // maps integer locations back to uniform name strings, so that we can lazily fetch uniform array locations
    program.uniformArrayNamesById = {};
    var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
    /*GL_ACTIVE_UNIFORMS*/ for (i = 0; i < numActiveUniforms; ++i) {
      var u = GLctx.getActiveUniform(program, i);
      var nm = u.name;
      var sz = u.size;
      var lb = webglGetLeftBracePos(nm);
      var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
      // Assign a new location.
      var id = program.uniformIdCounter;
      program.uniformIdCounter += sz;
      // Eagerly get the location of the uniformArray[0] base element.
      // The remaining indices >0 will be left for lazy evaluation to
      // improve performance. Those may never be needed to fetch, if the
      // application fills arrays always in full starting from the first
      // element of the array.
      uniformSizeAndIdsByName[arrayName] = [ sz, id ];
      // Store placeholder integers in place that highlight that these
      // >0 index locations are array indices pending population.
      for (j = 0; j < sz; ++j) {
        uniformLocsById[id] = j;
        program.uniformArrayNamesById[id++] = arrayName;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetUniformLocation = (program, name) => {
  name = UTF8ToString(name);
  if (program = GL.programs[program]) {
    webglPrepareUniformLocationsBeforeFirstUse(program);
    var uniformLocsById = program.uniformLocsById;
    // Maps GLuint -> WebGLUniformLocation
    var arrayIndex = 0;
    var uniformBaseName = name;
    // Invariant: when populating integer IDs for uniform locations, we must
    // maintain the precondition that arrays reside in contiguous addresses,
    // i.e. for a 'vec4 colors[10];', colors[4] must be at location
    // colors[0]+4.  However, user might call glGetUniformLocation(program,
    // "colors") for an array, so we cannot discover based on the user input
    // arguments whether the uniform we are dealing with is an array. The only
    // way to discover which uniforms are arrays is to enumerate over all the
    // active uniforms in the program.
    var leftBrace = webglGetLeftBracePos(name);
    // If user passed an array accessor "[index]", parse the array index off the accessor.
    if (leftBrace > 0) {
      arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
      // "index]", coerce parseInt(']') with >>>0 to treat "foo[]" as "foo[0]" and foo[-1] as unsigned out-of-bounds.
      uniformBaseName = name.slice(0, leftBrace);
    }
    // Have we cached the location of this uniform before?
    // A pair [array length, GLint of the uniform location]
    var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
    // If an uniform with this name exists, and if its index is within the
    // array limits (if it's even an array), query the WebGLlocation, or
    // return an existing cached location.
    if (sizeAndId && arrayIndex < sizeAndId[0]) {
      arrayIndex += sizeAndId[1];
      // Add the base location of the uniform to the array index offset.
      if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
        return arrayIndex;
      }
    }
  } else {
    // N.b. we are currently unable to distinguish between GL program IDs that
    // never existed vs GL program IDs that have been deleted, so report
    // GL_INVALID_VALUE in both cases.
    GL.recordError(1281);
  }
  /* GL_INVALID_VALUE */ return -1;
};

var _emscripten_glGetUniformLocation = _glGetUniformLocation;

var webglGetUniformLocation = location => {
  var p = GLctx.currentProgram;
  if (p) {
    var webglLoc = p.uniformLocsById[location];
    // p.uniformLocsById[location] stores either an integer, or a
    // WebGLUniformLocation.
    // If an integer, we have not yet bound the location, so do it now. The
    // integer value specifies the array index we should bind to.
    if (typeof webglLoc == "number") {
      p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
    }
    // Else an already cached WebGLUniformLocation, return it.
    return webglLoc;
  } else {
    GL.recordError(1282);
  }
};

/** @suppress{checkTypes} */ var emscriptenWebGLGetUniform = (program, location, params, type) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if params ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  program = GL.programs[program];
  webglPrepareUniformLocationsBeforeFirstUse(program);
  var data = GLctx.getUniform(program, webglGetUniformLocation(location));
  if (typeof data == "number" || typeof data == "boolean") {
    switch (type) {
     case 0:
      HEAP32[((params) >> 2)] = data;
      break;

     case 2:
      HEAPF32[((params) >> 2)] = data;
      break;
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      switch (type) {
       case 0:
        HEAP32[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 2:
        HEAPF32[(((params) + (i * 4)) >> 2)] = data[i];
        break;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetUniformfv = (program, location, params) => {
  emscriptenWebGLGetUniform(program, location, params, 2);
};

var _emscripten_glGetUniformfv = _glGetUniformfv;

/** @suppress {duplicate } */ var _glGetUniformiv = (program, location, params) => {
  emscriptenWebGLGetUniform(program, location, params, 0);
};

var _emscripten_glGetUniformiv = _glGetUniformiv;

/** @suppress {duplicate } */ var _glGetVertexAttribPointerv = (index, pname, pointer) => {
  if (!pointer) {
    // GLES2 specification does not specify how to behave if pointer is a null
    // pointer. Since calling this function does not make sense if pointer ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  if (GL.currentContext.clientBuffers[index].enabled) {
    err("glGetVertexAttribPointer on client-side array: not supported, bad data returned");
  }
  HEAP32[((pointer) >> 2)] = GLctx.getVertexAttribOffset(index, pname);
};

var _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv;

/** @suppress{checkTypes} */ var emscriptenWebGLGetVertexAttrib = (index, pname, params, type) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if params ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    /* GL_INVALID_VALUE */ return;
  }
  if (GL.currentContext.clientBuffers[index].enabled) {
    err("glGetVertexAttrib*v on client-side array: not supported, bad data returned");
  }
  var data = GLctx.getVertexAttrib(index, pname);
  if (pname == 34975) /*VERTEX_ATTRIB_ARRAY_BUFFER_BINDING*/ {
    HEAP32[((params) >> 2)] = data && data["name"];
  } else if (typeof data == "number" || typeof data == "boolean") {
    switch (type) {
     case 0:
      HEAP32[((params) >> 2)] = data;
      break;

     case 2:
      HEAPF32[((params) >> 2)] = data;
      break;

     case 5:
      HEAP32[((params) >> 2)] = Math.fround(data);
      break;
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      switch (type) {
       case 0:
        HEAP32[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 2:
        HEAPF32[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 5:
        HEAP32[(((params) + (i * 4)) >> 2)] = Math.fround(data[i]);
        break;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetVertexAttribfv = (index, pname, params) => {
  // N.B. This function may only be called if the vertex attribute was
  // specified using the function glVertexAttrib*f(), otherwise the results
  // are undefined. (GLES3 spec 6.1.12)
  emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
};

var _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv;

/** @suppress {duplicate } */ var _glGetVertexAttribiv = (index, pname, params) => {
  // N.B. This function may only be called if the vertex attribute was
  // specified using the function glVertexAttrib*f(), otherwise the results
  // are undefined. (GLES3 spec 6.1.12)
  emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
};

var _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv;

/** @suppress {duplicate } */ var _glHint = (x0, x1) => GLctx.hint(x0, x1);

var _emscripten_glHint = _glHint;

/** @suppress {duplicate } */ var _glIsBuffer = buffer => {
  var b = GL.buffers[buffer];
  if (!b) return 0;
  return GLctx.isBuffer(b);
};

var _emscripten_glIsBuffer = _glIsBuffer;

/** @suppress {duplicate } */ var _glIsEnabled = x0 => GLctx.isEnabled(x0);

var _emscripten_glIsEnabled = _glIsEnabled;

/** @suppress {duplicate } */ var _glIsFramebuffer = framebuffer => {
  var fb = GL.framebuffers[framebuffer];
  if (!fb) return 0;
  return GLctx.isFramebuffer(fb);
};

var _emscripten_glIsFramebuffer = _glIsFramebuffer;

/** @suppress {duplicate } */ var _glIsProgram = program => {
  program = GL.programs[program];
  if (!program) return 0;
  return GLctx.isProgram(program);
};

var _emscripten_glIsProgram = _glIsProgram;

/** @suppress {duplicate } */ var _glIsQueryEXT = id => {
  var query = GL.queries[id];
  if (!query) return 0;
  return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
};

var _emscripten_glIsQueryEXT = _glIsQueryEXT;

/** @suppress {duplicate } */ var _glIsRenderbuffer = renderbuffer => {
  var rb = GL.renderbuffers[renderbuffer];
  if (!rb) return 0;
  return GLctx.isRenderbuffer(rb);
};

var _emscripten_glIsRenderbuffer = _glIsRenderbuffer;

/** @suppress {duplicate } */ var _glIsShader = shader => {
  var s = GL.shaders[shader];
  if (!s) return 0;
  return GLctx.isShader(s);
};

var _emscripten_glIsShader = _glIsShader;

/** @suppress {duplicate } */ var _glIsTexture = id => {
  var texture = GL.textures[id];
  if (!texture) return 0;
  return GLctx.isTexture(texture);
};

var _emscripten_glIsTexture = _glIsTexture;

/** @suppress {duplicate } */ var _glIsVertexArray = array => {
  var vao = GL.vaos[array];
  if (!vao) return 0;
  return GLctx.isVertexArray(vao);
};

/** @suppress {duplicate } */ var _glIsVertexArrayOES = _glIsVertexArray;

var _emscripten_glIsVertexArrayOES = _glIsVertexArrayOES;

/** @suppress {duplicate } */ var _glLineWidth = x0 => GLctx.lineWidth(x0);

var _emscripten_glLineWidth = _glLineWidth;

/** @suppress {duplicate } */ var _glLinkProgram = program => {
  program = GL.programs[program];
  GLctx.linkProgram(program);
  // Invalidate earlier computed uniform->ID mappings, those have now become stale
  program.uniformLocsById = 0;
  // Mark as null-like so that glGetUniformLocation() knows to populate this again.
  program.uniformSizeAndIdsByName = {};
};

var _emscripten_glLinkProgram = _glLinkProgram;

/** @suppress {duplicate } */ var _glPixelStorei = (pname, param) => {
  if (pname == 3317) {
    GL.unpackAlignment = param;
  } else if (pname == 3314) {
    GL.unpackRowLength = param;
  }
  GLctx.pixelStorei(pname, param);
};

var _emscripten_glPixelStorei = _glPixelStorei;

/** @suppress {duplicate } */ var _glPolygonModeWEBGL = (face, mode) => {
  GLctx.webglPolygonMode["polygonModeWEBGL"](face, mode);
};

var _emscripten_glPolygonModeWEBGL = _glPolygonModeWEBGL;

/** @suppress {duplicate } */ var _glPolygonOffset = (x0, x1) => GLctx.polygonOffset(x0, x1);

var _emscripten_glPolygonOffset = _glPolygonOffset;

/** @suppress {duplicate } */ var _glPolygonOffsetClampEXT = (factor, units, clamp) => {
  GLctx.extPolygonOffsetClamp["polygonOffsetClampEXT"](factor, units, clamp);
};

var _emscripten_glPolygonOffsetClampEXT = _glPolygonOffsetClampEXT;

/** @suppress {duplicate } */ var _glQueryCounterEXT = (id, target) => {
  GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target);
};

var _emscripten_glQueryCounterEXT = _glQueryCounterEXT;

var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
  function roundedToNextMultipleOf(x, y) {
    return (x + y - 1) & -y;
  }
  var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
  var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
  return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
  // Micro-optimizations for size: map format to size by subtracting smallest
  // enum value (0x1902) from all values first.  Also omit the most common
  // size value (1) from the list, which is assumed by formats not on the
  // list.
  var colorChannels = {
    // 0x1902 /* GL_DEPTH_COMPONENT */ - 0x1902: 1,
    // 0x1906 /* GL_ALPHA */ - 0x1902: 1,
    5: 3,
    6: 4,
    // 0x1909 /* GL_LUMINANCE */ - 0x1902: 1,
    8: 2,
    29502: 3,
    29504: 4
  };
  return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
  // Micro-optimization for size: Subtract lowest GL enum number (0x1400/* GL_BYTE */) from type to compare
  // smaller values for the heap, for shorter generated code size.
  // Also the type HEAPU16 is not tested for explicitly, but any unrecognized type will return out HEAPU16.
  // (since most types are HEAPU16)
  type -= 5120;
  if (type == 1) return HEAPU8;
  if (type == 4) return HEAP32;
  if (type == 6) return HEAPF32;
  if (type == 5 || type == 28922) return HEAPU32;
  return HEAPU16;
};

var toTypedArrayIndex = (pointer, heap) => pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
  var heap = heapObjectForWebGLType(type);
  var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
  var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
  return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
};

/** @suppress {duplicate } */ var _glReadPixels = (x, y, width, height, format, type, pixels) => {
  var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
  if (!pixelData) {
    GL.recordError(1280);
    /*GL_INVALID_ENUM*/ return;
  }
  GLctx.readPixels(x, y, width, height, format, type, pixelData);
};

var _emscripten_glReadPixels = _glReadPixels;

/** @suppress {duplicate } */ var _glReleaseShaderCompiler = () => {};

// NOP (as allowed by GLES 2.0 spec)
var _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler;

/** @suppress {duplicate } */ var _glRenderbufferStorage = (x0, x1, x2, x3) => GLctx.renderbufferStorage(x0, x1, x2, x3);

var _emscripten_glRenderbufferStorage = _glRenderbufferStorage;

/** @suppress {duplicate } */ var _glSampleCoverage = (value, invert) => {
  GLctx.sampleCoverage(value, !!invert);
};

var _emscripten_glSampleCoverage = _glSampleCoverage;

/** @suppress {duplicate } */ var _glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);

var _emscripten_glScissor = _glScissor;

/** @suppress {duplicate } */ var _glShaderBinary = (count, shaders, binaryformat, binary, length) => {
  GL.recordError(1280);
};

/*GL_INVALID_ENUM*/ var _emscripten_glShaderBinary = _glShaderBinary;

/** @suppress {duplicate } */ var _glShaderSource = (shader, count, string, length) => {
  var source = GL.getSource(shader, count, string, length);
  GLctx.shaderSource(GL.shaders[shader], source);
};

var _emscripten_glShaderSource = _glShaderSource;

/** @suppress {duplicate } */ var _glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);

var _emscripten_glStencilFunc = _glStencilFunc;

/** @suppress {duplicate } */ var _glStencilFuncSeparate = (x0, x1, x2, x3) => GLctx.stencilFuncSeparate(x0, x1, x2, x3);

var _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate;

/** @suppress {duplicate } */ var _glStencilMask = x0 => GLctx.stencilMask(x0);

var _emscripten_glStencilMask = _glStencilMask;

/** @suppress {duplicate } */ var _glStencilMaskSeparate = (x0, x1) => GLctx.stencilMaskSeparate(x0, x1);

var _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate;

/** @suppress {duplicate } */ var _glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);

var _emscripten_glStencilOp = _glStencilOp;

/** @suppress {duplicate } */ var _glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);

var _emscripten_glStencilOpSeparate = _glStencilOpSeparate;

/** @suppress {duplicate } */ var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
  GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
};

var _emscripten_glTexImage2D = _glTexImage2D;

/** @suppress {duplicate } */ var _glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);

var _emscripten_glTexParameterf = _glTexParameterf;

/** @suppress {duplicate } */ var _glTexParameterfv = (target, pname, params) => {
  var param = HEAPF32[((params) >> 2)];
  GLctx.texParameterf(target, pname, param);
};

var _emscripten_glTexParameterfv = _glTexParameterfv;

/** @suppress {duplicate } */ var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

var _emscripten_glTexParameteri = _glTexParameteri;

/** @suppress {duplicate } */ var _glTexParameteriv = (target, pname, params) => {
  var param = HEAP32[((params) >> 2)];
  GLctx.texParameteri(target, pname, param);
};

var _emscripten_glTexParameteriv = _glTexParameteriv;

/** @suppress {duplicate } */ var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null;
  GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
};

var _emscripten_glTexSubImage2D = _glTexSubImage2D;

/** @suppress {duplicate } */ var _glUniform1f = (location, v0) => {
  GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1f = _glUniform1f;

var miniTempWebGLFloatBuffers = [];

/** @suppress {duplicate } */ var _glUniform1fv = (location, count, value) => {
  if (count <= 288) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; ++i) {
      view[i] = HEAPF32[(((value) + (4 * i)) >> 2)];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 4) >> 2));
  }
  GLctx.uniform1fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform1fv = _glUniform1fv;

/** @suppress {duplicate } */ var _glUniform1i = (location, v0) => {
  GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1i = _glUniform1i;

var miniTempWebGLIntBuffers = [];

/** @suppress {duplicate } */ var _glUniform1iv = (location, count, value) => {
  if (count <= 288) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; ++i) {
      view[i] = HEAP32[(((value) + (4 * i)) >> 2)];
    }
  } else {
    var view = HEAP32.subarray((((value) >> 2)), ((value + count * 4) >> 2));
  }
  GLctx.uniform1iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform1iv = _glUniform1iv;

/** @suppress {duplicate } */ var _glUniform2f = (location, v0, v1) => {
  GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2f = _glUniform2f;

/** @suppress {duplicate } */ var _glUniform2fv = (location, count, value) => {
  if (count <= 144) {
    // avoid allocation when uploading few enough uniforms
    count *= 2;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 2) {
      view[i] = HEAPF32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAPF32[(((value) + (4 * i + 4)) >> 2)];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 8) >> 2));
  }
  GLctx.uniform2fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform2fv = _glUniform2fv;

/** @suppress {duplicate } */ var _glUniform2i = (location, v0, v1) => {
  GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2i = _glUniform2i;

/** @suppress {duplicate } */ var _glUniform2iv = (location, count, value) => {
  if (count <= 144) {
    // avoid allocation when uploading few enough uniforms
    count *= 2;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 2) {
      view[i] = HEAP32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAP32[(((value) + (4 * i + 4)) >> 2)];
    }
  } else {
    var view = HEAP32.subarray((((value) >> 2)), ((value + count * 8) >> 2));
  }
  GLctx.uniform2iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform2iv = _glUniform2iv;

/** @suppress {duplicate } */ var _glUniform3f = (location, v0, v1, v2) => {
  GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3f = _glUniform3f;

/** @suppress {duplicate } */ var _glUniform3fv = (location, count, value) => {
  if (count <= 96) {
    // avoid allocation when uploading few enough uniforms
    count *= 3;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 3) {
      view[i] = HEAPF32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAPF32[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = HEAPF32[(((value) + (4 * i + 8)) >> 2)];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 12) >> 2));
  }
  GLctx.uniform3fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform3fv = _glUniform3fv;

/** @suppress {duplicate } */ var _glUniform3i = (location, v0, v1, v2) => {
  GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3i = _glUniform3i;

/** @suppress {duplicate } */ var _glUniform3iv = (location, count, value) => {
  if (count <= 96) {
    // avoid allocation when uploading few enough uniforms
    count *= 3;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 3) {
      view[i] = HEAP32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAP32[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = HEAP32[(((value) + (4 * i + 8)) >> 2)];
    }
  } else {
    var view = HEAP32.subarray((((value) >> 2)), ((value + count * 12) >> 2));
  }
  GLctx.uniform3iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform3iv = _glUniform3iv;

/** @suppress {duplicate } */ var _glUniform4f = (location, v0, v1, v2, v3) => {
  GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4f = _glUniform4f;

/** @suppress {duplicate } */ var _glUniform4fv = (location, count, value) => {
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[4 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = HEAPF32;
    value = ((value) >> 2);
    count *= 4;
    for (var i = 0; i < count; i += 4) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniform4fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform4fv = _glUniform4fv;

/** @suppress {duplicate } */ var _glUniform4i = (location, v0, v1, v2, v3) => {
  GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4i = _glUniform4i;

/** @suppress {duplicate } */ var _glUniform4iv = (location, count, value) => {
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    count *= 4;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 4) {
      view[i] = HEAP32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAP32[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = HEAP32[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = HEAP32[(((value) + (4 * i + 12)) >> 2)];
    }
  } else {
    var view = HEAP32.subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniform4iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform4iv = _glUniform4iv;

/** @suppress {duplicate } */ var _glUniformMatrix2fv = (location, count, transpose, value) => {
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    count *= 4;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 4) {
      view[i] = HEAPF32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAPF32[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = HEAPF32[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = HEAPF32[(((value) + (4 * i + 12)) >> 2)];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv;

/** @suppress {duplicate } */ var _glUniformMatrix3fv = (location, count, transpose, value) => {
  if (count <= 32) {
    // avoid allocation when uploading few enough uniforms
    count *= 9;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 9) {
      view[i] = HEAPF32[(((value) + (4 * i)) >> 2)];
      view[i + 1] = HEAPF32[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = HEAPF32[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = HEAPF32[(((value) + (4 * i + 12)) >> 2)];
      view[i + 4] = HEAPF32[(((value) + (4 * i + 16)) >> 2)];
      view[i + 5] = HEAPF32[(((value) + (4 * i + 20)) >> 2)];
      view[i + 6] = HEAPF32[(((value) + (4 * i + 24)) >> 2)];
      view[i + 7] = HEAPF32[(((value) + (4 * i + 28)) >> 2)];
      view[i + 8] = HEAPF32[(((value) + (4 * i + 32)) >> 2)];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 36) >> 2));
  }
  GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv;

/** @suppress {duplicate } */ var _glUniformMatrix4fv = (location, count, transpose, value) => {
  if (count <= 18) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[16 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = HEAPF32;
    value = ((value) >> 2);
    count *= 16;
    for (var i = 0; i < count; i += 16) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
      view[i + 4] = heap[dst + 4];
      view[i + 5] = heap[dst + 5];
      view[i + 6] = heap[dst + 6];
      view[i + 7] = heap[dst + 7];
      view[i + 8] = heap[dst + 8];
      view[i + 9] = heap[dst + 9];
      view[i + 10] = heap[dst + 10];
      view[i + 11] = heap[dst + 11];
      view[i + 12] = heap[dst + 12];
      view[i + 13] = heap[dst + 13];
      view[i + 14] = heap[dst + 14];
      view[i + 15] = heap[dst + 15];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 64) >> 2));
  }
  GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv;

/** @suppress {duplicate } */ var _glUseProgram = program => {
  program = GL.programs[program];
  GLctx.useProgram(program);
  // Record the currently active program so that we can access the uniform
  // mapping table of that program.
  GLctx.currentProgram = program;
};

var _emscripten_glUseProgram = _glUseProgram;

/** @suppress {duplicate } */ var _glValidateProgram = program => {
  GLctx.validateProgram(GL.programs[program]);
};

var _emscripten_glValidateProgram = _glValidateProgram;

/** @suppress {duplicate } */ var _glVertexAttrib1f = (x0, x1) => GLctx.vertexAttrib1f(x0, x1);

var _emscripten_glVertexAttrib1f = _glVertexAttrib1f;

/** @suppress {duplicate } */ var _glVertexAttrib1fv = (index, v) => {
  GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
};

var _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv;

/** @suppress {duplicate } */ var _glVertexAttrib2f = (x0, x1, x2) => GLctx.vertexAttrib2f(x0, x1, x2);

var _emscripten_glVertexAttrib2f = _glVertexAttrib2f;

/** @suppress {duplicate } */ var _glVertexAttrib2fv = (index, v) => {
  GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
};

var _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv;

/** @suppress {duplicate } */ var _glVertexAttrib3f = (x0, x1, x2, x3) => GLctx.vertexAttrib3f(x0, x1, x2, x3);

var _emscripten_glVertexAttrib3f = _glVertexAttrib3f;

/** @suppress {duplicate } */ var _glVertexAttrib3fv = (index, v) => {
  GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
};

var _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv;

/** @suppress {duplicate } */ var _glVertexAttrib4f = (x0, x1, x2, x3, x4) => GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);

var _emscripten_glVertexAttrib4f = _glVertexAttrib4f;

/** @suppress {duplicate } */ var _glVertexAttrib4fv = (index, v) => {
  GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
};

var _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv;

/** @suppress {duplicate } */ var _glVertexAttribDivisor = (index, divisor) => {
  GLctx.vertexAttribDivisor(index, divisor);
};

/** @suppress {duplicate } */ var _glVertexAttribDivisorANGLE = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorANGLE = _glVertexAttribDivisorANGLE;

/** @suppress {duplicate } */ var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
  var cb = GL.currentContext.clientBuffers[index];
  if (!GLctx.currentArrayBufferBinding) {
    cb.size = size;
    cb.type = type;
    cb.normalized = normalized;
    cb.stride = stride;
    cb.ptr = ptr;
    cb.clientside = true;
    cb.vertexAttribPointerAdaptor = function(index, size, type, normalized, stride, ptr) {
      this.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    };
    return;
  }
  cb.clientside = false;
  GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
};

var _emscripten_glVertexAttribPointer = _glVertexAttribPointer;

/** @suppress {duplicate } */ var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

var _emscripten_glViewport = _glViewport;

var growMemory = size => {
  var b = wasmMemory.buffer;
  var pages = ((size - b.byteLength + 65535) / 65536) | 0;
  try {
    // round size grow request up to wasm page size (fixed 64KB per spec)
    wasmMemory.grow(pages);
    // .grow() takes a delta compared to the previous size
    updateMemoryViews();
    return 1;
  } /*success*/ catch (e) {}
};

// implicit 0 return to save code size (caller will cast "undefined" into 0
// anyhow)
var _emscripten_resize_heap = requestedSize => {
  var oldSize = HEAPU8.length;
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  requestedSize >>>= 0;
  // With multithreaded builds, races can happen (another thread might increase the size
  // in between), so return a failure, and let the caller retry.
  // Memory resize rules:
  // 1.  Always increase heap size to at least the requested size, rounded up
  //     to next page multiple.
  // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
  //     geometrically: increase the heap size according to
  //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
  //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
  // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
  //     linearly: increase the heap size by at least
  //     MEMORY_GROWTH_LINEAR_STEP bytes.
  // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
  //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
  // 4.  If we were unable to allocate as much memory, it may be due to
  //     over-eager decision to excessively reserve due to (3) above.
  //     Hence if an allocation fails, cut down on the amount of excess
  //     growth, in an attempt to succeed to perform a smaller allocation.
  // A limit is set for how much we can grow. We should not exceed that
  // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    return false;
  }
  // Loop through potential heap size increases. If we attempt a too eager
  // reservation that fails, cut down on the attempted size and reserve a
  // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
    // ensure geometric growth
    // but limit overreserving (default to capping at +96MB overgrowth at most)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = growMemory(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
};

var registerFocusEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.focusEvent ||= _malloc(256);
  var focusEventHandlerFunc = (e = event) => {
    var nodeName = JSEvents.getNodeNameForTarget(e.target);
    var id = e.target.id ? e.target.id : "";
    var focusEvent = JSEvents.focusEvent;
    stringToUTF8(nodeName, focusEvent + 0, 128);
    stringToUTF8(id, focusEvent + 128, 128);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, focusEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target: findEventTarget(target),
    eventTypeString,
    callbackfunc,
    handlerFunc: focusEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

var _emscripten_set_blur_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);

var _emscripten_set_canvas_element_size = (target, width, height) => {
  var canvas = findCanvasEventTarget(target);
  if (!canvas) return -4;
  canvas.width = width;
  canvas.height = height;
  return 0;
};

var registerKeyEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.keyEvent ||= _malloc(160);
  var keyEventHandlerFunc = e => {
    var keyEventData = JSEvents.keyEvent;
    HEAPF64[((keyEventData) >> 3)] = e.timeStamp;
    var idx = ((keyEventData) >> 2);
    HEAP32[idx + 2] = e.location;
    HEAP8[keyEventData + 12] = e.ctrlKey;
    HEAP8[keyEventData + 13] = e.shiftKey;
    HEAP8[keyEventData + 14] = e.altKey;
    HEAP8[keyEventData + 15] = e.metaKey;
    HEAP8[keyEventData + 16] = e.repeat;
    HEAP32[idx + 5] = e.charCode;
    HEAP32[idx + 6] = e.keyCode;
    HEAP32[idx + 7] = e.which;
    stringToUTF8(e.key || "", keyEventData + 32, 32);
    stringToUTF8(e.code || "", keyEventData + 64, 32);
    stringToUTF8(e.char || "", keyEventData + 96, 32);
    stringToUTF8(e.locale || "", keyEventData + 128, 32);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, keyEventData, userData)) e.preventDefault();
  };
  var eventHandler = {
    target: findEventTarget(target),
    eventTypeString,
    callbackfunc,
    handlerFunc: keyEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

var _emscripten_set_keydown_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);

var _emscripten_set_keyup_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);

var _emscripten_set_main_loop = (func, fps, simulateInfiniteLoop) => {
  var iterFunc = (() => dynCall_v(func));
  setMainLoop(iterFunc, fps, simulateInfiniteLoop);
};

var fillMouseEventData = (eventStruct, e, target) => {
  HEAPF64[((eventStruct) >> 3)] = e.timeStamp;
  var idx = ((eventStruct) >> 2);
  HEAP32[idx + 2] = e.screenX;
  HEAP32[idx + 3] = e.screenY;
  HEAP32[idx + 4] = e.clientX;
  HEAP32[idx + 5] = e.clientY;
  HEAP8[eventStruct + 24] = e.ctrlKey;
  HEAP8[eventStruct + 25] = e.shiftKey;
  HEAP8[eventStruct + 26] = e.altKey;
  HEAP8[eventStruct + 27] = e.metaKey;
  HEAP16[idx * 2 + 14] = e.button;
  HEAP16[idx * 2 + 15] = e.buttons;
  HEAP32[idx + 8] = e["movementX"];
  HEAP32[idx + 9] = e["movementY"];
  // Note: rect contains doubles (truncated to placate SAFE_HEAP, which is the same behaviour when writing to HEAP32 anyway)
  var rect = getBoundingClientRect(target);
  HEAP32[idx + 10] = e.clientX - (rect.left | 0);
  HEAP32[idx + 11] = e.clientY - (rect.top | 0);
};

var registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.mouseEvent ||= _malloc(64);
  target = findEventTarget(target);
  var mouseEventHandlerFunc = (e = event) => {
    // TODO: Make this access thread safe, or this could update live while app is reading it.
    fillMouseEventData(JSEvents.mouseEvent, e, target);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
    // Mouse move events do not allow fullscreen/pointer lock requests to be handled in them!
    eventTypeString,
    callbackfunc,
    handlerFunc: mouseEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

var _emscripten_set_mousedown_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);

var _emscripten_set_mousemove_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);

var _emscripten_set_mouseup_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);

var webglPowerPreferences = [ "default", "low-power", "high-performance" ];

/** @suppress {duplicate } */ var _emscripten_webgl_do_create_context = (target, attributes) => {
  var attr32 = ((attributes) >> 2);
  var powerPreference = HEAP32[attr32 + (8 >> 2)];
  var contextAttributes = {
    "alpha": !!HEAP8[attributes + 0],
    "depth": !!HEAP8[attributes + 1],
    "stencil": !!HEAP8[attributes + 2],
    "antialias": !!HEAP8[attributes + 3],
    "premultipliedAlpha": !!HEAP8[attributes + 4],
    "preserveDrawingBuffer": !!HEAP8[attributes + 5],
    "powerPreference": webglPowerPreferences[powerPreference],
    "failIfMajorPerformanceCaveat": !!HEAP8[attributes + 12],
    // The following are not predefined WebGL context attributes in the WebGL specification, so the property names can be minified by Closure.
    majorVersion: HEAP32[attr32 + (16 >> 2)],
    minorVersion: HEAP32[attr32 + (20 >> 2)],
    enableExtensionsByDefault: HEAP8[attributes + 24],
    explicitSwapControl: HEAP8[attributes + 25],
    proxyContextToMainThread: HEAP32[attr32 + (28 >> 2)],
    renderViaOffscreenBackBuffer: HEAP8[attributes + 32]
  };
  var canvas = findCanvasEventTarget(target);
  if (!canvas) {
    return 0;
  }
  if (contextAttributes.explicitSwapControl) {
    return 0;
  }
  var contextHandle = GL.createContext(canvas, contextAttributes);
  return contextHandle;
};

var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;

var _emscripten_webgl_make_context_current = contextHandle => {
  var success = GL.makeContextCurrent(contextHandle);
  return success ? 0 : -5;
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
  if (!getEnvStrings.strings) {
    // Default values.
    // Browser language detection #8751
    var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
    var env = {
      "USER": "web_user",
      "LOGNAME": "web_user",
      "PATH": "/",
      "PWD": "/",
      "HOME": "/home/web_user",
      "LANG": lang,
      "_": getExecutableName()
    };
    // Apply the user-provided values, if any.
    for (var x in ENV) {
      // x is a key in ENV; if ENV[x] is undefined, that means it was
      // explicitly set to be so. We allow user code to do that to
      // force variables with default values to remain unset.
      if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(`${x}=${env[x]}`);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++] = str.charCodeAt(i);
  }
  // Null-terminate the string
  HEAP8[buffer] = 0;
};

var _environ_get = (__environ, environ_buf) => {
  var bufSize = 0;
  getEnvStrings().forEach((string, i) => {
    var ptr = environ_buf + bufSize;
    HEAPU32[(((__environ) + (i * 4)) >> 2)] = ptr;
    stringToAscii(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
};

var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
  var strings = getEnvStrings();
  HEAPU32[((penviron_count) >> 2)] = strings.length;
  var bufSize = 0;
  strings.forEach(string => bufSize += string.length + 1);
  HEAPU32[((penviron_buf_size) >> 2)] = bufSize;
  return 0;
};

function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _fd_fdstat_get(fd, pbuf) {
  try {
    var rightsBase = 0;
    var rightsInheriting = 0;
    var flags = 0;
    {
      var stream = SYSCALLS.getStreamFromFD(fd);
      // All character devices are terminals (other things a Linux system would
      // assume is a character device, like the mouse, we have special APIs for).
      var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
    }
    HEAP8[pbuf] = type;
    HEAP16[(((pbuf) + (2)) >> 1)] = flags;
    (tempI64 = [ rightsBase >>> 0, (tempDouble = rightsBase, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((pbuf) + (8)) >> 2)] = tempI64[0], HEAP32[(((pbuf) + (12)) >> 2)] = tempI64[1]);
    (tempI64 = [ rightsInheriting >>> 0, (tempDouble = rightsInheriting, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[(((pbuf) + (16)) >> 2)] = tempI64[0], HEAP32[(((pbuf) + (20)) >> 2)] = tempI64[1]);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doReadv = (stream, iov, iovcnt, offset) => {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[((iov) >> 2)];
    var len = HEAPU32[(((iov) + (4)) >> 2)];
    iov += 8;
    var curr = FS.read(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
    // nothing more to read
    if (typeof offset != "undefined") {
      offset += curr;
    }
  }
  return ret;
};

function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    HEAPU32[((pnum) >> 2)] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  try {
    if (isNaN(offset)) return 61;
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.llseek(stream, offset, whence);
    (tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
    HEAP32[((newOffset) >> 2)] = tempI64[0], HEAP32[(((newOffset) + (4)) >> 2)] = tempI64[1]);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _fd_sync(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    if (stream.stream_ops?.fsync) {
      return stream.stream_ops.fsync(stream);
    }
    return 0;
  } // we can't do anything synchronously; the in-memory FS is already synced to
  catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doWritev = (stream, iov, iovcnt, offset) => {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[((iov) >> 2)];
    var len = HEAPU32[(((iov) + (4)) >> 2)];
    iov += 8;
    var curr = FS.write(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) {
      // No more space to write.
      break;
    }
    if (typeof offset != "undefined") {
      offset += curr;
    }
  }
  return ret;
};

function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    HEAPU32[((pnum) >> 2)] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var stringToUTF8OnStack = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8(str, ret, size);
  return ret;
};

/** @type {WebAssembly.Table} */ var wasmTable;

var FS_createPath = FS.createPath;

var FS_unlink = path => FS.unlink(path);

var FS_createLazyFile = FS.createLazyFile;

var FS_createDevice = FS.createDevice;

// exports
Module["requestFullscreen"] = Browser.requestFullscreen;

Module["setCanvasSize"] = Browser.setCanvasSize;

Module["getUserMedia"] = Browser.getUserMedia;

Module["createContext"] = Browser.createContext;

Module["requestAnimationFrame"] = MainLoop.requestAnimationFrame;

Module["pauseMainLoop"] = MainLoop.pause;

Module["resumeMainLoop"] = MainLoop.resume;

MainLoop.init();

FS.createPreloadedFile = FS_createPreloadedFile;

FS.staticInit();

// Set module methods based on EXPORTED_RUNTIME_METHODS
Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_unlink"] = FS.unlink;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

// This error may happen quite a bit. To avoid overhead we reuse it (and
// suffer a lack of stack info).
MEMFS.doesNotExistError = new FS.ErrnoError(44);

/** @suppress {checkTypes} */ MEMFS.doesNotExistError.stack = "<generic error, no stack>";

// Signal GL rendering layer that processing of a new frame is about to
// start. This helps it optimize VBO double-buffering and reduce GPU stalls.
registerPreMainLoop(() => GL.newRenderingFrameStarted());

for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

var miniTempWebGLFloatBuffersStorage = new Float32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
}

var miniTempWebGLIntBuffersStorage = new Int32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i);
}

var wasmImports = {
  /** @export */ ve: _SDL_InitSubSystem,
  /** @export */ j: _SDL_JoystickClose,
  /** @export */ ue: _SDL_JoystickEventState,
  /** @export */ L: _SDL_JoystickGetButton,
  /** @export */ te: _SDL_JoystickNumAxes,
  /** @export */ se: _SDL_JoystickNumButtons,
  /** @export */ re: _SDL_JoystickNumHats,
  /** @export */ qe: _SDL_JoystickOpen,
  /** @export */ g: _SDL_JoystickOpened,
  /** @export */ pe: _SDL_NumJoysticks,
  /** @export */ K: _SDL_PollEvent,
  /** @export */ oe: _SDL_QuitSubSystem,
  /** @export */ ne: ___call_sighandler,
  /** @export */ x: ___cxa_throw,
  /** @export */ me: ___syscall__newselect,
  /** @export */ J: ___syscall_chdir,
  /** @export */ I: ___syscall_chmod,
  /** @export */ le: ___syscall_dup,
  /** @export */ ke: ___syscall_dup3,
  /** @export */ je: ___syscall_faccessat,
  /** @export */ ie: ___syscall_fchdir,
  /** @export */ he: ___syscall_fchmod,
  /** @export */ H: ___syscall_fchmodat2,
  /** @export */ ge: ___syscall_fchown32,
  /** @export */ G: ___syscall_fchownat,
  /** @export */ f: ___syscall_fcntl64,
  /** @export */ fe: ___syscall_fdatasync,
  /** @export */ ee: ___syscall_fstat64,
  /** @export */ de: ___syscall_fstatfs64,
  /** @export */ T: ___syscall_ftruncate64,
  /** @export */ ce: ___syscall_getcwd,
  /** @export */ be: ___syscall_getdents64,
  /** @export */ w: ___syscall_ioctl,
  /** @export */ ae: ___syscall_lstat64,
  /** @export */ $d: ___syscall_mkdirat,
  /** @export */ _d: ___syscall_mknodat,
  /** @export */ Zd: ___syscall_newfstatat,
  /** @export */ n: ___syscall_openat,
  /** @export */ Yd: ___syscall_pipe,
  /** @export */ v: ___syscall_readlinkat,
  /** @export */ Xd: ___syscall_renameat,
  /** @export */ F: ___syscall_rmdir,
  /** @export */ Wd: ___syscall_stat64,
  /** @export */ Vd: ___syscall_statfs64,
  /** @export */ Ud: ___syscall_symlinkat,
  /** @export */ u: ___syscall_unlinkat,
  /** @export */ Td: ___syscall_utimensat,
  /** @export */ Od: __abort_js,
  /** @export */ Nd: __emscripten_memcpy_js,
  /** @export */ Md: __emscripten_runtime_keepalive_clear,
  /** @export */ Ld: __emscripten_system,
  /** @export */ Kd: __emscripten_throw_longjmp,
  /** @export */ Q: __gmtime_js,
  /** @export */ P: __localtime_js,
  /** @export */ O: __mktime_js,
  /** @export */ N: __mmap_js,
  /** @export */ M: __munmap_js,
  /** @export */ Jd: __tzset_js,
  /** @export */ Id: _alBufferData,
  /** @export */ Hd: _alDeleteBuffers,
  /** @export */ Gd: _alDeleteSources,
  /** @export */ Fd: _alDopplerFactor,
  /** @export */ Ed: _alDopplerVelocity,
  /** @export */ Dd: _alGenBuffers,
  /** @export */ Cd: _alGenSources,
  /** @export */ C: _alGetError,
  /** @export */ Bd: _alGetSourceiv,
  /** @export */ Ad: _alIsBuffer,
  /** @export */ zd: _alListenerf,
  /** @export */ s: _alListenerfv,
  /** @export */ yd: _alSourcePause,
  /** @export */ xd: _alSourcePlay,
  /** @export */ b: _alSourceStop,
  /** @export */ wd: _alSourceStopv,
  /** @export */ i: _alSourcef,
  /** @export */ l: _alSourcefv,
  /** @export */ r: _alSourcei,
  /** @export */ vd: _alcCloseDevice,
  /** @export */ ud: _alcCreateContext,
  /** @export */ td: _alcDestroyContext,
  /** @export */ sd: _alcGetError,
  /** @export */ rd: _alcMakeContextCurrent,
  /** @export */ qd: _alcOpenDevice,
  /** @export */ S: _clock_time_get,
  /** @export */ m: _emscripten_asm_const_int,
  /** @export */ B: _emscripten_cancel_main_loop,
  /** @export */ A: _emscripten_date_now,
  /** @export */ pd: _emscripten_force_exit,
  /** @export */ od: _emscripten_get_canvas_element_size,
  /** @export */ nd: _emscripten_get_element_css_size,
  /** @export */ md: _emscripten_get_heap_max,
  /** @export */ ld: _emscripten_get_now,
  /** @export */ kd: _emscripten_glActiveTexture,
  /** @export */ jd: _emscripten_glAttachShader,
  /** @export */ id: _emscripten_glBeginQueryEXT,
  /** @export */ hd: _emscripten_glBindAttribLocation,
  /** @export */ gd: _emscripten_glBindBuffer,
  /** @export */ fd: _emscripten_glBindFramebuffer,
  /** @export */ ed: _emscripten_glBindRenderbuffer,
  /** @export */ dd: _emscripten_glBindTexture,
  /** @export */ cd: _emscripten_glBindVertexArrayOES,
  /** @export */ bd: _emscripten_glBlendColor,
  /** @export */ ad: _emscripten_glBlendEquation,
  /** @export */ $c: _emscripten_glBlendEquationSeparate,
  /** @export */ _c: _emscripten_glBlendFunc,
  /** @export */ Zc: _emscripten_glBlendFuncSeparate,
  /** @export */ Yc: _emscripten_glBufferData,
  /** @export */ Xc: _emscripten_glBufferSubData,
  /** @export */ Wc: _emscripten_glCheckFramebufferStatus,
  /** @export */ Vc: _emscripten_glClear,
  /** @export */ Uc: _emscripten_glClearColor,
  /** @export */ Tc: _emscripten_glClearDepthf,
  /** @export */ Sc: _emscripten_glClearStencil,
  /** @export */ Rc: _emscripten_glClipControlEXT,
  /** @export */ Qc: _emscripten_glColorMask,
  /** @export */ Pc: _emscripten_glCompileShader,
  /** @export */ Oc: _emscripten_glCompressedTexImage2D,
  /** @export */ Nc: _emscripten_glCompressedTexSubImage2D,
  /** @export */ Mc: _emscripten_glCopyTexImage2D,
  /** @export */ Lc: _emscripten_glCopyTexSubImage2D,
  /** @export */ Kc: _emscripten_glCreateProgram,
  /** @export */ Jc: _emscripten_glCreateShader,
  /** @export */ Ic: _emscripten_glCullFace,
  /** @export */ Hc: _emscripten_glDeleteBuffers,
  /** @export */ Gc: _emscripten_glDeleteFramebuffers,
  /** @export */ Fc: _emscripten_glDeleteProgram,
  /** @export */ Ec: _emscripten_glDeleteQueriesEXT,
  /** @export */ Dc: _emscripten_glDeleteRenderbuffers,
  /** @export */ Cc: _emscripten_glDeleteShader,
  /** @export */ Bc: _emscripten_glDeleteTextures,
  /** @export */ Ac: _emscripten_glDeleteVertexArraysOES,
  /** @export */ zc: _emscripten_glDepthFunc,
  /** @export */ yc: _emscripten_glDepthMask,
  /** @export */ xc: _emscripten_glDepthRangef,
  /** @export */ wc: _emscripten_glDetachShader,
  /** @export */ vc: _emscripten_glDisable,
  /** @export */ uc: _emscripten_glDisableVertexAttribArray,
  /** @export */ tc: _emscripten_glDrawArrays,
  /** @export */ sc: _emscripten_glDrawArraysInstancedANGLE,
  /** @export */ rc: _emscripten_glDrawBuffersWEBGL,
  /** @export */ qc: _emscripten_glDrawElements,
  /** @export */ pc: _emscripten_glDrawElementsInstancedANGLE,
  /** @export */ oc: _emscripten_glEnable,
  /** @export */ nc: _emscripten_glEnableVertexAttribArray,
  /** @export */ mc: _emscripten_glEndQueryEXT,
  /** @export */ lc: _emscripten_glFinish,
  /** @export */ kc: _emscripten_glFlush,
  /** @export */ jc: _emscripten_glFramebufferRenderbuffer,
  /** @export */ ic: _emscripten_glFramebufferTexture2D,
  /** @export */ hc: _emscripten_glFrontFace,
  /** @export */ gc: _emscripten_glGenBuffers,
  /** @export */ fc: _emscripten_glGenFramebuffers,
  /** @export */ ec: _emscripten_glGenQueriesEXT,
  /** @export */ dc: _emscripten_glGenRenderbuffers,
  /** @export */ cc: _emscripten_glGenTextures,
  /** @export */ bc: _emscripten_glGenVertexArraysOES,
  /** @export */ ac: _emscripten_glGenerateMipmap,
  /** @export */ $b: _emscripten_glGetActiveAttrib,
  /** @export */ _b: _emscripten_glGetActiveUniform,
  /** @export */ Zb: _emscripten_glGetAttachedShaders,
  /** @export */ Yb: _emscripten_glGetAttribLocation,
  /** @export */ Xb: _emscripten_glGetBooleanv,
  /** @export */ Wb: _emscripten_glGetBufferParameteriv,
  /** @export */ Vb: _emscripten_glGetError,
  /** @export */ Ub: _emscripten_glGetFloatv,
  /** @export */ Tb: _emscripten_glGetFramebufferAttachmentParameteriv,
  /** @export */ Sb: _emscripten_glGetIntegerv,
  /** @export */ Rb: _emscripten_glGetProgramInfoLog,
  /** @export */ Qb: _emscripten_glGetProgramiv,
  /** @export */ Pb: _emscripten_glGetQueryObjecti64vEXT,
  /** @export */ Ob: _emscripten_glGetQueryObjectivEXT,
  /** @export */ Nb: _emscripten_glGetQueryObjectui64vEXT,
  /** @export */ Mb: _emscripten_glGetQueryObjectuivEXT,
  /** @export */ Lb: _emscripten_glGetQueryivEXT,
  /** @export */ Kb: _emscripten_glGetRenderbufferParameteriv,
  /** @export */ Jb: _emscripten_glGetShaderInfoLog,
  /** @export */ Ib: _emscripten_glGetShaderPrecisionFormat,
  /** @export */ Hb: _emscripten_glGetShaderSource,
  /** @export */ Gb: _emscripten_glGetShaderiv,
  /** @export */ Fb: _emscripten_glGetString,
  /** @export */ Eb: _emscripten_glGetTexParameterfv,
  /** @export */ Db: _emscripten_glGetTexParameteriv,
  /** @export */ Cb: _emscripten_glGetUniformLocation,
  /** @export */ Bb: _emscripten_glGetUniformfv,
  /** @export */ Ab: _emscripten_glGetUniformiv,
  /** @export */ zb: _emscripten_glGetVertexAttribPointerv,
  /** @export */ yb: _emscripten_glGetVertexAttribfv,
  /** @export */ xb: _emscripten_glGetVertexAttribiv,
  /** @export */ wb: _emscripten_glHint,
  /** @export */ vb: _emscripten_glIsBuffer,
  /** @export */ ub: _emscripten_glIsEnabled,
  /** @export */ tb: _emscripten_glIsFramebuffer,
  /** @export */ sb: _emscripten_glIsProgram,
  /** @export */ rb: _emscripten_glIsQueryEXT,
  /** @export */ qb: _emscripten_glIsRenderbuffer,
  /** @export */ pb: _emscripten_glIsShader,
  /** @export */ ob: _emscripten_glIsTexture,
  /** @export */ nb: _emscripten_glIsVertexArrayOES,
  /** @export */ mb: _emscripten_glLineWidth,
  /** @export */ lb: _emscripten_glLinkProgram,
  /** @export */ kb: _emscripten_glPixelStorei,
  /** @export */ jb: _emscripten_glPolygonModeWEBGL,
  /** @export */ ib: _emscripten_glPolygonOffset,
  /** @export */ hb: _emscripten_glPolygonOffsetClampEXT,
  /** @export */ gb: _emscripten_glQueryCounterEXT,
  /** @export */ fb: _emscripten_glReadPixels,
  /** @export */ eb: _emscripten_glReleaseShaderCompiler,
  /** @export */ db: _emscripten_glRenderbufferStorage,
  /** @export */ cb: _emscripten_glSampleCoverage,
  /** @export */ bb: _emscripten_glScissor,
  /** @export */ ab: _emscripten_glShaderBinary,
  /** @export */ $a: _emscripten_glShaderSource,
  /** @export */ _a: _emscripten_glStencilFunc,
  /** @export */ Za: _emscripten_glStencilFuncSeparate,
  /** @export */ Ya: _emscripten_glStencilMask,
  /** @export */ Xa: _emscripten_glStencilMaskSeparate,
  /** @export */ Wa: _emscripten_glStencilOp,
  /** @export */ Va: _emscripten_glStencilOpSeparate,
  /** @export */ Ua: _emscripten_glTexImage2D,
  /** @export */ Ta: _emscripten_glTexParameterf,
  /** @export */ Sa: _emscripten_glTexParameterfv,
  /** @export */ Ra: _emscripten_glTexParameteri,
  /** @export */ Qa: _emscripten_glTexParameteriv,
  /** @export */ Pa: _emscripten_glTexSubImage2D,
  /** @export */ Oa: _emscripten_glUniform1f,
  /** @export */ Na: _emscripten_glUniform1fv,
  /** @export */ Ma: _emscripten_glUniform1i,
  /** @export */ La: _emscripten_glUniform1iv,
  /** @export */ Ka: _emscripten_glUniform2f,
  /** @export */ Ja: _emscripten_glUniform2fv,
  /** @export */ Ia: _emscripten_glUniform2i,
  /** @export */ Ha: _emscripten_glUniform2iv,
  /** @export */ Ga: _emscripten_glUniform3f,
  /** @export */ Fa: _emscripten_glUniform3fv,
  /** @export */ Ea: _emscripten_glUniform3i,
  /** @export */ Da: _emscripten_glUniform3iv,
  /** @export */ Ca: _emscripten_glUniform4f,
  /** @export */ Ba: _emscripten_glUniform4fv,
  /** @export */ Aa: _emscripten_glUniform4i,
  /** @export */ za: _emscripten_glUniform4iv,
  /** @export */ ya: _emscripten_glUniformMatrix2fv,
  /** @export */ xa: _emscripten_glUniformMatrix3fv,
  /** @export */ wa: _emscripten_glUniformMatrix4fv,
  /** @export */ va: _emscripten_glUseProgram,
  /** @export */ ua: _emscripten_glValidateProgram,
  /** @export */ ta: _emscripten_glVertexAttrib1f,
  /** @export */ sa: _emscripten_glVertexAttrib1fv,
  /** @export */ ra: _emscripten_glVertexAttrib2f,
  /** @export */ qa: _emscripten_glVertexAttrib2fv,
  /** @export */ pa: _emscripten_glVertexAttrib3f,
  /** @export */ oa: _emscripten_glVertexAttrib3fv,
  /** @export */ na: _emscripten_glVertexAttrib4f,
  /** @export */ ma: _emscripten_glVertexAttrib4fv,
  /** @export */ la: _emscripten_glVertexAttribDivisorANGLE,
  /** @export */ ka: _emscripten_glVertexAttribPointer,
  /** @export */ ja: _emscripten_glViewport,
  /** @export */ ia: _emscripten_resize_heap,
  /** @export */ ha: _emscripten_set_blur_callback_on_thread,
  /** @export */ ga: _emscripten_set_canvas_element_size,
  /** @export */ fa: _emscripten_set_keydown_callback_on_thread,
  /** @export */ ea: _emscripten_set_keyup_callback_on_thread,
  /** @export */ da: _emscripten_set_main_loop,
  /** @export */ ca: _emscripten_set_mousedown_callback_on_thread,
  /** @export */ ba: _emscripten_set_mousemove_callback_on_thread,
  /** @export */ aa: _emscripten_set_mouseup_callback_on_thread,
  /** @export */ $: _emscripten_webgl_create_context,
  /** @export */ z: _emscripten_webgl_make_context_current,
  /** @export */ Sd: _environ_get,
  /** @export */ Rd: _environ_sizes_get,
  /** @export */ h: _exit,
  /** @export */ k: _fd_close,
  /** @export */ E: _fd_fdstat_get,
  /** @export */ D: _fd_read,
  /** @export */ R: _fd_seek,
  /** @export */ Qd: _fd_sync,
  /** @export */ t: _fd_write,
  /** @export */ _: _glGetFloatv,
  /** @export */ Z: _glStencilFunc,
  /** @export */ Y: _glStencilOp,
  /** @export */ a: invoke_ii,
  /** @export */ d: invoke_iii,
  /** @export */ e: invoke_iiii,
  /** @export */ q: invoke_iiiii,
  /** @export */ X: invoke_iiiiii,
  /** @export */ W: invoke_iiiiiiiiii,
  /** @export */ p: invoke_vi,
  /** @export */ c: invoke_vii,
  /** @export */ o: invoke_viii,
  /** @export */ V: invoke_viiii,
  /** @export */ U: invoke_viiiiiii,
  /** @export */ y: invoke_viiiiiiiii,
  /** @export */ Pd: _proc_exit
};

var wasmExports;

createWasm();

var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["xe"])();

var _main = Module["_main"] = (a0, a1) => (_main = Module["_main"] = wasmExports["ze"])(a0, a1);

var _malloc = a0 => (_malloc = wasmExports["Ae"])(a0);

var _free = a0 => (_free = wasmExports["Be"])(a0);

var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports["Ce"])(a0, a1);

var _setThrew = (a0, a1) => (_setThrew = wasmExports["De"])(a0, a1);

var __emscripten_tempret_set = a0 => (__emscripten_tempret_set = wasmExports["Ee"])(a0);

var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["Fe"])(a0);

var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["Ge"])(a0);

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["He"])();

var dynCall_ii = Module["dynCall_ii"] = (a0, a1) => (dynCall_ii = Module["dynCall_ii"] = wasmExports["Ie"])(a0, a1);

var dynCall_vii = Module["dynCall_vii"] = (a0, a1, a2) => (dynCall_vii = Module["dynCall_vii"] = wasmExports["Je"])(a0, a1, a2);

var dynCall_iiii = Module["dynCall_iiii"] = (a0, a1, a2, a3) => (dynCall_iiii = Module["dynCall_iiii"] = wasmExports["Ke"])(a0, a1, a2, a3);

var dynCall_v = Module["dynCall_v"] = a0 => (dynCall_v = Module["dynCall_v"] = wasmExports["Le"])(a0);

var dynCall_vi = Module["dynCall_vi"] = (a0, a1) => (dynCall_vi = Module["dynCall_vi"] = wasmExports["Me"])(a0, a1);

var dynCall_viii = Module["dynCall_viii"] = (a0, a1, a2, a3) => (dynCall_viii = Module["dynCall_viii"] = wasmExports["Ne"])(a0, a1, a2, a3);

var dynCall_iii = Module["dynCall_iii"] = (a0, a1, a2) => (dynCall_iii = Module["dynCall_iii"] = wasmExports["Oe"])(a0, a1, a2);

var dynCall_iiiii = Module["dynCall_iiiii"] = (a0, a1, a2, a3, a4) => (dynCall_iiiii = Module["dynCall_iiiii"] = wasmExports["Pe"])(a0, a1, a2, a3, a4);

var dynCall_viiii = Module["dynCall_viiii"] = (a0, a1, a2, a3, a4) => (dynCall_viiii = Module["dynCall_viiii"] = wasmExports["Qe"])(a0, a1, a2, a3, a4);

var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_viiiiiii = Module["dynCall_viiiiiii"] = wasmExports["Re"])(a0, a1, a2, a3, a4, a5, a6, a7);

var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = wasmExports["Se"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

var dynCall_iiiiii = Module["dynCall_iiiiii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiii = Module["dynCall_iiiiii"] = wasmExports["Te"])(a0, a1, a2, a3, a4, a5);

var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = wasmExports["Ue"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);

function invoke_iii(index, a1, a2) {
  var sp = stackSave();
  try {
    return dynCall_iii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return dynCall_iiiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ii(index, a1) {
  var sp = stackSave();
  try {
    return dynCall_ii(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index, a1, a2) {
  var sp = stackSave();
  try {
    dynCall_vii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_iiii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    dynCall_viiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    dynCall_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    dynCall_viii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
  var sp = stackSave();
  try {
    return dynCall_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vi(index, a1) {
  var sp = stackSave();
  try {
    dynCall_vi(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    return dynCall_iiiiii(index, a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave();
  try {
    dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

// include: postamble.js
// === Auto-generated postamble setup entry stuff ===
Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["callMain"] = callMain;

Module["FS_createPreloadedFile"] = FS_createPreloadedFile;

Module["FS_unlink"] = FS_unlink;

Module["FS_createPath"] = FS_createPath;

Module["FS_createDevice"] = FS_createDevice;

Module["FS"] = FS;

Module["FS_createDataFile"] = FS_createDataFile;

Module["FS_createLazyFile"] = FS_createLazyFile;

var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};

// try this again later, after new deps are fulfilled
function callMain(args = []) {
  var entryFunction = _main;
  args.unshift(thisProgram);
  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  args.forEach(arg => {
    HEAPU32[((argv_ptr) >> 2)] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  });
  HEAPU32[((argv_ptr) >> 2)] = 0;
  try {
    var ret = entryFunction(argc, argv);
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  } catch (e) {
    return handleException(e);
  }
}

function run(args = arguments_) {
  if (runDependencies > 0) {
    return;
  }
  preRun();
  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
    Module["onRuntimeInitialized"]?.();
    if (shouldRunNow) callMain(args);
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(() => {
      setTimeout(() => Module["setStatus"](""), 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}

if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = false;

if (Module["noInitialRun"]) shouldRunNow = false;

run();

// end include: postamble.js
// include: /Users/ryan/CleanCode/Sandbox/RP_Dumps/RyansHardestGame_Web/runtime/browser-support.js
// Emscripten 3.1.74 FULL_ES2 client indices otherwise rewrite one GPU buffer
// per size on every draw. A ring avoids measured ANGLE synchronization stalls.
// Match the existing vertex pool's two sets of 64 buffers; allocate lazily.
(() => {
  const buffersPerSize = 128;
  GL.getTempIndexBuffer = sizeBytes => {
    const context = GL.currentContext;
    const exponent = GL.log2ceilLookup(sizeBytes);
    const rings = context.tempIndexBufferRings || (context.tempIndexBufferRings = []);
    const ring = rings[exponent] || (rings[exponent] = {
      next: 0,
      buffers: []
    });
    const slot = ring.next;
    ring.next = (slot + 1) % buffersPerSize;
    if (!ring.buffers[slot]) {
      const previous = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
      const buffer = GLctx.createBuffer();
      if (!buffer) throw new Error("Unable to allocate temporary WebGL index buffer.");
      GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, buffer);
      GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 2 ** exponent, GLctx.DYNAMIC_DRAW);
      GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, previous);
      ring.buffers[slot] = buffer;
    }
    return ring.buffers[slot];
  };
})();
