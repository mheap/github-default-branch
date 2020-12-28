const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");
const githubPages = require("./github-pages");

const createBranch = require("./github-pages");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#github-pages", () => {
  it("continues with a log if pages is not enabled", async () => {
    nock("https://api.github.com/").get("/repos/demo/repo/pages").reply(404);

    await githubPages({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("No GitHub Pages found for [demo/repo]");
  });

  it("logs if the configured branch does not match the old branch", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pages")
      .reply(200, {
        source: {
          branch: "custom",
          path: "/",
        },
      });

    await githubPages({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "Skipping GitHub pages as [custom] does not match [master]"
    );
  });

  it("configures actions with the new branch", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pages")
      .reply(200, {
        source: {
          branch: "master",
          path: "/",
        },
      });

    nock("https://api.github.com/")
      .put("/repos/demo/repo/pages", { source: { branch: "main", path: "/" } })
      .reply(200);

    await githubPages({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "Updated GitHub pages from [master] to [main] with path [/]"
    );
  });

  it("respects dryRun", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pages")
      .reply(200, {
        source: {
          branch: "master",
          path: "/",
        },
      });

    await githubPages({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith(
      "Updated GitHub pages from [master] to [main] with path [/]"
    );
  });

  it("configures actions with the new branch (custom path)", async () => {
    nock("https://api.github.com/")
      .get("/repos/demo/repo/pages")
      .reply(200, {
        source: {
          branch: "master",
          path: "/docs",
        },
      });

    nock("https://api.github.com/")
      .put("/repos/demo/repo/pages", {
        source: { branch: "main", path: "/docs" },
      })
      .reply(200);

    await githubPages({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "Updated GitHub pages from [master] to [main] with path [/docs]"
    );
  });
});
