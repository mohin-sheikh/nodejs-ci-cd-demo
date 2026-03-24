import { Server } from 'http';
import app from '../app';

describe('Server', () => {
  let server: Server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should start server without errors', () => {
    expect(server).toBeDefined();
    expect(server.listening).toBe(true);
  });
});
