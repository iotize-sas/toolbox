import { RegisterPipe } from './register.pipe';

describe('RegisterPipe', () => {

  let pipe: RegisterPipe;

  beforeAll(() => {
    pipe = new RegisterPipe();
  });
  
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should display as decimal', () => {
    expect(pipe.transform(0x1234, 'DEC')).toBe("4660");
  });

  it('should display as hex string', () => {
    expect(pipe.transform(0x1234, 'HEX')).toBe("0x1234");
    expect(pipe.transform(0x123456, 'HEX')).toBe("0x123456");
  });

  it('should display at least 4 digits in HEX mode', () => {
    expect(pipe.transform(0x34, 'HEX')).toBe("0x0034");
  });

});
