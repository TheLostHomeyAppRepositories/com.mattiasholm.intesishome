'use strict';

const { Device } = require('homey');
const intesis = require('./intesishome')

class IntesisHomeDevice extends Device {
  
  /**
   * onInit is called when the device is initialized.
   */

  async onInit() {
    this.settings = this.getSettings();
    this.log('IntesisHome has been initialized');
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('target_temperature', this.onCapabilityTarget_temperature.bind(this));
    this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasure_temperature.bind(this));
    this.registerCapabilityListener('ac_mode', this.onCapabilityAc_mode.bind(this));
    this.registerCapabilityListener('ac_fan_speed', this.onCapabilityAc_fan_speed.bind(this));
    this.registerCapabilityListener('ac_vvane', this.onCapabilityAc_vvane.bind(this));
    this.registerCapabilityListener('ac_hvane', this.onCapabilityAc_hvane.bind(this));
    
    const ac_mode_card = this.homey.flow.getActionCard('ac_mode_action');
    const ac_fan_speed_card = this.homey.flow.getActionCard('ac_fan_speed_action');
    const ac_hvane_card = this.homey.flow.getActionCard('ac_hvane_action');
    const ac_vvane_card = this.homey.flow.getActionCard('ac_vvane_action');


    ac_mode_card.registerRunListener(async (args) => {
      const { mode } = args;
      this.onCapabilityAc_mode(mode); 
    })

    ac_fan_speed_card.registerRunListener(async (args) => {
      const { fan_speed } = args;
      this.onCapabilityAc_fan_speed(fan_speed); 
    })

    ac_hvane_card.registerRunListener(async (args) => {
      const { hvane } = args;
      this.onCapabilityAc_hvane(hvane); 
    })

    ac_vvane_card.registerRunListener(async (args) => {
      const { vvane } = args;
      this.onCapabilityAc_vvane(vvane); 
    })

    this.log("polling intesisHome");
    intesis.getStatus(this.settings, intesis.intesisRunner);
    this.setPollTimer(this.settings.interval);
  }

  async onCapabilityOnoff(value){
    if (value == false){
      value = 0
    }else if (value == true){
      value = 1
    }
    this.log('IntesisHome onoff' + value);
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":1,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 1, value);
    intesis.sendCommand(_cmd)
  }

  async onCapabilityMeasure_temperature(){
    this.log('IntesisHome measure temperature');
  }

  async onCapabilityTarget_temperature(value){
    value = parseInt(value) * 10
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":9,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 9, value);
    intesis.sendCommand(_cmd)
    this.log('IntesisHome target temperature: ' + value);
  }

  async onCapabilityAc_mode(value){
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":2,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 2, value);
    intesis.sendCommand(_cmd)
    this.log('IntesisHome ac_mode: ' + value);
  }

  async onCapabilityAc_fan_speed(value){
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":4,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 4, value);
    intesis.sendCommand(_cmd)
    this.log('IntesisHome ac_fan_speed: ' + value);
  }

  async onCapabilityAc_vvane(value){
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":5,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 5, value);
    intesis.sendCommand(_cmd)
    this.log('IntesisHome ac_vvane: ' + value);
  }

  async onCapabilityAc_hvane(value){
    //var _cmd = '{"command":"set","data":{"deviceId":127934848804,"uid":6,"value":'+value+',"seqNo":3}}'
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 6, value);
    intesis.sendCommand(_cmd)
    this.log('IntesisHome ac_hvane: ' + value);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('IntesisHome has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('IntesisHome settings where changed');
    this.settings = this.getSettings();
    this.log("polling intesisHome");
    intesis.getStatus(this.settings, intesis.intesisRunner);
    this.setPollTimer(this.settings.interval);
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('IntesisHome was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('IntesisHome has been deleted');
  }

  updateAllValues(){
    let _map = {
      "power": "onoff",
      "mode": "ac_mode",
      "fanspeed": "ac_fan_speed",
      "vvane": "ac_vvane",
      "hvane": "ac_hvane",
      "setpoint": "target_temperature",
      "ambient": "measure_temperature"
    };
    for (var attr in intesis.STATUS){
      if (this.getCapabilityValue(_map[attr]) != intesis.STATUS[attr]){
        let _val = 0;
        console.log("CHANGED: " + _map[attr] + ' = ' + intesis.STATUS[attr])
        if(attr == "power"){
          _val = Boolean(intesis.STATUS[attr]);
        } 
        else if(attr == "setpoint" || attr == "ambient"){
          _val = parseInt(intesis.STATUS[attr]);
        }else{
          _val = String(intesis.STATUS[attr]);
        }
        this.setCapabilityValue(_map[attr], _val);      
      }
    }
  }

  setPollTimer(interval) {
    this.pollTimer = setInterval(async () => {
      this.updateAllValues()
    }, (interval || 10) * 1000)
  }
}

module.exports = IntesisHomeDevice;
