# Introduction to ICP Ninja 

> ICP Ninja is a Web Based development environment that is designed to simplify the creation and deployment of applications on ICP

It will help developers who want to quickluy get started with building on ICP, without going through the whole process of complex setups 

## What is ICP Ninja: 
[ICP Ninja](https://icp.ninja) is a browser based IDE (Intergrated Development Environment) that allows someone to: 
* Directly build and deplpy ICP canisters directly from the web browser 
* Develop applications without downloading the canister development kit (CDK), create a developer identity, or acquire cycles
* Access project templates that show ICP's unique capabilities 
* Deploy projects with a simple click of a button 

📝 Check out the official article [here](https://medium.com/dfinity/enhancing-icp-dapp-development-using-icp-ninja-ai-11d5dad408ef#6423)

## ✨ Key features: 
ICP Ninja has these key features: 
1. **Easy Deployment**: Select a template project and click "Deploy" to get your application running on the mainnet
2. **Multiple language support**: Develop in Motoko, Rust, and (in pipeline) Typescript & Python
3. **AI Learning Assistant**: get help with code explanation, fixing and optimization from AI assistant trained on the documentation 
4. **Project Sharing**: Share whatever projects you've made with others via direct links, or export to GitHub 
5. **Authentication Options:** Log in with [internet identity](https://internetcomputer.org/internet-identity) or [Github](https://github.com/) to save your progress
6. **Developer Tools:** Access canister logging, live project compilation logs, and a professional code editor

## 🚀 Getting started & How to use ICP Ninja: 
1. **Access the platform**: Visit [icp.ninja](https://icp.ninja)

![icpninja](./images/icpninja.png)

2. **Choose a project**: Select from example templates or start a new project

### Create a new project and start from scratch 

![newproject](./images/createproject.png)

* Select the project type: whether fullstack, backend only or frontend only 
* Select the backend language, currently supported ones are motoko and rust only 
* Click on "Create Project" to get started

**OR**

From the example templates, click on the project you want to use.
![chooseproject](./images/exampleproject.png)

For my case I've choosen LLM Chatbot 

![llmchatbot](./images/llmchatbot.png)

* I will then select my preferred language, motoko or rust
* Then check out the 13 steps that serve as an introduction to make you familiar with the online IDE. Go through them keenly to understand the editor and utilize the different features present. 

> **Note**: Deployed projects remain active for 20 minutes but can be redeployed as needed. For long-term development, you'll want to migrate to a local environment.

Now that we have an understanding of ICP Ninja, let's proceed to create an LLM Chatbot using ICP Ninja and the LLM Canister. 