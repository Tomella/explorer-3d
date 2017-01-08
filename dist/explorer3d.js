(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Explorer3d = global.Explorer3d || {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}







function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
}

function atom(atm) {
    var parts = atm.split(/\s+/g);
    var length = parts.length;
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = parseInt(item) - 1;
                break;
            case 2:
                response.vertexId = parseFloat(item) - 1;
                break;
            case 3:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    return response;
}

function border(border) {
    var parts = border.split(/\s+/g);
    return {
        id: +parts[1] - 1,
        vertices: [
            +parts[2] - 1,
            +parts[3] - 1
        ]
    };
}

function bstone(bstone) {
    var parts = bstone.split(/\s+/g);
    return parseInt(parts[1]) - 1;
}

// We are zero based, GoCad is 1 based
// We are zero based, GoCad is 1 based
function face(face) {
    var parts = face.split(/\s+/g);
    var length = parts.length;
    var response = {
        get abc() {
            return [this.a, this.b, this.c];
        }
    };
    if (length === 4) {
        response.a = parseInt(parts[1]) - 1;
        response.b = parseFloat(parts[2]) - 1;
        response.c = parseFloat(parts[3]) - 1;
    }
    return response;
}

function vertex(vrtx, projectionFn, zDirection) {
    var parts = vrtx.split(/\s+/g);
    var length = parts.length;
    var zSign = zDirection ? zDirection : 1;
    var coord = [];
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        },
        get all() {
            var data = [this.x, this.y, this.z];
            if (this.properties) {
                this.properties.forEach(function (item) {
                    data.push(item);
                });
            }
            return data;
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = parseInt(item) - 1;
                break;
            case 2:
                coord[0] = parseFloat(item);
                // response.x = parseFloat(item);
                break;
            case 3:
                coord[1] = parseFloat(item);
                // response.y = parseFloat(item);
                break;
            case 4:
                response.z = parseFloat(item) * zSign;
                break;
            case 5:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    if (projectionFn) {
        coord = projectionFn(coord);
    }
    response.x = coord[0];
    response.y = coord[1];
    return response;
}

var Type = (function () {
    function Type() {
        this.type = "Type";
        this.isValid = false;
    }
    return Type;
}());

var TSurf = (function (_super) {
    __extends(TSurf, _super);
    function TSurf() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = "TSurf";
        _this.vertices = [];
        _this.faces = [];
        _this.bstones = [];
        _this.borders = [];
        return _this;
    }
    return TSurf;
}(Type));

var CoordinateSystem = (function () {
    function CoordinateSystem() {
        this.isValid = true;
        this.typeMap = {
            AXIS_NAME: split,
            AXIS_UNIT: split
        };
    }
    return CoordinateSystem;
}());
function split(val) {
    return val.split(/\s+/g).map(function (str) {
        return str.replace(/\"/g, "");
    });
}

var CoordinateSystemBufferedReader = (function () {
    function CoordinateSystemBufferedReader(reader) {
        this.reader = reader;
    }
    CoordinateSystemBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coordinateSystem, line, index, name, rest, mapper;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        coordinateSystem = new CoordinateSystem();
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 1:
                        line = (_a.sent()).trim();
                        if (!(line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM"))
                            return [3 /*break*/, 2];
                        this.reader.previous();
                        coordinateSystem.isValid = false || true;
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.reader.nextDataLine()];
                    case 3:
                        line = (_a.sent()).trim();
                        _a.label = 4;
                    case 4:
                        if (!(line && line !== "END_ORIGINAL_COORDINATE_SYSTEM"))
                            return [3 /*break*/, 6];
                        index = line.indexOf(" ");
                        if (index > 0) {
                            name = line.substring(0, index);
                            rest = line.substring(index).trim();
                            mapper = coordinateSystem.typeMap[name] ? coordinateSystem.typeMap[name] : function (val) { return val; };
                            coordinateSystem[name] = mapper(rest);
                        }
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 5:
                        line = (_a.sent()).trim();
                        return [3 /*break*/, 4];
                    case 6:
                        coordinateSystem.typeMap = null;
                        return [2 /*return*/, coordinateSystem];
                }
            });
        });
    };
    return CoordinateSystemBufferedReader;
}());

function flowThru(val) {
    return val;
}

function toBool(val) {
    return "true" === val;
}

function toColor(val) {
    if (val) {
        var parts = val.trim().split(/\s+/g);
        if (parts.length === 1) {
            if (parts[0].indexOf("#") === 0) {
                return parseInt("0x" + parts[0].substring(1));
            }
        }
        return parseFloat(parts[0]) * 255 * 256 * 256 + parseFloat(parts[1]) * 255 * 256 + parseFloat(parts[2]) * 255;
    }
    return null;
}

var Header = (function () {
    function Header() {
        this.values = {};
        this.typeMap = {
            ivolmap: toBool,
            imap: toBool,
            parts: toBool,
            mesh: toBool,
            cn: toBool,
            border: toBool,
            "*solid*color": toColor
        };
    }
    return Header;
}());

var HeaderBufferedReader = (function () {
    function HeaderBufferedReader(reader) {
        this.reader = reader;
    }
    HeaderBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var header, line, parts, mapper;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        header = new Header();
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 1:
                        line = (_a.sent()).trim();
                        _a.label = 2;
                    case 2:
                        if (!line)
                            return [3 /*break*/, 4];
                        if (line.indexOf("}") === 0) {
                            return [3 /*break*/, 4];
                        }
                        parts = line.split(":");
                        if (parts.length === 2) {
                            mapper = header.typeMap[parts[0]];
                            mapper = mapper ? mapper : flowThru;
                            header.values[parts[0]] = mapper(parts[1]);
                        }
                        else {
                            console.warn("That doesn't look like a pair: " + line);
                        }
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 3:
                        line = (_a.sent()).trim();
                        return [3 /*break*/, 2];
                    case 4:
                        header.name = header.values["name"];
                        header.solidColor = header.values["*solid*color"];
                        header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
                        header.typeMap = null;
                        return [2 /*return*/, header];
                }
            });
        });
    };
    return HeaderBufferedReader;
}());

var TypeBufferedReader = (function () {
    /**
     * We come in here on the next line
     */
    function TypeBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
    }
    TypeBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Type()];
            });
        });
    };
    return TypeBufferedReader;
}());

var TSurfBufferedReader = (function (_super) {
    __extends(TSurfBufferedReader, _super);
    /**
     * We come in here on the next line
     */
    function TSurfBufferedReader(reader, projectionFn) {
        return _super.call(this, reader, projectionFn) || this;
    }
    TSurfBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tsurf, line, _a, cs, zSign, v, a, b;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tsurf = new TSurf();
                        return [4 /*yield*/, this.reader.expects("HEADER")];
                    case 1:
                        line = _b.sent();
                        if (!line || line.indexOf("{") === -1) {
                            return [2 /*return*/, tsurf];
                        }
                        _a = tsurf;
                        return [4 /*yield*/, new HeaderBufferedReader(this.reader).read()];
                    case 2:
                        _a.header = _b.sent();
                        return [4 /*yield*/, new CoordinateSystemBufferedReader(this.reader).read()];
                    case 3:
                        cs = _b.sent();
                        zSign = 1;
                        if (cs.isValid) {
                            tsurf.coordinateSystem = cs;
                            zSign = tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
                        }
                        return [4 /*yield*/, this.reader.expects("TFACE")];
                    case 4:
                        line = _b.sent();
                        _b.label = 5;
                    case 5: return [4 /*yield*/, this.reader.nextDataLine()];
                    case 6:
                        if (!((line = (_b.sent()).trim()) !== "END"))
                            return [3 /*break*/, 7];
                        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                            v = vertex(line, this.projectionFn, zSign);
                            tsurf.vertices[v.index] = v.all;
                        }
                        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                            a = atom(line);
                            tsurf.vertices[a.index] = tsurf.vertices[a.vertexId];
                        }
                        else if (line.indexOf("TRGL") === 0) {
                            tsurf.faces.push(face(line).abc);
                        }
                        else if (line.indexOf("BSTONE") === 0) {
                            tsurf.bstones.push(bstone(line));
                        }
                        else if (line.indexOf("BORDER") === 0) {
                            b = border(line);
                            tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]];
                        }
                        return [3 /*break*/, 5];
                    case 7: return [2 /*return*/, tsurf];
                }
            });
        });
    };
    return TSurfBufferedReader;
}(TypeBufferedReader));

function segment(seg) {
    var parts = seg.split(/\s+/g);
    return [
        parseInt(parts[1]) - 1,
        parseInt(parts[2]) - 1
    ];
}

var PLineHeader = (function (_super) {
    __extends(PLineHeader, _super);
    function PLineHeader() {
        return _super.apply(this, arguments) || this;
    }
    return PLineHeader;
}(Header));

