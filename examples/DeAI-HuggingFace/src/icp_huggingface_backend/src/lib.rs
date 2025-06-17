use candle_core::{Tensor, Device, DType};
// use candle_transformers::models::codegeex4_9b::Model;
use ic_cdk::{query, init};
use candid::{CandidType, Deserialize};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager},
    DefaultMemoryImpl,
};
use std::cell::RefCell;
mod storage;
use safetensors::tensor::SafeTensors;
use crate::storage::bytes;
// use candle_core::{Tensor, Device};
// use candle_core::safetensors::SafeTensors;
use std::path::Path;
use candle_transformers::models::parler_tts::{Model as ParlerTTSModel, Config as ParlerTTSConfig};
//  use candle_transformers::quantized_var_builder::VarBuilder; --use this if your modle is in the gguf fomart
use candle_nn::VarBuilder;
use candle_transformers::generation::LogitsProcessor;


const WASI_MEMORY_ID: MemoryId = MemoryId::new(10);

// Files in the WASI filesystem (in the stable memory) that store the models.
const PARLER_TEXT_TO_SPEECH_MODEL: &str = "model.safetensors";


thread_local! {

    static PARLER_TTS_MODEL: RefCell<Option<ParlerTTSModel>> = RefCell::new(None);
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
}

#[ic_cdk::update]
fn clear_openai_model_bytes() {
    storage::clear_bytes(PARLER_TEXT_TO_SPEECH_MODEL);
}

//Struct to hold the audio input. 
#[derive(CandidType, Deserialize)]
pub struct AudioInput {
    pub samples: Vec<f32>,
    pub sample_rate: u32,
}


/// Appends the given chunk to the face detection model file.
/// This is used for incremental chunk uploading of large files.
#[ic_cdk::update]
fn append_openai_model_bytes(bytes: Vec<u8>) {
    storage::append_bytes(PARLER_TEXT_TO_SPEECH_MODEL, bytes);
}


/// Once the model files have been incrementally uploaded,
/// this function loads them into in-memory models.
#[ic_cdk::update]
fn setup_parler_tts_model() -> Result<(), String> {
    let device = Device::Cpu;

    // Load safetensors
    let model_bytes = crate::storage::bytes("parler_tts_model.safetensors");
    let safetensors = SafeTensors::deserialize(&model_bytes)
        .map_err(|e| format!("Failed to parse safetensors: {e}"))?;

    // Create VarBuilder
    let model_path = Path::new("parler_tts_model.safetensors");
    let paths = &[model_path];
    let vb = unsafe {
        VarBuilder::from_mmaped_safetensors(paths, DType::F32, &device)
            .map_err(|e| format!("Failed to load weights: {e}"))?
    };

    // Load config
    let config_bytes = crate::storage::bytes("parler_tts_config.json");
    let config: ParlerTTSConfig = serde_json::from_slice(&config_bytes)
        .map_err(|e| format!("Failed to parse config: {e}"))?;

    // Initialize model
    let model = ParlerTTSModel::new(&config, vb)
        .map_err(|e| format!("Model init failed: {e}"))?;

    PARLER_TTS_MODEL.with(|slot| {
        *slot.borrow_mut() = Some(model);
    });

    Ok(())
}


// 3. Frontend-facing TTS function
#[ic_cdk::update]
fn text_to_speech(text: String) -> Result<Vec<f32>, String> {
    let device = Device::Cpu;

    PARLER_TTS_MODEL.with(|slot| {
        let mut slot = slot.borrow_mut();
        let model = slot.as_mut().ok_or("TTS model not loaded".to_string())?;
    
    // Get model
    // let model: &mut candle_transformers::models::parler_tts::Model = PARLER_TTS_MODEL.with(|slot| {
    //     slot.borrow_mut().as_mut().ok_or("TTS model not loaded".to_string())
    // })?;
        let model = slot.as_mut().ok_or("TTS model not loaded".to_string())?;

        // Convert text to tensor
        let text_tensor = Tensor::from_vec(
            text.into_bytes(),
            (1,), 
            &device
        ).map_err(|e| format!("Tensor creation failed: {e}"))?;


        // Generate speech 
        let speaker_embedding = Tensor::zeros(&[1, 1024], DType::F32, &device)
        .map_err(|e| format!("Speaker embedding tensor failed: {e}"))?;

        // Logits processor 
        let seed = 42;
        let temperature = Some(1.0);
        let top_p = Some(0.9);

        let logits_processor = LogitsProcessor::new(seed, temperature, top_p);
        // let logits_processor = LogitsProcessor::default();

        // Max output tokens 
        let max_tokens = 300;

        let audio_tensor = model.generate(
            &text_tensor,
            &speaker_embedding,
            logits_processor,
            max_tokens,
        ).map_err(|e| format!("Generation failed: {e}"))?;


        // Convert tensor to Vec<f32>
        let audio_samples: Vec<f32> = audio_tensor
            .flatten_all()
            .map_err(|e| format!("Flatten failed: {e}"))?
            .to_vec1()
            .map_err(|e| format!("Conversion failed: {e}"))?;

        Ok(audio_samples)
        })
    
}

#[ic_cdk::init]
fn init() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

fn load_model_bytes_from_storage() -> Vec<u8> {
    crate::storage::bytes("model.safetensors") 
}



// #[ic_cdk::update]
// fn run_whisper_on_input(features: Vec<f32>) -> Result<Vec<u32>, String> {
//     let input = Tensor::from_vec(features, (1, 80, 3000), &Device::Cpu)
//         .map_err(|e| format!("Tensor creation failed: {}", e))?;

//     WHISPER_MODEL.with(|slot| {
//         let mut model = slot.borrow_mut();
//         let model: &mut candle_transformers::models::whisper::Model = model.as_mut().ok_or("Model not loaded".to_string())?;
//         let _output = model.forward(&input, 1)
//             .map_err(|e| format!("Inference failed: {}", e))?;

//         Ok(vec![0]) //dummy output
//     })
// }



ic_cdk::export_candid!();