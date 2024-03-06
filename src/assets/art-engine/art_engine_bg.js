let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_22(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__ha32a076da23608f6(arg0, arg1, arg2);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
* @param {HTMLCanvasElement} canvas
*/
export function run(canvas) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.run(retptr, addHeapObject(canvas));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
*/
export const ShaderType = Object.freeze({ Render:0,"0":"Render",Compute:1,"1":"Compute", });
/**
*/
export const BufferType = Object.freeze({ Array:0,"0":"Array",Element:1,"1":"Element", });
/**
*/
export const BufferUsage = Object.freeze({ Static:0,"0":"Static",Dynamic:1,"1":"Dynamic", });
/**
*/
export const ElementBufferType = Object.freeze({ Float32:0,"0":"Float32",Int8:1,"1":"Int8",Int16:2,"2":"Int16",Int32:3,"3":"Int32",UInt8:4,"4":"UInt8",UInt16:5,"5":"UInt16",UInt32:6,"6":"UInt32",Mat4x4:7,"7":"Mat4x4",Mat4x3:8,"8":"Mat4x3",Mat4x2:9,"9":"Mat4x2",Mat3x4:10,"10":"Mat3x4",Mat3x3:11,"11":"Mat3x3",Mat3x2:12,"12":"Mat3x2",Mat2x4:13,"13":"Mat2x4",Mat2x3:14,"14":"Mat2x3",Mat2x2:15,"15":"Mat2x2",Vec4:16,"16":"Vec4",Vec3:17,"17":"Vec3",Vec2:18,"18":"Vec2", });

const BufferFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_buffer_free(ptr >>> 0));
/**
*/
export class Buffer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Buffer.prototype);
        obj.__wbg_ptr = ptr;
        BufferFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Buffer)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BufferFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_buffer_free(ptr);
    }
    /**
    * Create a new buffer.
    *
    * * `gl`          - The context.
    * * `ty`          - The type of buffer.
    * * `usage`       - The buffer usage.
    * * `descriptor`  - The buffer data descriptor
    * @param {WebGL2RenderingContext} gl
    * @param {BufferType} ty
    * @param {BufferUsage} usage
    * @param {BufferDataDescriptor} descriptor
    * @returns {Buffer}
    */
    static new(gl, ty, usage, descriptor) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(descriptor, BufferDataDescriptor);
            var ptr0 = descriptor.__destroy_into_raw();
            wasm.buffer_new(retptr, addHeapObject(gl), ty, usage, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Buffer.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {BufferType}
    */
    get_type() {
        const ret = wasm.buffer_get_type(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {BufferUsage}
    */
    get_usage() {
        const ret = wasm.buffer_get_usage(this.__wbg_ptr);
        return ret;
    }
    /**
    */
    bind() {
        wasm.buffer_bind(this.__wbg_ptr);
    }
    /**
    */
    unbind() {
        wasm.buffer_unbind(this.__wbg_ptr);
    }
    /**
    * @returns {(BufferDataLayoutDescriptor)[]}
    */
    get_layout() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.buffer_get_layout(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    get_size() {
        const ret = wasm.buffer_get_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get_element_size() {
        const ret = wasm.buffer_get_element_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {WebGLBuffer}
    */
    raw() {
        const ret = wasm.buffer_raw(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const BufferDataDescriptorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bufferdatadescriptor_free(ptr >>> 0));
/**
*/
export class BufferDataDescriptor {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BufferDataDescriptor.prototype);
        obj.__wbg_ptr = ptr;
        BufferDataDescriptorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BufferDataDescriptorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bufferdatadescriptor_free(ptr);
    }
    /**
    * @param {ArrayBuffer} data
    * @param {(BufferDataLayoutDescriptor)[]} layout
    * @param {number} count
    * @returns {BufferDataDescriptor}
    */
    static new(data, layout, count) {
        const ptr0 = passArrayJsValueToWasm0(layout, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.bufferdatadescriptor_new(addHeapObject(data), ptr0, len0, count);
        return BufferDataDescriptor.__wrap(ret);
    }
    /**
    * Calculate the size of one element in the buffer
    * (stride) in bytes.
    * @returns {number}
    */
    get_element_size() {
        const ret = wasm.bufferdatadescriptor_get_element_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * Calculate the size of the buffer in bytes.
    * @returns {number}
    */
    get_size() {
        const ret = wasm.bufferdatadescriptor_get_size(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const BufferDataLayoutDescriptorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bufferdatalayoutdescriptor_free(ptr >>> 0));
/**
*/
export class BufferDataLayoutDescriptor {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BufferDataLayoutDescriptor.prototype);
        obj.__wbg_ptr = ptr;
        BufferDataLayoutDescriptorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof BufferDataLayoutDescriptor)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BufferDataLayoutDescriptorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bufferdatalayoutdescriptor_free(ptr);
    }
    /**
    * @param {string} name
    * @param {ElementBufferType} ty
    * @param {number | undefined} [instance_count]
    * @returns {BufferDataLayoutDescriptor}
    */
    static new(name, ty, instance_count) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.bufferdatalayoutdescriptor_new(ptr0, len0, ty, !isLikeNone(instance_count), isLikeNone(instance_count) ? 0 : instance_count);
        return BufferDataLayoutDescriptor.__wrap(ret);
    }
}

const CameraFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_camera_free(ptr >>> 0));
/**
*/
export class Camera {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Camera.prototype);
        obj.__wbg_ptr = ptr;
        CameraFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CameraFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_camera_free(ptr);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @returns {Camera}
    */
    static new(width, height) {
        const ret = wasm.camera_new(width, height);
        return Camera.__wrap(ret);
    }
    /**
    * @param {number} width
    * @param {number} height
    */
    resize(width, height) {
        wasm.camera_resize(this.__wbg_ptr, width, height);
    }
    /**
    * @returns {Float32Array}
    */
    get_matrix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_matrix(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Float32Array}
    */
    get_position() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_position(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    translate(x, y, z) {
        wasm.camera_translate(this.__wbg_ptr, x, y, z);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    set_position(x, y, z) {
        wasm.camera_set_position(this.__wbg_ptr, x, y, z);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    scale(x, y, z) {
        wasm.camera_scale(this.__wbg_ptr, x, y, z);
    }
    /**
    * @returns {Float32Array}
    */
    get_scale() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_scale(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    set_euleur_angles(x, y, z) {
        wasm.camera_set_euleur_angles(this.__wbg_ptr, x, y, z);
    }
    /**
    * @returns {Float32Array}
    */
    get_euleur_angles() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_euleur_angles(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Float32Array}
    */
    get_projection_view() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_projection_view(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Float32Array}
    */
    get_view_matrix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.camera_get_view_matrix(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} t
    */
    lerp_rotation(x, y, z, t) {
        wasm.camera_lerp_rotation(this.__wbg_ptr, x, y, z, t);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} t
    */
    lerp_position(x, y, z, t) {
        wasm.camera_lerp_position(this.__wbg_ptr, x, y, z, t);
    }
}

const ComputeMaterialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_computematerial_free(ptr >>> 0));
/**
*/
export class ComputeMaterial {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ComputeMaterial.prototype);
        obj.__wbg_ptr = ptr;
        ComputeMaterialFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ComputeMaterialFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_computematerial_free(ptr);
    }
    /**
    * Create a material from a shader.
    *
    * # Arguments
    *
    * * `source` - The shader source.
    * @param {WebGL2RenderingContext} gl
    * @param {Shader} shader
    * @param {(string)[]} varyings
    * @returns {ComputeMaterial}
    */
    static new(gl, shader, varyings) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(shader, Shader);
            const ptr0 = passArrayJsValueToWasm0(varyings, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.computematerial_new(retptr, addHeapObject(gl), shader.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ComputeMaterial.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    bind() {
        wasm.computematerial_bind(this.__wbg_ptr);
    }
    /**
    */
    unbind() {
        wasm.computematerial_unbind(this.__wbg_ptr);
    }
    /**
    * @param {Buffer} buf
    * @param {Buffer} out_buf
    */
    bind_buffer(buf, out_buf) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(buf, Buffer);
            _assertClass(out_buf, Buffer);
            wasm.computematerial_bind_buffer(retptr, this.__wbg_ptr, buf.__wbg_ptr, out_buf.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} name
    * @param {ArrayBuffer} buf
    * @param {ElementBufferType} ty
    */
    set_uniform(name, buf, ty) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.computematerial_set_uniform(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(buf), ty);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} count
    */
    compute(count) {
        wasm.computematerial_compute(this.__wbg_ptr, count);
    }
}

const EngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_engine_free(ptr >>> 0));
/**
*/
export class Engine {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Engine.prototype);
        obj.__wbg_ptr = ptr;
        EngineFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EngineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_engine_free(ptr);
    }
    /**
    * Create a new [engine](Engine) instance.
    *
    * # Arguments
    *
    * * `canvas` - The canvas element at where the [engine](Engine) will render.
    * @param {HTMLCanvasElement} canvas
    * @returns {Engine}
    */
    static new(canvas) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_new(retptr, addHeapObject(canvas));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Engine.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Resize the renderer.
    */
    resize() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.engine_resize(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Clear the renderer
    *
    * # Arguments
    *
    * * `r` - The red color channel *(`0.0` by default)*
    * * `g` - The green color channel *(`0.0` by default)*
    * * `b` - The blue color channel *(`0.0` by default)*
    * * `a` - The alpha color channel *(`1.0` by default)*
    * @param {number | undefined} [r]
    * @param {number | undefined} [g]
    * @param {number | undefined} [b]
    * @param {number | undefined} [a]
    */
    clear(r, g, b, a) {
        wasm.engine_clear(this.__wbg_ptr, !isLikeNone(r), isLikeNone(r) ? 0 : r, !isLikeNone(g), isLikeNone(g) ? 0 : g, !isLikeNone(b), isLikeNone(b) ? 0 : b, !isLikeNone(a), isLikeNone(a) ? 0 : a);
    }
    /**
    * Create a new Buffer.
    *
    * * `ty` - The type of buffer.
    * * `usage` - The usage of the buffer.
    * * `descriptor` - The data descriptor of the buffer.
    * @param {BufferType} ty
    * @param {BufferUsage} usage
    * @param {BufferDataDescriptor} descriptor
    * @returns {Buffer}
    */
    create_buffer(ty, usage, descriptor) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(descriptor, BufferDataDescriptor);
            var ptr0 = descriptor.__destroy_into_raw();
            wasm.engine_create_buffer(retptr, this.__wbg_ptr, ty, usage, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Buffer.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new Shader.
    *
    * * `ty` - The type of shader.
    * * `source` - The shader source.
    * @param {ShaderType} ty
    * @param {string} source
    * @returns {Shader}
    */
    create_shader(ty, source) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.engine_create_shader(retptr, this.__wbg_ptr, ty, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Shader.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new Compute Material.
    *
    * * `shader` - The shader.
    * * `varyings` - The compute shader varyings.
    * @param {Shader} shader
    * @param {(string)[]} varyings
    * @returns {ComputeMaterial}
    */
    create_compute_material(shader, varyings) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(shader, Shader);
            const ptr0 = passArrayJsValueToWasm0(varyings, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.engine_create_compute_material(retptr, this.__wbg_ptr, shader.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ComputeMaterial.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new Material.
    *
    * * `shader` - The shader source used for the material.
    * @param {Shader} shader
    * @returns {Material}
    */
    create_material(shader) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(shader, Shader);
            wasm.engine_create_material(retptr, this.__wbg_ptr, shader.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Material.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} width
    * @param {number} height
    * @returns {Camera}
    */
    create_camera(width, height) {
        const ret = wasm.engine_create_camera(this.__wbg_ptr, width, height);
        return Camera.__wrap(ret);
    }
}

const MaterialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_material_free(ptr >>> 0));
/**
*/
export class Material {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Material.prototype);
        obj.__wbg_ptr = ptr;
        MaterialFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MaterialFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_material_free(ptr);
    }
    /**
    * Create a material from a shader.
    *
    * # Arguments
    *
    * * `source` - The shader source.
    * @param {WebGL2RenderingContext} gl
    * @param {Shader} shader
    * @returns {Material}
    */
    static new(gl, shader) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(shader, Shader);
            wasm.material_new(retptr, addHeapObject(gl), shader.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Material.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    bind() {
        wasm.material_bind(this.__wbg_ptr);
    }
    /**
    */
    unbind() {
        wasm.material_unbind(this.__wbg_ptr);
    }
    /**
    * @param {(Buffer)[]} buffers
    * @param {Buffer} index_buf
    */
    bind_buffer(buffers, index_buf) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(buffers, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(index_buf, Buffer);
            wasm.material_bind_buffer(retptr, this.__wbg_ptr, ptr0, len0, index_buf.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} name
    * @param {ArrayBuffer} buf
    * @param {ElementBufferType} ty
    */
    set_uniform(name, buf, ty) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.material_set_uniform(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(buf), ty);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    draw() {
        wasm.material_draw(this.__wbg_ptr);
    }
    /**
    * @param {number} instances
    */
    draw_instanced(instances) {
        wasm.material_draw_instanced(this.__wbg_ptr, instances);
    }
}

const ShaderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_shader_free(ptr >>> 0));
/**
*/
export class Shader {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Shader.prototype);
        obj.__wbg_ptr = ptr;
        ShaderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ShaderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_shader_free(ptr);
    }
    /**
    * @param {WebGL2RenderingContext} gl
    * @param {ShaderType} ty
    * @param {string} source
    * @returns {Shader}
    */
    static new(gl, ty, source) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.shader_new(retptr, addHeapObject(gl), ty, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Shader.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Retrive the raw webgl vertex shader
    *
    * @returns {WebGLShader}
    */
    raw_vertex_shader() {
        const ret = wasm.shader_raw_vertex_shader(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Retrive the raw webgl fragment shader
    *
    * @returns {WebGLShader}
    */
    raw_fragment_shader() {
        const ret = wasm.shader_raw_fragment_shader(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Retrieve the shader type.
    * @returns {ShaderType}
    */
    get_type() {
        const ret = wasm.shader_get_type(this.__wbg_ptr);
        return ret;
    }
}

const TransformFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transform_free(ptr >>> 0));
/**
*/
export class Transform {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Transform.prototype);
        obj.__wbg_ptr = ptr;
        TransformFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransformFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transform_free(ptr);
    }
    /**
    * @returns {Transform}
    */
    static new() {
        const ret = wasm.transform_new();
        return Transform.__wrap(ret);
    }
    /**
    * @returns {Float32Array}
    */
    get_position() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transform_get_position(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    translate(x, y, z) {
        wasm.transform_translate(this.__wbg_ptr, x, y, z);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    set_position(x, y, z) {
        wasm.transform_set_position(this.__wbg_ptr, x, y, z);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    scale(x, y, z) {
        wasm.transform_scale(this.__wbg_ptr, x, y, z);
    }
    /**
    * @returns {Float32Array}
    */
    get_scale() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transform_get_scale(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    set_euleur_angles(x, y, z) {
        wasm.transform_set_euleur_angles(this.__wbg_ptr, x, y, z);
    }
    /**
    * @returns {Float32Array}
    */
    get_euleur_angles() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transform_get_euleur_angles(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Float32Array}
    */
    get_matrix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transform_get_matrix(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_bufferdatalayoutdescriptor_new(arg0) {
    const ret = BufferDataLayoutDescriptor.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_is_falsy(arg0) {
    const ret = !getObject(arg0);
    return ret;
};

export function __wbg_bufferdatalayoutdescriptor_unwrap(arg0) {
    const ret = BufferDataLayoutDescriptor.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_buffer_unwrap(arg0) {
    const ret = Buffer.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbg_instanceof_WebGl2RenderingContext_b1bbc94623ae057f(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof WebGL2RenderingContext;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_canvas_e97c0dd2bc3fcf26(arg0) {
    const ret = getObject(arg0).canvas;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_beginTransformFeedback_b78f5134a0958225(arg0, arg1) {
    getObject(arg0).beginTransformFeedback(arg1 >>> 0);
};

export function __wbg_bindBufferBase_87219c94582f885f(arg0, arg1, arg2, arg3) {
    getObject(arg0).bindBufferBase(arg1 >>> 0, arg2 >>> 0, getObject(arg3));
};

export function __wbg_bindTransformFeedback_8be8ab72af5b64b3(arg0, arg1, arg2) {
    getObject(arg0).bindTransformFeedback(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindVertexArray_68196ec68ffa5d9c(arg0, arg1) {
    getObject(arg0).bindVertexArray(getObject(arg1));
};

export function __wbg_bufferData_325ab331c8e0735f(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};

export function __wbg_createTransformFeedback_773b533d6757d4c5(arg0) {
    const ret = getObject(arg0).createTransformFeedback();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createVertexArray_aa1c03bf14f520f1(arg0) {
    const ret = getObject(arg0).createVertexArray();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_deleteTransformFeedback_7920107fb266d081(arg0, arg1) {
    getObject(arg0).deleteTransformFeedback(getObject(arg1));
};

export function __wbg_deleteVertexArray_aeabcf2495f7c09c(arg0, arg1) {
    getObject(arg0).deleteVertexArray(getObject(arg1));
};

export function __wbg_drawElementsInstanced_dce84cc1ed887494(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_endTransformFeedback_0ba889ed623e74e7(arg0) {
    getObject(arg0).endTransformFeedback();
};

export function __wbg_transformFeedbackVaryings_d768cc30b83eb100(arg0, arg1, arg2, arg3) {
    getObject(arg0).transformFeedbackVaryings(getObject(arg1), getObject(arg2), arg3 >>> 0);
};

export function __wbg_uniform1fv_c8046ef9c7c7d48e(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform1iv_3ad74d27c91ea061(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform1uiv_71f94eafc0c66db3(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
};

export function __wbg_uniform2fv_331aca4dc43cd9e7(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform3fv_4d943b68444ade05(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform4fv_84bfda99967b1dd8(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniformMatrix2fv_50bcb78733383b7a(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix2x3fv_511bcd6812f9b234(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix2x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix2x4fv_05825b02cb8e8a57(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix2x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix3fv_83860334e7232725(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix3x2fv_a7543598cc704917(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix3x4fv_9b21067dcf5eb3e8(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix4fv_e785e114daf5701d(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix4x2fv_8446a99a4cfedbbc(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix4x3fv_4efbf729ac1dd06e(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_vertexAttribDivisor_35b74964a6a4eaf4(arg0, arg1, arg2) {
    getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_attachShader_427e1d01a628e522(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};

export function __wbg_bindBuffer_0285be79ac8a4f9f(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_clear_ceb93ecc4e5d5e06(arg0, arg1) {
    getObject(arg0).clear(arg1 >>> 0);
};

export function __wbg_clearColor_e4c61a3089043306(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
};

export function __wbg_compileShader_2191687ded033138(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};

export function __wbg_createBuffer_ee6e74ae50f1fbc8(arg0) {
    const ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createProgram_869004e7019cca34(arg0) {
    const ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createShader_eceb4217c94a1056(arg0, arg1) {
    const ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_disable_3598de08841268c2(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};

export function __wbg_drawArrays_5becfe216deed585(arg0, arg1, arg2, arg3) {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
};

export function __wbg_drawElements_77b947be75fe30f4(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
};

export function __wbg_enable_98a8863abbaa7bd2(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};

export function __wbg_enableVertexAttribArray_5f8e190ba41f4f30(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_getAttribLocation_08f436d8fc4fe68d(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return ret;
};

export function __wbg_getProgramInfoLog_a9fede9be1e3a6ce(arg0, arg1, arg2) {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getProgramParameter_a13e6d88ec9e039a(arg0, arg1, arg2) {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getShaderInfoLog_63c64bf03382de2d(arg0, arg1, arg2) {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getShaderParameter_0fb2d525889d5a24(arg0, arg1, arg2) {
    const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getUniformLocation_009db1591e93ef17(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_linkProgram_578651eb0388616a(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};

export function __wbg_shaderSource_d241264f221df907(arg0, arg1, arg2, arg3) {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
};

export function __wbg_useProgram_b28955d541019a7a(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};

export function __wbg_vertexAttribPointer_df897e1c10d6b71b(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};

export function __wbg_viewport_f542dcd30d88e69d(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};

export function __wbg_instanceof_Window_cee7a886d55e7df5(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_devicePixelRatio_3ced5021c4480dd9(arg0) {
    const ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export function __wbg_requestAnimationFrame_fdbeaff9e8f3f77d() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_clientWidth_7a325bdb8c723d9f(arg0) {
    const ret = getObject(arg0).clientWidth;
    return ret;
};

export function __wbg_clientHeight_2b2a9874084502db(arg0) {
    const ret = getObject(arg0).clientHeight;
    return ret;
};

export function __wbg_instanceof_HtmlCanvasElement_1e81f71f630e46bc(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof HTMLCanvasElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_width_aa1ac55fb41db6ae(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_setwidth_233645b297bb3318(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_height_bea901cd16645fb7(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbg_setheight_fcb491cf54e3527c(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_dfc91ab0837db1d1() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_newnoargs_cfecb3965268594c(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_3f093dd26d5569f8() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_self_05040bd9523805b9() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_adc720039f2cb14f() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_622105db80c1457d() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_f56b013ed9bcf359() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_newwithlength_a20dc3b27e1cb1b2(arg0) {
    const ret = new Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_set_79c308ecd9a1d091(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_buffer_b914fb8b50ebbc3e(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_e4dd61c29af24331(arg0) {
    const ret = new Int32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_3a377ba3f4747190(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_af7a8cd5f2157bc5(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_437b9c4fbab85dd9(arg0) {
    const ret = new Uint32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_a2d1e73b1a5280c5(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_56f30c3a2173f1dd(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_d5be849e30054b65(arg0) {
    const ret = new Float32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_c07e61b3625bced8(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_f2871b6ecd8bc3e4(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper342(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 16, __wbg_adapter_22);
    return addHeapObject(ret);
};

