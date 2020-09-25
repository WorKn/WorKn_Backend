class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|le)\b/g, (match) => `$${match}`);

    // Parse "like" keywords to regex expressions
    const queryStrToObj = parseToRegex(JSON.parse(queryStr));

    this.query = this.query.find(queryStrToObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const parseToRegex = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key].like) {
      const value = escapeRegex(obj[key].like);

      // Note: the 'i' keyword creates a case-insensitive regular expression.
      // However, if we are working with a large collection, it may not be efficient.
      const regex = new RegExp(value, 'i');
      obj[key] = regex;
    }
  });

  return obj;
};

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = APIFeatures;
