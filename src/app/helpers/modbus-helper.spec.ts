import { ModbusReadAnswer, ModbusConfig, DisplayOptions, ByteOrder, DataDisplay } from "./modbus-helper";
import { ModbusOptions, VariableFormat } from "@iotize/device-client.js/device/model";
import { MockFactory } from 'tests/mocks';

describe("ModbusConfig", () => {
    it("should create an instance", () => {
        const instance = new ModbusConfig(MOCK_MODBUS_OPTIONS, MOCK_DISPLAY_OPTIONS, 1000);
        expect(instance).toBeTruthy();
    });

    it("should return true on isEqual when comparing config with the same parameters", () => {
        //except period
        const instance1 = new ModbusConfig(MOCK_MODBUS_OPTIONS, MOCK_DISPLAY_OPTIONS, 1000);
        const instance2 = new ModbusConfig(MOCK_MODBUS_OPTIONS, MOCK_DISPLAY_OPTIONS, 100);
        expect(instance1.isEqual(instance2)).toBe(true);
    });

    it("should return false on isEqual when comparing config with different parameters", () => {
        
        const instance1 = new ModbusConfig(MOCK_MODBUS_OPTIONS, MOCK_DISPLAY_OPTIONS);

        //create options, only address change
        let differentOptions = Object.assign({}, MOCK_MODBUS_OPTIONS);
        differentOptions.address = MockFactory.getRandNumber(0, 0xFFFF, instance1.address);
        let instance2 = new ModbusConfig(differentOptions, MOCK_DISPLAY_OPTIONS);
        expect(instance1.isEqual(instance2)).toBe(false);

        //reset options only slave changes
        differentOptions = Object.assign({}, MOCK_MODBUS_OPTIONS);
        differentOptions.slave = MockFactory.getRandNumber(0, 0xFFFF, instance1.slave);
        instance2 = new ModbusConfig(differentOptions, MOCK_DISPLAY_OPTIONS);
        expect(instance1.isEqual(instance2)).toBe(false);

        //reset options only format changes
        differentOptions = Object.assign({}, MOCK_MODBUS_OPTIONS);
        differentOptions.format = MockFactory.getRandFromEnum(VariableFormat, instance1.format);
        instance2 = new ModbusConfig(differentOptions, MOCK_DISPLAY_OPTIONS);
        expect(instance1.isEqual(instance2)).toBe(false);

        //reset options only length changes
        differentOptions = Object.assign({}, MOCK_MODBUS_OPTIONS);
        differentOptions.length = MockFactory.getRandNumber(0, 0xFF, instance1.length);
        instance2 = new ModbusConfig(differentOptions, MOCK_DISPLAY_OPTIONS);
        expect(instance1.isEqual(instance2)).toBe(false);

        //reset options only objectType changes
        differentOptions = Object.assign({}, MOCK_MODBUS_OPTIONS);
        differentOptions.objectType = MockFactory.getRandFromEnum(ModbusOptions.ObjectType, instance1.objectType);
        instance2 = new ModbusConfig(differentOptions, MOCK_DISPLAY_OPTIONS);
        expect(instance1.isEqual(instance2)).toBe(false);

        //create display options
        let differentDisplayOptions = Object.assign({}, MOCK_DISPLAY_OPTIONS);
        differentDisplayOptions.byteOrder = MockFactory.getRandFromEnum(ByteOrder, MOCK_DISPLAY_OPTIONS.byteOrder);
        instance2 = new ModbusConfig(MOCK_MODBUS_OPTIONS, differentDisplayOptions);
        expect(instance1.isEqual(instance2)).toBe(false);

        //reset options
        differentDisplayOptions = Object.assign({}, MOCK_DISPLAY_OPTIONS);
        differentDisplayOptions.displayAs = MockFactory.getRandFromEnum(DataDisplay, MOCK_DISPLAY_OPTIONS.displayAs);
        instance2 = new ModbusConfig(MOCK_MODBUS_OPTIONS, differentDisplayOptions);
        expect(instance1.isEqual(instance2)).toBe(false);
    });

    it("Should return a clone that 'isEqual' to its source", () => {
        const instance = new ModbusConfig(MOCK_MODBUS_OPTIONS, MOCK_DISPLAY_OPTIONS, 1000);
        expect(instance.clone().isEqual(instance)).toBe(true);
        expect(instance.isEqual(instance.clone())).toBe(true);
    });

});

describe("ModbusReadAnswer", () => {
    it("should create an instance", () => {
        const instance = MockFactory.getRandomModbusAnswerRead();
        expect(instance).toBeTruthy();
    });

    it("should give an unique id to each STORED instance (incrementation)", () => {
        const instance = MockFactory.getRandomModbusAnswerRead();
        const instance2 = MockFactory.getRandomModbusAnswerRead();
        console.log('instance2 ID', instance2.id, 'instance ID', instance.id);
        expect(instance2.id - instance.id).toBe(1);
    });
    
    it("should return true on isEqual when comparing the same instance", () => {
        const instance = MockFactory.getRandomModbusAnswerRead();
        expect(instance.isEqual(instance)).toBe(true);
    });
    
    it("should return true on isEqual when comparing with a cloned instance", () => {
        const instance = MockFactory.getRandomModbusAnswerRead();
        expect(instance.isEqual(instance.clone())).toBe(true);
        expect(instance.clone().isEqual(instance)).toBe(true);
    });
    
    it("should return true on isEqual when comparing with a cloned instance", () => {
        const instance = MockFactory.getRandomModbusAnswerRead();
        expect(instance.isEqual(instance.clone())).toBe(true);
        expect(instance.clone().isEqual(instance)).toBe(true);
    });
    
    it("should return true on isEqual when comparing two matching STORED instances", () => {
        const instance = ModbusReadAnswer.store(MockFactory.getRandomModbusAnswerRead());
        const instance2 = ModbusReadAnswer.store(instance.clone());
        expect(instance.isEqual(instance2)).toBe(true);
    });

    it("should return false on isEqual when comparing two different instances", () => {
        const originalInstance = MockFactory.getRandomModbusAnswerRead();
        let testedInstance = originalInstance.clone();
        //modify
        testedInstance.config.address = MockFactory.getRandNumber(0, 0xFFFF, originalInstance.config.address);
        //test
        expect(originalInstance.isEqual(testedInstance)).toBe(false);
    });
})

const MOCK_MODBUS_OPTIONS: ModbusOptions = {
    address: 0,
    format: VariableFormat._16_BITS,
    length: 1,
    objectType: ModbusOptions.ObjectType.DEFAULT,
    slave: 1
};

const MOCK_DISPLAY_OPTIONS: DisplayOptions = {
    byteOrder: ByteOrder.B3_B2_B1_B0,
    displayAs: DataDisplay.ASCII
}