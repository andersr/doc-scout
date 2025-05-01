export interface DataRequest {
  request: Request;
  require?: boolean;
  internal?: boolean; // include all ids and possibly sensitive data not suited for exposing to the client
}
