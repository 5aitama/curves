use js_sys::{ArrayBuffer, Float32Array, Int32Array, Uint32Array};
use wasm_bindgen::prelude::*;
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlVertexArrayObject};

use super::{buffer::{Buffer, ElementBufferType}, shader::Shader};

#[wasm_bindgen]
pub struct Material {
    gl: WebGl2RenderingContext,
    program: WebGlProgram,
    vao: Option<WebGlVertexArrayObject>,
    draw_type: Option<ElementBufferType>,
    draw_count: u32,
}

#[wasm_bindgen]
impl Material {
    /// Create a material from a shader.
    ///
    /// # Arguments
    ///
    /// * `source` - The shader source.
    ///
    pub fn new(gl: WebGl2RenderingContext, shader: &Shader) -> Result<Material, JsValue> {

        let program = gl.create_program().ok_or("Failed to create program")?;

        gl.attach_shader(&program, &shader.raw_vertex_shader());
        gl.attach_shader(&program, &shader.raw_fragment_shader());
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

        Ok(Self { gl: gl.clone(), program, vao: None, draw_type: None, draw_count: 0 })
    }

    pub fn bind(&self) {
        self.gl.use_program(Some(&self.program));
        self.gl.bind_vertex_array(self.vao.as_ref());
    }

    pub fn unbind(&self) {
        self.gl.bind_vertex_array(None);
        self.gl.use_program(None);
    }

    pub fn bind_buffer(&mut self, buffers: Vec<Buffer>, index_buf: &Buffer) -> Result<(), JsValue> {
        self.gl.delete_vertex_array(self.vao.as_ref());

        self.vao = Some(self.gl.create_vertex_array()
            .ok_or("Failed to create vertex array object")?);

        self.draw_count = index_buf.get_size() / index_buf.get_element_size();
        self.draw_type = index_buf.get_layout()
            .first()
            .map(|layout| layout.get_type());

        self.bind();
        for buf in buffers {
            buf.bind();
            
            let layouts = buf.get_layout();
            
            let strides: i32 = layouts.iter().map(|layout| layout.get_type().size()).sum();
            let mut offset = 0;
            
            for layout in layouts {
                // Retrieve the attribute location from the layout name...
                let location = self.gl.get_attrib_location(&self.program, &layout.get_name());
                
                // Skip the current layout if the location was not found...
                if location == -1 { continue; }
                
                if let Some(instance_count) = layout.get_instance_count() {
                    for j in 0..instance_count {
                        if layout.get_type().size() > 16 {
                            for i in 0..layout.get_type().size() / 4 {
                                self.gl.enable_vertex_attrib_array((location + i) as u32);
                                self.gl.vertex_attrib_pointer_with_i32(
                                    (location + i + j as i32) as u32,
                                    layout.get_type().count() as i32,
                                    layout.get_type().ty(),
                                    false,
                                    strides,
                                    offset + (i + j as i32) * layout.get_type().size()
                                );
                            }
                        } else {
                            self.gl.enable_vertex_attrib_array(location as u32);
                            self.gl.vertex_attrib_pointer_with_i32(
                                (location + j as i32) as u32,
                                layout.get_type().count() as i32,
                                layout.get_type().ty(),
                                false,
                                strides,
                                offset
                            );
                        }

                        self.gl.vertex_attrib_divisor(location as u32, 1);
                        offset += layout.get_type().size();
                    }
                } else {
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
            }
            
            buf.unbind();
        }
        index_buf.bind();

        self.unbind();
        index_buf.unbind();
        
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

    pub fn draw(&self) {
        if let Some(draw_type) = self.draw_type {
            self.bind();
            self.gl.draw_elements_with_i32(WebGl2RenderingContext::TRIANGLES, self.draw_count as i32, draw_type.ty(), 0);
            self.unbind();
        }
    }

    pub fn draw_instanced(&self, instances: u32) {
        if let Some(draw_type) = self.draw_type {
            self.bind();
            self.gl.draw_elements_instanced_with_i32(WebGl2RenderingContext::TRIANGLES, self.draw_count as i32, draw_type.ty(), 0, instances as i32);
            self.unbind();
        }
    }
}