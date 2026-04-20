require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const killPort = require('kill-port');

require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

const checkPort = async (port, maxPort = 65535) => {

    if (port > maxPort) {
        throw new Error("No available ports found");
    }

    try {
        await killPort(port, "tcp");
        await killPort(port, "udp");
        return port;
    } catch (err) {
        return checkPort(port + 1, maxPort);
    }
};

(async () => {
    const safePort = await checkPort(PORT);
    const getPort = (await import('get-port')).default; // dynamic import
    const final_port = await getPort({ port: safePort });

    console.log(`Port ${final_port} is free. Ready to start server.`);

    // Middleware
    app.use(cors({ origin: `http://localhost:${final_port}` }));
    app.use(express.json());
    app.use(morgan('dev'));

    // Routes
    app.use('/api/marketplace', require('./routes/marketplace.js'));
    app.use('/api/items', require('./routes/items'));
    app.use('/api/stats', require('./routes/stats'));

    /**
     * @route    GET /api/marketplace
     * @desc     This endpoint reads a market place contract deployed on Sepolia and returns a list of items for sale on a market place.
     * @author   Francois de la Rouviere
     * @access   https://github.com/fassadlr/invoblocks-assessment
     * @param    {Request}  req  - This is just a GET with no parameters passed.
     * @param    {Response} res  - Express response object.
     * @returns  {JSON}          - An array of:
     *                              {
     *                                  "0":"0xf61041F7e2Dd35848088f2fa719245b7932aC3f8",
     *                                  "1":"car1",
     *                                  "2":"1000",
     *                                  "3":true,
     *                                  "__length__":4,
     *                                  "owner":"0xf61041F7e2Dd35848088f2fa719245b7932aC3f8",
     *                                  "itemName":"car1",
     *                                  "price":"1000",
     *                                  "sold":true
     *                              }
     * @throws   500 on contract call failure
     *
     * @example
     * // Example request
     * curl  http://localhost:3001/api/marketplace'
     *
     * // Example response
     * {
     *   "message": "Value updated",
     *   "txHash": "0x..."
     * }
     */

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('client/build'));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
        });
    }

    // Start server
    app.listen(final_port, () => {
        console.log(`Backend running on http://localhost:${final_port}`);
    });
})();