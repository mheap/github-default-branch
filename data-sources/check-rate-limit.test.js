const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const checkLimit = require("./check-rate-limit");
const octokit = require("../src/octokit")();
describe("#check-rate-limit", () => {
  it("returns a rate limit on API success", async () => {
    nock("https://api.github.com/")
      .get("/rate_limit")
      .reply(200, {
        rate: {
          remaining: 9845,
        },
      });
    return expect(await checkLimit({ octokit, log })).toEqual({
      rateLimit: 9845,
    });
  });

  it("returns null and logs on API error", async () => {
    nock("https://api.github.com/")
      .get("/rate_limit")
      .reply(500, "Endpoint not supported");

    await checkLimit({ octokit, log });
    expect(log.logger).toHaveBeenCalledWith(
      "⚠️  Unable to determine rate limits: Endpoint not supported"
    );
  });
});
