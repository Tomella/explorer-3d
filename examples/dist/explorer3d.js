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

var CoordinateSystem = (function () {
    function CoordinateSystem(reader) {
        this.isValid = true;
        this.typeMap = {
            AXIS_NAME: split,
            AXIS_UNIT: split
        };
        var line = reader.nextDataLine().trim();
        if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
            reader.previous();
            this.isValid = false;
        }
        else {
            line = reader.nextDataLine().trim();
            while (line && line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
                var index = line.indexOf(" ");
                if (index > 0) {
                    var name = line.substring(0, index);
                    var rest = line.substring(index).trim();
                    var mapper = this.typeMap[name] ? this.typeMap[name] : function (val) { return val; };
                    this[name] = mapper(rest);
                }
                line = reader.nextDataLine().trim();
            }
        }
        this.typeMap = null;
    }
    return CoordinateSystem;
}());
function split(val) {
    return val.split(/\s+/g).map(function (str) {
        return str.replace(/\"/g, "");
    });
}

/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */
var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.apply = function (object) {
        object.addEventListener = EventDispatcher.prototype.addEventListener;
        object.hasEventListener = EventDispatcher.prototype.hasEventListener;
        object.removeEventListener = EventDispatcher.prototype.removeEventListener;
        object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;
    };
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        if (this._listeners === undefined)
            this._listeners = {};
        var listeners = this._listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    };
    EventDispatcher.prototype.hasEventListener = function (type, listener) {
        if (this._listeners === undefined)
            return false;
        var listeners = this._listeners;
        if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
            return true;
        }
        return false;
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        if (this._listeners === undefined)
            return;
        var listeners = this._listeners;
        var listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            var index = listenerArray.indexOf(listener);
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    };
    EventDispatcher.prototype.dispatchEvent = function () {
        var array = [];
        return;
        function fn(event) {
            if (this._listeners === undefined)
                return;
            var listeners = this._listeners;
            var listenerArray = listeners[event.type];
            if (listenerArray !== undefined) {
                event.target = this;
                var length = listenerArray.length;
                for (var i = 0; i < length; i++) {
                    array[i] = listenerArray[i];
                }
                for (var i = 0; i < length; i++) {
                    array[i].call(this, event);
                }
            }
        }
    };
    return EventDispatcher;
}());

var Type = (function (_super) {
    __extends(Type, _super);
    /**
     * We come in here on the next line
     */
    function Type(reader, projectionFn) {
        _super.call(this);
        this.type = "Type";
        this.projectionFn = function (coords) {
            return coords;
        };
        this.isValid = false;
        this.reader = reader;
        if (projectionFn) {
            this.projectionFn = projectionFn;
        }
    }
    Type.prototype.clear = function () {
        this.reader = null;
    };
    return Type;
}(EventDispatcher));
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
                response.index = parseInt(item);
                break;
            case 2:
                response.vertexId = parseFloat(item);
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
                response.index = parseInt(item);
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

