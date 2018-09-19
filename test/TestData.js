var data = artifacts.require("ItemDaoBasic");


contract('ItemDaoBasic', function(accounts) {

    it("test create item", function() {

        var dao;
        var logNewEvent;

        return data.deployed().then(function (instance) {
            dao = instance;

            logNewEvent = dao.LogNew();



            //Arrange
            var owner = dao;
            var version =1;
            var title = "Payday";
            var inventory = 5;
            var active = true;

            // console.log(dao);

            //Act
            return dao.create.call(version, title, inventory, active);
        }).then(function(createdId) {

            var actualCreatedId = createdId.toNumber();

            console.log(actualCreatedId == 1);


            logNewEvent.watch(function(error, result){

                consle.log("EVENT:");

                if (!error) {

                   //Success
                    assert.isTrue(result.active, "Should be active");
                    assert.isTrue(result.title != 0, "Should have a title");
                    assert.isTrue(result.inventory == 5, "Should have 5 in stock");
                    assert.isTrue(result.owner == dao, "Owner should be this contract");


                } else {
                    //Error
                    assert.isTrue(false);
                }
            });


            // assert.isTrue(createdId != 0); //want to be more specific

            // assert.isTrue(created.active(), "Should be active");
            // assert.isTrue(created.title() != 0, "Should have a title");
            // assert.isTrue(created.inventory() == 5, "Should have 5 in stock");
            // assert.isTrue(created.owner() == dao, "Owner should be this contract");
        })
    });

});


