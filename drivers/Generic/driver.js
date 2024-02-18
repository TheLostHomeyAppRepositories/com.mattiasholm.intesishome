'use strict';

const { Driver } = require('homey');

const intesis = require('../../lib/intesishome')
const util = require('util');
class GenericDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Generic AC cloud device driver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      {
        name: 'GenericDriver',
        data: {
          id: 'GenericDriver'
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

module.exports = GenericDriver;