var PLineHeaderBufferedReader = (function (_super) {
    __extends(PLineHeaderBufferedReader, _super);
    function PLineHeaderBufferedReader(reader) {
        return _super.call(this, reader) || this;
    }
    PLineHeaderBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var header, plineHeader, color;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.read.call(this)];
                    case 1:
                        header = _a.sent();
                        plineHeader = Object.assign(new PLineHeader(), header);
                        plineHeader.paintedVariable = plineHeader.values["*painted*variable"];
                        color = plineHeader.values["*line*color"];
                        plineHeader.color = color ? toColor(color) : 0x0000ff;
                        return [2 /*return*/, plineHeader];
                }
            });
        });
    };
    return PLineHeaderBufferedReader;
}(HeaderBufferedReader));

var PLine = (function (_super) {
    __extends(PLine, _super);
    function PLine() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = "PLine";
        _this.vertices = [];
        _this.lines = [];
        return _this;
    }
    return PLine;
}(Type));

var PLineBufferedReader = (function (_super) {
    __extends(PLineBufferedReader, _super);
    /**
     * We come in here on the next line
     */
    function PLineBufferedReader(reader, projectionFn) {
        return _super.call(this, reader, projectionFn) || this;
    }
    PLineBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pline, line, header, cs, zSign, startIndex, lastIndex, hasSeg, lineSegments, completed, v, a, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pline = new PLine();
                        return [4 /*yield*/, this.reader.expects("HEADER")];
                    case 1:
                        line = _a.sent();
                        if (!line || line.indexOf("{") === -1) {
                            return [2 /*return*/, pline];
                        }
                        return [4 /*yield*/, new PLineHeaderBufferedReader(this.reader).read()];
                    case 2:
                        header = _a.sent();
                        pline.header = header;
                        return [4 /*yield*/, new CoordinateSystemBufferedReader(this.reader).read()];
                    case 3:
                        cs = _a.sent();
                        zSign = 1;
                        if (cs.isValid) {
                            pline.coordinateSystem = cs;
                            zSign = pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
                        }
                        return [4 /*yield*/, this.reader.expects("ILINE")];
                    case 4:
                        // let props = new Properties(reader);
                        // if(props.isValid) {
                        //   this.properties = props;
                        // }
                        line = _a.sent();
                        startIndex = 1;
                        lastIndex = 1;
                        hasSeg = false;
                        lineSegments = [];
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 5:
                        line = _a.sent();
                        completed = (line ? line.trim() : "}") === "}";
                        _a.label = 6;
                    case 6:
                        if (!!completed)
                            return [3 /*break*/, 9];
                        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                            v = vertex(line, this.projectionFn, zSign);
                            pline.vertices[v.index] = v.all;
                            lastIndex = v.index;
                        }
                        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                            a = atom(line);
                            pline.vertices[a.index] = pline.vertices[a.vertexId];
                        }
                        else if (line.indexOf("SEG") === 0) {
                            lineSegments.push(segment(line));
                            hasSeg = true;
                        }
                        else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
                            completed = line.indexOf("END") === 0;
                            if (!hasSeg && lastIndex > startIndex) {
                                // We have to step over every vertex pair from start index to lastIndex
                                for (i = startIndex; i < lastIndex; i++) {
                                    lineSegments.push([i, i + 1]);
                                }
                            }
                            pline.lines.push(lineSegments);
                            lineSegments = [];
                            startIndex = lastIndex + 1;
                            hasSeg = false;
                        }
                        completed = !this.reader.hasMore();
                        if (!!completed)
                            return [3 /*break*/, 8];
                        return [4 /*yield*/, this.reader.nextDataLine()];
                    case 7:
                        line = (_a.sent()).trim();
                        completed = line === "}";
                        _a.label = 8;
                    case 8: return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, pline];
                }
            });
        });
    };
    return PLineBufferedReader;
}(TypeBufferedReader));

var TSolid = (function (_super) {
    __extends(TSolid, _super);
    function TSolid() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = "TSolid";
        _this.vertices = [];
        _this.tetras = [];
        return _this;
    }
    return TSolid;
}(Type));

function tetra(tetra) {
    var parts = tetra.split(/\s+/g);
    return [
        parseInt(parts[1]),
        parseInt(parts[2]),
        parseInt(parts[3]),
        parseInt(parts[4])
    ];
}

var TSolidBufferedReader = (function () {
    function TSolidBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
    }
    TSolidBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tsolid, type, line, _a, cs, zSign, v, a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tsolid = new TSolid();
                        return [4 /*yield*/, new TypeBufferedReader(this.reader, this.projectionFn).read()];
                    case 1:
                        type = _b.sent();
                        return [4 /*yield*/, this.reader.expects("HEADER")];
                    case 2:
                        line = _b.sent();
                        if (!line)
                            return [3 /*break*/, 8];
                        _a = tsolid;
                        return [4 /*yield*/, new HeaderBufferedReader(this.reader).read()];
                    case 3:
                        _a.header = _b.sent();
                        return [4 /*yield*/, new CoordinateSystemBufferedReader(this.reader).read()];
                    case 4:
                        cs = _b.sent();
                        zSign = 1;
                        if (cs.isValid) {
                            tsolid.coordinateSystem = cs;
                            zSign = tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
                        }
                        return [4 /*yield*/, this.reader.expects("TVOLUME")];
                    case 5:
                        line = _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.reader.nextDataLine()];
                    case 7:
                        if (!((line = (_b.sent()).trim()) !== "END"))
                            return [3 /*break*/, 8];
                        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                            v = vertex(line, this.projectionFn, zSign);
                            tsolid.vertices[v.index] = v.all;
                        }
                        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                            a = atom(line);
                            tsolid.vertices[a.index] = tsolid.vertices[a.vertexId];
                        }
                        else if (line.indexOf("TETRA") === 0) {
                            tsolid.tetras.push(tetra(line));
                        }
                        return [3 /*break*/, 6];
                    case 8: return [2 /*return*/, tsolid];
                }
            });
        });
    };
    return TSolidBufferedReader;
}());

var VSet = (function (_super) {
    __extends(VSet, _super);
    function VSet() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = "VSet";
        _this.vertices = [];
        return _this;
    }
    return VSet;
}(Type));

var VSetHeader = (function (_super) {
    __extends(VSetHeader, _super);
    function VSetHeader() {
        return _super.apply(this, arguments) || this;
    }
    return VSetHeader;
}(Header));

var VSetHeaderBufferedReader = (function () {
    function VSetHeaderBufferedReader(reader) {
        this.reader = reader;
    }
    VSetHeaderBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var header, vsetheader;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new HeaderBufferedReader(this.reader).read()];
                    case 1:
                        header = _a.sent();
                        vsetheader = Object.assign(new VSetHeader(), header);
                        vsetheader.color = toColor(vsetheader.values["*atoms*color"]);
                        return [2 /*return*/, vsetheader];
                }
            });
        });
    };
    return VSetHeaderBufferedReader;
}());

var VSetBufferedReader = (function () {
    /**
     * We come in here on the next line
     */
    function VSetBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
    }
    VSetBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vset, line, _a, cs, zSign, v, a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        vset = new VSet();
                        return [4 /*yield*/, this.reader.expects("HEADER")];
                    case 1:
                        line = _b.sent();
                        if (!line || line.indexOf("{") === -1) {
                            return [2 /*return*/];
                        }
                        _a = vset;
                        return [4 /*yield*/, new VSetHeaderBufferedReader(this.reader).read()];
                    case 2:
                        _a.header = _b.sent();
                        return [4 /*yield*/, new CoordinateSystemBufferedReader(this.reader).read()];
                    case 3:
                        cs = _b.sent();
                        zSign = 1;
                        if (cs.isValid) {
                            vset.coordinateSystem = cs;
                            zSign = vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
                        }
                        _b.label = 4;
                    case 4: return [4 /*yield*/, this.reader.nextDataLine()];
                    case 5:
                        if (!((line = (_b.sent()).trim()) !== "END"))
                            return [3 /*break*/, 6];
                        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                            v = vertex(line, this.projectionFn, zSign);
                            vset.vertices[v.index] = v.all;
                        }
                        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                            a = atom(line);
                            vset.vertices[a.index] = vset.vertices[a.vertexId];
                        }
                        return [3 /*break*/, 4];
                    case 6: return [2 /*return*/, vset];
                }
            });
        });
    };
    return VSetBufferedReader;
}());

var Unknown = (function (_super) {
    __extends(Unknown, _super);
    function Unknown() {
        var _this = _super.apply(this, arguments) || this;
        _this.type = "Unknown";
        return _this;
    }
    return Unknown;
}(Type));

