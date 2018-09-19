var daoImpl = artifacts.require("ItemDaoBasic");


module.exports = function(deployer) {
  deployer.deploy(daoImpl);
};