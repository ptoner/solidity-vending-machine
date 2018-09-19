var ItemDaoBasic = artifacts.require("ItemDaoBasic");


contract('ItemDaoBasic', function(accounts) {

    it("Test create Payday", function() {

        var dao;

        return ItemDaoBasic.deployed().then(function (instance) {
            dao = instance;

            //Arrange
            var owner = dao;
            var version = 1;
            var title = "Payday";
            var inventory = 5;
            var active = true;


            //Act
            return dao.create(version, title, inventory, active);

        }).then(function(result) {

            result.logs.forEach(function(log){

                if (log.event == "LogNew") {
                    assert.isTrue(log.args.id.toNumber() == 1);
                    assert.isTrue(log.args.active, "Should be active");
                    assert.isTrue(log.args.title != 0, "Should have a title");
                    assert.isTrue(log.args.inventory == 5, "Should have 5 in stock");
                    assert.isTrue(log.args.owner == accounts[0], "Owner should be this contract");
                }
            });


        })
    });







});


