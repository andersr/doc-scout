export interface DataRequest {
  internal?: boolean;
  request: Request;
  require?: boolean; // include all ids and possibly sensitive data not suited for exposing to the client
}
