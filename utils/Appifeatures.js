function search(query, queryString) {
    const keyword = queryString.keyword;

    if (keyword) {
        // Add logic to search based on keyword
        query = query.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for product name
                { description: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for product description
            ]
        });
    }

    return query;
}

module.exports = search;
