import { EnumPipe, EnumIndexValue } from './enum.pipe';

describe('EnumPipe', () => {
  let pipe: EnumPipe;

  beforeAll(() => {
    pipe = new EnumPipe();
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform an enum', () => {
    
    const transformed = pipe.transform(TestEnum)
    transformed.forEach((obj, idx) => {
      expect(obj.index).toBe(expectedEnum[idx].index);
      expect(obj.value).toBe(expectedEnum[idx].value);
    })
  });
});

enum TestEnum {
  THIS = 0,
  IS = 1,
  a = 2,
  TEST = 3,
  ENUM = 4,
}

const expectedEnum: EnumIndexValue[] = [
  {
    index: '0',
    value:'THIS'
  },
  {
    index: '1',
    value:'IS'
  },
  {
    index: '2',
    value:'a'
  },
  {
    index: '3',
    value:'TEST'
  },
  {
    index: '4',
    value:'ENUM'
  },
  
]