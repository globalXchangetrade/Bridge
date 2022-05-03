// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Remix style import
//import { IERC20 } from "@openzeppelin/contracts@4.0.0/token/ERC20/IERC20.sol";

//Brownie style import
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Bridge {

    IERC20 private token;

    address gateway;

    event TokensSent(address indexed requester, bytes32 indexed mainDepositHash, uint amount, uint timestamp);
    event TokensReceived(address indexed requester, bytes32 indexed sideDepositHash, uint amount, uint timestamp);

    constructor (address _mainToken, address _gateway) {
        token = IERC20(_mainToken);
        gateway = _gateway;
    }

    function sendTokens (address _requester, uint _bridgedAmount, bytes32 _mainDepositHash) external {
        //Added code
        token.burn(msg.sender, _bridgedAmount);
        
        emit TokensSent(_requester, _mainDepositHash, _bridgedAmount, block.timestamp);
    }

    function receiveTokens (address _requester, uint _bridgedAmount, bytes32 _sideDepositHash) onlyGateway external {
        //Updated code
        token.mint(_requester, _bridgedAmount);
        emit TokensReceived(_requester, _sideDepositHash, _bridgedAmount, block.timestamp);
    }

    modifier onlyGateway {
      require(msg.sender == gateway, "only gateway can execute this function");
      _;
    }
    

}
