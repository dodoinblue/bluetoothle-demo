import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { BluetoothLE } from '../../wrapper/BluetoothLeWrapper'
// import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/take'
// import { InitParams } from '../../wrapper/models/BlePluginParams';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  initStatus: string
  hasPermission: boolean
  isLocationEnabled: boolean
  osType: 'ios' | 'android' | 'other'

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    public ble: BluetoothLE,
    private platform: Platform
  ) {
    console.log('constructor')
    if (platform.platforms().includes('ios')) {
      this.osType = 'ios'
    } else if (platform.platforms().includes('android')) {
      this.osType = 'android'
    } else {
      this.osType = 'other'
    }
  }

  init() {
    console.log('init')
    this.ble.initialize().take(1).subscribe(result => {
      console.log(`bluetooth status: ${result.status}`)
      this.initStatus = result.status
    })
  }

  checkPermissions() {
    console.log('checkPermissions')
    this.ble.hasPermission().then((result) => {
      console.log(result.hasPermission)
      this.hasPermission = result.hasPermission
    }).catch((error) => {
      console.log(error)
    })
  }

  checkLocations() {
    console.log('checkLocations')
    this.ble.isLocationEnabled().then((result) => {
      console.log(result.isLocationEnabled)
      this.isLocationEnabled = result.isLocationEnabled
    }).catch((error) => {
      console.log(error)
    })
  }

  enable() {
    console.log('enable')
    this.ble.enable()
  }

  disable() {
    console.log('disable')
    this.ble.disable()
  }

  getAdapterInfo() {
    console.log('getAdapterInfo')
    this.ble.getAdapterInfo().then((result) => {
      let message = `
        name: ${result.name}
        address: ${result.address}
        isEnabled: ${result.isEnabled}
        isDiscoverable: ${result.isDiscoverable}
        isInitialized: ${result.isInitialized}
      `
      let alert = this.alertCtrl.create({
        title: 'Adapter Info',
        subTitle: message,
        buttons: ['Dismiss']
      });
      alert.present()
    })
  }

  scanWithTimeout() {
    console.log('scanWithTimeout')
  }

  retrieveConnected() {
    console.log('retrieveConnected')
    this.ble.retrieveConnected({
      "services": [
        "180A"      ]
    }).then((devices) => {
      console.log(devices)
      let inputs = devices.map((d) => {
        console.log(`name: ${d.name} address: ${d.address}`)
        return {
          type: 'radio',
          label: d.name,
          value: d.address
        } as any
      })
      // inputs[0].checked = true
      let alert = this.alertCtrl.create({
        title: 'Connected devices',
        inputs: inputs,
        buttons: ['Dismiss']
      })
      alert.present()
    })
  }

  ionViewWillLoad() {
    console.log('ionViewWillLoad')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad')
    this.ble.initialize().take(1).subscribe(result => {
      console.log(`bluetooth status: ${result.status}`)
      this.initStatus = result.status
    })
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave')
  }

}
