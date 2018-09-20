var ItemDaoBasic = artifacts.require("ItemDaoBasic");


contract('ItemDaoBasic', async (accounts) => {


    it("Test create Payday", async () => {

        let dao = await ItemDaoBasic.deployed();

        //Arrange and act
        let result = await createPayday(dao);

        //Assert
        var log = getLogByEventName("LogNew", result.logs);

        assert.isTrue(log.args.id.toNumber() == 1);
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
        let result = await createPayday(dao);

        let log = getLogByEventName("LogNew", result.logs);
        let createdId = log.args.id;


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



    function createPayday(dao) {

        var owner = dao;
        var version = 1;
        var title = "Payday";
        var inventory = 5;
        var active = true;

        return dao.create(version, title, inventory, active);
    }

    function assertIsPayday(active, title, inventory, owner) {
        assert.isTrue(active == true, "Should be active");
        assert.isTrue(title == "Payday", "Should have a title");
        assert.isTrue(inventory == 5, "Should have 5 in stock");
        assert.isTrue(owner == accounts[0], "Owner should be this contract");
    }


    function getLogByEventName(eventName, logs) {

        var found;

        logs.forEach(function(log){

            if (log.event == eventName) {
                found = log;
            }
        });

        return found;


    }




});


