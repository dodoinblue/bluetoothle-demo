import { BluetoothLe } from "ionic-native-bluetoothle";
import { Subscription } from "rxjs/Subscription";
import { EventEmitter, Output } from '@angular/core'
import { Buffer } from 'buffer'

export enum Connection {
  NONE = 'NONE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCOVERED = 'discovered',
  DISCONNECTED = 'DISCONNECTED',
  CLOSED = 'CLOSED'
}

const CONNECTION_TIMEOUT = 15 * 1000
const CONNECTION_MAX_RETRY = 3

export class BleDevice {

  private connectionSubscription: Subscription
  private state: Connection
  private reconnectCount: number = 0

  public name: string
  private services: any[]

  @Output() stateChangeEvent: EventEmitter<{oldState: Connection, newState: Connection}> = new EventEmitter();

  constructor(private ble: BluetoothLe, private address: string) {
    console.log('BleDevice constructor')
    this.state = Connection.NONE
  }

  private setState(newState: Connection) {
    console.log(`Connection ${this.state} -> ${newState}`)
    this.stateChangeEvent.emit({
      oldState: this.state,
      newState: newState
    })
    this.state = newState
    if(newState === Connection.CONNECTED) {
      this.reconnectCount = 0      
    }
  }

  connect() {
    this.setState(Connection.CONNECTING)
    let cancelConnectionTask = setTimeout(() => {
      this.connectionSubscription.unsubscribe()
      this.close()
    }, CONNECTION_TIMEOUT)
    this.connectionSubscription = this.ble.connect({address: this.address}).subscribe((result) => {
      console.log('connection sub: ' + JSON.stringify(result))
      clearTimeout(cancelConnectionTask)
      if (result.status === 'disconnected') {
        this.setState(Connection.DISCONNECTED)
      } else if (result.status === 'connected') {
        this.setState(Connection.CONNECTED)
        this.name = result.name
        this.discover()
      } else {
        console.log('illegal state')
      }
    }, (error) => {
      console.log('connect error: ' + JSON.stringify(error))
    })
  }

  discover() {
    this.ble.discover({address: this.address, clearCache: true}).then((result) => {
      this.services = result.services
      this.setState(Connection.DISCOVERED)
    })
  }

  disconnect() {
    return this.ble.disconnect({address: this.address}).then((result) => {
      console.log('disconnect.then: ' + JSON.stringify(result))
      this.setState(Connection.DISCONNECTED)
      return this.close()
    })
  }

  reconnect() {
    return this.ble.reconnect({address: this.address}).then(result => {
      console.log('reconnect.then: ' + JSON.stringify(result))
      if (result.status === 'connected') {
        this.setState(Connection.DISCOVERED)
      } else if (result.status === 'disconnected') {
        this.reconnectCount++
      }
    })
  }

  close() {
    return this.ble.close({address: this.address}).then(() => {
      this.setState(Connection.CLOSED)
    })
  }

  getDeviceInfo() {
    // if (this.state !== Connection.CONNECTED) {
    //   return Promise.reject('Device Not Connected')
    // }
    return this.ble.read({
      address: this.address,
      service: '1800',
      characteristic: '2a00'
    }).then((result) => {
      console.log(JSON.stringify(result))
      let array = this.ble.encodedStringToBytes(result.value)
      console.log(Buffer.from(array).toString())
    })
  }

  readBatteryLevel() {
    console.log('batteryLevel')
    this.ble.read({
      address: this.address,
      service: '180f',
      characteristic: '2a19'}).then((result) => {
        console.log(JSON.stringify(result))
        let array = this.ble.encodedStringToBytes(result.value)
        console.log('battery: ' + array[0])
    })
  }
}