pragma solidity ^0.4.24;


interface ItemDao {

    function create(
        uint _version,
        string _title,
        uint _inventory,
        bool _active
    ) external returns (uint256);

    function read(uint256 _id) external view returns (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active
    );

    function update(
        uint256 _id,
        uint _version,
        string _title,
        uint _inventory
    ) external;


    function remove(uint256 id) external;
}



contract ItemDaoBasic is ItemDao {

    struct Item {
        uint256 id;
        address owner;
        uint version;
        string title;
        uint inventory;
        bool active;
    }


    event ItemEvent (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active,
        string eventType
    );


    mapping(uint256 => Item) private itemMapping;
    uint256[] private itemIndex;
    uint256 itemCounter;

    function read(uint256 _id) external view returns (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active
    ) {

        require(exists(_id));

        Item storage item = itemMapping[_id];

        return (item.id, item.owner, item.version, item.title, item.inventory, item.active);
    }

    function create(
        uint _version,
        string _title,
        uint _inventory,
        bool _active
    ) external returns (uint256) {

        itemCounter++;

        uint256 id = itemCounter;

        require(exists(id) == false); //make sure it doesn't exist. Might need refactored so that I can write tests to verify this condition

        Item memory item = Item({
            id: id,
            owner: msg.sender,
            version: 1,
            title: _title,
            inventory: _inventory,
            active: _active
        });


        //Put item in mapping
        itemMapping[id] = item;


        //Put id in index
        itemIndex.push(id);


        emit ItemEvent(
            item.id,
            item.owner,
            item.version,
            item.title,
            item.inventory,
            item.active,
            "NEW"
        );


        return item.id;
    }

    function update(
        uint256 _id,
        uint _version,
        string _title,
        uint _inventory
) external {

        require(exists(_id));


        if (itemMapping[_id].version != _version) {
            itemMapping[_id].version = _version;
        }

        if (keccak256(bytes(itemMapping[_id].title)) != keccak256(bytes(_title))) {
            itemMapping[_id].title = _title;
        }

        if (itemMapping[_id].inventory != _inventory) {
            itemMapping[_id].inventory = _inventory;
        }

        emit ItemEvent(
            itemMapping[_id].id,
            itemMapping[_id].owner,
            itemMapping[_id].version,
            itemMapping[_id].title,
            itemMapping[_id].inventory,
            itemMapping[_id].active,
            "UPDATE"
        );

    }

    function remove(uint256 _id) external {
        require(exists(_id));
        itemMapping[_id].active = false;

    }

    function exists(uint256 _id) private view returns (bool) {
        if(itemIndex.length == 0) return false;

        return itemMapping[_id].active; //should return false if it doesn't exist
    }


}




//
//
//
//library DaoUtils {
//    function generateId(uint256[] existingIds) internal view returns (uint256){
//        return existingIds.length + 1;
//    }
//}
//
//
////For unit test
//contract DaoUtilsProxy {
//    function generateId(uint256[] existingIds) external view returns (uint256){
//        return DaoUtils.generateId(existingIds);
//    }
//}




