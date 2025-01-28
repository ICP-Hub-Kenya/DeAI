use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, TransformArgs, 
    TransformContext, HttpResponse, TransformFunc
};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct CodeReviewRequest {
    code: String,
}

#[ic_cdk::update]
async fn review_code(code: String) -> String {
    let supabase_url = "https://<PROJECT_ID>.supabase.co/functions/v1/<FUNCTION_NAME>";

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "Idempotency-Key".to_string(),
            value: format!("review-{}", ic_cdk::api::time()), 
        },
    ];

    let request_body = json!({
        "code": code
    });

    let request = CanisterHttpRequestArgument {
        url: supabase_url.to_string(),
        method: HttpMethod::POST,
        body: Some(request_body.to_string().into_bytes()),
        max_response_bytes: None,
        transform: Some(TransformContext {
            function: TransformFunc(candid::Func {
                principal: ic_cdk::api::id(),
                method: "transform".to_string(),
            }),
            context: vec![],
        }),        
        headers: request_headers,
    };

    let cycles: u128 = 2_000_000_000_000;

    match http_request(request, cycles).await {
        Ok((response,)) => {
            String::from_utf8(response.body)
                .unwrap_or_else(|_| "Error decoding response".to_string())
        }
        Err((r, m)) => {
            format!("Failed to review code. Error: {:?}, Message: {}", r, m)
        }        
    }
}

#[ic_cdk::update]
async fn generate_code(prompt: String) -> String {
    let supabase_url = "https://<PROJECT_ID>.supabase.co/functions/v1/<FUNCTION_NAME>";

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "Idempotency-Key".to_string(),
            value: format!("generate-{}", ic_cdk::api::time()), 
        },
    ];

    let request_body = json!({
        "prompt": prompt
    });

    let request = CanisterHttpRequestArgument {
        url: supabase_url.to_string(),
        method: HttpMethod::POST,
        body: Some(request_body.to_string().into_bytes()),
        max_response_bytes: None,
        transform: Some(TransformContext {
            function: TransformFunc(candid::Func {
                principal: ic_cdk::api::id(),
                method: "transform".to_string(),
            }),
            context: vec![],
        }),
        headers: request_headers,
    };

    let cycles: u128 = 2_000_000_000_000;

    match http_request(request, cycles).await {
        Ok((response,)) => {
            String::from_utf8(response.body)
                .unwrap_or_else(|_| "Error decoding response".to_string())
        }
        Err((r, m)) => {
            format!("Failed to generate code. Error: {:?}, Message: {}", r, m)
        }
    }
}

#[ic_cdk::query]
fn transform(args: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: args.response.status,
        headers: vec![HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        }],
        body: args.response.body,
    }
}

ic_cdk::export_candid!();