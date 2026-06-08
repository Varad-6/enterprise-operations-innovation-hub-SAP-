const axios = require('axios');

const titles = [
    'Laptop Request',
    'VPN Access Request',
    'Software Installation',
    'Payroll Query',
    'Hardware Upgrade'
];

async function createRequest() {

    const title =
        titles[Math.floor(Math.random() * titles.length)];

    try {

        const response = await axios.post(
            'http://localhost:4004/odata/v4/operations/Requests',
            {
                Title: title,
                Description: `${title} generated automatically`,
                Employee_ID:
                '11111111-eeee-1111-eeee-111111111111'
            }
        );

        console.log('Created:', title);

    } catch (err) {

        console.error(
            err.response?.data || err.message
        );

    }

}

console.log('Generator Started');

createRequest();

setInterval(createRequest, 30000);