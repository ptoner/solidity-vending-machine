pragma solidity ^0.4.24;






interface ItemDao {

    function create(
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    ) external returns (uint256);

    function read(uint256 id) external returns (
        address owner,
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    );

    function update(
        uint256 id,
        address owner,
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    ) external;


    function remove(uint256 id) external;
}

contract ItemDaoBasic is ItemDao {

    struct Item {
        uint256 id;
        address owner;
        uint version;
        bytes32 title;
        uint inventory;
        bool active;
    }


    event LogNew (
        uint256 id,
        address owner,
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    );

    mapping(uint256 => Item) private itemMapping;
    uint[] private itemIndex;

    function read(uint256 id) external returns (
        address owner,
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    ) {

        require(exists(id));

        Item storage item = itemMapping[id];

        return (item.owner, item.version, item.title, item.inventory, item.active);
    }

    function create(
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    ) external returns (uint256) {

        uint256 id = generateId();

        require(exists(id) == false); //make sure it doesn't exist. Might need refactored so that I can write tests to verify this condition

        Item memory item = Item({
            id: id,
            owner: msg.sender,
            version: 1,
            title: title,
            inventory: inventory,
            active: active
        });



        //Put item in mapping
        itemMapping[id] = item;


        //Put id in index
        itemIndex.push(id);


        emit LogNew(item.id, item.owner, item.version, item.title, item.inventory, item.active);


        return item.id;
    }

    function update(
        uint256 id,
        address owner,
        uint version,
        bytes32 title,
        uint inventory,
        bool active
    ) external {

    }

    function remove(uint256 id) external {

    }

    function exists(uint256 id) private returns (bool) {
        if(itemIndex.length == 0) return false;

        return false;
        //return itemMapping[id].exists; //should return false if it doesn't exist
    }

    function generateId() private view returns (uint256){
        return itemIndex.length + 1;
    }

}








