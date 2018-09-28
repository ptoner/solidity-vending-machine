var ItemDaoBasic = artifacts.require("ItemDaoBasic");
var ItemServiceBasic = artifacts.require("ItemServiceBasic");


module.exports = function(deployer) {
  deployer.deploy(ItemDaoBasic);
  deployer.deploy(ItemServiceBasic);
};