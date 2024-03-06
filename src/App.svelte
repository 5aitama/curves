<script lang="ts">
	import * as ArtEngine from "./assets/art-engine";
	import shaderQuad from "./assets/shaders/quad.glsl?raw";
    import { onMount } from "svelte";
    import { Circle } from "./lib/circle";
    import Slider from "./lib/Slider.svelte";

	let canvas: HTMLCanvasElement;

	const cameraViews = [
		{
			rot: { x: -180, y: 0, z: 0 },
			pos: { x: 0, y: 10, z: -40 },
		},
		{
			rot: { x: -90, y: 0, z: 0 },
			pos: { x: 0, y: 40, z: 0 },
		}
	];

	let cameraPos = {
		rot: { x: 0, y: 0, z: 0 },
		pos: { x: 0, y: 0, z: 0 },
	}

	let cameraViewState = 0;

	function switchView() {
		cameraViewState = (cameraViewState + 1) % cameraViews.length;
		cameraPos = cameraViews[cameraViewState];
	}

	onMount(() => {
		const engine = ArtEngine.Engine.new(canvas);

		const circle = new Circle(0.1);
		
		// Create the descriptor for the vertex buffer.
		const vertexBufferDescriptor = ArtEngine.BufferDataDescriptor.new(
			new Float32Array(circle.vertices), [
			ArtEngine.BufferDataLayoutDescriptor.new("inPos", ArtEngine.ElementBufferType.Vec3),
			ArtEngine.BufferDataLayoutDescriptor.new("inCol", ArtEngine.ElementBufferType.Vec3),
		], circle.element_count);
		
		// Create the vertex buffer.
		const vertexBuffer = engine.create_buffer(
			ArtEngine.BufferType.Array,
			ArtEngine.BufferUsage.Dynamic,
			vertexBufferDescriptor
		);

		const initialVertexBufferDescriptor = ArtEngine.BufferDataDescriptor.new(
			new Float32Array(circle.vertices), [
			ArtEngine.BufferDataLayoutDescriptor.new("inPos", ArtEngine.ElementBufferType.Vec3),
			ArtEngine.BufferDataLayoutDescriptor.new("inCol", ArtEngine.ElementBufferType.Vec3),
		], circle.element_count);

		// Create the initial vertex buffer.
		const initialVertexBuffer = engine.create_buffer(
			ArtEngine.BufferType.Array,
			ArtEngine.BufferUsage.Static,
			initialVertexBufferDescriptor
		);
			
		// Create the descriptor for the index buffer.
		const indexBufferDescriptor = ArtEngine.BufferDataDescriptor.new(
			new Uint8Array(circle.indices), [
			ArtEngine.BufferDataLayoutDescriptor.new("index", ArtEngine.ElementBufferType.UInt8)
		], circle.indices.length);
		
		// Create the index buffer.
		const indexBuffer = engine.create_buffer(
			ArtEngine.BufferType.Element,
			ArtEngine.BufferUsage.Static,
			indexBufferDescriptor
		);

		const arr = new Float32Array(16384 * 3);
		for (let i = 0; i < 16384; i++) {
			const x =  ((i % 128) - 64) * 0.5;
			const y = 0;
			const z = (Math.floor(i / 128) - 64) * 0.5;
			
			arr[i * 3    ] = x;
			arr[i * 3 + 1] = y;
			arr[i * 3 + 2] = z;
		}

		const positionBufferDescriptor = ArtEngine.BufferDataDescriptor.new(
			arr,
			[ArtEngine.BufferDataLayoutDescriptor.new("position", ArtEngine.ElementBufferType.Vec3, 1)],
			100
		);

		const positionBuffer = engine.create_buffer(
			ArtEngine.BufferType.Array,
			ArtEngine.BufferUsage.Static,
			positionBufferDescriptor
		);

		const shaderCompute = engine.create_shader(ArtEngine.ShaderType.Compute, shaderQuad);
		const materialCompute = engine.create_compute_material(shaderCompute, ["outPos", "outCol"]);
		materialCompute.bind_buffer(initialVertexBuffer, vertexBuffer);
		
		const shader = engine.create_shader(ArtEngine.ShaderType.Render, shaderQuad);

		// Create a material and bind the buffer created above to it.
		const material = engine.create_material(shader);
		material.bind_buffer([vertexBuffer, positionBuffer], indexBuffer);
		
		// console.log(`Vertex buffer element size: ${ vertexBuffer.get_element_size() }byte(s)`);
		// console.log(`Vertex buffer size : ${vertexBuffer.get_size()}byte(s)`);
		// console.log(`Index buffer size : ${indexBuffer.get_size()}byte(s)`);
		
		const camera = engine.create_camera(canvas.width, canvas.height);

		camera.set_euleur_angles(cameraPos.rot.x, cameraPos.rot.y, cameraPos.rot.z);
		camera.set_position(cameraPos.pos.x, cameraPos.pos.y, cameraPos.pos.z * -1);
		
		const gl = canvas.getContext("webgl2")!;
		let currentAnimationFrame = 0;
		let lastTime = 0;

		const onUpdate = (t: number) => {
			let dt = (t - lastTime) / 10000;
			lastTime = t;

			if (isNaN(dt)) {
				dt = 0;
			}
			// console.log(dt);

			// console.log(dt);

			// Ensure that the renderer will be at the right size.
			engine.resize();
			camera.resize(canvas.width, canvas.height);
			
			// Clear the renderer.
			engine.clear();

			camera.lerp_rotation(cameraPos.rot.x, cameraPos.rot.y, cameraPos.rot.z, dt * 25);
			camera.lerp_position(cameraPos.pos.x, cameraPos.pos.y, cameraPos.pos.z * -1, dt * 25);
			
			// Draw the square
			
			materialCompute.set_uniform(
				"v_matrix",
				camera.get_view_matrix(),
				ArtEngine.ElementBufferType.Mat4x4
			);
				
			materialCompute.compute(circle.element_count);
			
			material.set_uniform(
				"vp_matrix",
				camera.get_projection_view(),
				ArtEngine.ElementBufferType.Mat4x4
			);
			
			material.bind();
			material.draw_instanced(16384);
			
			currentAnimationFrame = requestAnimationFrame(onUpdate);

		}

		onUpdate(0);

		return () => {
			cancelAnimationFrame(currentAnimationFrame);
		}
		// ArtEngine.run(canvas);
	});
