const express = require('express');
const Web3 = require('web3');
const marketPlaceAbi = require("../contract/marketplace_sol_MarketPlace.json");

const web3 = new Web3.Web3('https://ethereum-sepolia-rpc.publicnode.com');
const router = express.Router();

// JSON serializer issue with BigInt's
BigInt.prototype.toJSON = function() {
    return this.toString()
} 

const marketPlaceContract = new web3.eth.Contract(marketPlaceAbi,  process.env.CONTRACT_ADDRESS);

function sendResult(res, result) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.json(result);
}

// GET /api/marketplace
router.get('/', async (req, res, next) => {
    try {
        const result = await marketPlaceContract.methods.listMarketItems().call();
        sendResult(res, result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);        
    }
});

module.exports = router;