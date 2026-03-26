declare module 'supertest' {
  import { Server } from 'http';
  import { Application } from 'express';

  interface Response {
    body: Record<string, unknown> | string | Buffer;
    status: number;
    text: string;
    headers: Record<string, string>;
  }

  interface Test extends Promise<Response> {
    expect(status: number): this;
    expect(body: Record<string, unknown> | string | Buffer): this;
    expect(field: string, val: string): this;
    end(cb: (err: Error | null, res: Response) => void): this;
    set(headers: Record<string, string>): this;
  }

  interface SuperTest {
    get(url: string): Test;
    post(url: string): Test;
    put(url: string): Test;
    delete(url: string): Test;
    patch(url: string): Test;
  }

  function request(app: Application | Server): SuperTest;
  export default request;
}
