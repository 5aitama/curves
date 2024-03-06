pub mod core;
use js_sys::*;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, WebGl2RenderingContext};

use crate::core::{buffer::{Buffer, BufferDataDescriptor, BufferType, BufferUsage}, compute_material::ComputeMaterial, material::Material, shader::{Shader, ShaderType}};

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Retrieve the [window](web_sys::Window)
fn window() -> web_sys::Window {
    web_sys::window().expect("no global `window` exists")
}

/// Request an animation frame.
///
/// # Arguments
///
/// * `func` - The callback function.
///
fn request_animation_frame(func: &Closure<dyn FnMut(u32)>) {
    window()
        .request_animation_frame(func.as_ref().unchecked_ref())
        .expect("should register `requestAnimationFrame` OK");
}

#[wasm_bindgen]
pub struct Engine {
    gl: WebGl2RenderingContext,
}

#[wasm_bindgen]
impl Engine {
    /// Create a new [engine](Engine) instance.
    ///
    /// # Arguments
    ///
    /// * `canvas` - The canvas element at where the [engine](Engine) will render.
    ///
    pub fn new(canvas: HtmlCanvasElement) -> Result<Engine, JsValue> {
        let ctx = canvas.get_context("webgl2")?.unwrap();
        let gl = ctx.dyn_into::<WebGl2RenderingContext>()?;

        let canvas = gl.canvas().unwrap().dyn_into::<HtmlCanvasElement>().unwrap();

        Ok(Self { gl })
    }

    /// Resize the renderer.
    ///
    pub fn resize(&mut self) -> Result<(), JsValue> {
        let canvas = self.gl.canvas()
            .ok_or("Failed to resize the renderer: Failed to retrieve the canvas")?
            .dyn_into::<HtmlCanvasElement>()
            .unwrap();

        let w = (canvas.client_width() as f64 * window().device_pixel_ratio()) as u32;
        let h = (canvas.client_height() as f64 * window().device_pixel_ratio()) as u32;

        canvas.set_width(w);
        canvas.set_height(h);

        self.gl.viewport(0, 0, canvas.width() as i32, canvas.height() as i32);

        Ok(())
    }

    /// Clear the renderer
    ///
    /// # Arguments
    /// 
    /// * `r` - The red color channel *(`0.0` by default)*
    /// * `g` - The green color channel *(`0.0` by default)*
    /// * `b` - The blue color channel *(`0.0` by default)*
    /// * `a` - The alpha color channel *(`1.0` by default)*
    ///
    pub fn clear(&self, r: Option<f32>, g: Option<f32>, b: Option<f32>, a: Option<f32>) {
        self.gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT | WebGl2RenderingContext::DEPTH_BUFFER_BIT);
        self.gl.clear_color(r.unwrap_or(0.0), g.unwrap_or(0.0), b.unwrap_or(0.0), a.unwrap_or(1.0))
    }

    /// Create a new Buffer.
    ///
    /// * `ty` - The type of buffer.
    /// * `usage` - The usage of the buffer.
    /// * `descriptor` - The data descriptor of the buffer.
    ///
    pub fn create_buffer(&self, ty: BufferType, usage: BufferUsage, descriptor: BufferDataDescriptor) -> Result<Buffer, JsValue> {
        Ok(Buffer::new(self.gl.clone(), ty, usage, descriptor)?)
    }

    /// Create a new Shader.
    /// 
    /// * `ty` - The type of shader.
    /// * `source` - The shader source.
    ///
    pub fn create_shader(&self, ty: ShaderType, source: &str) -> Result<Shader, JsValue> {
        Ok(Shader::new(self.gl.clone(), ty, source)?)
    }

    /// Create a new Compute Material.
    ///
    /// * `shader` - The shader.
    /// * `varyings` - The compute shader varyings.
    ///
    pub fn create_compute_material(&self, shader: &Shader, varyings: Vec<String>) -> Result<ComputeMaterial, JsValue> {
        Ok(ComputeMaterial::new(self.gl.clone(), shader, varyings)?)
    }

    /// Create a new Material.
    ///
    /// * `shader` - The shader source used for the material.
    ///
    pub fn create_material(&self, shader: &Shader) -> Result<Material, JsValue> {
        Ok(Material::new(self.gl.clone(), shader)?)
    }

    pub fn create_camera(&self, width: u32, height: u32) -> Camera {
        Camera::new(width, height)
    }
}

#[wasm_bindgen]
pub struct Transform {
    t: nalgebra::Translation3<f32>,
    r: nalgebra::Rotation3<f32>,
    s: nalgebra::Scale3<f32>,
}

#[wasm_bindgen]
impl Transform {
    pub fn new() -> Self {
        Self {
            t: nalgebra::Translation3::identity(),
            r: nalgebra::Rotation3::identity(),
            s: nalgebra::Scale3::identity(),
        }
    }

    pub fn get_position(&self) -> Vec<f32> {
        vec![self.t.x, self.t.y, self.t.z]
    }

    pub fn translate(&mut self, x: f32, y: f32, z: f32) {
        self.t = self.t * nalgebra::Translation3::new(x, y, z);
    }

    pub fn set_position(&mut self, x: f32, y: f32, z: f32) {
        self.t = nalgebra::Translation3::new(x, y, z);
    }

