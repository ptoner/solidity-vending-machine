# Vending Machine: DApp Edition
Code repository for the Solidity vending machine project I'm building on my Twitch stream. https://www.twitch.tv/patricktoner

I'm using test driven development to build a prototype DApp that will run as a smart contract on the Ethereum blockchain. 

I intend for this to function as a proof of concept for end-to-end application to do basic CRUD operations and run business calculations. When it's complete it will represent the general architecture that I'll use to build other DApps with. 

The general idea is that I don't want the front-end to care one bit that it's a blockchain app. It's going to be HTML and it's going to be javascript. All of the business logical will be abstracted away using a standard enterprise SOA design focused on dependency injection. Interfaces will be used to separate each logical layer.

It's going to use the MVC pattern in various different ways.

### Front-end
* The HTML won't care it's a dapp.
* There will be a javascript "controller" that will interact with the services and build HTML. The controller won't care it's a dapp.
* There will be a javascript "service" for each DTO. This is our logical API. We'll be writing integration tests mostly against these. 
    * This layer will know on some level that it's a dapp. It will be the thing that uses javascript (web3) to interact with the Ethereum contract.

### Back-end
* This is where Solidity comes in.
* The first point of contact on the Solidity side will be a smart contract whose public interface largely matches that of the javascript service layer. 
* Each public contract will expose CRUD operations and other related calls. 
* The data access layer will be accessed through an interface. This will allow us to possibly point the service to an updated data layer in future versions.
    * The owner of the DAO will be the service.

## Functionality
The vending machine will sell virtual items. Right now it's not important for the items to be transferrable in any way but that may come with time. They're intended to represent the kinds of related data fields that you would normally store in a SQL table with a primary key. 

* Create an item.
* Read an item. 
* Update an item.
* Delete an item.
* Get a paged list of items. Allow paging with a limit and an offset.
    * Write unit tests for paging.
* TODO: Get a paged list of items sorted by some criteria. Allow paging with a limit and an offset.
    * Write unit tests
* TODO: Model a one-to-many relationship.
* TODO: Model a many-to-many relationship.
* TODO: The contract should be able to be updated to easily add/remove data fields. Data should be pulled forward from old versions.
* TODO: Make the item itself ownable.
* TODO: Make the item implement one of the token specs to make it tradeable. 
* TODO: Write a front-end that actually does these things.

The end result of this will be a integration tested javascript object to access the dapp. I want the front-end to not even know that it's talking to Solidity. It really shoudn't care.




 

