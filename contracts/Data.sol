pragma solidity ^0.4.24;


interface ItemDao {

    function create(string _title, int _inventory) external returns (uint256 id);
    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index);
    function update(uint256 _id, uint _version, string _title, int _inventory) external;
    function remove(uint256 _id) external;

    //Paging functionality
    function count() external constant returns (uint256 count);
    function readByIndex(uint256 _index) external constant returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index);
}


contract ItemDaoBasic is ItemDao {

    struct Item {
        uint256 id;
        address owner;
        uint version;
        string title;
        int inventory;
        uint256 index;
    }


    event ItemEvent (
        uint256 id,
        address owner,
        uint version,
        string title,
        int inventory,
        uint256 index,
        string eventType
    );


    event DebugEvent (
        uint256 message
    );

    mapping(uint256 => Item) private itemMapping; //ITEMMAPPING IS NOT THE LIST OF ACTIVE THINGS
    uint256[] private itemIndex;    //ITEMINDEX IS THE LIST OF ACTIVE THINGS
    uint256 private itemCounter;

    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index) {

        require(exists(_id), "This ID does not exist");

        Item storage item = itemMapping[_id];

//        emit DebugEvent(item.inventory);

        return (item.id, item.owner, item.version, item.title, item.inventory, item.index);
    }

    function create(string _title, int _inventory) external returns (uint256) {

        itemCounter++;

        uint256 id = itemCounter;

        //Validation
        require(exists(id) == false);
        require(_inventory > 0, "_inventory must be greater than or equal to 0");
        require(bytes(_title).length > 0, "_title is required ");


        Item memory item = Item({
            id : id,
            owner : msg.sender,
            version : 1,
            title : _title,
            inventory : _inventory,
            index : itemIndex.length
            });


        //Make sure appropriate values get set.
        require(item.id != 0);
        require(item.owner != 0);


        //Put item in mapping
        itemMapping[id] = item;


        //Put id in index
        itemIndex.push(id);


        emit ItemEvent(
            itemMapping[id].id,
            itemMapping[id].owner,
            itemMapping[id].version,
            itemMapping[id].title,
            itemMapping[id].inventory,
            itemMapping[id].index,
            "NEW"
        );


        return itemMapping[id].id;
    }

    function update(uint256 _id, uint _version, string _title, int _inventory) external {

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




    //https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec
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

        if (idToMove == _id) {
            delete itemIndex[indexToDelete];
            itemIndex.length--;
        } else {
            //Move the last item to the place we're trying to remove.
            itemIndex[indexToDelete] = idToMove;

            //Update the index of the moved one to tell it where it is in the index.
            itemMapping[idToMove].index = indexToDelete;
        }



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


    function count() external constant returns (uint256 count) {
        return itemIndex.length;
    }


    function readByIndex(uint256 _index) external constant returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index) {

        require(index < itemIndex.length, "No item at this index");

        uint256 idAtIndex = itemIndex[index];


        Item storage item = itemMapping[idAtIndex];


        return (item.id, item.owner, item.version, item.title, item.inventory, item.index);
    }


    function exists(uint256 _id) private view returns (bool) {

        if (itemIndex.length == 0) return false;

        //Look up item by id and get the current index.
        uint256 currentIndex = itemMapping[_id].index;

        //Look in indexes and see see what's in the that spot
        if (itemIndex.length > currentIndex) {

            uint256 currentIdAtIndex = itemIndex[currentIndex];

            //See if this id is still at the same place.
            if (_id == currentIdAtIndex) {
                return true;
            }
        }


        return false;
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




