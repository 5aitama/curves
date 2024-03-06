use js_sys::ArrayBuffer;
use wasm_bindgen::prelude::*;
use web_sys::{WebGl2RenderingContext, WebGlBuffer};

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub enum ElementBufferType {
    Float32,

    Int8,
    Int16,
    Int32,

    UInt8,
    UInt16,
    UInt32,

    Mat4x4,
    Mat4x3,
    Mat4x2,

    Mat3x4,
    Mat3x3,
    Mat3x2,

    Mat2x4,
    Mat2x3,
    Mat2x2,

    Vec4,
    Vec3,
    Vec2,
}

impl ElementBufferType {
    pub fn count(&self) -> u32 {
        match self {
            ElementBufferType::Float32 => 1,
            ElementBufferType::Int8 => 1,
            ElementBufferType::Int16 => 1,
            ElementBufferType::Int32 => 1,
            ElementBufferType::UInt8 => 1,
            ElementBufferType::UInt16 => 1,
            ElementBufferType::UInt32 => 1,
            ElementBufferType::Mat4x4 => 16,
            ElementBufferType::Mat4x3 => 12,
            ElementBufferType::Mat4x2 => 8,
            ElementBufferType::Mat3x4 => 12,
            ElementBufferType::Mat3x3 => 9,
            ElementBufferType::Mat3x2 => 6,
            ElementBufferType::Mat2x4 => 8,
            ElementBufferType::Mat2x3 => 6,
            ElementBufferType::Mat2x2 => 4,
            ElementBufferType::Vec4 => 4,
            ElementBufferType::Vec3 => 3,
            ElementBufferType::Vec2 => 2,
        }
    }

    pub fn size(&self) -> i32 {
        match self {
            ElementBufferType::Float32 => 4,
            ElementBufferType::Int8 => 1,
            ElementBufferType::Int16 => 2,
            ElementBufferType::Int32 => 4,
            ElementBufferType::UInt8 => 1,
            ElementBufferType::UInt16 => 2,
            ElementBufferType::UInt32 => 4,
            ElementBufferType::Mat4x4 => 4 * 16,
            ElementBufferType::Mat4x3 => 4 * 12,
            ElementBufferType::Mat4x2 => 4 * 8,
            ElementBufferType::Mat3x4 => 4 * 12,
            ElementBufferType::Mat3x3 => 4 * 9,
            ElementBufferType::Mat3x2 => 4 * 6,
            ElementBufferType::Mat2x4 => 4 * 8,
            ElementBufferType::Mat2x3 => 4 * 6,
            ElementBufferType::Mat2x2 => 4 * 4,
            ElementBufferType::Vec4 => 4 * 4,
            ElementBufferType::Vec3 => 4 * 3,
            ElementBufferType::Vec2 => 4 * 2,
        }
    }

    pub fn ty(&self) -> u32 {
        match self {
            ElementBufferType::Float32 => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Int8    => WebGl2RenderingContext::BYTE,
            ElementBufferType::Int16   => WebGl2RenderingContext::SHORT,
            ElementBufferType::Int32   => WebGl2RenderingContext::INT,
            ElementBufferType::UInt8   => WebGl2RenderingContext::UNSIGNED_BYTE,
            ElementBufferType::UInt16  => WebGl2RenderingContext::UNSIGNED_SHORT,
            ElementBufferType::UInt32  => WebGl2RenderingContext::UNSIGNED_INT,
            ElementBufferType::Mat4x4  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat4x3  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat4x2  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat3x4  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat3x3  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat3x2  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat2x4  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat2x3  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Mat2x2  => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Vec4    => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Vec3    => WebGl2RenderingContext::FLOAT,
            ElementBufferType::Vec2    => WebGl2RenderingContext::FLOAT,
        }
    }
}

