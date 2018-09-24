pragma solidity ^0.4.24;


interface ItemDao {

    function create(uint _version, string _title, uint _inventory) external returns (uint256);
    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, uint inventory);
    function update(uint256 _id, uint _version, string _title, uint _inventory) external;
    function remove(uint256 _id) external;
}


contract ItemDaoBasic is ItemDao {

    struct Item {
        uint256 id;
        address owner;
        uint version;
        string title;
        uint inventory;
        uint256 index;
    }


    event ItemEvent (
        uint256 id,
        address owner,
        uint version,
        string title,
        uint inventory,
        uint256 index,
        string eventType
    );


    mapping(uint256 => Item) private itemMapping; //ITEMMAPPING IS NOT THE LIST OF ACTIVE THINGS
    uint256[] private itemIndex;    //ITEMINDEX IS THE LIST OF ACTIVE THINGS
    uint256 itemCounter;

    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, uint inventory) {

        require(exists(_id));

        Item storage item = itemMapping[_id];

        return (item.id, item.owner, item.version, item.title, item.inventory, item.index);
    }

    function create(uint _version, string _title, uint _inventory) external returns (uint256) {

        itemCounter++;

        uint256 id = itemCounter;

        require(exists(id) == false);
        //make sure it doesn't exist. Might need refactored so that I can write tests to verify this condition

        Item memory item = Item({
            id : id,
            owner : msg.sender,
            version : 1,
            title : _title,
            inventory : _inventory,
            index : itemIndex.length
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
            item.index,
            "NEW"
        );


        return item.id;
    }

    function update(uint256 _id, uint _version, string _title, uint _inventory) external {

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
            itemMapping[_id].index,
            "UPDATE"
        );

    }


    /**
        https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec
    **/
    function remove(uint256 _id) external {

        require(exists(_id));

        //itemMapping[_id].active = false; //WHY DOESN'T THIS WORK

        //Identifying the location of the item - in the itemIndex array - we're trying to remove.
        //And then move the last item to its location to overwrite it.
        //Then it's gone from the index. And since read uses the index it will be ignored when reading. Effectively deleted.


        //Get the index of the one we're trying to delete
        uint256 indexToDelete = itemMapping[_id].index;

        //Get the last id in the list.
        uint256 idToMove = itemIndex[itemIndex.length-1];

        //Update the index of the deleted one to specify that it doesn't exist
        itemMapping[indexToDelete].index = -1; //Doesn't exist


        //Move the last item to the place we're trying to remove.
        itemIndex[indexToDelete] = idToMove;

        //Update the index of the moved one to tell it where it is in the index.
        itemMapping[idToMove].index = indexToDelete;



        emit ItemEvent(
            itemMapping[_id].id,
            itemMapping[_id].owner,
            itemMapping[_id].version,
            itemMapping[_id].title,
            itemMapping[_id].inventory,
            itemMapping[_id].index,
            "REMOVE"
        );

    }

    function exists(uint256 _id) private view returns (bool) {
        if (itemIndex.length == 0) return false;

        return itemMapping[_id].index > -1;
        //should return false if it doesn't exist
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




