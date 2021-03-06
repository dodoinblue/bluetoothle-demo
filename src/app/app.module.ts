import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BluetoothLe } from 'ionic-native-bluetoothle'

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MyBleMock } from '../MyBleMock';
// import { BluetoothLeMock } from 'ionic-native-bluetoothle/mocks/BluetoothLeMock' // Use default mock

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    // BluetoothLe, // Use real plugin
    { provide: BluetoothLe, useClass: MyBleMock }, // Use mock
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
