'use strict';

module.exports = (from, to) => {
    if (!from || Object.values(from).length === 0) {
        return 'Add';
    }
    if (!to || Object.values(to).length === 0) {
        return 'Remove';
    }
    return 'Modify';
};