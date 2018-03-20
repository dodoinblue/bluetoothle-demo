import { BluetoothLe } from "ionic-native-bluetoothle"
import { Subscription } from "rxjs/Subscription"
import { EventEmitter, Output } from '@angular/core'
import { Buffer } from 'buffer'
import { Observable } from "rxjs/Observable"
import { map } from 'rxjs/operators'

export enum DeviceState {
  NONE = 'none',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCOVERED = 'discovered',
  DISCONNECTED = 'disconnected',
  CLOSED = 'closed'
}

const CONNECTION_TIMEOUT = 15 * 1000
const CONNECTION_MAX_RETRY = 3

export class BleDevice {

  private connectionSubscription: Subscription
  private state: DeviceState
  private reconnectCount: number = 0

  public name: string
  private services: any[]

  @Output() stateChangeEvent: EventEmitter<{oldState: DeviceState, newState: DeviceState}> = new EventEmitter();

  constructor(private ble: BluetoothLe, private address: string) {
    this.state = DeviceState.NONE
  }

  private setState(newState: DeviceState) {
    console.log(`State: ${this.state} -> ${newState}`)
    this.stateChangeEvent.emit({
      oldState: this.state,
      newState: newState
    })
    this.state = newState
    if(newState === DeviceState.CONNECTED) {
      this.reconnectCount = 0      
    }
  }

  connect() {
    this.setState(DeviceState.CONNECTING)
    let cancelConnectionTask = setTimeout(() => {
      this.connectionSubscription.unsubscribe()
      this.close()
    }, CONNECTION_TIMEOUT)
    this.connectionSubscription = this.ble.connect({address: this.address}).subscribe((result) => {
      console.log('connection sub: ' + JSON.stringify(result))
      clearTimeout(cancelConnectionTask)
      if (result.status === 'disconnected') {
        this.setState(DeviceState.DISCONNECTED)
      } else if (result.status === 'connected') {
        this.setState(DeviceState.CONNECTED)
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
      this.setState(DeviceState.DISCOVERED)
    })
  }

  disconnect() {
    return this.ble.disconnect({address: this.address}).then((result) => {
      console.log('disconnect.then: ' + JSON.stringify(result))
      this.setState(DeviceState.DISCONNECTED)
      return this.close()
    })
  }

  reconnect() {
    return this.ble.reconnect({address: this.address}).then(result => {
      console.log('reconnect.then: ' + JSON.stringify(result))
      if (result.status === 'connected') {
        this.setState(DeviceState.DISCOVERED)
      } else if (result.status === 'disconnected') {
        this.reconnectCount++
      }
    })
  }

  close() {
    return this.ble.close({address: this.address}).then(() => {
      this.setState(DeviceState.CLOSED)
    })
  }

  bond() {
    return this.ble.bond({address: this.address})
  }

  isBonded() {
    return this.ble.isBonded({address: this.address})
  }

  getSerialNumber() {
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

  subscribeHr() {
    let hrCharPath = {
      address: this.address,
      service: '180D',
      characteristic: '2A37'
    }
    return this.ble.subscribe(hrCharPath).pipe(map(result => {
      if(result.status === 'subscribedResult') {
        return {
          status: 'subscribedResult',
          value: this.ble.encodedStringToBytes(result.value)[1]
        }
      } else {
        return result
      }
    }))
    // if(this.broadcastingHr !== true) {
    //   this.broadcastingHr = true
    //   this.ble.subscribe(hrCharPath).subscribe((data) => {
    //     // console.log('hr: ' + JSON.stringify(data))
    //     if(data.value) {
    //       onResult({status: 'subscribedResult', value: this.ble.encodedStringToBytes(data.value)[1]})
    //     } else {
    //       onResult(data)
    //     }
    //   })
    // } else {
    //   this.ble.unsubscribe(hrCharPath).then((result) => {
    //     console.log('unsubscribe hr: ' + JSON.stringify(result))
    //     this.broadcastingHr = false
    //     onResult(result)
    //   })
    // }
  }

  unsubscribeHr() {

  }
}