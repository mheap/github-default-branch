const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const updateDefault = require("./update-default-branch");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#update-default-branch", () => {
  it("exits if $old is not the current default branch", async () => {
    nock("https://api.github.com/").get("/repos/demo/repo").reply(200, {
      default_branch: "unexpected-default",
    });

    await updateDefault({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "Default branch is not [master]. Found [unexpected-default]. Not updating default branch"
    );
  });

  it("updates the default branch", async () => {
    nock("https://api.github.com/").get("/repos/demo/repo").reply(200, {
      default_branch: "master",
    });

    nock("https://api.github.com/")
      .patch("/repos/demo/repo", {
        name: "repo",
        default_branch: "main",
      })
      .reply(200);

    await updateDefault({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "Updating default branch to [main] in [repo]"
    );
  });

  it("respects dryRun mode", async () => {
    nock("https://api.github.com/").get("/repos/demo/repo").reply(200, {
      default_branch: "master",
    });

    await updateDefault({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith(
      "Updating default branch to [main] in [repo]"
    );
  });
});
