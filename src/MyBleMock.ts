import { BluetoothLeMock } from 'ionic-native-bluetoothle/mocks/BluetoothLeMock'
import { RetrieveConnectedParams } from 'ionic-native-bluetoothle/models/BlePluginParams';

export class MyBleMock extends BluetoothLeMock {

  retrieveConnected(params?: RetrieveConnectedParams): Promise<Array<{
    name: string;
    address: string;
  }>> {
    return Promise.resolve([
      {
        'address': 'C6:D7:C9:0F:72:52',
        'name': 'MOCK-0001'
      },
      {
        'address': 'C6:D7:C9:0F:72:52',
        'name': 'Real-0002'
      }
    ])
  }
  
}