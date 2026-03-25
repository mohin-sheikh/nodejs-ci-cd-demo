describe('Basic Tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should have a valid environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