impl std::fmt::Display for ElementBufferType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self {
            ElementBufferType::Float32 => write!(f, "Float32"),
            ElementBufferType::Int8    => write!(f, "Int8"),
            ElementBufferType::Int16   => write!(f, "Int16"),
            ElementBufferType::Int32   => write!(f, "Int32"),
            ElementBufferType::UInt8   => write!(f, "UInt8"),
            ElementBufferType::UInt16  => write!(f, "UInt16"),
            ElementBufferType::UInt32  => write!(f, "UInt32"),
            ElementBufferType::Mat4x4  => write!(f, "Mat4x4"),
            ElementBufferType::Mat4x3  => write!(f, "Mat4x3"),
            ElementBufferType::Mat4x2  => write!(f, "Mat4x2 "),
            ElementBufferType::Mat3x4  => write!(f, "Mat3x4"),
            ElementBufferType::Mat3x3  => write!(f, "Mat3x3"),
            ElementBufferType::Mat3x2  => write!(f, "Mat3x2"),
            ElementBufferType::Mat2x4  => write!(f, "Mat2x4"),
            ElementBufferType::Mat2x3  => write!(f, "Mat2x3"),
            ElementBufferType::Mat2x2  => write!(f, "Mat2x2"),
            ElementBufferType::Vec4    => write!(f, "Vec4"),
            ElementBufferType::Vec3    => write!(f, "Vec3"),
            ElementBufferType::Vec2    => write!(f, "Vec2"),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum BufferType {
    Array,
    Element,
}

impl Into<u32> for BufferType {
    fn into(self) -> u32 {
        match self {
            BufferType::Array => WebGl2RenderingContext::ARRAY_BUFFER,
            BufferType::Element => WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum BufferUsage {
    Static,
    Dynamic,
}

impl Into<u32> for BufferUsage {
    fn into(self) -> u32 {
        match self {
            BufferUsage::Static => WebGl2RenderingContext::STATIC_DRAW,
            BufferUsage::Dynamic => WebGl2RenderingContext::DYNAMIC_DRAW,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct BufferDataLayoutDescriptor {
    name: String,
    ty: ElementBufferType,
    instance_count: Option<u32>,
}

impl BufferDataLayoutDescriptor {
    pub fn get_name(&self) -> String {
        self.name.clone()
    }

    pub fn get_type(&self) -> ElementBufferType {
        self.ty
    }

    pub fn get_instance_count(&self) -> Option<u32> {
        self.instance_count
    }
}

#[wasm_bindgen]
impl BufferDataLayoutDescriptor {
    pub fn new(name: String, ty: ElementBufferType, instance_count: Option<u32>) -> BufferDataLayoutDescriptor {
        Self { name, ty, instance_count }
    }
}

#[wasm_bindgen]
pub struct BufferDataDescriptor {
    data: ArrayBuffer,
    layout: Vec<BufferDataLayoutDescriptor>,
    count: u32,
}

#[wasm_bindgen]
impl BufferDataDescriptor {
    pub fn new(data: ArrayBuffer, layout: Vec<BufferDataLayoutDescriptor>, count: u32) -> BufferDataDescriptor {
        Self { data, layout, count }
    }

    /// Calculate the size of one element in the buffer
    /// (stride) in bytes.
    ///
    pub fn get_element_size(&self) -> u32 {
        self.layout.iter()
            .map(|layout| layout.ty.size())
            .sum::<i32>() as u32
    }

    /// Calculate the size of the buffer in bytes.
    ///
    pub fn get_size(&self) -> u32 {
        self.get_element_size() * self.count
    }
}

#[wasm_bindgen]
pub struct Buffer {
    gl: WebGl2RenderingContext,
    buf: WebGlBuffer,
    descriptor: BufferDataDescriptor,
    ty: BufferType,
    usage: BufferUsage,
}

#[wasm_bindgen]
impl Buffer {
    /// Create a new buffer.
    ///
    /// * `gl`          - The context.
    /// * `ty`          - The type of buffer.
    /// * `usage`       - The buffer usage.
    /// * `descriptor`  - The buffer data descriptor
    ///
    pub fn new(gl: WebGl2RenderingContext, ty: BufferType, usage: BufferUsage, descriptor: BufferDataDescriptor) -> Result<Buffer, JsValue> {
        let buf = gl.create_buffer()
            .ok_or("Failed to create buffer")?;


        gl.bind_buffer(ty.into(), Some(&buf));
        gl.buffer_data_with_array_buffer_view(ty.into(), &descriptor.data, usage.into());
        gl.bind_buffer(ty.into(), None);
        
        Ok(Self { gl, buf, descriptor, ty, usage })
    }

    pub fn get_type(&self) -> BufferType {
        self.ty
    }

    pub fn get_usage(&self) -> BufferUsage {
        self.usage
    }

    pub fn bind(&self) {
        self.gl.bind_buffer(self.ty.into(), Some(&self.buf));
    }

    pub fn unbind(&self) {
        self.gl.bind_buffer(self.ty.into(), None);
    }

    pub fn get_layout(&self) -> Vec<BufferDataLayoutDescriptor> {
        self.descriptor.layout.clone()
    }

    pub fn get_size(&self) -> u32 {
        self.descriptor.get_size()
    }

    pub fn get_element_size(&self) -> u32 {
        self.descriptor.get_element_size()
    }

    pub fn raw(&self) -> WebGlBuffer {
        self.buf.clone()
    }
}