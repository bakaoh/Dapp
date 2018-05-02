import { expect } from 'chai';
import Web3 from 'web3';

import { checkERC20Contract } from "../../src/util/validations";

//Use Rinkey testnet  in case of test on travis or else use localhost:9545
const web3Url = process.env.NODE_ENV === 'test'
  ? 'https://rinkeby.infura.io/3632KD8OP9iixQqYbSjj'
  : 'http://localhost:9545';

// set the provider you want from Web3.providers
const web3 = new Web3(new Web3.providers.HttpProvider(web3Url));


describe('CheckContractAction', () => {

  it('should validate contract based on the valid address provided', (done) => {
    const address = '0x29317b796510afc25794e511e7b10659ca18048b'; // Market Token Address
    checkERC20Contract(web3, address, function (result) {
      expect(result).to.equals(undefined);
      done();
    });
  });

  it('should invalidate the contract based on the invalid smart contract address provided', (done) => {
    const address = '0x1234567890098765432112345678900987654321';
    checkERC20Contract(web3, address, function (result) {
      expect(result).to.equals('Not a valid smart contract address');
      done();
    });
  });

  it('should invalidate the contract based on the invalid ERC20 address provided', (done) => {
    const address = '0xc51b536AD6169bb7F8c893FF4b744d03433455cB';
    checkERC20Contract(web3, address, function (result) {
      expect(result).to.equals('Not a valid ERC20 smart contract address');
      done();
    });
  });

});
