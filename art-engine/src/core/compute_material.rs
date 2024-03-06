use js_sys::{Array, ArrayBuffer, Float32Array, Int32Array, Uint32Array};
use wasm_bindgen::prelude::*;
use web_sys::{WebGl2RenderingContext, WebGlBuffer, WebGlProgram, WebGlTransformFeedback};

use super::{buffer::{Buffer, ElementBufferType}, shader::{Shader, ShaderType}};

#[wasm_bindgen]
pub struct ComputeMaterial {
    gl: WebGl2RenderingContext,
    program: WebGlProgram,
    tfo: Option<WebGlTransformFeedback>,
    tf_buf: Option<WebGlBuffer>,
}

#[wasm_bindgen]
impl ComputeMaterial {
    /// Create a material from a shader.
    ///
    /// # Arguments
    ///
    /// * `source` - The shader source.
    ///
    pub fn new(gl: WebGl2RenderingContext, shader: &Shader, mut varyings: Vec<String>) -> Result<ComputeMaterial, JsValue> {
        if shader.get_type() != ShaderType::Compute {
            return Err("Failed to create compute material: The shader was not a compute shader !".into());
        }

        let program = gl.create_program().ok_or("Failed to create program")?;

        gl.attach_shader(&program, &shader.raw_vertex_shader());
        gl.attach_shader(&program, &shader.raw_fragment_shader());

        let arr = Array::new_with_length(varyings.len() as u32);
        
        for i in 0..varyings.len() {
            arr.set(i as u32, varyings.remove(0).into());
        }

        gl.transform_feedback_varyings(&program, &arr, WebGl2RenderingContext::INTERLEAVED_ATTRIBS);
        gl.link_program(&program);

        let success = gl
            .get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
            .is_truthy();

        if !success {
            let err = gl
                .get_program_info_log(&program)
                .ok_or("Failed to retrieve program info log")?;

            return Err(format!("Failed to compile program: {}", err).into());
        }

        Ok(Self { gl: gl.clone(), program, tfo: None, tf_buf: None })
    }

    pub fn bind(&self) {
        self.gl.use_program(Some(&self.program));
        self.gl.bind_transform_feedback(WebGl2RenderingContext::TRANSFORM_FEEDBACK, self.tfo.as_ref());
        self.gl.bind_buffer_base(WebGl2RenderingContext::TRANSFORM_FEEDBACK_BUFFER, 0, self.tf_buf.as_ref());
    }

    pub fn unbind(&self) {
        self.gl.bind_buffer_base(WebGl2RenderingContext::TRANSFORM_FEEDBACK_BUFFER, 0, None);
        self.gl.bind_transform_feedback(WebGl2RenderingContext::TRANSFORM_FEEDBACK, None);
        self.gl.use_program(None);
    }

    pub fn bind_buffer(&mut self, buf: &Buffer, out_buf: &Buffer) -> Result<(), JsValue> {
        self.gl.delete_transform_feedback(self.tfo.as_ref());

        self.tfo = Some(self.gl.create_transform_feedback()
            .ok_or("Failed to create TransformFeedback object")?);

        self.tf_buf = Some(out_buf.raw());
        self.bind();
        buf.bind();
        
        let layouts = buf.get_layout();
        
        let strides: i32 = layouts.iter().map(|layout| layout.get_type().size()).sum();
        let mut offset = 0;
        
        for layout in layouts {
            // Retrieve the attribute location from the layout name...
            let location = self.gl.get_attrib_location(&self.program, &layout.get_name());
            
            // Skip the current layout if the location was not found...
            if location == -1 { continue; }
            
            if layout.get_type().size() > 16 {
                for i in 0..layout.get_type().size() / 4 {
                    self.gl.enable_vertex_attrib_array((location + i) as u32);
                    self.gl.vertex_attrib_pointer_with_i32(
                        (location + i) as u32,
                        layout.get_type().count() as i32,
                        layout.get_type().ty(),
                        false,
                        strides,
                        offset + i * layout.get_type().size()
                    );
                }
            } else {
                self.gl.enable_vertex_attrib_array(location as u32);
                self.gl.vertex_attrib_pointer_with_i32(
                    location as u32,
                    layout.get_type().count() as i32,
                    layout.get_type().ty(),
                    false,
                    strides,
                    offset
                );
            }
            
            offset += layout.get_type().size();
        }
        
        buf.unbind();
        self.unbind();
        
        Ok(())
    }
    
    pub fn set_uniform(&self, name: &str, buf: ArrayBuffer, ty: ElementBufferType) -> Result<(), JsValue> {
        let location = self.gl.get_uniform_location(&self.program, name);
        
        if let Some(location) = location {
            self.bind();
            match ty {
                ElementBufferType::Float32 => self.gl.uniform1fv_with_f32_array(Some(&location), &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Int32   => self.gl.uniform1iv_with_i32_array(Some(&location), &Int32Array::new(&buf).to_vec()),
                ElementBufferType::UInt32  => self.gl.uniform1uiv_with_u32_array(Some(&location), &Uint32Array::new(&buf).to_vec()),
                ElementBufferType::Mat4x4  => self.gl.uniform_matrix4fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat4x3  => self.gl.uniform_matrix4x3fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat4x2  => self.gl.uniform_matrix4x2fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat3x4  => self.gl.uniform_matrix3x4fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat3x3  => self.gl.uniform_matrix3fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat3x2  => self.gl.uniform_matrix3x2fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat2x4  => self.gl.uniform_matrix2x4fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat2x3  => self.gl.uniform_matrix2x3fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Mat2x2  => self.gl.uniform_matrix2fv_with_f32_array(Some(&location), false, &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Vec4    => self.gl.uniform4fv_with_f32_array(Some(&location), &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Vec3    => self.gl.uniform3fv_with_f32_array(Some(&location), &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Vec2    => self.gl.uniform2fv_with_f32_array(Some(&location), &Float32Array::new(&buf).to_vec()),
                ElementBufferType::Int8  |
                ElementBufferType::Int16 |
                ElementBufferType::UInt8 |
                ElementBufferType::UInt16  => return Err(format!("Failed to set uniform: Type {} was not supported", ty).into()),
            }
            self.unbind();
        } else {
            // return Err(format!("Failed to set uniform: Unable to locate uniform named {} !", name).into());
        }

        Ok(())
    }

    pub fn compute(&self, count: u32) {
        if self.tf_buf.is_some() {
            self.bind();
            self.gl.begin_transform_feedback(WebGl2RenderingContext::POINTS);
            self.gl.enable(WebGl2RenderingContext::RASTERIZER_DISCARD);
            self.gl.draw_arrays(WebGl2RenderingContext::POINTS, 0, count as i32);
            self.gl.disable(WebGl2RenderingContext::RASTERIZER_DISCARD);
            self.gl.end_transform_feedback();
            self.unbind();
        }
    }
}