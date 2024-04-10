'use strict';

const { Device } = require('homey');
const intesis = require('../../lib/intesishome')

class PAACWIFI1ADevice extends Device {
  
  /**
   * onInit is called when the device is initialized.
   */

  async onInit() {
    this.settings = this.getSettings();
    this.log('PA-AC-WIFI-1A has been initialized');
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

    this.log("polling PA-AC-WIFI-1A");
    intesis.getStatus(this.settings, intesis.intesisRunner);
    this.setPollTimer(this.settings.interval);
  }

  async onCapabilityOnoff(value){
    if (value == false){
      value = 0
    }else if (value == true){
      value = 1
    }
    this.log('PA-AC-WIFI-1A onoff' + value);
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 1, value);
    intesis.sendCommand(_cmd)
  }

  async onCapabilityMeasure_temperature(){
    this.log('PA-AC-WIFI-1A measure temperature');
  }

  async onCapabilityTarget_temperature(value){
    value = parseInt(value) * 10
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 9, value);
    intesis.sendCommand(_cmd)
    this.log('PA-AC-WIFI-1A target temperature: ' + value);
  }

  async onCapabilityAc_mode(value){
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 2, value);
    intesis.sendCommand(_cmd)
    this.log('PA-AC-WIFI-1A ac_mode: ' + value);
  }

  async onCapabilityAc_fan_speed(value){
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 4, value);
    intesis.sendCommand(_cmd)
    this.log('PA-AC-WIFI-1A ac_fan_speed: ' + value);
  }

  async onCapabilityAc_vvane(value){
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 5, value);
    intesis.sendCommand(_cmd)
    this.log('PA-AC-WIFI-1A ac_vvane: ' + value);
  }

  async onCapabilityAc_hvane(value){
    var _cmd = intesis.generateCommand(this.settings.intesisDeviceID, 6, value);
    intesis.sendCommand(_cmd)
    this.log('PA-AC-WIFI-1A ac_hvane: ' + value);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('PA-AC-WIFI-1A has been added');
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
    this.log('PA-AC-WIFI-1A settings where changed');
    this.settings = this.getSettings();
    this.log("polling PA-AC-WIFI-1A");
    intesis.getStatus(this.settings, intesis.intesisRunner);
    this.setPollTimer(this.settings.interval);
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('PA-AC-WIFI-1A was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('PA-AC-WIFI-1A has been deleted');
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

        
        // Some devices seems to send ".", no idea which or why. 
        if (_val != "."){ 
          try{
            this.setCapabilityValue(_map[attr], _val);
          }catch (error){
            Error("PA-AC-WIFI-1A.updateAllValues: " + error)
          }
        }
      }
    }
  }

  setPollTimer(interval) {
    this.pollTimer = setInterval(async () => {
      this.updateAllValues()
    }, (interval || 10) * 1000)
  }
}

module.exports = PAACWIFI1ADevice;
