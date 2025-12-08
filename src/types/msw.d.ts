declare module 'msw' {
  export const http: any;
  export const HttpResponse: any;
  export const delay: any;
  export const rest: any;
}
declare module 'msw/node' {
  export function setupServer(...handlers: any[]): any;
}
declare module 'msw/native' {
  export function setupServer(...handlers: any[]): any;
}
