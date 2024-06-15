import Service from "node-service-linux";
 
console.log(Service )

// Create a new service object
var svc = new Service.Service({
    name:'dyndnsupdate',
    description: 'Updates Dyndns',
    script: './index.js'
});
 
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
});
 
svc.install();