var Header = (function () {
    function Header(reader) {
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
        var line = reader.nextDataLine().trim();
        while (line) {
            if (line.indexOf("}") === 0) {
                break;
            }
            var parts = line.split(":");
            if (parts.length === 2) {
                var mapper = this.typeMap[parts[0]];
                mapper = mapper ? mapper : flowThru;
                this.values[parts[0]] = mapper(parts[1]);
            }
            else {
                console.warn("That doesn't look like a pair: " + line);
            }
            line = reader.nextDataLine().trim();
        }
        this.name = this.values["name"];
        this.solidColor = this.values["*solid*color"];
        this.solidColor = this.solidColor ? this.solidColor : 0xeeeeee;
        this.typeMap = null;
    }
    Header.prototype.toColor = function (key) {
        return toColor(key);
    };
    Header.prototype.toBool = function (val) {
        return toBool(val);
    };
    return Header;
}());
function toBool(val) {
    return "true" === val;
}
function flowThru(val) {
    return val;
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

var TSurf = (function (_super) {
    __extends(TSurf, _super);
    /**
     * We come in here on the next line
     */
    function TSurf(reader, projectionFn) {
        _super.call(this, reader, projectionFn);
        this.type = "TSurf";
        this.vertices = [];
        this.faces = [];
        this.bstones = [];
        this.borders = [];
        var line = reader.expects("HEADER");
        if (!line || line.indexOf("{") === -1) {
            return;
        }
        this.header = new Header(reader);
        // this.dispatchEvent('gocad.header', this.header);
        var cs = new CoordinateSystem(reader);
        var zSign = 1;
        if (cs.isValid) {
            this.coordinateSystem = cs;
            zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        line = reader.expects("TFACE");
        while ((line = reader.nextDataLine().trim()) !== "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, zSign);
                this.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.vertices[a.index] = this.vertices[a.vertexId];
            }
            else if (line.indexOf("TRGL") === 0) {
                this.faces.push(face(line).abc);
            }
            else if (line.indexOf("BSTONE") === 0) {
                this.bstones.push(bstone(line));
            }
            else if (line.indexOf("BORDER") === 0) {
                var b = border(line);
                this.borders[b.id] = [b.vertices[0], b.vertices[1]];
            }
        }
        this.clear();
    }
    return TSurf;
}(Type));
function border(border) {
    var parts = border.split(/\s+/g);
    return {
        id: +parts[1],
        vertices: [
            +parts[2],
            +parts[3]
        ]
    };
}
function face(face) {
    var parts = face.split(/\s+/g);
    var length = parts.length;
    var response = {
        get abc() {
            return [this.a, this.b, this.c];
        }
    };
    if (length === 4) {
        response.a = parseInt(parts[1]);
        response.b = parseFloat(parts[2]);
        response.c = parseFloat(parts[3]);
    }
    return response;
}
function bstone(bstone) {
    var parts = bstone.split(/\s+/g);
    return parseInt(parts[1]);
}

var PLineHeader = (function (_super) {
    __extends(PLineHeader, _super);
    function PLineHeader(reader) {
        _super.call(this, reader);
        this.paintedVariable = this.values["*painted*variable"];
        var color = this.values["*line*color"];
        this.color = color ? this.toColor(color) : 0x0000ff;
    }
    return PLineHeader;
}(Header));

var PLine = (function (_super) {
    __extends(PLine, _super);
    /**
     * We come in here on the next line
     */
    function PLine(reader, projectionFn) {
        _super.call(this, reader, projectionFn);
        this.type = "PLine";
        this.vertices = [];
        this.lines = [];
        var line = reader.expects("HEADER");
        if (!line || line.indexOf("{") === -1) {
            return;
        }
        this.header = new PLineHeader(reader);
        var cs = new CoordinateSystem(reader);
        var zSign = 1;
        if (cs.isValid) {
            this.coordinateSystem = cs;
            zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        // let props = new Properties(reader);
        // if(props.isValid) {
        //   this.properties = props;
        // }
        line = reader.expects("ILINE");
        var startIndex = 1;
        var lastIndex = 1;
        var hasSeg = false;
        var lineSegments = [];
        line = reader.nextDataLine();
        var completed = (line ? line.trim() : "}") === "}";
        while (!completed) {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, zSign);
                this.vertices[v.index] = v.all;
                lastIndex = v.index;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.vertices[a.index] = this.vertices[a.vertexId];
            }
            else if (line.indexOf("SEG") === 0) {
                lineSegments.push(segment(line));
                hasSeg = true;
            }
            else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
                completed = line.indexOf("END") === 0;
                if (!hasSeg && lastIndex > startIndex) {
                    // We have to step over every vertex pair from start index to lastIndex
                    for (var i = startIndex; i < lastIndex; i++) {
                        lineSegments.push([i, i + 1]);
                    }
                }
                this.lines.push(lineSegments);
                lineSegments = [];
                startIndex = lastIndex + 1;
                hasSeg = false;
            }
            completed = !reader.hasMore();
            if (!completed) {
                completed = (line = reader.nextDataLine().trim()) === "}";
            }
        }
        this.clear();
    }
    return PLine;
}(Type));
function segment(seg) {
    var parts = seg.split(/\s+/g);
    return [
        parseInt(parts[1]),
        parseInt(parts[2])
    ];
}

