import { Component } from '@angular/core';
import { NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { BluetoothLE } from '../../wrapper/BluetoothLeWrapper'
// import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/take'
import { Subscription } from 'rxjs/Subscription';
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
  scanStatus: string = 'Scan stopped'

  connStatusSubscriptions: Map<string, Subscription> = new Map()

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private ble: BluetoothLE,
    private platform: Platform,
    private loadingCtrl: LoadingController
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
    let loading = this.loadingCtrl.create({
      content: 'Scanning. Please wait...'
    })
    loading.present()
    console.log('scanWithTimeout')
    let scanParams = {"services": []}
    let foundDevicesMap = new Map()
    let scanSubscription = this.ble.startScan(scanParams).subscribe(result => {
      if (result.status === 'scanResult') {
        if (result.name) {
          foundDevicesMap.set(result.address, result)
        }
      } else if (result.status === 'scanStarted') {
        console.log('scan started')
        this.scanStatus = 'scanStarted'
      } else {
        // TODO handle error
        console.log('start scan error: ' + JSON.stringify(result))
      }
    })
    // TODO: Make the list reactive. Currently the Alert only has addInput().
    // Need to extend it to add removeInput() or updateInputs()
    setTimeout(() => {
      this.ble.stopScan().then(() => {
        console.log('scanStopped')
        this.scanStatus = 'scanStopped'
        scanSubscription.unsubscribe()
        let foundDeviceArray = Array.from(foundDevicesMap.values()).map((d) => {
          return {
            type: 'radio',
            label: d.name,
            value: d.address
          } as any
        })
        let alert = this.alertCtrl.create({
          title: 'Discovered devices',
          inputs: foundDeviceArray,
          buttons: [{
            text: 'Connect',
            handler: selection => {
              console.log('Connecting to ' + JSON.stringify(selection));
              this.connect(selection)
            }
          }]
        })
        loading.dismiss()
        alert.present()
      })
    }, 5000)
  }

  retrieveConnected() {
    console.log('retrieveConnected')
    this.ble.retrieveConnected({ "services": [ "180A" ] }).then((devices) => {
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

  statusListener(status) {
    console.log(JSON.stringify(status))
  }

  connect(address: string) {
    // let loading = this.loadingCtrl.create({
    //   content: 'Scanning. Please wait...'
    // })
    // loading.present()
    // if (this.connStatusSubscriptions.has(address)) {
    //   this.connStatusSubscriptions.get(address).unsubscribe()
    // }
    // let statusSubscription = this.ble.connect({address: address})
    // .subscribe((result) => {
    //   loading.dismiss()
    //   this.statusListener(result)
    // })
    // this.connStatusSubscriptions.set(address, statusSubscription)
    this.navCtrl.push('DevicePage', {
      address: address
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

  jump() {
    console.log('jumping')
    this.navCtrl.push('DevicePage')
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave')
  }

}