var UnknownBufferedReader = (function () {
    /**
     * We come in here on the next line
     */
    function UnknownBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
    }
    UnknownBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unknown, line;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unknown = new Unknown();
                        _a.label = 1;
                    case 1:
                        if (!this.reader.hasMore())
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.reader.next()];
                    case 2:
                        line = (_a.sent()).trim();
                        if (line === "END") {
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, unknown];
                }
            });
        });
    };
    return UnknownBufferedReader;
}());

var TypeFactory = (function () {
    function TypeFactory() {
        this.isValid = false;
    }
    return TypeFactory;
}());

var TypeFactoryBufferedReader = (function () {
    function TypeFactoryBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
    }
    TypeFactoryBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var typeFactory, line, parts, _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        typeFactory = new TypeFactory();
                        if (!this.reader.hasMore())
                            return [3 /*break*/, 11];
                        return [4 /*yield*/, this.reader.next()];
                    case 1:
                        line = (_f.sent()).trim();
                        parts = line.split(/\s+/g);
                        typeFactory.isValid = parts.length === 3
                            && parts[0] === "GOCAD"
                            && (parts[2] === "1.0" || parts[2] === "1");
                        if (!typeFactory.isValid)
                            return [3 /*break*/, 11];
                        typeFactory.version = parts[2];
                        if (!(parts[1] === "TSurf"))
                            return [3 /*break*/, 3];
                        _a = typeFactory;
                        return [4 /*yield*/, new TSurfBufferedReader(this.reader, this.projectionFn).read()];
                    case 2:
                        _a.type = _f.sent();
                        return [3 /*break*/, 11];
                    case 3:
                        if (!(parts[1] === "PLine"))
                            return [3 /*break*/, 5];
                        _b = typeFactory;
                        return [4 /*yield*/, new PLineBufferedReader(this.reader, this.projectionFn).read()];
                    case 4:
                        _b.type = _f.sent();
                        return [3 /*break*/, 11];
                    case 5:
                        if (!(parts[1] === "TSolid"))
                            return [3 /*break*/, 7];
                        _c = typeFactory;
                        return [4 /*yield*/, new TSolidBufferedReader(this.reader, this.projectionFn).read()];
                    case 6:
                        _c.type = _f.sent();
                        return [3 /*break*/, 11];
                    case 7:
                        if (!(parts[1] === "VSet"))
                            return [3 /*break*/, 9];
                        _d = typeFactory;
                        return [4 /*yield*/, new VSetBufferedReader(this.reader, this.projectionFn).read()];
                    case 8:
                        _d.type = _f.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        _e = typeFactory;
                        return [4 /*yield*/, new UnknownBufferedReader(this.reader, this.projectionFn).read()];
                    case 10:
                        _e.type = _f.sent();
                        _f.label = 11;
                    case 11: return [2 /*return*/, typeFactory];
                }
            });
        });
    };
    return TypeFactoryBufferedReader;
}());

var Document = (function () {
    function Document() {
        this.types = [];
    }
    return Document;
}());

var DocumentBufferedReader = (function () {
    function DocumentBufferedReader(reader, projectionFn) {
        this.reader = reader;
        this.projectionFn = projectionFn;
        this.document = new Document();
    }
    DocumentBufferedReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var typefactoryreader, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.document.types = [];
                        if (!this.reader.hasMore())
                            return [3 /*break*/, 2];
                        typefactoryreader = new TypeFactoryBufferedReader(this.reader, this.projectionFn);
                        return [4 /*yield*/, typefactoryreader.read()];
                    case 1:
                        obj = _a.sent();
                        if (obj.isValid) {
                            this.document.types.push(obj.type);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.document];
                }
            });
        });
    };
    return DocumentBufferedReader;
}());

var LineStreamer = (function () {
    function LineStreamer(file) {
        this.PAGE_SIZE = 16 * 1048576; // A mb at a time should be harmless
        this.file = file;
        this.length = file.size;
        this.pageNo = -1;
        this.index = 0;
        this.reader = new FileReader();
    }
    LineStreamer.prototype.readPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, start, blob;
            return __generator(this, function (_a) {
                this.pageNo++;
                this.index = 0;
                self = this;
                start = this.pageNo * this.PAGE_SIZE;
                if (start >= this.length) {
                    return [2 /*return*/, ""];
                }
                blob = this.file.slice(start, start + this.PAGE_SIZE);
                this.reader.readAsText(blob);
                return [2 /*return*/, new Promise(function (resolve) {
                        self.reader.onloadend = function (evt) {
                            if (evt.target["readyState"] === FileReader.prototype.DONE) {
                                // console.log("Reading page " + this.pageNo);
                                self.buffer = evt.target["result"];
                                // We've finished the block get ready for the next
                                resolve(true);
                            }
                        };
                    })];
            });
        });
    };
    LineStreamer.prototype.hasMore = function () {
        return this.index + this.PAGE_SIZE * this.pageNo < this.length - 1;
    };
    LineStreamer.prototype.nextNonEmpty = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lineBuffer, char, str;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lineBuffer = [];
                        _a.label = 1;
                    case 1:
                        if (!this.hasMore())
                            return [3 /*break*/, 7];
                        if (!(!this.buffer || this.index >= this.PAGE_SIZE))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.readPage()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        char = this.buffer[this.index++];
                        if (char === "\r") {
                            return [3 /*break*/, 1];
                        }
                        if (!(char === "\n"))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, this.next()];
                    case 4:
                        str = _a.sent();
                        if (lineBuffer.length) {
                            return [2 /*return*/, lineBuffer.join("")];
                        }
                        lineBuffer = [];
                        return [3 /*break*/, 6];
                    case 5:
                        lineBuffer.push(char);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, null];
                }
            });
        });
    };
    LineStreamer.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lineBuffer, char;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lineBuffer = [];
                        _a.label = 1;
                    case 1:
                        if (!this.hasMore())
                            return [3 /*break*/, 4];
                        if (!(!this.buffer || this.index >= this.PAGE_SIZE))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.readPage()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        char = this.buffer[this.index++];
                        if (char === "\r") {
                            return [3 /*break*/, 1];
                        }
                        if (char === "\n") {
                            return [3 /*break*/, 4];
                        }
                        lineBuffer.push(char);
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, lineBuffer.join("")];
                }
            });
        });
    };
    return LineStreamer;
}());

var LineBufferedReader = (function () {
    function LineBufferedReader(file) {
        this.streamer = new LineStreamer(file);
        this.current = "";
    }
    LineBufferedReader.prototype.hasMore = function () {
        return this.streamer.hasMore();
    };
    LineBufferedReader.prototype.previous = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.useLast = true;
                return [2 /*return*/];
            });
        });
    };
    LineBufferedReader.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.useLast) {
                            this.useLast = false;
                            return [2 /*return*/, this.current];
                        }
                        _a = this;
                        return [4 /*yield*/, this.streamer.next()];
                    case 1:
                        _a.current = _b.sent();
                        return [2 /*return*/, this.current];
                }
            });
        });
    };
    LineBufferedReader.prototype.expects = function (startsWith) {
        return __awaiter(this, void 0, void 0, function () {
            var read;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasMore())
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.next()];
                    case 1:
                        read = _a.sent();
                        if (!read.indexOf(startsWith)) {
                            return [2 /*return*/, read];
                        }
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    LineBufferedReader.prototype.nextNonEmpty = function () {
        return __awaiter(this, void 0, void 0, function () {
            var str;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasMore())
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.next()];
                    case 1:
                        str = _a.sent();
                        if (str) {
                            return [2 /*return*/, str];
                        }
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    LineBufferedReader.prototype.nextDataLine = function () {
        return __awaiter(this, void 0, void 0, function () {
            var line;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nextNonEmpty()];
                    case 1:
                        line = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!line)
                            return [3 /*break*/, 4];
                        if (line.indexOf("#")) {
                            return [2 /*return*/, line];
                        }
                        return [4 /*yield*/, this.nextNonEmpty()];
                    case 3:
                        line = _a.sent();
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, line];
                }
            });
        });
    };
    return LineBufferedReader;
}());

function fileBufferedReader(e, proj4) {
    return __awaiter(this, void 0, void 0, function () {
        var file, options, projectionFn, name;
        return __generator(this, function (_a) {
            proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
            file = e.data.file;
            options = e.data.options;
            projectionFn = passThru;
            if (options && options.from && options.to && options.from !== options.to) {
                projectionFn = function reproject(from, to) {
                    return function (coords) {
                        return proj4(from, to, [coords[0], coords[1]]);
                    };
                }(options.from, options.to);
            }
            name = file.name;
            return [2 /*return*/, new DocumentBufferedReader(new LineBufferedReader(file), projectionFn).read()];
        });
    });
}
function passThru(coords) {
    return coords;
}

var Pusher = (function () {
    function Pusher() {
        this.complete = false;
    }
    return Pusher;
}());

var StatePusher = (function (_super) {
    __extends(StatePusher, _super);
    function StatePusher() {
        var _this = _super.call(this) || this;
        _this.state = 0;
        return _this;
    }
    return StatePusher;
}(Pusher));