var TSolid = (function (_super) {
    __extends(TSolid, _super);
    function TSolid(reader, projectionFn) {
        _super.call(this, reader, projectionFn);
        this.type = "TSolid";
        this.vertices = [];
        this.tetras = [];
        var line = reader.expects("HEADER");
        if (!line) {
            return;
        }
        this.header = new Header(reader);
        var cs = new CoordinateSystem(reader);
        var zSign = 1;
        if (cs.isValid) {
            this.coordinateSystem = cs;
            zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        line = reader.expects("TVOLUME");
        while ((line = reader.nextDataLine().trim()) !== "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, zSign);
                this.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.vertices[a.index] = this.vertices[a.vertexId];
            }
            else if (line.indexOf("TETRA") === 0) {
                this.tetras.push(tetra(line));
            }
        }
        this.clear();
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

var VSetHeader = (function (_super) {
    __extends(VSetHeader, _super);
    function VSetHeader(reader) {
        _super.call(this, reader);
        this.color = this.toColor(this.values["*atoms*color"]);
    }
    return VSetHeader;
}(Header));

var VSet = (function (_super) {
    __extends(VSet, _super);
    /**
     * We come in here on the next line
     */
    function VSet(reader, projectionFn) {
        _super.call(this, reader, projectionFn);
        this.type = "VSet";
        this.vertices = [];
        var line = reader.expects("HEADER");
        if (!line || line.indexOf("{") === -1) {
            return;
        }
        this.header = new VSetHeader(reader);
        var cs = new CoordinateSystem(reader);
        var zSign = 1;
        if (cs.isValid) {
            this.coordinateSystem = cs;
            zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        while ((line = reader.nextDataLine().trim()) !== "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, projectionFn, zSign);
                this.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.vertices[a.index] = this.vertices[a.vertexId];
            }
        }
        this.clear();
    }
    return VSet;
}(Type));

var Unknown = (function (_super) {
    __extends(Unknown, _super);
    /**
     * We come in here on the next line
     */
    function Unknown(reader, projectionFn) {
        _super.call(this, reader, projectionFn);
        this.type = "Unknown";
        while (reader.hasMore()) {
            var line = reader.next().trim();
            if (line === "END") {
                break;
            }
        }
        this.clear();
    }
    return Unknown;
}(Type));

var TypeFactory = (function () {
    function TypeFactory(reader, projectionFn) {
        this.isValid = false;
        if (reader.hasMore()) {
            var line = reader.next().trim();
            var parts = line.split(/\s+/g);
            this.isValid = parts.length === 3
                && parts[0] === "GOCAD"
                && (parts[2] === "1.0" || parts[2] === "1");
            if (this.isValid) {
                this.version = parts[2];
                if (parts[1] === "TSurf") {
                    this.type = new TSurf(reader, projectionFn);
                }
                else if (parts[1] === "PLine") {
                    this.type = new PLine(reader, projectionFn);
                }
                else if (parts[1] === "TSolid") {
                    this.type = new TSolid(reader, projectionFn);
                }
                else if (parts[1] === "VSet") {
                    this.type = new VSet(reader, projectionFn);
                }
                else {
                    this.type = new Unknown(reader, projectionFn);
                }
            }
        }
    }
    return TypeFactory;
}());

var Document = (function () {
    function Document(reader, projectionFn) {
        this.types = [];
        this.reader = reader;
        if (reader.hasMore()) {
            var obj = new TypeFactory(reader, projectionFn);
            if (obj.isValid) {
                this.types.push(obj.type);
            }
        }
        this.clean();
    }
    Document.prototype.clean = function () {
        this.reader = null;
        if (this.types) {
            this.types.forEach(function (type) {
                type.projectionFn = null;
            });
        }
    };
    return Document;
}());

var Properties = (function () {
    function Properties(reader, terminators) {
        var _this = this;
        this.isValid = true;
        this.names = {};
        this.range = {
            min: null,
            max: null
        };
        this.terminator = "}";
        terminators = terminators ? terminators : [];
        terminators.push(this.terminator);
        var line = reader.nextDataLine().trim();
        this.isValid = false;
        if (line.indexOf("PROPERTIES") !== 0) {
            reader.previous();
        }
        else {
            var self = this;
            var keys_1 = getValues(line);
            if (keys_1.length) {
                keys_1.forEach(function (key) {
                    _this.names[key] = {};
                });
            }
            this.isValid = true;
            line = reader.nextDataLine().trim();
            while (true) {
                var values = getValues(line);
                if (line.indexOf("PROP_LEGAL_RANGES") === 0 && values.length === 2) {
                    if (values[0] !== "**none**") {
                        this.range.min = parseFloat(values[0]);
                    }
                    if (values[1] !== "**none**") {
                        this.range.min = parseFloat(values[1]);
                    }
                }
                else if (line.indexOf("PROPERTY_CLASSES") === 0 && values.length > 0) {
                    values.forEach(function (value, index) {
                        _this.names[keys_1[index]].className = value;
                    });
                }
                else if (line.indexOf("UNITS") === 0 && values.length > 0) {
                    values.forEach(function (value, index) {
                        _this.names[keys_1[index]].unit = value;
                    });
                }
                line = reader.nextDataLine() ? line.trim() : "}";
                if (line.indexOf("}") === 0) {
                    break;
                }
            }
        }
        // console.log(this);
    }
    return Properties;
}());
function getValues(line) {
    var parts = line.split(/\s+/g);
    parts.shift();
    return parts;
}

var Vertex = (function () {
    function Vertex(str, projectionFn) {
        if (str) {
            var parts = str.split(/\s+/g);
            var coords = projectionFn([parseFloat(parts[0]), parseFloat(parts[1])]);
            this.x = coords[0];
            this.y = coords[1];
            this.z = parseFloat(parts[2]);
        }
    }
    return Vertex;
}());

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

var LinePusher = (function () {
    function LinePusher(file, handler, errorHandler) {
        this.PAGE_SIZE = 1048576; // A mb at a time should be harmless
        this.file = file;
        this.length = file.size;
        this.handler = handler;
        this.errorHandler = errorHandler;
        this.pageNo = this.index = 0;
        this.lineBuffer = [];
        this.process();
    }
    LinePusher.prototype.process = function () {
        this.readPage();
    };
    LinePusher.prototype.readPage = function () {
        var _this = this;
        var start = this.pageNo * this.PAGE_SIZE;
        if (start >= this.length) {
            this.complete();
        }
        var reader = new FileReader();
        var blob = this.file.slice(start, start + this.PAGE_SIZE);
        reader.onloadend = function (evt) {
            if (evt.target["readyState"] === FileReader.prototype.DONE) {
                var text = evt.target["result"];
                processBlock(text);
                // We've finished the block get ready for the next
                _this.pageNo++;
                _this.readPage();
            }
        };
        reader.readAsText(blob);
        function processBlock(text) {
            for (var i = 0; i < text.length; i++) {
                var char = text[this.index];
                if (char === "\r") {
                    continue;
                }
                if (char === "\n") {
                    this.handler(this.lineBuffer.join(""));
                    this.lineBuffer = [];
                    continue;
                }
                this.lineBuffer.push(text[i]);
            }
        }
    };
    LinePusher.prototype.complete = function () {
        if (this.lineBuffer.length) {
            // flush last line
            this.handler(this.lineBuffer.join(""));
        }
        // Send null to terminate
        this.handler(null);
    };
    return LinePusher;
}());

var LineReader = (function () {
    function LineReader(data) {
        this.indexStack = [];
        this.data = data;
        this.length = data.length;
        this.index = 0;
    }
    LineReader.prototype.hasMore = function () {
        return this.index < this.length - 1;
    };
    LineReader.prototype.peek = function () {
        var str = this.next();
        this.previous();
    };
    LineReader.prototype.previous = function () {
        if (this.indexStack.length) {
            this.index = this.indexStack.pop();
        }
    };
    LineReader.prototype.next = function () {
        this.indexStack.push(this.index);
        var response = [];
        for (; this.index < this.length; this.index++) {
            var char = this.data[this.index];
            if (char === "\r") {
                continue;
            }
            if (char === "\n") {
                this.index++;
                break;
            }
            response.push(this.data[this.index]);
        }
        return !response ? null : response.join("");
    };
    LineReader.prototype.expects = function (startsWith) {
        while (this.hasMore()) {
            var read = this.next();
            if (!read.indexOf(startsWith)) {
                return read;
            }
        }
        return null;
    };
    LineReader.prototype.nextNonEmpty = function () {
        while (this.hasMore()) {
            var str = this.next();
            if (str) {
                return str;
            }
        }
        return null;
    };
    LineReader.prototype.nextDataLine = function () {
        var line = this.nextNonEmpty();
        while (line) {
            if (line.indexOf("#")) {
                return line;
            }
            line = this.nextNonEmpty();
        }
        return line;
    };
    return LineReader;
}());

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

function parseXml(xmlStr) {
    if (typeof DOMParser !== "undefined") {
        return (new DOMParser()).parseFromString(xmlStr, "text/xml");
    }
    else if (typeof ActiveXObject !== "undefined" && new ActiveXObject("Microsoft.XMLDOM")) {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    }
    else {
        return null;
    }
}

// Rollup the libs as used by the web workers

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

var TSurfLoader = (function () {
    function TSurfLoader() {
        this.geometry = new THREE.Geometry();
        this.userData = {};
    }
    TSurfLoader.prototype.setHeader = function (header) {
        this.userData.header = header;
        var color = header.solidColor;
        this.material = new THREE.MeshLambertMaterial({
            color: color ? color : 0xff1111,
            side: THREE.DoubleSide
        });
    };
    TSurfLoader.prototype.setVertices = function (vertices) {
        var _this = this;
        vertices.forEach(function (vertex) {
            _this.geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
        });
    };
    TSurfLoader.prototype.setCoordinateSystem = function (coords) {
        this.userData.coordinateSystem = coords;
    };
    TSurfLoader.prototype.setFaces = function (faces) {
        var _this = this;
        faces.forEach(function (face) {
            // GOCAD indexes with a base of 1. Normalize.
            _this.geometry.faces.push(new THREE.Face3(face[0] - 1, face[1] - 1, face[2] - 1));
        });
    };
    TSurfLoader.prototype.createMesh = function () {
        this.geometry.computeBoundingBox();
        this.geometry.computeFaceNormals();
        var mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.userData = this.userData;
        return mesh;
    };
    return TSurfLoader;
}());

function loadPLine(pline) {
    var minMax = range(pline.vertices, function (a) {
        return a ? +a[3] : null;
    });
    var material = new THREE.LineBasicMaterial({
        linewidth: 10,
        color: 0xffffff,
        vertexColors: THREE.VertexColors
    });
    var geometry = new THREE.Geometry();
    var lut = new THREE.Lut("rainbow", Math.floor(minMax[1] - minMax[0]));
    lut.setMax(Math.floor(minMax[1]));
    lut.setMin(Math.floor(minMax[0]));
    pline.lines.forEach(function (line) {
        line.forEach(function (seg, index) {
            var vertex$$1 = pline.vertices[seg[0]];
            geometry.vertices.push(new THREE.Vector3(vertex$$1[0], vertex$$1[1], vertex$$1[2]));
            geometry.colors.push(lut.getColor(parseInt(vertex$$1[3])));
            vertex$$1 = pline.vertices[seg[1]];
            geometry.vertices.push(new THREE.Vector3(vertex$$1[0], vertex$$1[1], vertex$$1[2]));
            geometry.colors.push(lut.getColor(parseInt(vertex$$1[3])));
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
    tsurf.vertices.forEach(function (vertex) {
        geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
    });
    tsurf.faces.forEach(function (face) {
        // GOCAD indexes with a base of 1. Normalize.
        geometry.faces.push(new THREE.Face3(face[0] - 1, face[1] - 1, face[2] - 1));
    });
    geometry.computeBoundingBox();
    geometry.computeFaceNormals();
    var mesh = new THREE.Mesh(geometry, mat);
    return mesh;
}

function loadVSet(vset) {
    var geometry = new THREE.Geometry();
    var color = vset.header.color;
    vset.vertices.forEach(function (vertex) {
        var v = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
        geometry.vertices.push(v);
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
    return Shaders;
}());

var World = (function () {
    function World(container, options) {
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
        this.options = deepMerge(this.options, options ? options : {});
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
    World.prototype.destroy = function () {
        this.renderer.domElement.addEventListener("dblclick", null, false); // remove listener to render
        this.scene = null;
        this.camera = null;
        this.controls = null;
        while (this.container.lastChild)
            this.container.removeChild(this.container.lastChild);
        this.continueAnimation = false;
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

exports.loadBorders = loadBorders;
exports.loadBstones = loadBstones;
exports.TSurfLoader = TSurfLoader;
exports.loadPLine = loadPLine;
exports.loadTSurf = loadTSurf;
exports.loadVSet = loadVSet;
exports.Shaders = Shaders;
exports.World = World;
exports.CoordinateSystem = CoordinateSystem;
exports.Document = Document;
exports.PLine = PLine;
exports.PLineHeader = PLineHeader;
exports.Properties = Properties;
exports.TSolid = TSolid;
exports.TSurf = TSurf;
exports.TypeFactory = TypeFactory;
exports.Unknown = Unknown;
exports.Vertex = Vertex;
exports.VSet = VSet;
exports.VSetHeader = VSetHeader;
exports.deepMerge = deepMerge;
exports.EventDispatcher = EventDispatcher;
exports.LinePusher = LinePusher;
exports.LineReader = LineReader;
exports.range = range;
exports.parseXml = parseXml;
exports.toBool = toBool;
exports.flowThru = flowThru;
exports.toColor = toColor;
exports.Header = Header;
exports.atom = atom;
exports.vertex = vertex;
exports.Type = Type;

Object.defineProperty(exports, '__esModule', { value: true });

})));
