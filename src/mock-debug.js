module.exports = {
  logger: jest.fn(),
  extend: function (name) {
    return this.logger;
  },
  cleanAll: function () {
    this.logger = jest.fn();
  },
};
