// Types.mo
import IC "ic:aaaaa-aa";

module {
  public type TransformArgs = {
    response : IC.http_request_result;
    context : Blob;
  };
  
  public type TransformContext = {
    function : shared query TransformArgs -> async IC.http_request_result;
    context : Blob;
  };
}