const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const listRepos = require("./list-repos");
const octokit = require("../src/octokit")();

describe("#list-repos", () => {
  it("returns a single repo", async () => {
    expect(await listRepos({ repo: "demo/repo", log })).toEqual({
      repos: ["demo/repo"],
    });
  });

  it("returns repos for an org", async () => {
    nock("https://api.github.com/")
      .get("/orgs/demo/repos?per_page=100")
      .reply(200, [
        {
          full_name: "demo/repo",
        },
        {
          full_name: "demo/other",
        },
      ]);
    expect(await listRepos({ org: "demo", octokit, log })).toEqual({
      repos: ["demo/repo", "demo/other"],
    });
  });

  it("returns repos for a user", async () => {
    nock("https://api.github.com/")
      .get("/user/repos?per_page=100")
      .reply(200, [
        {
          full_name: "ashley/r1",
          owner: { login: "ashley" },
        },
        {
          full_name: "ashley/r2",
          owner: { login: "ashley" },
        },
        {
          full_name: "charlie/repo",
          owner: { login: "charlie" },
        },
      ]);
    expect(await listRepos({ user: "ashley", octokit, log })).toEqual({
      repos: ["ashley/r1", "ashley/r2"],
    });
  });

  it("does not skip forks by default", async () => {
    nock("https://api.github.com/")
      .get("/user/repos?per_page=100")
      .reply(200, [
        {
          full_name: "ashley/r1",
          owner: { login: "ashley" },
          fork: false,
        },
        {
          full_name: "ashley/r2",
          owner: { login: "ashley" },
          fork: true,
        },
      ]);
    expect(await listRepos({ user: "ashley", octokit, log })).toEqual({
      repos: ["ashley/r1", "ashley/r2"],
    });
  });

  it("skips forks if required", async () => {
    nock("https://api.github.com/")
      .get("/user/repos?per_page=100")
      .reply(200, [
        {
          full_name: "ashley/r1",
          owner: { login: "ashley" },
          fork: false,
        },
        {
          full_name: "ashley/r2",
          owner: { login: "ashley" },
          fork: true,
        },
      ]);
    expect(
      await listRepos({ user: "ashley", skipForks: true, octokit, log })
    ).toEqual({
      repos: ["ashley/r1"],
    });
  });

  it("skips archived repos", async () => {
    nock("https://api.github.com/")
      .get("/user/repos?per_page=100")
      .reply(200, [
        {
          full_name: "ashley/r1",
          owner: { login: "ashley" },
          archived: true,
        },
        {
          full_name: "ashley/r2",
          owner: { login: "ashley" },
          archived: false,
        },
      ]);
    expect(await listRepos({ user: "ashley", octokit, log })).toEqual({
      repos: ["ashley/r2"],
    });
  });
});
