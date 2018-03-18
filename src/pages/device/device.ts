import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { BleDevice } from '../../BleDevice';
// import { BluetoothLe } from 'ionic-native-bluetoothle';
// import { Buffer } from 'buffer'

@IonicPage()
@Component({
  selector: 'page-device',
  templateUrl: 'device.html',
})
export class DevicePage {

  batteryStatus: string = 'Click to view device info'
  bondStatus: string = 'Click to view bond status'
  hrStatus: string | number = 'Not subscribed'

  device: BleDevice
  loading: Loading

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController
  ) {
    console.log('Device page, constructor')
    if (!this.navParams.get('device')) {
      console.log('Must select a device')
      return
    }
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.device = this.navParams.get('device') as BleDevice
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevicePage');

    this.device.stateChangeEvent.subscribe(event => {
      console.log('event: ' + JSON.stringify(event))
      if(event.newState === 'CONNECTED') {
        this.loading.dismiss()
      } else if (event.newState === 'CLOSED') {
        this.navCtrl.pop()
      }
    })

    this.loading.present()
    this.device.connect()
  }

  showDeviceInfo() {
    this.device.getDeviceInfo().then((info) => {
      console.log(JSON.stringify(info))
    }).catch((error) => {
      console.log('error show info: ' + JSON.stringify(error))
    })
  }

  checkAndBond() {
  }

  batteryLevel() {
    return this.device.readBatteryLevel()
  }

  connect() {
    return this.device.connect()
  }

  reconnect() {
    return this.device.reconnect()
  }

  disconnect() {
    return this.device.disconnect().catch((error) => { console.log(JSON.stringify(error))})
  }

  showHeartrate() {
    console.log('showHeartrate')
  }

}
