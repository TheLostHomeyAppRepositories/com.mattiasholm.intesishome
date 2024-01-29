
const axios = require('axios');
const net = require('net');
const util = require('util')

const CMD_GET_STATUS = '{"status":{"hash":"x"},"config":{"hash":"x"}}';
const URL = 'https://user.intesishome.com/api.php/get/control';

const VERSION = '1.2.2';

var gclient;
var STATUS = {
    power: "",
    mode: "",
    fanspeed: "",
    setpoint: "",
    ambient: "",
    vvane: "",
    hvane: ""

};

const headers = { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'}
        }

function createConnection(response){
    let client = new net.Socket();
    let buffer = '';
    let lastPacket

    client.on('error', function (e) {
        console.log('ERROR: ' + e);
    });
    client.on('drain', function() {
        console.log("drain!");
    });
    client.on('timeout', function() {
        console.log("timeout!");
    });
    client.connect(response.config.port, response.config.serverIP, function () {
	    client.write('{"command":"connect_req","data":{"token":' + response.config.token + '}}')
        console.log('Connecting')
    });
    client.on('data', function(data) {
        data = data.toString();
        
        if (lastPacket && Date.now() - lastPacket > 5000) {
            buffer = '';
        } else {
            buffer += data;
        }

        let pos = buffer.indexOf('}{');
        while (pos !== -1) {
            let line = buffer.substring(0, pos + 1);
            buffer = buffer.substring(pos + 1);
            processResponse(line);
            pos = buffer.indexOf('}{');

        }
        if (buffer && buffer[buffer.length - 1] === '}') {
            if (processResponse(buffer)) {
                buffer = '';
            }
        }
    });
        
    client.on('close', function() {
        console.log('Connection closed');
    });
    return client;
}

function processResponse(response){
    let resp;
    resp = JSON.parse(response);
    //console.log("IntesisData: " + util.inspect(resp.data, {showHidden: false, depth: null, colors: true}))
    switch (resp.command){
        case 'connect_rsp':
            break;
        case 'rssi':
            break;
        case 'status':
            updateStatus(new Array(resp.data));
            break;
        default:
            break;
    }

}

function getStatus(settings, callback) {
    const data = {
        username: settings.username,
        password: settings.password,
        cmd: CMD_GET_STATUS,
        version: VERSION
    };
    resp = axios.post(URL, data, headers)
	.then((res) => {
	    let response = {
		    config:{},
		    status:{}
	    }
        if(!res.data.errorCode){
            response.config = {
                token: res.data.config.token,
                serverIP: res.data.config.serverIP,
                port: res.data.config.serverPort,
                installation: res.data.config.inst
            }
            //console.log("getStatus: " + util.inspect(res, {showHidden: false, depth: null, colors: true}))
            let status = res.data.status.status
            response.status = updateStatus(status);
            callback && callback(null, response)
        }else{
            callback && callback('could not connect: ' + res.data.errorMessage)
        }
	}).catch((err) => {
            console.error(err);
            callback(err)
	})
}
function updateStatus(status){
    for (let i=0; i< status.length;i++){
        let _uid = status[i].uid
        let _val = status[i].value
        switch(_uid){
            case 1:
                STATUS.power = _val;
                break;
            case 2:
                STATUS.mode = _val;
                break;
            case 4:
                STATUS.fanspeed = _val;
                break;
            case 5:
                STATUS.vvane = _val;
                break;
            case 6:
                STATUS.hvane = _val;
                break;
            case 9:
                STATUS.setpoint = _val/10;
                break;
            case 10:
                STATUS.ambient = _val/10;
                break;
        }
    }
    return STATUS;
}


function generateCommand(intesisDeviceID, uid, value){
    console.log('{"command":"set","data":{"deviceId":' + intesisDeviceID + ',"uid":' + uid + ',"value":' + value + ',"seqNo":3}}')
    return '{"command":"set","data":{"deviceId":' + intesisDeviceID + ',"uid":' + uid + ',"value":' + value + ',"seqNo":3}}'
  }

function sendCommand(cmd){
    gclient.write(cmd)

}

function intesisRunner(err, response) {
    gclient = createConnection(response)
    if(gclient.closed){
        getStatus(intesisRunner);
    }
}

module.exports = {
    createConnection,
    processResponse,
    getStatus,
    intesisRunner,
    sendCommand,
    generateCommand,
    STATUS
}
