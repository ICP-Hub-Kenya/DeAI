# IC Eliza ETH Wallet Demo 

AI Agents hold a lot of promise when it comes to automating tasks in crypto. But there are some challanges with them: 
1. Most AI Agents run in a web2 environment: which requires you to give your private keys, thus bringing some security concerns. 
2. Unless you've built some server to access the agent, you have to manually access some server just to control the agent 

The IC Eliza ETH Wallet Demo by [ ] is a starter template for developing your own crypto AI Agent 

A demo plugin for Eliza Agent Framework - allows a conversational AI Agent to interact with an Ethereum Deployed wallet on ICP 

Why would you deploy an Ethereum wallet on the IC?
- Use of threshold signatures allowing transactions to be signed without exposing private keys: threshold signature is a feature on ICP that allows 
multiple parties to sign a transaction without exposing the private keys.
- Wallet is always online and can self host it's own UI

The Wallet UI is a simple application that allows users to view the wallets balance, address and ICP Identity. Also allows to set security rules for the agent. 

## Getting started: 
1. Clone the repo: 
```bash 
git clone https://github.com/kristoferlund/ic-eliza-eth-wallet.git
``` 

This is the file structure of the project: 
```bash 
src
   |_backend # the evm wallet that creates the transactions and stores the data 
   |_evm_rpc # responsible for running  requests from ICP to the EVM RPC provider outside ICP
   |_frontend # hosts the wallet UI 
   |_internet_identity # responsible for handling authentication 
``` 

2. Setup the pre-requisites: 
An [Etherscan API key](https://etherscan.io/apis) is required to query the wallet ETH balance. Creating an Etherscan account is free.

Save the API key to a file named ``.env.local`` in the root of the project:

```bash
echo "VITE_ETHERSCAN_API_KEY=YOUR_API_KEY" > .env.local
``` 

2. Deploying the project: 
```bash 
npm install # install all the dependencies first

dfx start --clean --background  # start the local dfx replica 

dfx deploy # deploy all the canisters


    





