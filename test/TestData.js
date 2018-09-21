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
        assertIsPayday(
            log.args.active,
            log.args.title,
            log.args.inventory,
            log.args.owner
        );


    });



    it("Test read Payday", async () => {

        let dao = await ItemDaoBasic.deployed();

        //Arrange
        let createdId = await createPaydayGetCreatedId(dao);

        //Act
        let resultArray = await dao.read.call(createdId);

        id = resultArray[0];
        owner = resultArray[1];
        version = resultArray[2];
        title = resultArray[3];
        inventory = resultArray[4];
        active = resultArray[5];

        assert.isTrue(id.toNumber() === createdId.toNumber(), "Ids need to match");
        assertIsPayday(active, title, inventory.toNumber(), owner);

    });


    it("Test update Payday", async () => {

        let dao = await ItemDaoBasic.deployed();

        //Arrange
        let createdId = await createPaydayGetCreatedId(dao);

        //Act
        let result = await dao.update(createdId, 2, "Not Payday", 4);



        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.isTrue(log.args.id == createdId.toNumber(), "IDs do not match");
        assert.isTrue(log.args.version == 2, "Version should be 2");
        assert.isTrue(log.args.title == "Not Payday", "Title should be Not Payday");
        assert.isTrue(log.args.inventory == 4, "Inventory should be 4");
        assert.isTrue(log.args.active == true, "Active should still be true");
        assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");
        assert.isTrue(log.args.eventType == "UPDATE", "Type should be NEW");

    });



    function createPayday(dao) {

        var owner = dao;
        var version = 1;
        var title = "Payday";
        var inventory = 5;
        var active = true;

        return dao.create(version, title, inventory, active);
    }


    async function createPaydayGetCreatedId(dao) {
        let result = await createPayday(dao);

        let log = getLogByEventName("ItemEvent", result.logs);
        let createdId = log.args.id;
        return createdId;
    }


    function assertIsPayday(active, title, inventory, owner) {
        assert.isTrue(active == true, "Should be active");
        assert.isTrue(title == "Payday", "Should have a title");
        assert.isTrue(inventory == 5, "Should have 5 in stock");
        assert.isTrue(owner == accounts[0], "Owner should be this contract");
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




    //Create tests that measure gas consumption of all of the functions

    //Before and after each test log the gas usage visually.

});


