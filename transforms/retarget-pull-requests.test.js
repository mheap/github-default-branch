const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const retarget = require("./retarget-pull-requests");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#retarget-pull-requests", () => {
  it("exits if there are no pull requests", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pulls?state=open&per_page=100")
      .reply(200, []);

    await retarget({
      owner: "demo",
      repo: "repo",
      target: "main",
      old: "master",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Found [0] pull requests");
  });

  it("skips pull requests with a different target", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pulls?state=open&per_page=100")
      .reply(200, [
        {
          number: 18,
          base: {
            ref: "other-branch",
          },
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

    expect(log.logger).toBeCalledWith("Found [1] pull requests");
    expect(log.logger).toBeCalledWith(
      "Skipping [#18] as it didn't target [master]"
    );
  });

  it("retargets valid pull requests", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pulls?state=open&per_page=100")
      .reply(200, [
        {
          number: 18,
          base: {
            ref: "master",
          },
        },
      ]);

    nock("https://api.github.com/")
      .patch("/repos/demo/repo/pulls/18", {
        base: "main",
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

    expect(log.logger).toBeCalledWith("Found [1] pull requests");
    expect(log.logger).toBeCalledWith(
      "Updating pull request [#18] in [repo] from [master] to [main]"
    );
  });

  it("respects dryRun mode", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pulls?state=open&per_page=100")
      .reply(200, [
        {
          number: 18,
          base: {
            ref: "master",
          },
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

    expect(log.logger).toBeCalledWith("Found [1] pull requests");
    expect(log.logger).toBeCalledWith(
      "Updating pull request [#18] in [repo] from [master] to [main]"
    );
  });
});
