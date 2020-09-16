module.exports = async function ({
  owner,
  repo,
  old,
  target,
  octokit,
  log,
  dryRun,
}) {
  log = log.extend("transforms:branch-protection");

  // Via https://github.com/gr2m/octokit-plugin-rename-branch/blob/5d3c37439515db9f49f049e28510dc596982cb02/src/rename-branch.ts#L56-L90
  const query = `query($owner: String!, $repo: String!) {
  repository(owner:$owner,name:$repo) {
    branchProtectionRules(first:100) {
      nodes {
        id
        pattern
      }
    }
  }
}`;

  log(`Loading branch protections for [${repo}]`);
  const {
    repository: {
      branchProtectionRules: { nodes: branchProtectionRules },
    },
  } = await octokit.graphql(query, { owner, repo });

  // there can only be one protection per pattern
  const rule = branchProtectionRules.find((rule) => rule.pattern === old);

  // No matching patterns
  if (!rule) {
    log(`No matching patterns found for [${old}]`);
    return;
  }

  if (!dryRun) {
    await octokit.graphql(
      `mutation($branchProtectionRuleId:ID!,$pattern:String!) {
  updateBranchProtectionRule (input:{branchProtectionRuleId:$branchProtectionRuleId,pattern:$pattern}) {
    branchProtectionRule {
      id,
      pattern
    }
  }
}`,
      {
        branchProtectionRuleId: rule.id,
        pattern: target,
      }
    );
  }

  log("Branch protections updated");
};