function isDataLine(line) {
    line = line.trim();
    return isNonEmpty(line) && line.indexOf("#") !== 0;
}
function isNonEmpty(line) {
    return line.trim().length !== 0;
}

var CoordinateSystemPusher = (function (_super) {
    __extends(CoordinateSystemPusher, _super);
    function CoordinateSystemPusher() {
        var _this = _super.call(this) || this;
        _this.coordinateSystem = new CoordinateSystem();
        _this.validHeader = false;
        return _this;
    }
    Object.defineProperty(CoordinateSystemPusher.prototype, "obj", {
        get: function () {
            return this.coordinateSystem;
        },
        enumerable: true,
        configurable: true
    });
    CoordinateSystemPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.hasBlock(line);
            case 1:
                return this.pushData(line);
        }
    };
    CoordinateSystemPusher.prototype.hasBlock = function (line) {
        line = line.trim();
        if (line.length) {
            if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
                this.complete = true;
                this.coordinateSystem.isValid = false;
                // Reject line
                return false;
            }
            else {
                this.state++;
            }
        }
        return true;
    };
    CoordinateSystemPusher.prototype.pushData = function (line) {
        if (isDataLine(line)) {
            if (line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
                var index = line.indexOf(" ");
                if (index > 0) {
                    var name = line.substring(0, index);
                    var rest = line.substring(index).trim();
                    var mapper = this.coordinateSystem.typeMap[name] ? this.coordinateSystem.typeMap[name] : function (val) { return val; };
                    this.coordinateSystem[name] = mapper(rest);
                }
            }
            else {
                this.coordinateSystem.typeMap = null;
                this.complete = true;
            }
        }
        return true;
    };
    return CoordinateSystemPusher;
}(StatePusher));

var HeaderPusher = (function (_super) {
    __extends(HeaderPusher, _super);
    function HeaderPusher() {
        var _this = _super.call(this) || this;
        _this.header = new Header();
        return _this;
    }
    Object.defineProperty(HeaderPusher.prototype, "obj", {
        get: function () {
            return this.header;
        },
        enumerable: true,
        configurable: true
    });
    HeaderPusher.prototype.push = function (line) {
        if (!isDataLine(line)) {
            return true;
        }
        line = line.trim();
        if (line.indexOf("}") === 0) {
            this.postLoad();
        }
        else {
            var parts = line.split(":");
            if (parts.length === 2) {
                var mapper = this.header.typeMap[parts[0]];
                mapper = mapper ? mapper : flowThru;
                this.header.values[parts[0]] = mapper(parts[1]);
            }
            else {
                console.warn("That doesn't look like a pair: " + line);
            }
        }
        return true;
    };
    HeaderPusher.prototype.postLoad = function () {
        this.complete = true;
        var header = this.header;
        header.name = header.values["name"];
        header.solidColor = header.values["*solid*color"];
        header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
        header.typeMap = null;
    };
    return HeaderPusher;
}(Pusher));

var TSurfPusher = (function (_super) {
    __extends(TSurfPusher, _super);
    /**
     * We come in here on the next line
     */
    function TSurfPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsurf = new TSurf();
        _this.zSign = 1;
        _this.readTface = false;
        return _this;
    }
    Object.defineProperty(TSurfPusher.prototype, "obj", {
        get: function () {
            return this.tsurf;
        },
        enumerable: true,
        configurable: true
    });
    TSurfPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.waitForHead(line);
            case 1:
                return this.loadHeader(line);
            case 2:
                return this.loadCs(line);
            case 3:
                return this.waitForTface(line);
            case 4:
                return this.processToEnd(line);
        }
    };
    TSurfPusher.prototype.waitForHead = function (line) {
        // Gobble up comments and blank lines
        if (line.startsWith("HEADER")) {
            if (line.indexOf("{") === -1) {
                this.complete = true;
            }
            else {
                this.headerPusher = new HeaderPusher();
            }
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadHeader = function (line) {
        this.headerPusher.push(line);
        if (this.headerPusher.complete) {
            this.tsurf.header = this.headerPusher.obj;
            this.csPusher = new CoordinateSystemPusher();
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadCs = function (line) {
        this.csPusher.push(line);
        if (this.csPusher.complete && this.csPusher.obj.isValid) {
            this.tsurf.coordinateSystem = this.csPusher.obj;
            this.zSign = this.tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.waitForTface = function (line) {
        if (!line.indexOf("TFACE")) {
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.processToEnd = function (line) {
        line = line.trim();
        if (line === "END") {
            this.complete = true;
            this.state = 99;
        }
        else {
            var tsurf = this.tsurf;
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                tsurf.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                tsurf.vertices[a.index] = tsurf.vertices[a.vertexId];
            }
            else if (line.indexOf("TRGL") === 0) {
                tsurf.faces.push(face(line).abc);
            }
            else if (line.indexOf("BSTONE") === 0) {
                tsurf.bstones.push(bstone(line));
            }
            else if (line.indexOf("BORDER") === 0) {
                var b = border(line);
                tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]];
            }
        }
        return true;
    };
    return TSurfPusher;
}(StatePusher));

var PLineHeaderPusher = (function (_super) {
    __extends(PLineHeaderPusher, _super);
    function PLineHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(PLineHeaderPusher.prototype, "obj", {
        get: function () {
            return this.plineHeader;
        },
        enumerable: true,
        configurable: true
    });
    PLineHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.plineHeader = Object.assign(new PLineHeader(), this.header);
            this.plineHeader.typeMap = null;
            this.plineHeader.paintedVariable = this.plineHeader.values["*painted*variable"];
            var color = this.plineHeader.values["*line*color"];
            this.plineHeader.color = color ? toColor(color) : 0x0000ff;
        }
        return accepted;
    };
    return PLineHeaderPusher;
}(HeaderPusher));

var PLinePusher = (function (_super) {
    __extends(PLinePusher, _super);
    /**
     * We come in here on the next line
     */
    function PLinePusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.pline = new PLine();
        return _this;
    }
    Object.defineProperty(PLinePusher.prototype, "obj", {
        get: function () {
            return this.pline;
        },
        enumerable: true,
        configurable: true
    });
    PLinePusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectIline(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    PLinePusher.prototype.expectHeader = function (line) {
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (!line || line.indexOf("{") === -1) {
            this.complete = true;
            return true;
        }
        this.child = new PLineHeaderPusher();
        this.state++;
        return true;
    };
    PLinePusher.prototype.pushHeader = function (line) {
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.pline.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return accepted;
    };
    PLinePusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            if (this.child.isValid) {
                this.pline.coordinateSystem = this.child.obj;
                this.zSign = this.pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            }
        }
        return response;
    };
    PLinePusher.prototype.expectIline = function (line) {
        if (line.startsWith("ILINE")) {
            this.state++;
            this.startIndex = 1;
            this.lastIndex = 1;
            this.hasSeg = false;
            this.lineSegments = [];
        }
        return true;
    };
    PLinePusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line) {
            return true;
        }
        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            var v = vertex(line, this.projectionFn, this.zSign);
            this.pline.vertices[v.index] = v.all;
            this.lastIndex = v.index;
        }
        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            var a = atom(line);
            this.pline.vertices[a.index] = this.pline.vertices[a.vertexId];
        }
        else if (line.indexOf("SEG") === 0) {
            this.lineSegments.push(segment(line));
            this.hasSeg = true;
        }
        else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
            this.complete = line.indexOf("END") === 0;
            if (!this.hasSeg && this.lastIndex > this.startIndex) {
                // We have to step over every vertex pair from start index to lastIndex
                for (var i = this.startIndex; i < this.lastIndex; i++) {
                    this.lineSegments.push([i, i + 1]);
                }
            }
            this.pline.lines.push(this.lineSegments);
            this.lineSegments = [];
            this.startIndex = this.lastIndex + 1;
            this.hasSeg = false;
        }
        return true;
    };
    return PLinePusher;
}(StatePusher));

