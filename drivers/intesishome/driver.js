'use strict';

const { Driver } = require('homey');

const intesis = require('./intesishome')
const util = require('util');
class IntesisHomeDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('IntesisHomeDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      {
        name: 'IntesisHome',
        data: {
          id: 'IntesisHome123'
        }
      }
    ];
  }

  async onPair(session){
    session.setHandler('list_devices',(data,callback)=>{
      return this.onPairListDevices(data,callback);
    });
    session.setHandler('validateSettings', (settings) => {
      try{
        intesis.getStatus(settings, async(err, result) =>{
          if(!err) {
            session.emit("validationResult", result)
          }else{
            session.emit("error", err)
          }
      })
      }catch(err){
        session.emit("error", err)
      }
    })
   
  }

}

module.exports = IntesisHomeDriver;
