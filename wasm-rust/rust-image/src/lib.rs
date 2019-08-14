
use futures::Future;
use std::io::Cursor;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::{future_to_promise,JsFuture};

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (web_sys::console::log_1(&format!($($t)*).into()))
}

#[wasm_bindgen]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct WorkingImage {
    fut: Box<Future<Item = ImageInfo, Error = JsValue>>
}

struct ImageInfo {
    image: image::DynamicImage,
    headers: web_sys::Headers,
    format: image::ImageFormat,
}

#[wasm_bindgen]
impl WorkingImage {
    #[wasm_bindgen(constructor)]
    pub fn new(url: &str) -> WorkingImage {
        // Start fetch
        let global = js_sys::global().unchecked_into::<web_sys::WorkerGlobalScope>();
        let resp_promise = global.fetch_with_str(url);
        let fut = Box::new(JsFuture::from(resp_promise)
            // Read buffer if response is OK
            .and_then(|resp_val| {
                let resp: web_sys::Response = resp_val.dyn_into().unwrap();
                if !resp.ok() {
                    // Just throw the response on failure
                    return Err(JsValue::from(resp));
                }
                Ok((resp.headers(), resp.array_buffer().unwrap()))
            })
            // Extract buffer from promise
            .and_then(move |(headers, buf_promise)| {
                JsFuture::from(buf_promise).map(move |buf_val| { (headers, buf_val) })
            })
            // Copy buffer to byte array and load image
            .and_then(move |(headers, buf)| {
                let uint8_arr = js_sys::Uint8Array::new(&buf);
                let mut bytes = vec![0; uint8_arr.length() as usize];
                uint8_arr.copy_to(&mut bytes);
                let format = image::guess_format(&bytes).map_err(err_img_to_js)?;
                Ok(ImageInfo {
                    image: image::load_from_memory_with_format(&bytes, format).map_err(err_img_to_js)?,
                    headers: headers,
                    format: format,
                })
            }));
        WorkingImage { fut: fut }
    }

    pub fn resize(self, w: u32, h: u32, exact: bool) -> WorkingImage {
        WorkingImage {
            fut: Box::new(self.fut.map(move |info| {
                ImageInfo {
                    image: if exact {
                        info.image.resize_exact(w, h, image::FilterType::Lanczos3)
                    } else {
                        info.image.resize(w, h, image::FilterType::Lanczos3)
                    },
                    ..info
                }
            })),
        }
    }

    pub fn build(self) -> js_sys::Promise {
        future_to_promise(
            self.fut.and_then(move |info| {
                // We'll use the same headers, but remove length
                let headers = web_sys::Headers::new_with_headers(&info.headers).unwrap();
                headers.delete("Content-Length").unwrap();
                // Write to a buffer
                let mut buf = Cursor::new(Vec::new());
                info.image.write_to(&mut buf, info.format).map_err(err_img_to_js)?;
                Ok((headers, buf))
            })
            .and_then(|(headers, buf)| {
                // Build the response
                let body = js_sys::Uint8Array::from(buf.get_ref().as_slice());
                let resp = web_sys::Response::new_with_opt_buffer_source_and_init(
                    Some(&body), web_sys::ResponseInit::new().headers(&headers))?;
                Ok(JsValue::from(resp))
            })
        )
    }
}

fn err_img_to_js(i: image::ImageError) -> JsValue {
    JsValue::from(js_sys::Error::new(&format!("Image error: {}", i)))
}