function ItemService(dao) {
    this.dao = dao;
}

ItemService.prototype = {

    constructor: ItemService,


    /**
     * CALLS
     */

    callRead: async function(id) {

        var self = this;

        let resultArray = await self.dao.read.call(id);
        return self.itemMapper(resultArray);
    },

    callReadByIndex: async function(index) {

        var self = this;

        let resultArray = await self.dao.readByIndex.call(index);
        return self.itemMapper(resultArray);
    },

    callReadItemList: async function(limit, offset) {

        var self = this;

        let currentCount = await self.dao.count();

        let items = [];

        for (var i=offset; (i < currentCount) || (i - offset == limit); i++) {
            let resultArray = await self.dao.readByIndex.call(i);
            items.push(self.itemMapper(resultArray));
        }

        return items;

    },

    callCount: async function() {
        return this.dao.count();
    },



    /**
     * SEND
     */
    sendCreate: async function(title, inventory) {
        return this.dao.create(title, inventory);
    },

    sendUpdate: async function(id, title, inventory) {
        return this.dao.update(id, "Not Payday", 4);
    },

    sendRemove: async function(id) {
        return this.dao.remove(id);
    },


    /**
     * UTIL
     */

    itemMapper: function(resultArray) {
        return {
            id: resultArray[0],
            owner: resultArray[1],
            version: resultArray[2],
            title: resultArray[3],
            inventory: resultArray[4],
            index: resultArray[5]
        }
    }

};


module.exports = ItemService;