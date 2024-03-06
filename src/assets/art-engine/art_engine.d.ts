/* tslint:disable */
/* eslint-disable */
/**
* @param {HTMLCanvasElement} canvas
*/
export function run(canvas: HTMLCanvasElement): void;
/**
*/
export enum ShaderType {
  Render = 0,
  Compute = 1,
}
/**
*/
export enum BufferType {
  Array = 0,
  Element = 1,
}
/**
*/
export enum BufferUsage {
  Static = 0,
  Dynamic = 1,
}
/**
*/
export enum ElementBufferType {
  Float32 = 0,
  Int8 = 1,
  Int16 = 2,
  Int32 = 3,
  UInt8 = 4,
  UInt16 = 5,
  UInt32 = 6,
  Mat4x4 = 7,
  Mat4x3 = 8,
  Mat4x2 = 9,
  Mat3x4 = 10,
  Mat3x3 = 11,
  Mat3x2 = 12,
  Mat2x4 = 13,
  Mat2x3 = 14,
  Mat2x2 = 15,
  Vec4 = 16,
  Vec3 = 17,
  Vec2 = 18,
}
/**
*/
export class Buffer {
  free(): void;
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
  static new(gl: WebGL2RenderingContext, ty: BufferType, usage: BufferUsage, descriptor: BufferDataDescriptor): Buffer;
/**
* @returns {BufferType}
*/
  get_type(): BufferType;
/**
* @returns {BufferUsage}
*/
  get_usage(): BufferUsage;
/**
*/
  bind(): void;
/**
*/
  unbind(): void;
/**
* @returns {(BufferDataLayoutDescriptor)[]}
*/
  get_layout(): (BufferDataLayoutDescriptor)[];
/**
* @returns {number}
*/
  get_size(): number;
/**
* @returns {number}
*/
  get_element_size(): number;
/**
* @returns {WebGLBuffer}
*/
  raw(): WebGLBuffer;
}
/**
*/
export class BufferDataDescriptor {
  free(): void;
/**
* @param {ArrayBuffer} data
* @param {(BufferDataLayoutDescriptor)[]} layout
* @param {number} count
* @returns {BufferDataDescriptor}
*/
  static new(data: ArrayBuffer, layout: (BufferDataLayoutDescriptor)[], count: number): BufferDataDescriptor;
/**
* Calculate the size of one element in the buffer
* (stride) in bytes.
* @returns {number}
*/
  get_element_size(): number;
/**
* Calculate the size of the buffer in bytes.
* @returns {number}
*/
  get_size(): number;
}
/**
*/
export class BufferDataLayoutDescriptor {
  free(): void;
/**
* @param {string} name
* @param {ElementBufferType} ty
* @param {number | undefined} [instance_count]
* @returns {BufferDataLayoutDescriptor}
*/
  static new(name: string, ty: ElementBufferType, instance_count?: number): BufferDataLayoutDescriptor;
}
/**
*/
export class Camera {
  free(): void;
/**
* @param {number} width
* @param {number} height
* @returns {Camera}
*/
  static new(width: number, height: number): Camera;
/**
* @param {number} width
* @param {number} height
*/
  resize(width: number, height: number): void;
/**
* @returns {Float32Array}
*/
  get_matrix(): Float32Array;
/**
* @returns {Float32Array}
*/
  get_position(): Float32Array;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  translate(x: number, y: number, z: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  set_position(x: number, y: number, z: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  scale(x: number, y: number, z: number): void;
/**
* @returns {Float32Array}
*/
  get_scale(): Float32Array;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  set_euleur_angles(x: number, y: number, z: number): void;
/**
* @returns {Float32Array}
*/
  get_euleur_angles(): Float32Array;
/**
* @returns {Float32Array}
*/
  get_projection_view(): Float32Array;
/**
* @returns {Float32Array}
*/
  get_view_matrix(): Float32Array;
/**
* @param {number} x
* @param {number} y
* @param {number} z
* @param {number} t
*/
  lerp_rotation(x: number, y: number, z: number, t: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
* @param {number} t
*/
  lerp_position(x: number, y: number, z: number, t: number): void;
}
/**
*/
export class ComputeMaterial {
  free(): void;
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
  static new(gl: WebGL2RenderingContext, shader: Shader, varyings: (string)[]): ComputeMaterial;
/**
*/
  bind(): void;
/**
*/
  unbind(): void;
/**
* @param {Buffer} buf
* @param {Buffer} out_buf
*/
  bind_buffer(buf: Buffer, out_buf: Buffer): void;
/**
* @param {string} name
* @param {ArrayBuffer} buf
* @param {ElementBufferType} ty
*/
  set_uniform(name: string, buf: ArrayBuffer, ty: ElementBufferType): void;
/**
* @param {number} count
*/
  compute(count: number): void;
}
/**
*/
export class Engine {
  free(): void;
/**
* Create a new [engine](Engine) instance.
*
* # Arguments
*
* * `canvas` - The canvas element at where the [engine](Engine) will render.
* @param {HTMLCanvasElement} canvas
* @returns {Engine}
*/
  static new(canvas: HTMLCanvasElement): Engine;
/**
* Resize the renderer.
*/
  resize(): void;
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
  clear(r?: number, g?: number, b?: number, a?: number): void;
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
  create_buffer(ty: BufferType, usage: BufferUsage, descriptor: BufferDataDescriptor): Buffer;
/**
* Create a new Shader.
* 
* * `ty` - The type of shader.
* * `source` - The shader source.
* @param {ShaderType} ty
* @param {string} source
* @returns {Shader}
*/
  create_shader(ty: ShaderType, source: string): Shader;
/**
* Create a new Compute Material.
*
* * `shader` - The shader.
* * `varyings` - The compute shader varyings.
* @param {Shader} shader
* @param {(string)[]} varyings
* @returns {ComputeMaterial}
*/
  create_compute_material(shader: Shader, varyings: (string)[]): ComputeMaterial;
/**
* Create a new Material.
*
* * `shader` - The shader source used for the material.
* @param {Shader} shader
* @returns {Material}
*/
  create_material(shader: Shader): Material;
/**
* @param {number} width
* @param {number} height
* @returns {Camera}
*/
  create_camera(width: number, height: number): Camera;
}
/**
*/
export class Material {
  free(): void;
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
  static new(gl: WebGL2RenderingContext, shader: Shader): Material;
/**
*/
  bind(): void;
/**
*/
  unbind(): void;
/**
* @param {(Buffer)[]} buffers
* @param {Buffer} index_buf
*/
  bind_buffer(buffers: (Buffer)[], index_buf: Buffer): void;
/**
* @param {string} name
* @param {ArrayBuffer} buf
* @param {ElementBufferType} ty
*/
  set_uniform(name: string, buf: ArrayBuffer, ty: ElementBufferType): void;
/**
*/
  draw(): void;
/**
* @param {number} instances
*/
  draw_instanced(instances: number): void;
}
/**
*/
export class Shader {
  free(): void;
/**
* @param {WebGL2RenderingContext} gl
* @param {ShaderType} ty
* @param {string} source
* @returns {Shader}
*/
  static new(gl: WebGL2RenderingContext, ty: ShaderType, source: string): Shader;
/**
* Retrive the raw webgl vertex shader
* 
* @returns {WebGLShader}
*/
  raw_vertex_shader(): WebGLShader;
/**
* Retrive the raw webgl fragment shader
* 
* @returns {WebGLShader}
*/
  raw_fragment_shader(): WebGLShader;
/**
* Retrieve the shader type.
* @returns {ShaderType}
*/
  get_type(): ShaderType;
}
/**
*/
export class Transform {
  free(): void;
/**
* @returns {Transform}
*/
  static new(): Transform;
/**
* @returns {Float32Array}
*/
  get_position(): Float32Array;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  translate(x: number, y: number, z: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  set_position(x: number, y: number, z: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  scale(x: number, y: number, z: number): void;
/**
* @returns {Float32Array}
*/
  get_scale(): Float32Array;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  set_euleur_angles(x: number, y: number, z: number): void;
/**
* @returns {Float32Array}
*/
  get_euleur_angles(): Float32Array;
/**
* @returns {Float32Array}
*/
  get_matrix(): Float32Array;
}
