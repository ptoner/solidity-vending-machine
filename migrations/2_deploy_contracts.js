var daoImpl = artifacts.require("ItemDaoBasic");
var daoUtilsProxy = artifacts.require("DaoUtilsProxy"); //For unit test


module.exports = function(deployer) {
  deployer.deploy(daoImpl);
  deployer.deploy(daoUtilsProxy);
};