</script>

<main>
	<canvas bind:this={canvas} id="canvas"></canvas>
	<div class="ui">
		<div class="container">
			<div class="title">
				<h1>Settings</h1>
			</div>

			<div class="section">
				<div class="head">
					<h1>Resolution</h1>
					<p>180x180</p>
				</div>
				<Slider />
			</div>
			<button on:click={switchView}>Switch view</button>
		</div>
	</div>
</main>

<style>
	main, canvas {
		width: 100%;
		height: 100%;
	}

	canvas {
		display: block;
		z-index: 0;
	}

	.ui {
		position: absolute;
		display: flex;
		flex-direction: row;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		padding: 10px;
		box-sizing: border-box;
	}
	
	.container {
		min-width: 200px;
		height: fit-content;
		background: rgba(24, 23, 26, 0.85);
		backdrop-filter: blur(10px);
		border: 1px solid #333038;
		border-radius: 8px;

		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
	}

	.container .title {
		display: flex;
		flex-direction: row;
		padding: 10px;
		border-bottom: 1px solid #333038;
	}

	.container .title h1 {
		font-size: 1.4rem;
		margin: 0;
	}

	.section {
		display: flex;
		flex-direction: column;
		margin: 10px;
		border: 1px solid #333038;
		border-radius: 8px;
		padding: 10px 10px;
	}

	.section .head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.section .head h1 {
		margin: 0;
		font-size: 0.9rem;
	}

	.section .head p {
		margin: 0;
		font-size: 0.7rem;
	}

	button {
		display: block;
		width: fit-content;
		height: 40px;
		line-height: 20px;
		padding: 0 10px;
		border: 2px solid rgb(51, 51, 51);
		border-radius: 10px;
		background: black;
		margin: 5px;
	}

	button:hover {

	}
</style>