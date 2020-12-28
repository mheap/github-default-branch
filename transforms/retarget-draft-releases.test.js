const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const retarget = require("./retarget-draft-releases");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#retarget-pull-requests", () => {
  it("exits if there are no draft releases", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/releases?per_page=100")
      .reply(200, []);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Found [0] releases");
    expect(log.logger).toBeCalledWith("No releases found. Exiting");
  });

  it("exits if there are no draft releases", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/releases?per_page=100")
      .reply(200, [{ draft: false }]);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("No draft releases found. Exiting");
  });

  it("skips releases with a different target", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/releases?per_page=100")
      .reply(200, [
        {
          name: "OtherTag",
          target_commitish: "other-branch",
          draft: true,
        },
      ]);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Found [1] releases");
    expect(log.logger).toBeCalledWith(
      "Skipping [OtherTag] as it didn't target [master]"
    );
  });

  it("retargets valid pull requests", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/releases?per_page=100")
      .reply(200, [
        {
          id: 1234,
          name: "OtherTag",
          target_commitish: "master",
          tag_name: "v1",
          draft: true,
        },
      ]);

    nock("https://api.github.com/")
      .patch("/repos/demo/repo/releases/1234", {
        target_commitish: "main",
        tag_name: "v1",
      })
      .reply(200);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Found [1] releases");
    expect(log.logger).toBeCalledWith(
      "Updating release [OtherTag] in [repo] from [master] to [main]"
    );
  });

  it("respects dryRun mode", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/releases?per_page=100")
      .reply(200, [
        {
          id: 1234,
          name: "OtherTag",
          target_commitish: "master",
          tag_name: "v1",
          draft: true,
        },
      ]);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith("Found [1] releases");
    expect(log.logger).toBeCalledWith(
      "Updating release [OtherTag] in [repo] from [master] to [main]"
    );
  });
});
