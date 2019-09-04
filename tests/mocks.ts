import { MockProtocol } from '@iotize/device-com-mock.js'
import { StringConverter, NumberConverter } from '@iotize/device-client.js/client/impl';
import { ApiRequest, Response } from "@iotize/device-client.js/client/impl";
import { LoginCredentialConverter, InterfaceLockConverter } from '@iotize/device-client.js/device/converter/model-converters';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { ModbusConfig, ModbusReadAnswer, ByteOrder, DataDisplay } from 'src/app/helpers/modbus-helper';
import { VariableFormat, ModbusOptions } from '@iotize/device-client.js/device/model';

export class MockFactory {

  static APP_NAME = 'testAppName';
  static USER_NAME = 'testUsername';
  static PASSWORD = 'testPassword';

  static protocol(): ComProtocol {
    const mockProtocol = new MockProtocol();

    const setDefaultResponses = () => {

      // Disconnect from target
      mockProtocol.addRoute(ApiRequest.POST('/1027//4'), Response.SUCCESS());
      // Current target protocol MODBUS
      mockProtocol.addRoute(ApiRequest.GET('/1027//1'), Response.SUCCESS(new Uint8Array([3])));
      // Connect to target
      mockProtocol.addRoute(ApiRequest.POST('/1027//3'), Response.SUCCESS());
      // get AppName
      mockProtocol.addRoute(ApiRequest.GET('/1024//9'), Response.SUCCESS(StringConverter.instance().encode(MockFactory.APP_NAME)));
      // keepAlive
      mockProtocol.addRoute(ApiRequest.GET('/1024//4'), Response.SUCCESS());

      let loginConverter = new LoginCredentialConverter();

      // login with falsey credentials
      mockProtocol.addRoute(ApiRequest.POST('/1024//0'), Response.ERROR(0x86));

      // login with truthy credentials
      mockProtocol.addRoute(ApiRequest.POST('/1024//0', loginConverter.encode({
        username: MockFactory.USER_NAME,
        password: MockFactory.PASSWORD
      })), () => {
        setLoggedInResponses();
        return Response.SUCCESS();
      })

      // logout
      mockProtocol.addRoute(ApiRequest.POST('/1024//1'), () => {
        setLoggedOutResponses();
        return Response.SUCCESS();
      });

      // lockInfos
      mockProtocol.addRoute(ApiRequest.GET('/1024//6'), Response.SUCCESS(
        (new InterfaceLockConverter()).encode({
          factoryReset: false,
          hashPassword: false,
          resourceFactory: false,
          resourceLogUid: false,
          scramActivated: false
        })
      ));
    }

    // behavior modification methods
    const setLoggedInResponses = () => {
      console.log("setLoggedInResponses called");
      //reset routes
      mockProtocol._router.clearRoutes();
      setDefaultResponses();
      // Specific behavior
      //session state
      // interface.getCurrentGroupId
      mockProtocol.addRoute(ApiRequest.GET('/1024//7'), Response.SUCCESS(NumberConverter.uint16Instance().encode(65535)));

      // group.getName
      mockProtocol.addRoute(ApiRequest.GET('/1025//0'), Response.SUCCESS(StringConverter.instance().encode(MockFactory.USER_NAME)));

      // group.getSessionLifetime
      mockProtocol.addRoute(ApiRequest.GET('/1025//4'), Response.SUCCESS(NumberConverter.int32Instance().encode(-1)));

    }

    const setLoggedOutResponses = () => {
      console.log("setLoggedOutResponses called");
      //reset routes
      mockProtocol._router.clearRoutes();
      setDefaultResponses();
      // Specific behavior
      //session state
      // interface.getCurrentGroupId
      mockProtocol.addRoute(ApiRequest.GET('/1024//7'), Response.SUCCESS(NumberConverter.uint16Instance().encode(0)));

      // group.getName
      mockProtocol.addRoute(ApiRequest.GET('/1025//0'), Response.SUCCESS(StringConverter.instance().encode('test')));

      // group.getSessionLifetime
      mockProtocol.addRoute(ApiRequest.GET('/1025//4'), Response.SUCCESS(NumberConverter.int32Instance().encode(-1)));
    }
    // default behavior
    setLoggedOutResponses();

    return mockProtocol;
  }

  static iotizeTap(): /*IoTizeTap*/ any { //WIP

    let iotizeTap = {};

    // Mock props
    Object.defineProperty(iotizeTap, 'session', {
      configurable: true,
      writable: true,
      value: {
        session: {
          groupId: 65535,
          lifeTime: -1,
          name: MockFactory.USER_NAME
        }
      }
    });

    return iotizeTap
  }


  static getRandNumber(min: number, max: number, except?: number | number[]) {
    let rand = Math.floor((max - min + 1) * Math.random()) + min;
    if (except) {
      if (typeof except == 'number' && rand == except) {
        return MockFactory.getRandNumber(min, max, except)
      }
      console.warn(except);
      if ((except as Array<number>).includes(rand)) {// except is then an array
        return MockFactory.getRandNumber(min, max, except)
      }
    }
    return rand;
  }

  static getRandFromEnum<T>(_enum: T, except?: T[keyof T]): T[keyof T] {
    const enumValues = Object.keys(_enum)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    if (enumValues.length < 2) {
      throw new Error('can not create random element of' + (_enum as any).name);
    }
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    if (randomEnumValue == except) {
      return MockFactory.getRandFromEnum(_enum, except);
    }
    return randomEnumValue;
  }

  static getRandModbusConfig() {
    return new ModbusConfig(
      {
        address: MockFactory.getRandNumber(0, 0xFFFF),
        slave: MockFactory.getRandNumber(0, 0xFFFF),
        format: MockFactory.getRandFromEnum(VariableFormat),
        length: MockFactory.getRandNumber(0, 0xFF),
        objectType: MockFactory.getRandFromEnum(ModbusOptions.ObjectType)

      },
      {
        byteOrder: MockFactory.getRandFromEnum(ByteOrder, ByteOrder.B0_B1_B2_B3), // TOFIX allows to test without the B0_B1_B2_B3 bug
        displayAs: MockFactory.getRandFromEnum(DataDisplay)
      },
    )
  }

  static getBytes(rand: boolean = false) {
     let buffer = Uint8Array.from([0, 1, 2, 3]);
    if (rand) {
      buffer = buffer.map(_ => Math.floor(256 * Math.random()));
    }
    return buffer;
  }

  static getRandomModbusAnswerRead() {
    return ModbusReadAnswer.store(new ModbusReadAnswer(MockFactory.getRandModbusConfig(), MockFactory.getBytes(true)));
  }

  static getRandomModbusAnswersMap(size: number = 4):  Map<number,ModbusReadAnswer> {
    if (size <= 0) {
      size = 0;
    }
    const myMap = new Map<number,ModbusReadAnswer>();
    (new Array(size))
      .fill(0)
      .map(_ => MockFactory.getRandomModbusAnswerRead())
      .forEach(_ => {
        myMap.set(_.id!, _);
      });
      return myMap;
  }
}