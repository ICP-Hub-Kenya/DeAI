use ic_stable_structures::{
    StableBTreeMap,
    memory_manager::{MemoryManager, MemoryId, VirtualMemory},
    DefaultMemoryImpl,
};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static MODEL_MAP: RefCell<StableBTreeMap<String, Vec<u8>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

#[ic_cdk_macros::update]
pub fn store_bytes(key: &str, bytes: Vec<u8>) {
    MODEL_MAP.with(|map| {
        map.borrow_mut().insert(key.to_string(), bytes);
    });
}

#[ic_cdk_macros::query]
pub fn bytes(key: &str) -> Vec<u8> {
    MODEL_MAP.with(|map| {
        map.borrow().get(&key.to_string()).unwrap_or_default()
    })
}

#[ic_cdk_macros::update]
pub fn clear_bytes(key: &str) {
    MODEL_MAP.with(|map| {
        map.borrow_mut().remove(&key.to_string());
    });
}

#[ic_cdk_macros::update]
pub fn append_bytes(key: &str, bytes: Vec<u8>) {
    MODEL_MAP.with(|map| {
        let mut map = map.borrow_mut();
        let mut existing = map.get(&key.to_string()).unwrap_or(Vec::new()).clone();
        existing.extend(bytes);
        map.insert(key.to_string(), existing);
    });
}