var TSolidPusher = (function (_super) {
    __extends(TSolidPusher, _super);
    function TSolidPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsolid = new TSolid();
        return _this;
    }
    Object.defineProperty(TSolidPusher.prototype, "obj", {
        get: function () {
            return this.tsolid;
        },
        enumerable: true,
        configurable: true
    });
    TSolidPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectTvolume(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    TSolidPusher.prototype.expectHeader = function (line) {
        if (line.startsWith("HEADER")) {
            this.child = new HeaderPusher();
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushHeader = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return response;
    };
    TSolidPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.coordinateSystem = this.child.obj;
            this.zSign = this.tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    TSolidPusher.prototype.expectTvolume = function (line) {
        if (line.startsWith("TVOLUME")) {
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushData = function (line) {
        line = line.trim();
        if (line === "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.tsolid.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.tsolid.vertices[a.index] = this.tsolid.vertices[a.vertexId];
            }
            else if (line.indexOf("TETRA") === 0) {
                this.tsolid.tetras.push(tetra(line));
            }
        }
        else {
            this.complete = true;
        }
        return true;
    };
    return TSolidPusher;
}(StatePusher));

var VSetHeaderPusher = (function (_super) {
    __extends(VSetHeaderPusher, _super);
    function VSetHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(VSetHeaderPusher.prototype, "obj", {
        get: function () {
            return this.vsetHeader;
        },
        enumerable: true,
        configurable: true
    });
    VSetHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.vsetHeader = Object.assign(new VSetHeader(), this.header);
            this.vsetHeader.color = toColor(this.vsetHeader.values["*atoms*color"]);
        }
        return accepted;
    };
    return VSetHeaderPusher;
}(HeaderPusher));

var VSetPusher = (function (_super) {
    __extends(VSetPusher, _super);
    /**
     * We come in here on the next line
     */
    function VSetPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.vset = new VSet();
        return _this;
    }
    Object.defineProperty(VSetPusher.prototype, "obj", {
        get: function () {
            return this.vset;
        },
        enumerable: true,
        configurable: true
    });
    VSetPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.pushData(line);
        }
        return true;
    };
    VSetPusher.prototype.expectHeader = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (line.indexOf("{") === -1) {
            this.complete = true;
        }
        this.child = new VSetHeaderPusher();
        this.state++;
        return true;
    };
    VSetPusher.prototype.pushHeader = function (line) {
        if (line === void 0) { line = ""; }
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
            this.zSign = 1;
        }
        return accepted;
    };
    VSetPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.coordinateSystem = this.child.obj;
            this.zSign = this.vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    VSetPusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (line) {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.vset.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.vset.vertices[a.index] = this.vset.vertices[a.vertexId];
            }
            else if (line.startsWith("END") && !line.startsWith("END_")) {
                this.complete = true;
            }
        }
        return true;
    };
    return VSetPusher;
}(StatePusher));

var UnknownPusher = (function (_super) {
    __extends(UnknownPusher, _super);
    /**
     * We come in here on the next line
     */
    function UnknownPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.unknown = new Unknown();
        return _this;
    }
    Object.defineProperty(UnknownPusher.prototype, "obj", {
        get: function () {
            return this.unknown;
        },
        enumerable: true,
        configurable: true
    });
    UnknownPusher.prototype.push = function (line) {
        if (line.trim() === "END") {
            this.complete = true;
        }
        return true;
    };
    return UnknownPusher;
}(Pusher));

var TypeFactoryPusher = (function (_super) {
    __extends(TypeFactoryPusher, _super);
    function TypeFactoryPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.typeFactory = new TypeFactory();
        return _this;
    }
    Object.defineProperty(TypeFactoryPusher.prototype, "obj", {
        get: function () {
            return this.type.obj;
        },
        enumerable: true,
        configurable: true
    });
    TypeFactoryPusher.prototype.push = function (line) {
        var accepted = true;
        if (this.type) {
            accepted = this.type.push(line);
            this.complete = this.type.complete;
        }
        else {
            accepted = this.create(line);
        }
        return accepted;
    };
    TypeFactoryPusher.prototype.create = function (line) {
        line = line.trim();
        var parts = line.split(/\s+/g);
        this.typeFactory.isValid = parts.length === 3
            && parts[0] === "GOCAD"
            && (parts[2] === "1.0" || parts[2] === "1");
        if (this.typeFactory.isValid) {
            this.typeFactory.version = parts[2];
            if (parts[1] === "TSurf") {
                this.type = new TSurfPusher(this.projectionFn);
            }
            else if (parts[1] === "PLine") {
                this.type = new PLinePusher(this.projectionFn);
            }
            else if (parts[1] === "TSolid") {
                this.type = new TSolidPusher(this.projectionFn);
            }
            else if (parts[1] === "VSet") {
                this.type = new VSetPusher(this.projectionFn);
            }
            else {
                this.type = new UnknownPusher(this.projectionFn);
            }
        }
        return this.typeFactory.isValid;
    };
    return TypeFactoryPusher;
}(Pusher));

var DocumentPusher = (function (_super) {
    __extends(DocumentPusher, _super);
    function DocumentPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.document = new Document();
        _this.typefactorypusher = new TypeFactoryPusher(_this.projectionFn);
        return _this;
    }
    Object.defineProperty(DocumentPusher.prototype, "obj", {
        get: function () {
            return this.document;
        },
        enumerable: true,
        configurable: true
    });
    DocumentPusher.prototype.push = function (line) {
        var consumed = this.typefactorypusher.push(line);
        // Well behaved children will have changed state when not consuming so *shouldn't* get in an infinite loop.
        if (!consumed) {
            console.log("NOT PUSHED: " + line);
            this.push(line);
            // Just in case they don't behave we'll swallow it.
            return true;
        }
        if (this.typefactorypusher.complete) {
            this.complete = true;
            this.document.types.push(this.typefactorypusher.obj);
            this.typefactorypusher = new TypeFactoryPusher(this.projectionFn);
        }
        return true;
    };
    return DocumentPusher;
}(Pusher));

var LinesPusher = (function () {
    function LinesPusher(file, options, callback) {
        this.file = file;
        this.callback = callback;
        this.blockSize = 1024 * 1024; // A bit at a time should be harmless
        this.file = file;
        this.length = file.size;
        this.pageNo = -1;
        this.index = 0;
        this.blockSize = options.blockSize ? options.blockSize : this.blockSize;
        this.reader = new FileReader();
        this.lineBuffer = [];
        this.start();
    }
    LinesPusher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, lines, lineResult, _a, group;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.read()];
                    case 1:
                        result = _b.sent();
                        lines = [];
                        _b.label = 2;
                    case 2:
                        if (!result)
                            return [3 /*break*/, 8];
                        lineResult = this.next();
                        _a = lineResult.state;
                        switch (_a) {
                            case "more": return [3 /*break*/, 3];
                            case "line": return [3 /*break*/, 5];
                            case "complete": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        group = lines;
                        lines = [];
                        this.callback(group);
                        return [4 /*yield*/, this.read()];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        lines.push(lineResult.line);
                        return [3 /*break*/, 7];
                    case 6:
                        lines.push(lineResult.line);
                        if (lines.length) {
                            this.callback(lines);
                        }
                        result = false;
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 2];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LinesPusher.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var self, start, blob;
            return __generator(this, function (_a) {
                this.pageNo++;
                this.index = 0;
                self = this;
                start = this.pageNo * this.blockSize;
                blob = this.file.slice(start, start + this.blockSize);
                this.reader.readAsText(blob);
                return [2 /*return*/, new Promise(function (resolve) {
                        if (start >= _this.length) {
                            resolve(false);
                            return;
                        }
                        self.reader.onloadend = function (evt) {
                            if (evt.target["readyState"] === FileReader.prototype.DONE) {
                                // console.log("Reading page " + self.pageNo);
                                self.buffer = evt.target["result"];
                                resolve(_this.hasMore());
                            }
                        };
                    })];
            });
        });
    };
    LinesPusher.prototype.hasMore = function () {
        return this.index + this.blockSize * this.pageNo < this.length - 1;
    };
    LinesPusher.prototype.next = function () {
        while (this.hasMore()) {
            if (!this.buffer || this.index >= this.blockSize) {
                return { state: "more" };
            }
            var char = this.buffer[this.index++];
            if (char === "\r") {
                continue;
            }
            if (char === "\n") {
                break;
            }
            this.lineBuffer.push(char);
        }
        var line = this.lineBuffer.join("");
        this.lineBuffer = [];
        return {
            state: this.hasMore() ? "line" : "complete",
            line: line
        };
    };
    return LinesPusher;
}());

var LinesToLinePusher = (function () {
    function LinesToLinePusher(callback) {
        this.callback = callback;
    }
    LinesToLinePusher.prototype.receiver = function (lines) {
        var self = this;
        lines.forEach(function (line) {
            self.callback(line);
        });
    };
    return LinesToLinePusher;
}());

var FilePusher = (function () {
    function FilePusher(file, options, proj4) {
        this.file = file;
        this.options = options;
        this.proj4 = proj4;
        this.proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        if (options && options.from && options.to && options.from !== options.to) {
            this.projectionFn = function reproject(from, to) {
                return function (coords) {
                    return proj4(from, to, [coords[0], coords[1]]);
                };
            }(options.from, options.to);
        }
        else {
            this.projectionFn = passThru$1;
        }
    }
    FilePusher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var name;
            return __generator(this, function (_a) {
                name = this.file.name;
                return [2 /*return*/, new Promise(function (resolve) {
                        var pusher = new DocumentPusher(_this.projectionFn);
                        var linesToLinePusher = new LinesToLinePusher(function (line) {
                            pusher.push(line);
                            if (pusher.complete) {
                                resolve(pusher.obj);
                            }
                        });
                        new LinesPusher(_this.file, _this.options, function (lines) {
                            linesToLinePusher.receiver(lines);
                        });
                    })];
            });
        });
    };
    return FilePusher;
}());
function passThru$1(coords) {
    return coords;
}

