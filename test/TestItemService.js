//Contract dependencies
var ItemDaoBasic = artifacts.require("ItemDaoBasic");

//Javascript dependencies
var ItemService = require('../src/js/item-service.js');





contract('ItemDaoBasic', async (accounts) => {

    //Keep track of how many items we inserted so that we can run counts.
    let createdCount = 0;

    var itemService = new ItemService();



    beforeEach('Setup each test', async () => {
        itemService.dao = await ItemDaoBasic.deployed();
    });



    it("Test create Item", async () => {

        //Arrange and act
        let result = await createPayday();

        // printReceipt("Create Payday", result);

        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.isTrue(log.args.id.toNumber() == 1, "ID should be 1");
        assert.isTrue(log.args.eventType == "NEW", "Type should be NEW");
        assert.isTrue(log.args.index == 0, "Index should be 0");
        assert.isTrue(log.args.title == "Payday", "Should have a title");
        assert.isTrue(log.args.inventory == 5, "Should have 5 in stock");
        assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");

        assert.isBelow(result.receipt.gasUsed, 197126, "Create used more than 197125 gas"); //Arbitrary value as a starting point


        //Also verify with a read.
        let item = await itemService.callRead(log.args.id.toNumber());

        assert.equal(item.id.toNumber(), log.args.id.toNumber(), "Ids need to match");
        assert.equal(item.index, 0, "Index should be 1");
        assert.equal(item.title, "Payday", "Should have a title");
        assert.equal(item.inventory, 5, "Should have 5 in stock");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");


        //Cleanup
        createdCount++;
    });


    it("Test create Item: no title", async () => {

        //Arrange
        var title="";
        var inventory = 5;

        let error;

        //Act
        try {
            let result = await itemService.sendCreate(title, inventory);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating a Payday without a title" );
        assert.equal("_title is required", getRequireMessage(error), "Should fail because title is required");

    });


    it("Test create Item: negative inventory", async () => {

        //Arrange
        var title="Payday";
        var inventory = -1;

        let error;

        //Act
        try {
            let result = await itemService.sendCreate(title, inventory);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating a Payday with a negative inventory");
        assert.equal("_inventory must be greater than or equal to 0", getRequireMessage(error), "Should fail because inventory is less than 0");

    });


    it("Test read Item", async () => {

        //Arrange
        let createdId = await createPaydayGetCreatedId();

        //Act
        let item = await itemService.callRead(createdId);

        assert.equal(item.id.toNumber(), createdId.toNumber(), "Ids need to match");
        assert.equal(item.index, 1, "Index should be 1");
        assert.equal(item.title, "Payday", "Should have a title");
        assert.equal(item.inventory, 5, "Should have 5 in stock");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");

        //Cleanup
        createdCount++;

    });


    it("Test read Item: non-existent item ID", async () => {

        let error;

        //Act
        try {
            let resultArray = await itemService.callRead(42);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item");

    });


    it("Test read Item: non-existent negative ID", async () => {

        //Act
        try {
            let resultArray = await await itemService.callRead(-42);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item with negative ID");

    });


    it("Test update Item", async () => {

        //Arrange
        let createdId = await createPaydayGetCreatedId();

        //Act
        let result = await itemService.sendUpdate(createdId, "Not Payday", 4);


        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.equal(log.args.id,createdId.toNumber(), "IDs do not match");
        assert.equal(log.args.version, 2, "Version should be 2");
        assert.equal(log.args.title, "Not Payday", "Title should be Not Payday");
        assert.equal(log.args.inventory, 4, "Inventory should be 4");
        assert.equal(log.args.index, 2, "Index should be 2");
        assert.equal(log.args.owner,accounts[0], "Owner should be this contract");
        assert.equal(log.args.eventType, "UPDATE", "Type should be UPDATE");

        assert.isBelow(result.receipt.gasUsed, 52973, "Create used more than 52972 gas"); //Arbitrary value as a starting point


        //Try to read it and make sure the values stuck.
        let item = await itemService.callRead(createdId.toNumber());


        assert.equal(item.id, createdId.toNumber(), "IDs do not match");
        assert.equal(item.version, 2, "Version should be 2");
        assert.equal(item.title, "Not Payday", "Title should be Not Payday");
        assert.equal(item.inventory, 4, "Inventory should be 4");
        assert.equal(item.index, 2, "Index should be 2");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");


        //Cleanup
        createdCount++;

    });


    it("Test remove Item", async () => {

        //Arrange
        let createdId = await createPaydayGetCreatedId();


        //Act
        let result = await itemService.sendRemove(createdId);


        //Assert

        //Check log
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.equal(log.args.id, createdId.toNumber(), "IDs do not match");
        assert.equal(log.args.version, 1, "Version should be 1");
        assert.equal(log.args.title,"Payday", "Title should be Payday");
        assert.equal(log.args.inventory , 5, "Inventory should be 5");
        assert.equal(log.args.index, 3, "Active should be false");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");
        assert.equal(log.args.eventType, "REMOVE", "Type should be REMOVE");

        assert.isBelow(result.receipt.gasUsed, 31504, "Create used more than 31504 gas"); //Arbitrary value as a starting point


        //Do a read and make sure it's gone
        let error;

        //Act
        try {
            let resultArray = await itemService.callRead(createdId);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item");


    });


    it("Test count Items", async () => {

        //Arrange

        //Act
        let result = await itemService.callCount();


        //Assert
        assert.equal(result.toNumber(), createdCount, "Count is incorrect");

    });


    it("Delete all Items then count", async () => {

        //Arrange
        let items = await itemService.callReadItemList(Number.MAX_SAFE_INTEGER, 0);

        //Delete them all
        for (item of items) {
            let resultArray = await itemService.sendRemove(item.id.toNumber());
        }

        //Act
        let result = await itemService.callCount();


        //Assert
        assert.equal(result.toNumber(), 0, "Count is incorrect");

    });


    it("Add 50 records then count", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await createPaydayGetCreatedId();
        }

        //Act
        let result = await itemService.callCount()


        //Assert
        assert.equal(result.toNumber(), 50, "Count is incorrect");

    });


    it("Test count by removing some Items", async () => {

        //Arrange - 50 items already exist at this point

        //Get all of them
        let items = await itemService.callReadItemList(Number.MAX_SAFE_INTEGER, 0);


        //Choose a few to delete.
        let indexesToDelete = [0, 1, 4, 10, 15, 20, 25, 30];

        for (index of indexesToDelete) {
            await itemService.sendRemove(items[index].id);
            items.splice(index, 1);
        }


        //Act
        let result = await itemService.callCount();



        //Assert
        assert.equal(result.toNumber(), items.length, "Count is incorrect");


        //Loop through remaining items and make sure they're all here.
        //They won't be in the same order due to how we delete things in the contract.
        //Make sure there's no duplicates either.
        let counter = 0;
        for (var i=0; i < items.length; i++) {

            var foundIds = [];

            let existingItem = await itemService.callReadByIndex(counter);


            var exists = false;
            var duplicate = false;

            //Check if we have a local copy of this item.
            for (item of items) {
                if (item.id.toNumber() == existingItem.id.toNumber()) {
                    exists = true;
                    break;
                }
            }

            //Check if we've already fetched this id.
            duplicate = foundIds.includes(existingItem.id.toNumber());

            foundIds.push(existingItem.id.toNumber());

            assert.isTrue(exists, "Item doesn't exist locally");
            assert.equal(duplicate, false, "There's a duplicate item");
            assert.equal(existingItem.index, counter, "The index of this item doesn't match the one it's found at");

            counter++;
        }

    });


    it("Test indexing during remove", async () => {


        //Arrange

        //Delete all of the existing records
        let items = await itemService.callReadItemList(Number.MAX_SAFE_INTEGER, 0);

        for (item of items) {
            await itemService.sendRemove(item.id.toNumber());
        }

        assert.equal(await itemService.callCount(), 0, "Failed to delete all items");


        //Insert 3 records
        let createdId1 = await createPaydayGetCreatedId();
        let createdId2 = await createPaydayGetCreatedId();
        let createdId3 = await createPaydayGetCreatedId();


        //Act - delete the middle one
        await itemService.sendRemove(createdId2.toNumber());

        //Assert
        assert.equal(await itemService.callCount(), 2, "Should have 2 items");

        //Get the first one
        let itemAtIndex0 = await itemService.callReadByIndex(0);
        assert.equal(itemAtIndex0.id.toNumber(), createdId1.toNumber(), "Item has wrong ID");
        assert.equal(itemAtIndex0.index.toNumber(), 0, "Item has wrong index");

        //Get the second one
        let itemAtIndex1 = await itemService.callReadByIndex(1);
        assert.equal(itemAtIndex1.id.toNumber(), createdId3.toNumber(), "Item has wrong ID");
        assert.equal(itemAtIndex1.index.toNumber(), 1, "Item has wrong index");



    });







    function printReceipt(title, result) {
        receipt = result.receipt;

        // console.log(receipt);

        console.log("************************************************");
        console.log(`${title}`);
        console.log("************************************************");
        console.log(`transactionHash:    ${receipt.transactionHash}` );
        console.log(`blockHash:          ${receipt.blockHash}` );
        console.log(`blockNumber:        ${receipt.blockNumber}` );
        console.log(`gasUsed:            ${receipt.gasUsed}` );
        console.log(`cumulativeGasUsed:  ${receipt.cumulativeGasUsed}` );
        console.log("************************************************");

    }




    function createPayday() {

        var owner = itemService.dao;
        var title = "Payday";
        var inventory = 5;

        return itemService.sendCreate(title, inventory);
    }


    async function createPaydayGetCreatedId() {
        let result = await createPayday();

        let log = getLogByEventName("ItemEvent", result.logs);
        let createdId = log.args.id;
        return createdId;
    }






    function getLogByEventName(eventName, logs) {

        if (!logs) return;

        var found;

        logs.forEach(function(log){

            if (log.event == eventName) {
                found = log;
            }
        });

        return found;


    }


    function getRequireMessage(ex) {
        // return ex.message.substr(43);
        // return ex.message;
        return ex.message.substr(ex.message.lastIndexOf(": revert")+8).trim();
    }




    //Create tests that measure gas consumption of all of the functions

    //Create with empty data

    //Before and after each test log the gas usage visually.

    //Make sure to write unit tests that insert a bunch of records and remove them in a sequence to make sure our re-indexing is working.

});


