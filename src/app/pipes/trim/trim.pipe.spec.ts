import { TrimPipe } from './trim.pipe';

describe('TrimPipe', () => {
  let pipe: TrimPipe;

  beforeAll(() => {
    pipe = new TrimPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should not change value if no character to trim is provided', () => {
    const testedString = "___this is a test  ";

    expect(pipe.transform(testedString)).toBe(testedString);
  });

  it('should trim away spaces', () => {
    expect(pipe.transform("___this is a test  ", " ")).toBe("___this is a test");
    expect(pipe.transform("    this is a test  ", " ")).toBe("this is a test");
    expect(pipe.transform("this is a test", " ")).toBe("this is a test");
  });

  it('should trim away underscores', () => {
    expect(pipe.transform("___this is a test  ", "_")).toBe("this is a test  ");
    expect(pipe.transform("___this is a test___", "_")).toBe("this is a test");
    expect(pipe.transform("this is a test", "_")).toBe("this is a test");
  });
});
