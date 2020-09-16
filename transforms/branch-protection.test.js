const nock = require("nock");
nock.disableNetConnect();

const log = require("../src/mock-debug");

const protect = require("./branch-protection");
const octokit = require("../src/octokit")();

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error("Not all nock interceptors were used");
  }
  log.cleanAll();
  nock.cleanAll();
});

describe("#branch-protection", () => {
  it("returns if there are no matching patterns", async () => {
    mockGetBranchProtection("other-branch");

    await protect({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith(
      "No matching patterns found for [master]"
    );
  });

  it("updates existing branch protections", async () => {
    mockGetBranchProtection("master");

    // Mock mutation
    nock("https://api.github.com/")
      .post(
        "/graphql",
        JSON.parse(
          '{"query":"mutation($branchProtectionRuleId:ID!,$pattern:String!) {\\n  updateBranchProtectionRule (input:{branchProtectionRuleId:$branchProtectionRuleId,pattern:$pattern}) {\\n    branchProtectionRule {\\n      id,\\n      pattern\\n    }\\n  }\\n}","variables":{"branchProtectionRuleId":"MDIwOkJyYW5jaFByb3RlY3Rpb25SdWxlMTc1ODg3NjI=","pattern":"main"}}'
        )
      )
      .reply(200);

    await protect({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
    });

    expect(log.logger).toBeCalledWith("Branch protections updated");
  });

  it("respects the dryRun parameter", async () => {
    mockGetBranchProtection("master");

    await protect({
      owner: "demo",
      repo: "repo",
      old: "master",
      target: "main",
      octokit,
      log,
      dryRun: true,
    });

    expect(log.logger).toBeCalledWith("Branch protections updated");
  });
});

function mockGetBranchProtection(pattern) {
  nock("https://api.github.com/")
    .post("/graphql", {
      query: `query($owner: String!, $repo: String!) {
  repository(owner:$owner,name:$repo) {
    branchProtectionRules(first:100) {
      nodes {
        id
        pattern
      }
    }
  }
}`,
      variables: { owner: "demo", repo: "repo" },
    })
    .reply(200, {
      data: {
        repository: {
          branchProtectionRules: {
            nodes: [
              {
                id: "MDIwOkJyYW5jaFByb3RlY3Rpb25SdWxlMTc1ODg3NjI=",
                pattern,
              },
            ],
          },
        },
      },
    });
}
