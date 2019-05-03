import { ModbusDataPipe } from './modbusData.pipe';

describe('EnumPipe', () => {
  it('create an instance', () => {
    const pipe = new ModbusDataPipe();
    expect(pipe).toBeTruthy();
  });
});
