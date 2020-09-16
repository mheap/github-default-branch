const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const createBranch = require("./create-branch");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#create-branch", () => {
  it("returns the current branch if it already exists", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmain")
      .reply(200);

    await createBranch({
      owner: "demo",
      repo: "repo",
      target: "main",
      sha: "demo-sha-123",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Branch [main] already exists");
  });

  it("creates the branch if it does not exist", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmain")
      .reply(404);

    nock("https://api.github.com/")
      .post("/repos/demo/repo/git/refs", {
        ref: "refs/heads/main",
        sha: "demo-sha-123",
      })
      .reply(200);

    await createBranch({
      owner: "demo",
      repo: "repo",
      target: "main",
      sha: "demo-sha-123",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Branch [main] created");
  });

  it("respects dry run", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmain")
      .reply(404);

    await createBranch({
      owner: "demo",
      repo: "repo",
      target: "main",
      sha: "demo-sha-123",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith("Branch [main] created");
  });

  it("throws if there is an API error", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/git/ref/heads%2Fmain")
      .reply(500, "Server Error");

    return expect(
      createBranch({
        owner: "demo",
        repo: "repo",
        target: "main",
        sha: "demo-sha-123",
        octokit,
        log,
      })
    ).rejects.toThrow("Server Error");
  });
});
