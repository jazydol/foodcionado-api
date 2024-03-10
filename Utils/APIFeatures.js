class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // build the query
    // filtering query
    const queryObject = { ...this.queryString };
    const excluededFields = ['page', 'sort', 'limit', 'fields'];
    excluededFields.forEach((el) => delete queryObject[el]);

    // advanced filter query
    let queryStr = JSON.stringify(queryObject);

    // regex for gte, gt, lte, lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const resultObject = JSON.parse(queryStr);

    // AI
    // Adding case-insensitive search for 'name' field if it exists
    if (resultObject.name) {
      const nameValue = resultObject.name;
      delete resultObject.name; // Remove the 'name' field to avoid cast error

      // Check if 'name' is present and is a string
      if (typeof nameValue === 'string') {
        resultObject.name = { $regex: new RegExp(nameValue, 'i') };
      }
    }

    // AI

    this.query.find(resultObject);

    return this;
  }

  //#region soring
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }
  //#endregion

  //#region fields limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }
  //#endregion

  //#region pagination
  async pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Count documents to get total count for pagination
    const totalDocs = await this.query.model.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalDocs / limit);

    return { page, totalPages, skip, limit };
  }
  //#endregion
}

module.exports = APIFeatures;
