/*
 /$$$$$$$           /$$                            /$$$$$$  /$$           /$$      
| $$__  $$         | $$                           /$$__  $$| $$          | $$      
| $$  \ $$ /$$$$$$ | $$  /$$$$$$  /$$$$$$$       | $$  \__/| $$ /$$   /$$| $$$$$$$ 
| $$$$$$$//$$__  $$| $$ /$$__  $$| $$__  $$      | $$      | $$| $$  | $$| $$__  $$
| $$____/| $$$$$$$$| $$| $$  \ $$| $$  \ $$      | $$      | $$| $$  | $$| $$  \ $$
| $$     | $$_____/| $$| $$  | $$| $$  | $$      | $$    $$| $$| $$  | $$| $$  | $$
| $$     |  $$$$$$$| $$|  $$$$$$/| $$  | $$      |  $$$$$$/| $$|  $$$$$$/| $$$$$$$/
|__/      \_______/|__/ \______/ |__/  |__/       \______/ |__/ \______/ |_______/ 

@title PelonClubToken
@author baeza.eth (King Of The Pelones)
@notice PELON Token - The Native Token Powering pelon.club: The Revolutionary Token-Gated Educational Platform & Student Social Network. Unlock exclusive access to premium educational resources, connect with elite students and educators globally, and participate in the first decentralized learning ecosystem that monetizes knowledge while building community. Early adopters gain privileged access to cutting-edge content, networking opportunities, and governance rights. Join the Web3 education revolution - where learning meets blockchain innovation. Limited supply. Maximum opportunity.
@dev PelonClubToken is a comprehensive ERC20 token implementation that extends OpenZeppelin's standard token contracts with multiple advanced features:
     - Standard ERC20 functionality for transfers and approvals
     - ERC20Burnable: Allows token holders to burn their tokens
     - ERC1363: Enables payable token transfers, allowing tokens to call functions on recipient contracts
     - ERC20Permit: Supports gasless token approvals via EIP-2612 signatures
     - ERC20Votes: Provides voting functionality for governance and decision-making within the pelon.club ecosystem
     The token is deployed with a total supply of 1,000,000,000,000 PELON tokens (1 trillion) minted to the specified recipient address.
     - This contract has NO owner functions or administrative controls. Once deployed, the contract is fully decentralized and immutable - no address can mint new tokens, pause transfers, or modify any contract parameters.
     - This token has NO buy/sell fees. All transfers are fee-free, ensuring maximum value retention for token holders.

https://pelon.club
carlos@pelon.club
https://github.com/PelonClub
https://x.com/PelonClub
https://t.me/PelonClub
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC1363} from "@openzeppelin/contracts/token/ERC20/extensions/ERC1363.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

contract PelonClubToken is ERC20, ERC20Burnable, ERC1363, ERC20Permit, ERC20Votes {
    constructor(address recipient)
        ERC20("Pelon Club Token", "PELON")
        ERC20Permit("Pelon Club Token")
    {
        _mint(recipient, 1000000000000 * 10 ** decimals());
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