    pub fn scale(&mut self, x: f32, y: f32, z: f32) {
        self.s = self.s * nalgebra::Scale3::new(x, y, z);
    }

    pub fn get_scale(&self) -> Vec<f32> {
        vec![self.s.x, self.s.y, self.s.z]
    }

    pub fn set_euleur_angles(&mut self, x: f32, y: f32, z: f32) {
        self.r = self.r * nalgebra::Rotation3::from_euler_angles(x.to_radians(), y.to_radians(), z.to_radians());
    }

    pub fn get_euleur_angles(&self) -> Vec<f32> {
        let (x, y, z) = self.r.euler_angles();
        vec![x.to_degrees(), y.to_degrees(), z.to_degrees()]
    }

    pub fn get_matrix(&self) -> Vec<f32> {
        let t = nalgebra::Matrix4::<f32>::from(self.t);
        let r = nalgebra::Matrix4::<f32>::from(self.r);
        let s = nalgebra::Matrix4::<f32>::from(self.s);

        (s * r * t).as_slice().to_vec()
    }
}

#[wasm_bindgen]
pub struct Camera {
    matrix: nalgebra::Perspective3<f32>,
    t: nalgebra::Translation3<f32>,
    r: nalgebra::Rotation3<f32>,
    s: nalgebra::Scale3<f32>,
}

#[wasm_bindgen]
impl Camera {
    pub fn new(width: u32, height: u32) -> Camera {
        let aspect = width as f32 / height as f32;
        let fov = 45f32;

        Self {
            matrix: nalgebra::Perspective3::new(aspect, fov, 0.1, 1000.0),
            t: nalgebra::Translation3::identity(),
            r: nalgebra::Rotation3::identity(),
            s: nalgebra::Scale3::identity(),
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        let aspect = width as f32 / height as f32;
        self.matrix.set_aspect(aspect);
    }

    pub fn get_matrix(&self) -> Vec<f32> {
        self.matrix.as_matrix().as_slice().to_vec()
    }

    pub fn get_position(&self) -> Vec<f32> {
        vec![self.t.x, self.t.y, self.t.z]
    }

    pub fn translate(&mut self, x: f32, y: f32, z: f32) {
        self.t = self.t * nalgebra::Translation3::new(x, y, z);
    }

    pub fn set_position(&mut self, x: f32, y: f32, z: f32) {
        self.t = nalgebra::Translation3::new(x, y, z);
    }

    pub fn scale(&mut self, x: f32, y: f32, z: f32) {
        self.s = self.s * nalgebra::Scale3::new(x, y, z);
    }

    pub fn get_scale(&self) -> Vec<f32> {
        vec![self.s.x, self.s.y, self.s.z]
    }

    pub fn set_euleur_angles(&mut self, x: f32, y: f32, z: f32) {
        self.r = self.r * nalgebra::Rotation3::from_euler_angles(x.to_radians(), y.to_radians(), z.to_radians());
    }

    pub fn get_euleur_angles(&self) -> Vec<f32> {
        let (x, y, z) = self.r.euler_angles();
        vec![x.to_degrees(), y.to_degrees(), z.to_degrees()]
    }

    pub fn get_projection_view(&self) -> Vec<f32> {
        let t = nalgebra::Matrix4::<f32>::from(self.t);
        let r = nalgebra::Matrix4::<f32>::from(self.r);
        let s = nalgebra::Matrix4::<f32>::from(self.s);

        (self.matrix.as_matrix() * (s * r * t)).as_slice().to_vec()
    }

    pub fn get_view_matrix(&self) -> Vec<f32> {
        let t = nalgebra::Matrix4::<f32>::from(self.t);
        let r = nalgebra::Matrix4::<f32>::from(self.r);
        let s = nalgebra::Matrix4::<f32>::from(self.s);

        (s * r * t).as_slice().to_vec()
    }

    pub fn lerp_rotation(&mut self, x: f32, y: f32, z: f32, t: f32) {
        let r = nalgebra::Rotation3::from_euler_angles(x.to_radians(), y.to_radians(), z.to_radians());
        self.r = self.r.slerp(&r, t);
    }

    pub fn lerp_position(&mut self, x: f32, y: f32, z: f32, t: f32) {
        let p = nalgebra::Translation3::new(x, y, z);
        self.t.vector = self.t.vector.lerp(&p.vector, t);
    }
}

#[wasm_bindgen]
pub fn run(canvas: HtmlCanvasElement) -> Result<(), JsValue> {
    let func = Rc::new(RefCell::new(None));
    let func_clone = func.clone();

    let ctx = canvas.get_context("webgl2")?.unwrap();
    let gl = ctx.dyn_into::<WebGl2RenderingContext>().unwrap();
    gl.enable(WebGl2RenderingContext::DEPTH_TEST);

    let mut last_time = 0u32;

    *func_clone.borrow_mut() = Some(Closure::new(move |time: u32| {
        // Calculate the delta time...
        let dt = time - last_time;
        last_time = time;

        // log(&format!("delta time: {}ms", dt));

        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT | WebGl2RenderingContext::DEPTH_BUFFER_BIT);
        gl.clear_color(0.0, 0.0, 0.0, 1.0);
        request_animation_frame(func.borrow().as_ref().unwrap());
    }));

    request_animation_frame(func_clone.borrow().as_ref().unwrap());

    Ok(())
}
