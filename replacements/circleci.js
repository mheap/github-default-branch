module.exports = function (owner, repo, old, target) {
    return {
        path: ".circleci/config.yml",
        replacements: [
            {
                from: `- ${old}`,
                to: `- ${target}`
            },
            {
                from : `branch: ${old}`,
                to: `branch: ${target}`
            },
            {
                from: `only: ${old}`,
                to: `only: ${target}`
            }
        ]
    };
}
