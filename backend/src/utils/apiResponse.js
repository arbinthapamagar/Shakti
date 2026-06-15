class apiResponse {
  // Standard envelope for every API response.
  //   { success, statusCode, message, data, [pagination] }
  // `data` always holds the payload directly (an array for lists, an object for
  // single items). For paginated lists, pass `pagination` so it sits as its own
  // top-level field instead of being mixed into `data`.
  constructor(statusCode, data = {}, message = 'Success', pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }
}

export { apiResponse };