// Rollup the libs as used by the web workers.
// These are basically your domain objects, utilities, readers and transformers

function loadBorders(tsurf) {
    var segments = new THREE.Geometry();
    tsurf.borders.forEach(function (seg) {
        var vertex = tsurf.vertices[seg[0]];
        segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
        vertex = tsurf.vertices[seg[1]];
        segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
    });
    if (segments.vertices.length) {
        segments.computeBoundingBox();
        return new THREE.LineSegments(segments, new THREE.LineBasicMaterial({
            linewidth: 10,
            color: 0xff00ff
        }));
    }
    return null;
}

function loadBstones(tsurf) {
    var geometry = new THREE.Geometry();
    tsurf.bstones.forEach(function (bstone) {
        var xyz = tsurf.vertices[bstone];
        if (xyz) {
            var vertex = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
            geometry.vertices.push(vertex);
        }
    });
    if (geometry.vertices.length) {
        geometry.computeBoundingBox();
        var material = new THREE.PointsMaterial({ size: 4096 * 4 });
        return new THREE.Points(geometry, material);
    }
    return null;
}

function range(array, cb) {
    var i = -1, length = array.length, min, value, max;
    if (cb == null) {
        while (++i < length) {
            if ((value = array[i]) != null && value >= value) {
                min = max = value;
                break;
            }
        }
        while (++i < length) {
            if ((value = array[i]) != null) {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }
    }
    else {
        while (++i < length) {
            if ((value = cb(array[i], i, array)) != null && value >= value) {
                min = max = value;
                break;
            }
        }
        while (++i < length) {
            if ((value = cb(array[i], i, array)) != null) {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }
    }
    return [min, max];
}

function loadPLine(pline) {
    var minMax = range(pline.vertices, function (a) {
        return a ? +a[3] : null;
    });
    var solidColor = pline.header.color;
    var material = new THREE.LineBasicMaterial({
        linewidth: 10,
        color: solidColor ? solidColor : 0xffffff,
        vertexColors: THREE.VertexColors
    });
    var geometry = new THREE.Geometry();
    var lut = new THREE.Lut("rainbow", Math.floor(minMax[1] - minMax[0]));
    lut.setMax(Math.floor(minMax[1]));
    lut.setMin(Math.floor(minMax[0]));
    pline.lines.forEach(function (line) {
        line.forEach(function (seg, index) {
            var vertex = pline.vertices[seg[0]];
            var color = vertex.length > 3 ? lut.getColor(parseInt(vertex[3])) : new THREE.Color(solidColor);
            geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
            geometry.colors.push(color);
            vertex = pline.vertices[seg[1]];
            color = vertex.length > 3 ? lut.getColor(parseInt(vertex[3])) : new THREE.Color(solidColor);
            geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
            geometry.colors.push(color);
        });
    });
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return new THREE.LineSegments(geometry, material);
}

function loadTSurf(tsurf) {
    var geometry = new THREE.Geometry();
    var color = tsurf.header.solidColor;
    var mat = new THREE.MeshLambertMaterial({
        color: color ? color : 0xff1111,
        side: THREE.DoubleSide
    });
    geometry.vertices = tsurf.vertices.map(function (vertex) { return new THREE.Vector3(vertex[0], vertex[1], vertex[2]); });
    geometry.faces = tsurf.faces.map(function (face) { return new THREE.Face3(face[0], face[1], face[2]); });
    geometry.computeBoundingBox();
    geometry.computeFaceNormals();
    var mesh = new THREE.Mesh(geometry, mat);
    return mesh;
}

function loadVSet(vset) {
    var geometry = new THREE.Geometry();
    var color = vset.header.color;
    vset.vertices.forEach(function (vertex) {
        geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
    });
    var material = new THREE.PointsMaterial({ size: 16, color: color });
    var particles = new THREE.Points(geometry, material);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    return particles;
}

var Shaders = (function () {
    function Shaders() {
    }
    Shaders.add = function (key, holder) {
        holder = holder ? holder : {};
        holder.vertexShader = this.VertexShader[key];
        holder.fragmentShader = this.FragmentShader[key];
        return holder;
    };
    return Shaders;
}());
Shaders.VertexShader = {
    COLOR_RAMP: "attribute vec3 customColor;\n" +
        "varying vec3 vColor;\n" +
        "void main() {\n" +
        "	vColor = customColor;\n" +
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
        "}"
};
Shaders.FragmentShader = {
    COLOR_RAMP: "uniform vec3 color;\n\n" +
        "varying vec3 vColor;\n" +
        "void main() {\n" +
        "	gl_FragColor = vec4( vColor * color, 1 );\n" +
        "}"
};

function deepMerge(target, source) {
    var array = Array.isArray(source);
    var dst = array && [] || {};
    if (Array.isArray(source)) {
        var dest_1 = dst;
        target = target || [];
        dest_1 = dest_1.concat(target);
        source.forEach(function (item, i) {
            if (typeof dest_1[i] === "undefined") {
                dest_1[i] = item;
            }
            else if (typeof item === "object") {
                dest_1[i] = deepMerge(target[i], item);
            }
            else {
                if (target.indexOf(item) === -1) {
                    dest_1.push(item);
                }
            }
        });
    }
    else {
        if (target && typeof target === "object") {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            });
        }
        Object.keys(source).forEach(function (key) {
            if (typeof source[key] !== "object" || !source[key]) {
                dst[key] = source[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = source[key];
                }
                else {
                    dst[key] = deepMerge(target[key], source[key]);
                }
            }
        });
    }
    return dst;
}

