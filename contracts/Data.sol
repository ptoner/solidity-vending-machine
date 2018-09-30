pragma solidity ^0.4.24;


interface ItemDao {

    function create(string _title, int _inventory) external returns (uint256 id);
    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index);
    function update(uint256 _id, string _title, int _inventory) external;
    function remove(uint256 _id) external;

    //Paging functionality
    function count() external constant returns (uint256 theCount);
    function readByIndex(uint256 _index) external constant returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index);
}



interface ItemService {

}

contract ItemServiceBasic is ItemService {

    

}












contract ItemDaoBasic is ItemDao {

    //The mapping where we actually store the item data on the blockchain
    mapping(uint256 => Item) private itemMapping;

    //An unordered index of the items that are active.
    uint256[] private itemIndex;

    //Don't want to reuse ids so just keep counting forever.
    uint256 private nextId;

    //This DAO should only be callable by the owning service.
    address ownerContract;


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




    function read(uint256 _id) external view returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index) {

        require(_exists(_id), "This ID does not exist");

        Item storage item = itemMapping[_id];

        return (item.id, item.owner, item.version, item.title, item.inventory, item.index);
    }

    function create(string _title, int _inventory) external returns (uint256) {

        nextId++;

        uint256 id = nextId;

        //Validation
        require(_exists(id) == false);
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
        require(item.id != 0, "Item ID is emtpy");
        require(item.owner != 0, "Item owner is emtpy");


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

    function update(uint256 _id, string _title, int _inventory) external {

        require(_exists(_id));


        if (keccak256(bytes(itemMapping[_id].title)) != keccak256(bytes(_title))) {
            itemMapping[_id].title = _title;
        }

        if (itemMapping[_id].inventory != _inventory) {
            itemMapping[_id].inventory = _inventory;
        }


        //Bump version up
        itemMapping[_id].version++;

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

    function remove(uint256 _id) external {

        //https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec

        require(_exists(_id));

        //1. Find the index of the item we're trying to delete.
        //2. Move the ID that's in the last spot in the array to where this one is.
        //3. Delete the last array spot.


        //Get the index of the one we're trying to delete
        uint256 indexToDelete = itemMapping[_id].index;

        //Get the last id in the list.
        uint256 idToMove = itemIndex[itemIndex.length-1];


        if (idToMove != _id) {

            //Move the last item to the place we're trying to remove.
            itemIndex[indexToDelete] = idToMove;

            //Update the index of the moved one to tell it where it is in the index.
            itemMapping[idToMove].index = indexToDelete;
        }

        //Delete last item in list
        delete itemIndex[itemIndex.length-1];
        itemIndex.length--;


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

    function count() external constant returns (uint256 theCount) {
        return itemIndex.length;
    }

    function readByIndex(uint256 _index) external constant returns (uint256 id, address owner, uint version, string title, int inventory, uint256 index) {

        require(_index < itemIndex.length, "No item at this index");

        uint256 idAtIndex = itemIndex[_index];


        Item storage item = itemMapping[idAtIndex];


        return (item.id, item.owner, item.version, item.title, item.inventory, item.index);
    }

    function _exists(uint256 _id) private view returns (bool) {

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