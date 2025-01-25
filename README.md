# Decentralized AI: 

## DeAI Overview: 
The intersection of AI and blockchain technology 

DeAI - is artificial intelligence running on a fully and decentralized platform 

#### Examples: 
- ***Fully onchain training and inference**: this is the long term goal of DeAI on ICP. After they have intergrated GPU enabled Nodes
- ***Fully onchain inference using models trained offchain**: Model is trained offchain then uploaded on chain. A good example is the image classification model.
- ***Storing the model onchain and running the inference on a users device**: Assuming that the model is trained off chain then uploaded on chain. The downside of this is that the model has to be downloaded to the users device. 
- ***Tokenization, marketplace, orchestration**: using smart contracts as the tokenization, marketplace and orchestration layer for AI models and AI hardware. 
- ***Smart contracts calling Web2 AI services**: most basic version of onchain AI, where smart contracts make HTTP requests to Web2 AI services such as OpenAI.

## Why DeAI? 
- DeAI can solve AI's trust problem (which is the biggest problemm in AI). Nowadays users have to trust centralized servers, they have no idea of how the models have been trained, how their data is being used or whether they work reliably and consistently. 

Traditional blockchains cannot run AI models fully on chain. Because of the computational power and memory required, they are too high. 

ICP Smart contracts can run AI models onchain because of the following feaures: 
1. Web Assembly virtual machine that gives it a near native performance
2. Deterministic time slicing that automatically splits long running computational over multiple blocks 
3. Powerful node hardware used by ICP nodes 

Add ICP AI Projects [here](https://internetcomputer.org/docs/current/developer-docs/ai/overview#icp-ai-projects)

## Types of Inference: 

- ***Inference***: Using trained model to draw conclusions from new data. 

Canisters can utilize inference in 4 ways: 
1. Onchain 
2. On device 
3. Through HTTPs Outcalls 

### Onchain Inference:
ICP Supports on chain inference of small models using libraries like [Sanos Tact](https://github.com/sonos/tract)

Examples of onchain inference [here](https://internetcomputer.org/docs/current/developer-docs/ai/inference#examples)

### On device Inference:
This would require the user to download the model from a canister to their device. 

Downside of this is that the user experience won't be that good because of reduced latency - as the model has to be downloaded to the device.

Example is [DeVinci](https://github.com/patnorris/DecentralizedAIonIC)

### Inference with HTTPs Outcalls:
Canisters will make HTTPs requests to Web2 services such as OpenAI and Claude using HTTPs outcalls

Example of Juno + Open AI [here](https://github.com/peterpeterparker/juno-openai)

## Training Models on ICP: 
Continue from here
firebase proxy 

Proxy reasons https://docs.google.com/document/d/1a0vRA4ST9TSoBNDK_lAFtjKllTcAgs8NwlGi8bZKeXg/edit?usp=sharing 