/// <reference path="../external.d.ts" />
var World = (function () {
    function World(container, options) {
        if (options === void 0) { options = {}; }
        this.options = {
            camera: {
                fov: 45,
                near: 0.1,
                far: 500000,
                position: {
                    x: -30,
                    y: 40,
                    z: 30
                },
                up: {
                    x: 0,
                    y: 1,
                    z: 0
                }
            },
            lights: {
                ambient: {
                    color: 0x555555
                },
                directional: {
                    color: 0xa0a0a0,
                    center: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    position: {
                        dx: 50,
                        dy: 10,
                        dz: -300
                    }
                }
            },
            axisHelper: {
                on: true,
                size: 20
            }
        };
        this.lights = [];
        this.options = deepMerge(this.options, options);
        var rect = document.body.getBoundingClientRect();
        if (typeof container === "string") {
            this.container = document.getElementById("" + container);
        }
        else {
            this.container = container;
        }
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ clearColor: 0xff0000 });
        this.renderer.setSize(rect.width, rect.height);
        var cam = this.options.camera;
        this.camera = new THREE.PerspectiveCamera(cam.fov, rect.width / rect.height, cam.near, cam.far);
        this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);
        var pos = cam.position;
        this.camera.position.x = pos.x;
        this.camera.position.y = pos.y;
        this.camera.position.z = pos.z;
        if (options.camera.lookAt) {
            var la = options.camera.lookAt;
            this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        }
        else {
            this.lookAt = this.scene.position;
        }
        this.camera.lookAt(this.lookAt);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);
        this.axisHelper(this.options.axisHelper.on);
        this.addLights();
        // this.addControls();
        this.addFlyControls();
        this.resizer = THREEExt.WindowResize(this.renderer, this.camera, this.container);
        var context = this;
        this.continueAnimation = true;
        this.resizer.trigger();
        animate();
        function animate() {
            if (!context.continueAnimation)
                return;
            window.requestAnimationFrame(animate);
            // context.renderer.clear();
            context.camera.lookAt(context.lookAt);
            context.renderer.render(context.scene, context.camera);
            context.controls.update(0.02);
        }
    }
    World.prototype.destroy = function () {
        this.lights = [];
        this.axis = null;
        this.renderer.dispose();
        this.renderer = null;
        this.dataContainer.children.forEach(function (child) {
            child.geometry.dispose();
            child.material.dispose();
        });
        this.scene.remove(this.dataContainer);
        this.scene = null;
        this.camera = null;
        if (this.controls.dispose) {
            this.controls.dispose();
        }
        this.controls = null;
        this.resizer.destroy();
        this.resizer = null;
        while (this.container.lastChild)
            this.container.removeChild(this.container.lastChild);
        this.continueAnimation = false;
    };
    World.prototype.resize = function (options) {
        this.options = deepMerge(this.options, options ? options : {});
        // Clear and set axishelper
        var state = this.options.axisHelper.on;
        this.axisHelper(false);
        this.axisHelper(state);
        this.updateLights();
        var la = options.camera.lookAt;
        this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        this.camera.far = options.camera.far;
        this.camera.near = options.camera.near;
        this.camera.lookAt(this.lookAt);
    };
    World.prototype.update = function (options) {
        this.options = deepMerge(this.options, options ? options : {});
        var cam = this.options.camera;
        this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);
        var pos = cam.position;
        this.camera.position.x = pos.x;
        this.camera.position.y = pos.y;
        this.camera.position.z = pos.z;
        if (options.camera.lookAt) {
            var la = options.camera.lookAt;
            this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        }
        else {
            this.lookAt = this.scene.position;
        }
        this.camera.lookAt(this.lookAt);
        this.controls.movementSpeed = this.options.radius;
        // Clear and set axishelper
        var state = this.options.axisHelper.on;
        this.axisHelper(false);
        this.axisHelper(state);
        this.updateLights();
    };
    World.prototype.addLabels = function (scale) {
        if (this.labels) {
            this.scene.remove(this.labels);
        }
        var container = this.labels = new THREE.Object3D();
        var pos = this.options.axisHelper.position;
        var offset = this.options.axisHelper.size;
        var labels = this.options.axisHelper.labels;
        var options = {
            fontsize: 64,
            backgroundColor: { r: 255, g: 200, b: 200, a: 0.7 }
        };
        var sprite = makeTextSprite(labels.x, options);
        sprite.position.set(pos.x + offset, pos.y, pos.z);
        container.add(sprite);
        options.backgroundColor = { r: 200, g: 255, b: 200, a: 0.7 };
        sprite = makeTextSprite(labels.y, options);
        sprite.position.set(pos.x, pos.y + offset, pos.z);
        container.add(sprite);
        options.backgroundColor = { r: 200, g: 200, b: 255, a: 0.7 };
        sprite = makeTextSprite(labels.z, options);
        sprite.position.set(pos.x, pos.y, pos.z + offset);
        container.add(sprite);
        this.scene.add(container);
        return container;
        function makeTextSprite(message, parameters) {
            var parms = deepMerge({
                fontface: "Arial",
                fontsize: 18,
                borderThickness: 4,
                borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
                backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 }
            }, parameters ? parameters : {});
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            context.font = parms.fontsize + "px " + parms.fontface;
            // get size data (height depends only on font size)
            var metrics = context.measureText(message);
            var textWidth = metrics.width;
            // console.log(textWidth);
            // background color
            context.fillStyle = "rgba(" + parms.backgroundColor.r + "," + parms.backgroundColor.g + ","
                + parms.backgroundColor.b + "," + parms.backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + parms.borderColor.r + "," + parms.borderColor.g + ","
                + parms.borderColor.b + "," + parms.borderColor.a + ")";
            context.lineWidth = parms.borderThickness;
            roundRect(context, parms.borderThickness / 2, parms.borderThickness / 2, textWidth + parms.borderThickness, parms.fontsize * 1.4 + parms.borderThickness, 6);
            // 1.4 is extra height factor for text below baseline: g,j,p,q.
            // text color
            context.fillStyle = "rgba(0, 0, 0, 1.0)";
            context.fillText(message, parms.borderThickness, parms.fontsize + parms.borderThickness);
            // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({
                map: texture
            });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(scale * 35, scale * 15, 1); // scale * 1);
            return sprite;
        }
        function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    };
    World.prototype.axisHelper = function (on) {
        if (this.axis) {
            if (!on) {
                this.scene.remove(this.axis);
                this.axis = null;
            }
        }
        else {
            if (on) {
                var options = this.options.axisHelper;
                this.axis = new THREE.AxisHelper(options.size);
                if (options.position) {
                    this.axis.position.set(options.position.x, options.position.y, options.position.z);
                    if (options.labels) {
                        var scale = options.size / 100;
                        this.addLabels(scale);
                    }
                }
                this.scene.add(this.axis);
            }
        }
        this.options.axisHelper.on = on;
    };
    World.prototype.addControls = function () {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.userPanSpeed = 20000;
    };
    
    World.prototype.addFirstPersonControls = function () {
        this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
        // this.controls.movementSpeed = this.options.radius;
        // this.controls.domElement = this.container;
        // this.controls.rollSpeed = Math.PI * 24 * this.options.radius;
        // this.controls.autoForward = false;
        // this.controls.dragToLook = false;
    };
    
    World.prototype.addFlyControls = function () {
        this.controls = new THREE.FlyControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = this.options.radius;
        this.controls.domElement = this.container;
        this.controls.rollSpeed = Math.PI * 24;
        this.controls.autoForward = false;
        this.controls.dragToLook = false;
    };
    
    World.prototype.addLights = function () {
        var data = this.options.lights;
        this.lights[0] = new THREE.AmbientLight(data.ambient.color);
        this.scene.add(this.lights[0]);
        var dir = data.directional;
        this.lights[1] = new THREE.DirectionalLight(dir.color);
        this.lights[1].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z + dir.position.dz);
        this.scene.add(this.lights[1]);
        this.lights[2] = new THREE.DirectionalLight(dir.color);
        this.lights[2].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z - dir.position.dz);
        this.scene.add(this.lights[2]);
    };
    
    World.prototype.updateLights = function () {
        this.scene.remove(this.lights[0]);
        this.scene.remove(this.lights[1]);
        this.scene.remove(this.lights[2]);
        this.addLights();
    };
    return World;
}());

var DefaultWorldFactory = (function (_super) {
    __extends(DefaultWorldFactory, _super);
    function DefaultWorldFactory(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.state = {
            world: null,
            dataContainer: null,
            get isAllVisible() {
                if (this.state.world && this.state.world.scene) {
                    return !this.state.dataContainer.children.some(function (layer) {
                        return !layer.visible;
                    });
                }
            }
        };
        return _this;
    }
    DefaultWorldFactory.prototype.destroy = function () {
        if (this.state.world) {
            this.state.world.destroy();
            this.state.world = null;
            this.state.dataContainer = null;
            this.dispatchEvent({
                type: "objects.changed",
                objects: []
            });
        }
    };
    DefaultWorldFactory.prototype.remove = function (obj) {
        var result = false;
        if (this.state.dataContainer) {
            this.state.dataContainer.remove(obj);
            result = this.state.dataContainer.children.length > 0;
            if (!result) {
                this.destroy();
            }
            else {
                this.resize();
                this.dispatchEvent({
                    type: "objects.changed",
                    objects: this.state.dataContainer.children
                });
            }
        }
        return result;
    };
    DefaultWorldFactory.prototype.resize = function () {
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        var center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 2.5;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        };
        this.state.world.resize(options);
    };
    DefaultWorldFactory.prototype.show = function (data) {
        if (!this.state.dataContainer) {
            this.create(data);
        }
        else {
            this.extend(data);
        }
        this.dispatchEvent({
            type: "objects.changed",
            objects: this.state.dataContainer.children
        });
    };
    DefaultWorldFactory.prototype.create = function (data) {
        this.state.dataContainer = new THREE.Object3D();
        this.state.dataContainer.add(data);
        var box = new THREE.Box3().setFromObject(data);
        var center = box.getCenter();
        data.userData.center = center;
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                },
                position: {
                    x: center.x,
                    y: center.y - 3 * radius,
                    z: center.z + radius
                },
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: radius,
                        dz: z
                    }
                }
            }
        };
        if (this.state.world) {
            this.state.world.destroy();
        }
        this.state.world = new World(this.element, options);
        // window["world"] = state.world;
        this.add(this.state.dataContainer);
        this.dispatchEvent({
            type: "world.created",
            factory: this
        });
    };
    DefaultWorldFactory.prototype.getWorld = function () {
        return this.state.world;
    };
    DefaultWorldFactory.prototype.add = function (obj3d) {
        this.state.world.scene.add(obj3d);
        this.state.world.dataContainer = obj3d;
    };
    DefaultWorldFactory.prototype.extend = function (data) {
        var center = new THREE.Box3().setFromObject(data).getCenter();
        data.userData.center = center;
        this.state.dataContainer.add(data);
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                },
                position: {
                    x: center.x,
                    y: center.y - 3 * radius,
                    z: center.z + radius
                },
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        };
        this.state.world.update(options);
    };
    return DefaultWorldFactory;
}(THREE.EventDispatcher));

var Modifier = (function () {
    function Modifier(eventdispatcher) {
        var _this = this;
        this.eventdispatcher = eventdispatcher;
        this.callbacks = [];
        eventdispatcher.addEventListener("world.created", function (event) {
            _this.factory = event.factory;
            _this.flushCallbacks(event.factory);
        });
        eventdispatcher.addEventListener("world.destroyed", function (event) {
            _this.factory = null;
            _this.flushCallbacks(null);
        });
    }
    Modifier.prototype.flushCallbacks = function (factory) {
        if (this.callbacks) {
            this.callbacks.forEach(function (fn) {
                fn(factory);
            });
            this.callbacks = [];
        }
    };
    Modifier.prototype.onChange = function (callback) {
        var _this = this;
        setTimeout(function () { return callback(_this.factory); });
        this.callbacks.push(callback);
        return this;
    };
    return Modifier;
}());

