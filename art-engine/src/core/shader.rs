use wasm_bindgen::prelude::*;
use web_sys::{WebGl2RenderingContext, WebGlShader};

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShaderType {
    Render,
    Compute,
}

#[wasm_bindgen]
pub struct Shader {
    v_shader: WebGlShader,
    f_shader: WebGlShader,
    ty: ShaderType,
}

#[wasm_bindgen]
impl Shader {
    pub fn new(gl: WebGl2RenderingContext, ty: ShaderType, source: &str) -> Result<Shader, JsValue> {

        let (v_src, f_src) = match ty {
            ShaderType::Render => (
                "#version 300 es\n#define VSHADER\n".to_string() + source,
                "#version 300 es\n#define FSHADER\n".to_string() + source,
            ),

            ShaderType::Compute => (
                "#version 300 es\n#define CSHADER\n".to_string() + source,
                "#version 300 es\nprecision highp float;\nvoid main() {}".to_string(),
            )
        };

        let (v_shader, f_shader) = (
            gl.create_shader(WebGl2RenderingContext::VERTEX_SHADER)
                .ok_or("Failed to create vertex shader !")?,

            gl.create_shader(WebGl2RenderingContext::FRAGMENT_SHADER)
                .ok_or("Failed to create fragment shader")?,
        );

        Self::compile_shader(&gl, &v_shader, &v_src)?;
        Self::compile_shader(&gl, &f_shader, &f_src)?;

        Ok(Self { v_shader, f_shader, ty })
    }

    fn compile_shader(gl: &WebGl2RenderingContext, shader: &WebGlShader, source: &str) -> Result<(), JsValue> {
        gl.shader_source(shader, source);
        gl.compile_shader(shader);

        let success = gl
            .get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS)
            .is_truthy();

        if !success {
            let err = gl
                .get_shader_info_log(&shader)
                .ok_or("Failed to retrieve shader info log")?;

            return Err(
                format!("Failed to compile shader: {}", err).into(),
            );
        }

        Ok(())
    }

    /// Retrive the raw webgl vertex shader
    /// 
    pub fn raw_vertex_shader(&self) -> WebGlShader {
        self.v_shader.clone()
    }

    /// Retrive the raw webgl fragment shader
    /// 
    pub fn raw_fragment_shader(&self) -> WebGlShader {
        self.f_shader.clone()
    }

    /// Retrieve the shader type.
    ///
    pub fn get_type(&self) -> ShaderType {
        self.ty
    }
}
