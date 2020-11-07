const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const getSha = require("./get-branch-sha");
const octokit = require("../src/octokit")();

describe("#get-branch-sha", () => {
  it("returns branch sha when the ref exists", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmaster")
      .reply(200, {
        object: {
          sha: "demo-sha-123",
        },
      });
    expect(
      await getSha({ owner: "demo", repo: "repo", old: "master", octokit, log })
    ).toEqual("demo-sha-123");
  });

  it("throws when a ref does not exist", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmaster")
      .reply(404, "Not Found");
    return expect(
      getSha({
        owner: "demo",
        repo: "repo",
        old: "master",
        octokit,
        log,
      })
    ).rejects.toThrow("Not Found");
  });
});
