var DaoUtilsProxy = artifacts.require("DaoUtilsProxy");



contract('DaoUtilsProxy', async (accounts) => {


    it("Test generate ID", async () => {

        let daoUtils = await DaoUtilsProxy.deployed();

        //Arrange and act
        let result = await daoUtils.generateId.call([1,2]);

        //Assert
        assert.isTrue(result.toNumber() == 3, "Generated ID should be 3");

    });

});
