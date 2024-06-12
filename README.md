# Dynamic DNS Updater

This Node.js application automatically updates your dynamic DNS records using the IONOS API. It regularly checks your current IP addresses (both IPv4 and IPv6) and updates the DNS records if there are any changes. The application is designed specifically for IONOS Dynamic DNS.

## Features

- Automatically retrieves and updates DNS zone ID and record IDs if not provided.
- Regularly checks for IP address changes and updates DNS records accordingly.
- Supports both IPv4 and IPv6 addresses.

## Requirements

- Node.js (version 14.x or higher)
- An API key for the IONOS API
- A domain name managed by IONOS

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/dynamic-dns-updater.git
    cd dynamic-dns-updater
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Configure the `config.json` file in the root directory of the project based on the sample configuration below.

## Configuration

The application requires a `config.json` file with the following structure:

```json
{
    "apiKey": "prefix.key",
    "domainName": "sample.domain.com",
    "ipv4": true,
    "ipv6": true,
    "zoneId": "",
    "ipv4RecordId": "",
    "ipv6RecordId": ""
}
```
- **apiKey:** Your API key for the IONOS API.<br>
- **domainName:** The domain name you want to update.<br>
- **ipv4:** De-/Activates DynDNS update for IPv4<br>
- **ipv6:** De-/Activates DynDNS update for IPv6<br>
- **zoneId: _(Optional)_** The DNS zone ID. If not provided, the application will retrieve and add it automatically.<br>
- **ipv4RecordId: _(Optional)_** The record ID for the IPv4 address. If not provided, the application will create and add it automatically.<br>
- **ipv6RecordId: _(Optional)_** The record ID for the IPv6 address. If not provided, the application will create and add it automatically.<br>

## Usage
To start the application, simply run:

```sh
npm run start
```
The application will:

Load the configuration from config.json.
Retrieve the current IP addresses (both IPv4 and IPv6).
Create DNS records if they do not exist.
Set up a cron job to check the IP addresses every second and update the DNS records if they change.

## Linux Service
To install the application as service on linux, simply run:
```
npm 
```

## Contributing
Feel free to submit issues and pull requests. Contributions are always welcome!

## License
This project is licensed under the MIT License.