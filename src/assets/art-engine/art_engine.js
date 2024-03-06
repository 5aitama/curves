import * as wasm from "./art_engine_bg.wasm";
import { __wbg_set_wasm } from "./art_engine_bg.js";
__wbg_set_wasm(wasm);
export * from "./art_engine_bg.js";
