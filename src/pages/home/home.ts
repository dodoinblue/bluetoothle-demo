import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BluetoothLE } from '../../wrapper/BluetoothLeWrapper'
// import { InitParams } from '../../wrapper/models/BlePluginParams';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public ble: BluetoothLE) {
    console.log('constructor')
  }

  init() {
    console.log('init')
    this.ble.initialize().subscribe(result => {
      console.log(result)
    })
  }

  checkPermissions() {
    console.log('checkPermissions')
  }

  checkLocations() {
    console.log('checkLocations')
  }

  enable() {
    console.log('enable')
  }

  disable() {
    console.log('disable')
  }

  getAdapterInfo() {
    console.log('getAdapterInfo')
  }

  scanWithTimeout() {
    console.log('scanWithTimeout')
  }

  retrieveConnected() {
    console.log('retrieveConnected')
  }

}
