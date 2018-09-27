var ItemDaoBasic = artifacts.require("ItemDaoBasic");


contract('ItemDaoBasic', async (accounts) => {

    let dao;

    //Keep track of how many items we inserted so that we can run counts.
    let createdCount = 0;


    it("Test create Payday", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange and act
        let result = await createPayday(dao);


        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.isTrue(log.args.id.toNumber() == 1, "ID should be 1");
        assert.isTrue(log.args.eventType == "NEW", "Type should be NEW");
        assert.isTrue(log.args.index == 0, "Index should be 0");
        assert.isTrue(log.args.title == "Payday", "Should have a title");
        assert.isTrue(log.args.inventory == 5, "Should have 5 in stock");
        assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");


        //Also verify with a read.
        let item = await read(log.args.id.toNumber());

        assert.equal(item.id.toNumber(), log.args.id.toNumber(), "Ids need to match");
        assert.equal(item.index, 0, "Index should be 1");
        assert.equal(item.title, "Payday", "Should have a title");
        assert.equal(item.inventory, 5, "Should have 5 in stock");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");


        //Cleanup
        createdCount++;
    });


    it("Test create Payday no title", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        var title="";
        var inventory = 5;

        let error;

        //Act
        try {
            let result = await dao.create(title, inventory);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating a Payday without a title" );
        assert.equal("_title is required", getRequireMessage(error), "Should fail because title is required");

    });


    it("Test create Payday negative inventory", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        var title="Payday";
        var inventory = -1;

        let error;

        //Act
        try {
            let result = await dao.create(title, inventory);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating a Payday with a negative inventory");
        assert.equal("_inventory must be greater than or equal to 0", getRequireMessage(error), "Should fail because inventory is less than 0");

    });


    it("Test read Payday", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        let createdId = await createPaydayGetCreatedId(dao);

        //Act
        let item = await read(createdId);

        assert.equal(item.id.toNumber(), createdId.toNumber(), "Ids need to match");
        assert.equal(item.index, 1, "Index should be 1");
        assert.equal(item.title, "Payday", "Should have a title");
        assert.equal(item.inventory, 5, "Should have 5 in stock");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");

        //Cleanup
        createdCount++;

    });



    it("Test read non-existent item ID", async () => {

        dao = await ItemDaoBasic.deployed();

        let error;

        //Act
        try {
            let resultArray = await dao.read(42);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item");

    });


    it("Test read non-existent negative ID", async () => {

        dao = await ItemDaoBasic.deployed();

        //Act
        try {
            let resultArray = await dao.read(-42);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item with negative ID");

    });


    it("Test update Payday", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        let createdId = await createPaydayGetCreatedId(dao);

        //Act
        let result = await dao.update(createdId, "Not Payday", 4);


        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.equal(log.args.id,createdId.toNumber(), "IDs do not match");
        assert.equal(log.args.version, 2, "Version should be 2");
        assert.equal(log.args.title, "Not Payday", "Title should be Not Payday");
        assert.equal(log.args.inventory, 4, "Inventory should be 4");
        assert.equal(log.args.index, 2, "Index should be 2");
        assert.equal(log.args.owner,accounts[0], "Owner should be this contract");
        assert.equal(log.args.eventType, "UPDATE", "Type should be UPDATE");

        //Cleanup
        createdCount++;

    });


    it("Test remove Payday", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        let createdId = await createPaydayGetCreatedId(dao);


        //Act
        let result = await dao.remove(createdId);


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


        //Do a read and make sure it's gone
        let error;

        //Act
        try {
            let resultArray = await dao.read(createdId);
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "Not an error :(");
        assert.equal("This ID does not exist", getRequireMessage(error), "Should fail to read nonexistent item");


    });


    it("Test count", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange

        //Act
        let result = await dao.count();


        //Assert
        assert.equal(result.toNumber(), createdCount, "Count is incorrect");

    });


    it("Delete all then count", async () => {

        dao = await ItemDaoBasic.deployed();

        //Arrange
        let items = await readItemList(Number.MAX_SAFE_INTEGER, 0);

        //Delete them all
        for (item of items) {
            await dao.remove(item.id);
        }

        //Act
        let result = await dao.count();


        //Assert
        assert.equal(result.toNumber(), 0, "Count is incorrect");

    });




    /*******
     *
     *
     * HELPER STUFF
     *
     *
     *
     */


    async function read(id) {
        let resultArray = await dao.read(id);
        return itemMapper(resultArray);
    }


    async function readItemList(limit, offset) {

        let currentCount = await dao.count();

        let items = [];

        for (var i=offset; (i < currentCount) || (i - offset == limit); i++) {
            let resultArray = await dao.readByIndex(i);
            items.push(itemMapper(resultArray));
        }

        return items;

    }


    function itemMapper(resultArray) {
        return {
            id: resultArray[0],
            owner: resultArray[1],
            version: resultArray[2],
            title: resultArray[3],
            inventory: resultArray[4],
            index: resultArray[5]
        }
    }




    function createPayday(dao) {

        var owner = dao;
        var title = "Payday";
        var inventory = 5;

        return dao.create(title, inventory);
    }


    async function createPaydayGetCreatedId(dao) {
        let result = await createPayday(dao);

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


