import cron from "node-cron";
import fs from "fs";

// Load configuration data from config.json
let config;
try {
    config = JSON.parse(fs.readFileSync("config.json", "utf8"));

    // If zoneId is not present, fetch it from IONOS API
    if (!config.zoneId) {
        let response = await fetch("https://api.hosting.ionos.com/dns/v1/zones/", {
            method: "GET",
            headers: [
                ["X-API-Key", config.apiKey],
                ["accept", "application/json"],
                ["Content-Type", "application/json"]
            ]
        });

        let zones = await response.json();

        // Update config.json with the fetched zoneId
        config.zoneId = zones[0].id;
        fs.writeFileSync("config.json", JSON.stringify(config, null, 2), "utf8");

        console.info("zoneId has been added to config.json:", config.zoneId);
    }

} catch (error) {
    throw new Error("The config.json file is missing. Please provide the configuration file with the required settings.");
}

// Define a class to manage IPv4 and IPv6 addresses
class IPs {
    ipv4 = null;
    ipv6 = null;

    constructor(ipv4, ipv6) {
        this.ipv4 = ipv4;
        this.ipv6 = ipv6;
    }

    // Check if the current IPs are equal to another set of IPs
    equals(ip) {
        return ip.ipv4 === this.ipv4 && ip.ipv6 === this.ipv6;
    }

    // Update the current IPs with new ones
    update(ip) {
        this.ipv4 = ip.ipv4;
        this.ipv6 = ip.ipv6;
    }
}

// Get the current IP addresses (both IPv4 and IPv6)
const getCurrentIP = async () => {
    const ipv4 = (await (await fetch("https://api.ipify.org?format=json")).json()).ip;
    const ipv6 = (await (await fetch("https://api6.ipify.org?format=json")).json()).ip;

    return new IPs(ipv4, ipv6);
}

// Update an existing DNS record with the current IP
const updateDynDNS = async (ip, recordId) => {
    const bodyData = {
        "disabled": false,
        "content": ip,
        "ttl": 3600,
        "prio": 0
    };

    let response = await fetch(`https://api.hosting.ionos.com/dns/v1/zones/${config.zoneId}/records/${recordId}`, {
        method: "PUT",
        body: JSON.stringify(bodyData),
        headers: [
            ["X-API-Key", config.apiKey],
            ["accept", "application/json"],
            ["Content-Type", "application/json"]
        ]
    });

    // console.log(response.status);
}

// Create new DNS records for the current IP
const createDynDNSRecords = async (ip, type) => {
    const bodyData = [{
        "name": config.domainName,
        "type": type,
        "content": ip,
        "ttl": 3600,
        "prio": 0,
        "disabled": false
    }];

    let response = await fetch(`https://api.hosting.ionos.com/dns/v1/zones/${config.zoneId}/records/`, {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: [
            ["X-API-Key", config.apiKey],
            ["accept", "application/json"],
            ["Content-Type", "application/json"]
        ]
    });

    let zones = await response.json();
    if (type === "A") {
        // Update config.json with the new IPv4 record ID
        config.ipv4RecordId = zones[0].id;
        fs.writeFileSync("config.json", JSON.stringify(config, null, 2), "utf8");
        console.info("ipv4RecordId has been added to config.json:", config.ipv4RecordId);

    } else if (type === "AAAA") {
        // Update config.json with the new IPv6 record ID
        config.ipv6RecordId = zones[0].id;
        fs.writeFileSync("config.json", JSON.stringify(config, null, 2), "utf8");
        console.info("ipv6RecordId has been added to config.json:", config.ipv6RecordId);

    } else {
        throw new Error("Unsupported type.");
    }

    // console.log(response.status);
}

// Main function to handle dynamic DNS updates
const main = async () => {
    const currentIps = await getCurrentIP();
    console.log("current ips", currentIps);

    // Create DNS records if they do not exist
    if (!config.ipv4RecordId) createDynDNSRecords(currentIps.ipv4, "A");
    if (!config.ipv6RecordId) createDynDNSRecords(currentIps.ipv6, "AAAA");

    // Schedule a cron job to check IPs every 10 sec
    cron.schedule('10 * * * * *', async () => {
        const newCurrentIps = await getCurrentIP();

        // If the IPs have changed, update the DNS records
        if (!currentIps.equals(newCurrentIps)) {
            console.log("new current ips", currentIps);

            currentIps.update(newCurrentIps);

            updateDynDNS(currentIps.ipv4, config.ipv4RecordId);
            updateDynDNS(currentIps.ipv6, config.ipv6RecordId);
        }
    });
}

// Run the main function
main();
