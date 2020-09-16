const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const deleteBranch = require("./delete-old-branch");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#delete-old-branch", () => {
  it("deletes the old branch if it exists", async () => {
    nock("https://api.github.com/")
      .delete("/repos/demo/repo/git/refs/heads%2Fmaster")
      .reply(200);

    await deleteBranch({
      owner: "demo",
      repo: "repo",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Deleted [master] branch");
  });

  it("does nothing on server error", async () => {
    nock("https://api.github.com/")
      .delete("/repos/demo/repo/git/refs/heads%2Fmaster")
      .reply(404);

    global.console.log = jest.fn();
    await deleteBranch({
      owner: "demo",
      repo: "repo",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Error deleting [master]");
  });

  it("respects dry run", async () => {
    await deleteBranch({
      owner: "demo",
      repo: "repo",
      old: "master",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith("Deleted [master] branch");
  });
});
