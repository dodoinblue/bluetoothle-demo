import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { BluetoothLe } from 'ionic-native-bluetoothle';
import { Buffer } from 'buffer'

@IonicPage()
@Component({
  selector: 'page-device',
  templateUrl: 'device.html',
})
export class DevicePage {

  batteryStatus: string = 'Click to view device info'
  bondStatus: string = 'Click to view bond status'
  hrStatus: string | number = 'Not subscribed'

  device: any = {}
  reconnectCount = 0


  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private ble: BluetoothLe,
  ) {
    console.log('Device page, constructor')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevicePage');
    if (!this.navParams.get('address')) {
      console.log('Must select a device')
      return
    }
    let loading = this.loadingCtrl.create({
      content: 'Connecting. Please wait...'
    })
    loading.present()
    this.device.address = this.navParams.get('address')
    this.ble.connect({address: this.device.address}).subscribe(result => {
      if (result.status === 'disconnected') {
        this.reconnectCount ++
        if (this.reconnectCount > 2) {
          // give up
          this.navCtrl.pop()
        } else {
          this.ble.reconnect({address: this.device.address}).then((result) => {
            console.log('reconnect: ' + JSON.stringify(result))
          })
        }
      } else {
        this.reconnectCount = 0
        loading.dismiss()
        this.device.name = result.name
        this.ble.discover({address: this.device.address}).then((result) => {
          console.log(JSON.stringify(result))
        })
      }
    })
  }

  showDeviceInfo() {
    console.log('showDeviceInfo')
    this.ble.read({
      address: this.device.address,
      service: '1800',
      characteristic: '2a00'
    }).then((result) => {
      console.log(JSON.stringify(result))
      let array = this.ble.encodedStringToBytes(result.value)
      console.log(Buffer.from(array).toString())
    }).catch((error) => {
      console.log(`error reading device info: ${JSON.stringify(error)}`)
    })
  }

  checkAndBond() {
    console.log('checkAndBond')
  }

  batteryLevel() {
    console.log('batteryLevel')
    this.ble.read({
      address: this.device.address,
      service: '180f',
      characteristic: '2a19'}).then((result) => {
        console.log(JSON.stringify(result))
    }).catch((error) => {
      console.log(`error reading battery: ${JSON.stringify(error)}`)
    })
  }

  disconnect() {
    console.log('disconnect')
    this.ble.disconnect({address: this.device.address}).then((result) => {
      console.log(JSON.stringify(result))
      this.navCtrl.pop()
    })
  }

  showHeartrate() {
    console.log('showHeartrate')
  }

}
