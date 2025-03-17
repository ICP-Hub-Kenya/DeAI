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
There are two repositories for this demo: 
1. [ic-eliza-eth-wallet](https://github.com/kristoferlund/ic-eliza-eth-wallet) - the Ethereum Wallet Deployed on ICP 
2. [ic-eliza-eth-wallet-plugin](https://github.com/kristoferlund/ic-eliza-eth-wallet-agent) - the Eliza pluging enabling the AI Agent to interact with the Ethereum wallet 

We'll first start by cloning and running the Ethereum Wallet then proceed to running the AI Agent that interacts with the Ethereum Wallet

### Deploy the Ethereum Wallet: 

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

# Pull and deploy the evm_rpc canister locally 
dfx deps pull 

dfx deps init evm_rpc --argument '(record {})' 

dfx deps deploy

dfx deploy # deploy all the canisters
```

Once that is complete you can check the UI in the frontend URL canister 

### Understanding and deploying the Eliza ETH Wallet Agent: 

The next step is to now to understand and deploy the Eliza ETH Wallet Agent

1. Clone the repo: 
```bash 
git clone https://github.com/kristoferlund/ic-eliza-eth-wallet-agent.git 

cd ic-eliza-eth-wallet-agent 
``` 

2. Understanding the file structure: 
```bash
|_src
     ... 
     |_plugins
         |_ic-eth-wallet # contains the actions for the agent
               |_ getAddress.ts # gets the ethereum address of the agent 
               |_ getBalance.ts # gets the ethereum balance of the agent
               |_ getIdentity.ts # getting the IC identity
               |_ sendEth.ts # sending ETH 
         |_canisters
         |_providers
               |_wallet 
                   |_ index.ts # responsible for managing internet identity and managing the communication with the deployed wallet
               |_ index.ts # contains the icETHWallet plugin 
```

The ``sendETH`` action is the most complicated one. It does the following: 
- Creates an instance of the wallet provider that enables communication with IC 
- We then parse the message from the user to a structured data that we can pass to the wallet
- It uses the ``composeContext`` and generate object functions of the eliza framework to properly structure the request 
   - It has some parameters: ``sendEthTemplate``: tranforms the prompt given by the user to a structured data needed to interact with the wallet canister 

2. Adding environment variables: 
We'll create a ``.env`` file and add the environment variables there

```bash 
touch .env 

# create the identity for the agent
dfx identity new ai_agent_identity --storage-mode=plaintext

# export the private key
dfx identity export ai_agent_identity

# Save the private key in a file 
dfx identity export ai_agent_identity > ai_agent_identity.pem 

# Extract the raw private key from the PEM file using OpenSSL 
dfx identity export ai_agent_identity | openssl ec -text -noout | grep -A 3 priv: | tail -n +2 | tr -d '[:space:]:' | tr -d '\n'

```

Copy the generated private key and paste it in the ``INTERNET_COMPUTER_PRIVATE_KEY`` field in the ``.env`` file 

Then take the ``backend`` URL from the deployed wallet and paste it in the ``IC_ETH_WALLET_CANISTER`` field in the ``.env`` file 

3. Starting the agent: 
```bash 
# install the dependencies 
pnpm install 

# start the agent
bash scripts/start.sh
```

Once it runs succesfully, this is what you'll see in your terminal: 
```bash
You: [2025-03-17 11:51:36] INFO: Maxwell Sterling III(214b8a0a-364e-047b-ab99-31060e6a222c) - Setting Model Provider:
    characterModelProvider: "openai"
    optsModelProvider: "openai"
    finalSelection: "openai"
[2025-03-17 11:51:36] INFO: Maxwell Sterling III(214b8a0a-364e-047b-ab99-31060e6a222c) - Selected model provider: openai
[2025-03-17 11:51:36] INFO: Maxwell Sterling III(214b8a0a-364e-047b-ab99-31060e6a222c) - Selected image model provider: openai
[2025-03-17 11:51:36] INFO: Maxwell Sterling III(214b8a0a-364e-047b-ab99-31060e6a222c) - Selected image vision model provider: openai
[2025-03-17 11:51:36] INFO: Initializing LlamaService...
```

Now you can press ``enter`` and start interacting with the agent. 

### Interacting with the agent: 
You can try out the following prompts: 
- what is my ethereum address?

- what is my internet identity?

- send some eth, like 0.0001 eth to 0xF6B34a431A5FDA268003D3a5613EA4B758d29794

Before sending some ETH: 
- You need to add some ETH to the wallet 
- You also need to set the agent rules 










    





