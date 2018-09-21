pragma solidity ^0.4.24;


interface ItemDao {

    function create(
        uint _version,
        string _title,
        uint _inventory,
        bool _active
    ) external returns (uint256);

    function read(uint256 _id) external returns (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active
    );

    function update(
        uint256 _id,
        address _owner,
        uint _version,
        string _title,
        uint _inventory,
        bool _active
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


    event LogNew (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active
    );

    event Help(
        string message
    );



    mapping(uint256 => Item) private itemMapping;
    uint256[] private itemIndex;

    function read(uint256 _id) external returns (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        bool active
    ) {

        emit Help("GOT HERE");

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

        uint256 id = DaoUtils.generateId(itemIndex);

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


        emit LogNew(item.id, item.owner, item.version, item.title, item.inventory, item.active);


        return item.id;
    }

    function update(
        uint256 _id,
        address _owner,
        uint _version,
        string _title,
        uint _inventory,
        bool _active
    ) external {

    }

    function remove(uint256 _id) external {

    }

    function exists(uint256 _id) private returns (bool) {
        if(itemIndex.length == 0) return false;

        return itemMapping[_id].active; //should return false if it doesn't exist
    }

    function generateId() private view returns (uint256){
        return itemIndex.length + 1;
    }

}







library DaoUtils {

    function generateId(uint256[] existingIds) internal view returns (uint256){
        return existingIds.length + 1;
    }
}


//For unit test
contract DaoUtilsProxy {
    function generateId(uint256[] existingIds) external view returns (uint256){
        return DaoUtils.generateId(existingIds);
    }
}




