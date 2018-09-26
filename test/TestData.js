var ItemDaoBasic = artifacts.require("ItemDaoBasic");


contract('ItemDaoBasic', async (accounts) => {


    it("Test create Payday", async () => {

        let dao = await ItemDaoBasic.deployed();

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
    });



    it("Test create Payday no title", async () => {

        let dao = await ItemDaoBasic.deployed();

        //Arrange
        var title="";
        var inventory = 5;

        let error;

        //Act
        try {
            let result = await dao.create(title, inventory);
        } catch(ex) {
            error = ex;
            console.log(ex.name);
            console.log(ex.message);
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating a Payday without a title" );

    });


    //
    // it("Test read Payday", async () => {
    //
    //     let dao = await ItemDaoBasic.deployed();
    //
    //     //Arrange
    //     let createdId = await createPaydayGetCreatedId(dao);
    //
    //     //Act
    //     let resultArray = await dao.read.call(createdId);
    //
    //     id = resultArray[0];
    //     owner = resultArray[1];
    //     version = resultArray[2];
    //     title = resultArray[3];
    //     inventory = resultArray[4];
    //     index = resultArray[5];
    //
    //     assert.isTrue(id.toNumber() === createdId.toNumber(), "Ids need to match");
    //     assert.isTrue(index == 1, "Index should be 1");
    //     assert.isTrue(title == "Payday", "Should have a title");
    //     assert.isTrue(inventory == 5, "Should have 5 in stock");
    //     assert.isTrue(owner == accounts[0], "Owner should be this contract");
    //
    // });
    //
    //
    // it("Test update Payday", async () => {
    //
    //     let dao = await ItemDaoBasic.deployed();
    //
    //     //Arrange
    //     let createdId = await createPaydayGetCreatedId(dao);
    //
    //     //Act
    //     let result = await dao.update(createdId, 2, "Not Payday", 4);
    //
    //
    //     //Assert
    //     var log = getLogByEventName("ItemEvent", result.logs);
    //
    //     assert.isTrue(log.args.id == createdId.toNumber(), "IDs do not match");
    //     assert.isTrue(log.args.version == 2, "Version should be 2");
    //     assert.isTrue(log.args.title == "Not Payday", "Title should be Not Payday");
    //     assert.isTrue(log.args.inventory == 4, "Inventory should be 4");
    //     assert.isTrue(log.args.index == 2, "Index should be 2");
    //     assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");
    //     assert.isTrue(log.args.eventType == "UPDATE", "Type should be UPDATE");
    //
    // });
    //
    //
    // it("Test remove Payday", async () => {
    //
    //     let dao = await ItemDaoBasic.deployed();
    //
    //     //Arrange
    //     let createdId = await createPaydayGetCreatedId(dao);
    //
    //
    //     //Act
    //     let result = await dao.remove(createdId);
    //
    //     //Assert
    //
    //     //Check log
    //     var log = getLogByEventName("ItemEvent", result.logs);
    //
    //     assert.isTrue(log.args.id == createdId.toNumber(), "IDs do not match");
    //     assert.isTrue(log.args.version == 1, "Version should be 1");
    //     assert.isTrue(log.args.title == "Payday", "Title should be Payday");
    //     assert.isTrue(log.args.inventory == 5, "Inventory should be 5");
    //     assert.isTrue(log.args.index == 3, "Active should be false");
    //     assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");
    //     assert.isTrue(log.args.eventType == "REMOVE", "Type should be REMOVE");
    //
    //
    //     //Do a read and make sure it's gone
    //     let resultArray = await dao.read(createdId);
    //     console.log(resultArray);
    //     assert.isTrue(resultArray[0] == undefined, "ID was not null");
    //     assert.isTrue(resultArray[1] == undefined, "Version was not null");
    //     assert.isTrue(resultArray[2] == undefined, "Title was not null");
    //     assert.isTrue(resultArray[3] == undefined, "Inventory was not null");
    //     assert.isTrue(resultArray[4] == undefined, "Index was not null");
    //
    //
    //     // console.log(resultArray);
    //
    // });










    /*******
     *
     *
     * HELPER STUFF
     *
     *
     *
     */






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
        ex.message


    }




    //Create tests that measure gas consumption of all of the functions

    //Create with empty data

    //Before and after each test log the gas usage visually.

    //Make sure to write unit tests that insert a bunch of records and remove them in a sequence to make sure our re-indexing is working.

});