var LabelSwitch = (function (_super) {
    __extends(LabelSwitch, _super);
    function LabelSwitch() {
        return _super.apply(this, arguments) || this;
    }
    LabelSwitch.prototype.set = function (value) {
        value ? this.on() : this.off();
    };
    LabelSwitch.prototype.on = function () {
        if (this.factory && this.factory.getWorld()) {
            this.factory.getWorld().labels.visible = true;
        }
    };
    LabelSwitch.prototype.off = function () {
        if (this.factory && this.factory.getWorld()) {
            this.factory.getWorld().labels.visible = false;
        }
    };
    return LabelSwitch;
}(Modifier));

var VerticalExagerate = (function (_super) {
    __extends(VerticalExagerate, _super);
    function VerticalExagerate() {
        return _super.apply(this, arguments) || this;
    }
    VerticalExagerate.prototype.set = function (value) {
        if (this.factory && this.factory.getWorld()) {
            this.factory.getWorld().dataContainer.scale.z = value;
        }
    };
    return VerticalExagerate;
}(Modifier));

var FileDrop = (function () {
    function FileDrop(element, handler) {
        if (!handler || typeof handler !== "function") {
            throw Error("No file handler provided");
        }
        if (!element) {
            throw Error("No element provided");
        }
        element.addEventListener("dragenter", dragenter, false);
        element.addEventListener("dragover", dragover, false);
        element.addEventListener("drop", drop, false);
        function dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            // console.log("dragenter");
        }
        function dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            // console.log("dragover");
        }
        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            var dt = e.dataTransfer;
            var files = dt.files;
            handleFiles(files);
        }
        function handleFiles(files) {
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    handler(files.item(i));
                }
            }
        }
    }
    return FileDrop;
}());

var Parser = (function () {
    function Parser() {
    }
    Parser.prototype.getBase = function () {
        return Parser.workerBase;
    };
    return Parser;
}());
Parser.workerBase = "";

var Transformer = (function () {
    function Transformer() {
    }
    Transformer.transform = function (doc) {
        var response;
        if (doc.types) {
            doc.types.forEach(function (type) {
                if (type.type === "TSurf") {
                    response = loadTSurf(type);
                }
                else if (type.type === "PLine") {
                    response = loadPLine(type);
                }
                else if (type.type === "VSet") {
                    response = loadVSet(type);
                }
            });
        }
        else {
            return null;
        }
        response.userData = {
            header: doc.types[0].header,
            coordinateSystem: doc.types[0].coordinateSystem
        };
        return response;
    };
    return Transformer;
}());
var ObjWithGeom = (function (_super) {
    __extends(ObjWithGeom, _super);
    function ObjWithGeom() {
        return _super.apply(this, arguments) || this;
    }
    return ObjWithGeom;
}(THREE.Object3D));

/**
 * Calls a web worker that loads the whole file before parsing. Works OK but uses
 * a lot of memory on huge files (100 - 250 MB is a good limit depending on pc)
 */
var GocadParser = (function (_super) {
    __extends(GocadParser, _super);
    function GocadParser() {
        return _super.apply(this, arguments) || this;
    }
    GocadParser.prototype.parse = function (data) {
        var _this = this;
        return new Promise(function (resolve) {
            var worker = new Worker(_this.getBase() + GocadParser.WORKER_NAME);
            worker.addEventListener("message", function (response) {
                console.log("worker gocad.js finished");
                worker.terminate();
                resolve(response.data);
            });
            worker.postMessage(data);
        });
    };
    return GocadParser;
}(Parser));
GocadParser.WORKER_NAME = "gocad.js";

var GocadPusherParser = (function (_super) {
    __extends(GocadPusherParser, _super);
    function GocadPusherParser() {
        return _super.apply(this, arguments) || this;
    }
    GocadPusherParser.prototype.parse = function (data) {
        var _this = this;
        return new Promise(function (resolve) {
            var worker = new Worker(_this.getBase() + GocadPusherParser.WORKER_NAME);
            worker.addEventListener("message", function (response) {
                console.log("worker gocadpusher.js finished");
                worker.terminate();
                resolve(response.data);
            });
            worker.addEventListener("error", function (err) {
                console.log("There is an error with your worker!");
                console.log(err);
            });
            worker.postMessage(data);
        });
    };
    return GocadPusherParser;
}(Parser));
GocadPusherParser.WORKER_NAME = "gocadpusher.js";

/**
 * Uses the block reading parser in the current UI thread. in
 * other words single threading. Mainly for debugging as its
 * easier to debug.
 */
var LocalGocadPusherParser = (function (_super) {
    __extends(LocalGocadPusherParser, _super);
    function LocalGocadPusherParser() {
        return _super.apply(this, arguments) || this;
    }
    // Easier to debug when running local.
    LocalGocadPusherParser.prototype.parse = function (data) {
        return new Promise(function (resolve) {
            new FilePusher(data.file, data.options, proj4).start().then(function (document) {
                resolve(document);
            });
        });
    };
    return LocalGocadPusherParser;
}(Parser));

/**
 * Use as a wrapper around other parsers to limit the number of concurrent web workers.
 * The constructor takes the wrapped parser and an optional count of web workers.
 * The default count is 7 as that means you get roughly 100% peak CPU use on an
 * 8 core CPU as the UI is using one core.
 */
var ThrottleProxyParser = (function (_super) {
    __extends(ThrottleProxyParser, _super);
    function ThrottleProxyParser(parser, max) {
        if (max === void 0) { max = 7; }
        var _this = _super.call(this) || this;
        _this.parser = parser;
        _this.max = max;
        _this.stack = [];
        _this.count = 0;
        return _this;
    }
    ThrottleProxyParser.prototype.parse = function (file, options) {
        var self = this;
        var waiter = {
            timestamp: Date.now(),
            file: file,
            options: options,
            self: self
        };
        var promise = new Promise(function (resolve) {
            waiter.resolver = resolve;
        });
        this.stack.push(waiter);
        this.count++;
        checkJobs();
        runCleaner();
        return promise;
        function runCleaner() {
        }
        function checkJobs() {
            console.log("We have " + self.count + " jobs queued");
            if (self.count > self.max || self.count < 1) {
                return;
            }
            runJob();
        }
        function runJob() {
            console.log("Jobs length = " + self.count);
            var job = self.stack.shift();
            if (job) {
                job.self.parser.parse(job.file, job.options).then(function (response) {
                    decrementCount();
                    runJob();
                    job.resolver(response);
                }).catch(function (err) {
                    console.log("Ooops!");
                    console.log(err);
                    decrementCount();
                });
            }
        }
        function decrementCount() {
            if (self.count > 0) {
                self.count--;
            }
        }
    };
    return ThrottleProxyParser;
}(Parser));

/**
 * Parse GeoJSON into our canonical form.
 * WARNING: Not fully working. Last I remember it was just
 * for point clouds.
 */
var GeoJsonParser = (function (_super) {
    __extends(GeoJsonParser, _super);
    function GeoJsonParser() {
        return _super.apply(this, arguments) || this;
    }
    GeoJsonParser.prototype.parse = function (file, options) {
        var _this = this;
        return new Promise(function (resolve) {
            var worker = new Worker(_this.getBase() + GeoJsonParser.WORKER_NAME);
            worker.addEventListener("message", function (response) {
                console.log("worker geojson.js finished");
                resolve(response.data);
            });
            worker.postMessage(file);
        });
    };
    return GeoJsonParser;
}(Parser));
GeoJsonParser.WORKER_NAME = "geojson.js";

exports.loadBorders = loadBorders;
exports.loadBstones = loadBstones;
exports.loadPLine = loadPLine;
exports.loadTSurf = loadTSurf;
exports.loadVSet = loadVSet;
exports.Shaders = Shaders;
exports.DefaultWorldFactory = DefaultWorldFactory;
exports.LabelSwitch = LabelSwitch;
exports.VerticalExagerate = VerticalExagerate;
exports.FileDrop = FileDrop;
exports.Parser = Parser;
exports.Transformer = Transformer;
exports.GocadParser = GocadParser;
exports.GocadPusherParser = GocadPusherParser;
exports.LocalGocadPusherParser = LocalGocadPusherParser;
exports.ThrottleProxyParser = ThrottleProxyParser;
exports.GeoJsonParser = GeoJsonParser;
exports.fileBufferedReader = fileBufferedReader;
exports.FilePusher = FilePusher;

Object.defineProperty(exports, '__esModule', { value: true });

})));
